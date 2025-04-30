from abc import ABC, abstractmethod
import json
import logging
from types import ModuleType
from typing import Any, Callable, Dict


from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORY_SCHEMAS as CATEGORY_SCHEMAS_V1_1_0, OCSF_SHAPE_SCHEMAS as SHAPE_SCHEMAS_V1_1_0
from backend.core.validation_report import ValidationReport
from backend.core.validators import PythonLogicInvalidSyntaxError, PythonLogicNotInModuleError, PythonLogicNotExecutableError

from backend.transformers.transformers import Transformer


logger = logging.getLogger("backend")


class TransformerValidatorBase(ABC):
    def __init__(self, category_name: str, input_entry: str, transformer: Transformer):
        self.category_name = category_name
        self.input_entry = input_entry
        self.transformer = transformer

    @abstractmethod
    def _load_transformer_logic(self, transformer: Transformer) -> Callable[[str], str]:
        pass

    def _try_load_transformer_logic(self, report: ValidationReport, transformer: Transformer) -> Callable[[str], str]:
        try:
            report.append_entry("Attempting to load the transformer logic...", logger.info)
            extract_logic = self._load_transformer_logic(transformer)
            report.append_entry("Loaded the transformer logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transformer logic loading has failed", logger.error)
            raise e
        
        return extract_logic
    
    def _try_invoke_transformer_logic(self, transformer_logic: Callable[[str], str], report: ValidationReport) -> str:
        try:
            report.append_entry("Attempting to invoke the transformer logic against the input...", logger.info)
            output = transformer_logic(report.input)
            report.output["transformer_output"] = output
            report.append_entry("Invoked the transformer logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transformer logic invocation has failed", logger.error)
            raise e

        return output
    
    @abstractmethod
    def _try_validate_schema(self, input_entry: str, transformer: Transformer, transformer_output: str, report: ValidationReport):
        pass

    def _try_validate_transformer_output(self, input_entry: str, transformer: Transformer, transformer_output: str, report: ValidationReport):
        try:
            report.append_entry("Validating the transformer output...", logger.info)

            self._try_validate_schema(input_entry, transformer, transformer_output, report)           

            report.append_entry("Transformer output is valid", logger.info)
        except Exception as e:
            report.append_entry("The transformer output is not valid", logger.error)
            raise e  

    def validate(self) -> ValidationReport:
        report = ValidationReport(
            input=self.input_entry,
            output={"transformer_output": None},
            report_entries=[],
            passed=False
        )
        try:
            logger.debug(f"report 0:\n{report.to_json()}")
            transformer_logic = self._try_load_transformer_logic(report, self.transformer)
            logger.debug(f"report 1:\n{json.dumps(report.to_json(), indent=4)}")
            transformer_output = self._try_invoke_transformer_logic(transformer_logic, report)
            logger.debug(f"report 2:\n{json.dumps(report.to_json(), indent=4)}")
            self._try_validate_transformer_output(self.input_entry, self.transformer, transformer_output, report)
            report.passed = True
        except Exception as e:
            report.passed = False
            report.append_entry(f"Error: {str(e)}", logger.error)

        logger.info(f"Transformer testing complete.  Passed: {report.passed}")
        logger.debug(f"Transformer testing report:\n{json.dumps(report.to_json(), indent=4)}")

        return report
    
class OcsfV1_1_0TransformValidator(TransformerValidatorBase):
    def _try_validate_schema(self, input_entry: str, transformer: Transformer, transformer_output: Dict[str, Any], report: ValidationReport):
        ocsf_version = OcsfVersion.V1_1_0
        category_name = self.category_name
        category_schemas = CATEGORY_SCHEMAS_V1_1_0
        shape_schemas = SHAPE_SCHEMAS_V1_1_0

        report.append_entry(f"Validating the transform output against the OCSF Schema for version {ocsf_version.value} and category {category_name}...", logger.info)

        # Pull the category schema
        used_category_schema = next((schema for schema in category_schemas if schema["name"] == category_name), None)
        if not used_category_schema:
            report.append_entry(f"Category schema for category {category_name} not found", logger.error)
            raise ValueError(f"Category schema for category {category_name} not found")

        # Confirm that all top level keys in the output are present in the category schema; log any that aren't in the
        # report
        category_fields = [field["name"] for field in used_category_schema["fields"]]
        only_expected_keys_present = True
        for key in transformer_output.keys():
            if key not in category_fields:
                report.append_entry(f"Top level field '{key}' present in transform output but not found in category schema", logger.warning)
                only_expected_keys_present = False
        if only_expected_keys_present:
            report.append_entry("All top level fields present in transform output are found in the category schema", logger.debug)

        # TODO: Confirm that all top level keys in the output have expected types; log any that don't in the report

        # Confirm that all keys marked as required in the category schema are present in the output; log any that
        # aren't in the report
        required_category_fields = [field["name"] for field in used_category_schema["fields"] if field.get("requirement") == "Required"]
        all_required_keys_present = True
        for key in required_category_fields:
            if key not in transformer_output.keys():
                report.append_entry(f"Top level field '{key}' marked as required in category schema but not present in transform output", logger.warning)
                all_required_keys_present = False

        if all_required_keys_present:
            report.append_entry("All required top level fields present in category schema are found in transform output", logger.debug)

        # TODO: Recursively, for each nested shape in the output, confirm and log in the report deviance on the following:
        # * All keys in the shape are present in the shape schema
        # * All keys in the shape have expected types
        # * All keys marked as required in the shape schema are present in the output

        if not only_expected_keys_present or not all_required_keys_present:
            report.append_entry("Transform output does not conform to the OCSF schema", logger.error)
            raise ValueError("Transform output does not conform to the OCSF schema")

class PythonOcsfV1_1_0TransformValidator(OcsfV1_1_0TransformValidator):
    def _load_transformer_logic(self, transformer: Transformer) -> Callable[[str], str]:
        # Take the raw logic and attempt to load it into an executable form
        try:
            transformer_module = ModuleType("transformer")
            exec(f"{transformer.dependency_setup}\n\n{transformer.transformer_logic}", transformer_module.__dict__)
        except SyntaxError as e:
            raise PythonLogicInvalidSyntaxError(f"Syntax error in the extract logic: {str(e)}")

        # Confirm we can pull out usable extract logic
        if not hasattr(transformer_module, "transformer"):
            raise PythonLogicNotInModuleError("The transformer logic does not contain a member named 'transformer'")
        
        if not callable(transformer_module.transformer):
            raise PythonLogicNotExecutableError("The 'transformer' attribute must be an executable function")
        
        return transformer_module.transformer