from abc import ABC, abstractmethod
from dataclasses import dataclass
import json
import logging
from typing import Any, Callable, Dict, List

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORY_SCHEMAS as CATEGORY_SCHEMAS_V1_1_0, OCSF_SHAPE_SCHEMAS as SHAPE_SCHEMAS_V1_1_0

from backend.transformation_expert.transforms import load_transform, TransformBase
from backend.transformation_expert.task_def import TransformTask


logger = logging.getLogger("backend")


@dataclass
class ValidationReport:
    input: str
    transform: TransformBase
    output: Dict[str, Any]
    report_entries: List[str]
    passed: bool

    def to_json(self) -> Dict[str, Any]:
        return {
            "input": self.input,
            "transform": self.transform.to_json(),
            "output": self.output if self.output else None,
            "report_entries": self.report_entries if self.report_entries else None,
            "passed": self.passed
        }
    
    def append_entry(self, entry: str, logging_function: Callable[..., None]):
        logging_function(entry)
        self.report_entries.append(entry)

class TransformValidatorBase(ABC):
    def __init__(self, transform_task: TransformTask):
        self.transform_task = transform_task

    def _try_load_transform(self, report: ValidationReport) -> Callable[[Dict[str, Any]], List[Dict[str, Any]]]:
        try:
            report.append_entry("Attempting to load the transform function...", logger.info)
            transform_func = load_transform(report.transform)
            report.append_entry("Loaded the transform function without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transform function loading has failed", logger.error)
            raise e
        
        return transform_func
    
    def _try_invoke_transform(self, transform_func: Callable[[Dict[str, Any]], List[Dict[str, Any]]], report: ValidationReport) -> List[Dict[str, Any]]:
        try:
            report.append_entry("Attempting to invoke the transform function against the input...", logger.info)
            output = transform_func(report.input)
            report.output = output
            report.append_entry("Invoked the transform function without exceptions", logger.info)
        except Exception as e:
            report.append_entry("The transform function invocation has failed", logger.error)
            raise e

        return output
    
    @abstractmethod
    def _try_validate_schema(self, output: Dict[str, Any], report: ValidationReport):
        pass

    def validate(self) -> ValidationReport:
        report = ValidationReport(
            input=self.transform_task.input,
            transform=self.transform_task.transform,
            output=None,
            report_entries=[],
            passed=False
        )
        try:
            transform_func = self._try_load_transform(report)
            output = self._try_invoke_transform(transform_func, report)
            self._try_validate_schema(output, report)
            report.passed = True
        except Exception as e:
            report.passed = False
            report.append_entry(f"Error: {str(e)}", logger.error)

        logger.info(f"Transform function testing complete.  Passed: {report.passed}")
        logger.debug(f"Transform function testing report:\n{json.dumps(report.to_json(), indent=4)}")

        return report
    
class OcsfV1_1_0TransformValidator(TransformValidatorBase):
    def _try_validate_schema(self, output: Dict[str, Any], report: ValidationReport):
        ocsf_version = OcsfVersion.V1_1_0
        category_name = self.transform_task.category_name
        category_schemas = CATEGORY_SCHEMAS_V1_1_0
        shape_schemas = SHAPE_SCHEMAS_V1_1_0

        report.append_entry("THIS IS A PLACEHOLDER, PLEASE IMPLEMENT")

        # Confirm that all top level keys in the output are present in the category schema; log any that aren't in the
        # report

        # Confirm that all keys marked as required in the category schema are present in the output; log any that
        # aren't in the report

        # Recursively, for each nested shape in the output, confirm and log in the report deviance on the following:
        # * All keys in the shape are present in the shape schema
        # * All keys marked as required in the shape schema are present in the output
