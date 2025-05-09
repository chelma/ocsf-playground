from abc import ABC, abstractmethod
import json
import logging
from types import ModuleType
from typing import Any, Callable, Dict

from backend.core.ocsf.ocsf_schema_v1_1_0 import OCSF_SCHEMA as OCSF_SCHEMA_V1_1_0
from backend.core.ocsf.ocsf_schemas import make_get_ocsf_event_schema, make_get_ocsf_object_schemas, PrintableOcsfObject
from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.validation_report import ValidationReport
from backend.core.validators import PythonLogicInvalidSyntaxError, PythonLogicNotInModuleError, PythonLogicNotExecutableError

from backend.transformers.transformers import Transformer


logger = logging.getLogger("backend")


class TransformerValidatorBase(ABC):
    def __init__(self, event_name: str, input_entry: str, transformer: Transformer):
        self.event_name = event_name
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
            transformer_logic = self._try_load_transformer_logic(report, self.transformer)
            transformer_output = self._try_invoke_transformer_logic(transformer_logic, report)
            self._try_validate_transformer_output(self.input_entry, self.transformer, transformer_output, report)
            report.passed = True
        except Exception as e:
            report.passed = False
            report.append_entry(f"Error: {str(e)}", logger.error)

        logger.info(f"Transformer testing complete.  Passed: {report.passed}")
        logger.debug(f"Transformer testing report:\n{json.dumps(report.to_json(), indent=4)}")

        return report
    
class OcsfV1_1_0TransformValidator(TransformerValidatorBase):
    def _validate_object(self, object_schemas_by_name: Dict[str, PrintableOcsfObject], obj_data: Dict[str, Any], schema_obj: PrintableOcsfObject, report: ValidationReport, path: str=""):
        logger.debug(f"Validating object at path: {path}")
        logger.debug(f"Object data: {json.dumps(obj_data, indent=4)}")

        valid = True

        # The unmapped path is a special case; we want to accept any data for it
        if path == "unmapped":
            report.append_entry(f"Special field 'unmapped' present; no schema requirements for this field", logger.debug)
            return valid
        
        # Check that all keys in obj_data are valid attributes in the schema
        for key in obj_data:
            full_key_path = f"{path}.{key}" if path else key

            logger.debug(f"Validating key: {key}")
            logger.debug(f"Schema keys: {schema_obj.attributes.keys()}")

            if key not in schema_obj.attributes:
                report.append_entry(f"Field '{full_key_path}' present in transform output but not found in event class", logger.warning)
                valid = False
                continue
            
            attr = schema_obj.attributes[key]
            
            # Skip validation if value is None
            if obj_data[key] is None:
                continue
                
            # If the attribute is an object, validate the nested object recursively
            if attr.is_object() and obj_data[key] is not None:
                obj_type = attr.object_type
                if obj_type not in object_schemas_by_name:
                    report.append_entry(f"Object type '{obj_type}' referenced but not found in object schemas", logger.error)
                    valid = False
                    continue
                
                obj_schema = object_schemas_by_name[obj_type]
                
                # Handle array of objects
                if attr.is_array:
                    if not isinstance(obj_data[key], list):
                        report.append_entry(f"Field '{full_key_path}' should be an array but is not", logger.warning)
                        valid = False
                    else:
                        for i, item in enumerate(obj_data[key]):
                            if item is not None:  # Skip None values in arrays
                                full_array_key_path = f"{full_key_path}[{i}]"
                                if not self._validate_object(object_schemas_by_name, item, obj_schema, report, f"{full_array_key_path}"):
                                    valid = False
                else:  # Single object
                    logger.debug(f"Validating nested single object at path: {path}{key}")
                    if not self._validate_object(object_schemas_by_name, obj_data[key], obj_schema, report, f"{full_key_path}"):
                        valid = False

        report.append_entry(f"All keys in object at path '{path}' present in OCSF schema", logger.debug)
        
        # Check that all required attributes in the schema are in obj_data
        for attr_name, attr in schema_obj.attributes.items():
            if attr.requirement == "Required" and attr_name not in obj_data:
                report.append_entry(f"Required field '{path + attr_name}' not found in transform output", logger.warning)
                valid = False

        report.append_entry(f"All required keys for object at path '{path}' are present", logger.debug)
        
        return valid

    def _try_validate_schema(self, input_entry: str, transformer: Transformer, transformer_output: Dict[str, Any], report: ValidationReport):
        ocsf_version = OcsfVersion.V1_1_0
        schema = OCSF_SCHEMA_V1_1_0
        
        report.append_entry(f"Validating the transform output against the OCSF Schema for version {ocsf_version.value} and category {self.event_name}...", logger.info)
        
        # Get the specific schemas in use for the event class
        try:
            event_schema = make_get_ocsf_event_schema(schema)(self.event_name, [])
            object_schemas = make_get_ocsf_object_schemas(schema)(self.event_name, [])
        except ValueError as e:
            report.append_entry(f"Schema validation error: {str(e)}", logger.error)
            raise
        
        # Create a dictionary of object schemas by name for quick lookup
        object_schemas_by_name = {obj.name: obj for obj in object_schemas}
        
        # Validate the top level object
        is_valid = self._validate_object(object_schemas_by_name, transformer_output, event_schema, report)
        
        if is_valid:
            report.append_entry("Transform output conforms to the OCSF schema", logger.info)
        else:
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