from abc import ABC, abstractmethod
import json
import logging
from types import ModuleType
from typing import Callable, List

from backend.entities_expert.extraction_pattern import ExtractionPattern
from backend.core.validation_report import ValidationReport
from backend.core.validators import PythonLogicInvalidSyntaxError, PythonLogicNotInModuleError, PythonLogicNotExecutableError


logger = logging.getLogger("backend")


class ExtractionPatternValidatorBase(ABC):
    def __init__(self, input_entry: str, pattern: ExtractionPattern):
        self.input_entry = input_entry
        self.pattern = pattern

    @abstractmethod
    def _load_extract_logic(self, pattern: ExtractionPattern) -> Callable[[str], str]:
        pass

    def _try_load_extract_logic(self, report: ValidationReport, pattern: ExtractionPattern) -> Callable[[str], str]:
        try:
            report.append_entry("Attempting to load the extract logic...", logger.info)
            extract_logic = self._load_extract_logic(pattern)
            report.append_entry("Loaded the extract logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The extract logic loading has failed", logger.error)
            raise e
        
        return extract_logic
    
    def _try_invoke_extract_logic(self, extract_logic: Callable[[str], str], report: ValidationReport) -> str:
        try:
            report.append_entry("Attempting to invoke the extract logic against the input...", logger.info)
            output = extract_logic(report.input)
            report.output["extract_output"] = output
            report.append_entry("Invoked the extract logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The extract logic invocation has failed", logger.error)
            raise e

        return output
    
    def _try_validate_extract_output(self, input_entry: str, pattern: ExtractionPattern, extract_output: List[str], report: ValidationReport):
        try:
            report.append_entry("Validating the extract output...", logger.info)
            if isinstance(extract_output, list):
                report.append_entry(f"The extract output matches the expected type: 'list'", logger.info)
            else:
                report.append_entry(f"The extract output does NOT match the expected type: 'list'", logger.warning)
                raise ValueError(f"The extract output does NOT match the expected type: 'list'")
            if len(extract_output) == 0:
                report.append_entry(f"The extract output is empty", logger.warning)
                raise ValueError(f"The extract output is empty")
            report.append_entry("Extract output is valid", logger.info)
        except Exception as e:
            report.append_entry("The extract output is not valid", logger.error)
            raise e    
    
    @abstractmethod
    def _load_transform_logic(self, pattern: ExtractionPattern) -> Callable[[str], str]:
        pass

    def _try_load_transform_logic(self, report: ValidationReport, pattern: ExtractionPattern) -> Callable[[str], str]:
        try:
            report.append_entry("Attempting to load the transform logic...", logger.info)
            transform_logic = self._load_transform_logic(pattern)
            report.append_entry("Loaded the transform logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transform logic loading has failed", logger.error)
            raise e
        
        return transform_logic
    
    def _try_invoke_transform_logic(self, transform_logic: Callable[[str], str], extract_output: str, report: ValidationReport) -> str:
        try:
            report.append_entry("Attempting to invoke the transform logic against the input...", logger.info)
            output = transform_logic(extract_output)
            report.output["transform_output"] = output
            report.append_entry("Invoked the transform logic without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transform logic invocation has failed", logger.error)
            raise e

        return output
    
    def _try_validate_transform_output(self, input_entry: str, pattern: ExtractionPattern, extract_output: str, transform_output: str, report: ValidationReport):
        try:
            report.append_entry("Validating the transform output...", logger.info)
            
            # TODO - Pull the types field from the OcsfSchema and use that to perform validation of the output
            # See: https://github.com/ocsf/ocsf-lib-py/blob/main/src/ocsf/schema/model.py#L153
            report.append_entry("TODO - Implement behavior to confirm the transform output value matches the type expected by the OCSF Schema for the field", logger.info)            

            report.append_entry("Transform output is valid", logger.info)
        except Exception as e:
            report.append_entry("The transform output is not valid", logger.error)
            raise e  

    def validate(self) -> ValidationReport:
        report = ValidationReport(
            input=self.input_entry,
            output=dict(),
            report_entries=[],
            passed=False
        )
        try:
            extract_logic = self._try_load_extract_logic(report, self.pattern)
            extract_output = self._try_invoke_extract_logic(extract_logic, report)
            self._try_validate_extract_output(self.input_entry, self.pattern, extract_output, report)

            transform_logic = self._try_load_transform_logic(report, self.pattern)
            transform_output = self._try_invoke_transform_logic(transform_logic, extract_output, report)
            self._try_validate_transform_output(self.input_entry, self.pattern, extract_output, transform_output, report)
            report.passed = True
        except Exception as e:
            report.passed = False
            report.append_entry(f"Error: {str(e)}", logger.error)

        logger.info(f"Extraction pattern testing complete.  Passed: {report.passed}")
        logger.debug(f"Extraction pattern testing report:\n{json.dumps(report.to_json(), indent=4)}")

        return report

class PythonExtractionPatternValidator(ExtractionPatternValidatorBase):
    def _load_extract_logic(self, pattern: ExtractionPattern) -> Callable[[str], str]:
        # Take the raw logic and attempt to load it into an executable form
        try:
            extract_module = ModuleType("extract")
            exec(f"{pattern.dependency_setup}\n\n{pattern.extract_logic}", extract_module.__dict__)
        except SyntaxError as e:
            raise PythonLogicInvalidSyntaxError(f"Syntax error in the extract logic: {str(e)}")

        # Confirm we can pull out usable extract logic
        if not hasattr(extract_module, "extract"):
            raise PythonLogicNotInModuleError("The extract logic does not contain a member named 'extract'")
        
        if not callable(extract_module.extract):
            raise PythonLogicNotExecutableError("The 'extract' attribute must be an executable function")
        
        return extract_module.extract
    
    def _load_transform_logic(self, pattern: ExtractionPattern) -> Callable[[str], str]:
        # Take the raw logic and attempt to load it into an executable form
        try:
            transform_module = ModuleType("transform")
            exec(f"{pattern.dependency_setup}\n\n{pattern.transform_logic}", transform_module.__dict__)
        except SyntaxError as e:
            raise PythonLogicInvalidSyntaxError(f"Syntax error in the transform logic: {str(e)}")

        # Confirm we can pull out usable transform logic
        if not hasattr(transform_module, "transform"):
            raise PythonLogicNotInModuleError("The transform logic does not contain a member named 'transform'")
        
        if not callable(transform_module.transform):
            raise PythonLogicNotExecutableError("The 'transform' attribute must be an executable function")
        
        return transform_module.transform