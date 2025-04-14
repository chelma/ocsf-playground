import json
from typing import Any, Callable, Dict

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.transformation_expert.prompting.knowledge import get_ocsf_category_schema, get_ocsf_shape_schemas
from backend.transformation_expert.prompting.templates import (GENERAL_GUIDELINES, PYTHON_OUTPUT_GUIDELINES,
                                                               TASK_TRANSFORM_CREATE, transformation_prompt_template)
from backend.transformation_expert.validation import ValidationReport


def get_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_category_name: str, is_followup: bool) -> Callable[[Dict[str, Any]], SystemMessage]:
    if is_followup:
        def factory(user_guidance: str, input_entry: str, validation_report: ValidationReport) -> SystemMessage:
            return SystemMessage(
                content=transformation_prompt_template.format(
                    task=TASK_TRANSFORM_CREATE,
                    general_guidelines=GENERAL_GUIDELINES,
                    output_guidelines=PYTHON_OUTPUT_GUIDELINES,
                    ocsf_version=ocsf_version,
                    ocsf_category_name=ocsf_category_name,
                    ocsf_category_schema=get_ocsf_category_schema(ocsf_version, ocsf_category_name),
                    ocsf_shapes=get_ocsf_shape_schemas(ocsf_version, ocsf_category_name),
                    input_entry=input_entry,
                    user_guidance=user_guidance,
                    previous_transform=validation_report.transform.to_file_format(),
                    validation_report=json.dumps(validation_report.to_json(), indent=4),
                    previous_input_entry=validation_report.input,
                    previous_output_entry=json.dumps(validation_report.output, indent=4) if validation_report.output else ""
                )
            )
    else:
        def factory(user_guidance: str, input_entry: str) -> SystemMessage:
            return SystemMessage(
                content=transformation_prompt_template.format(
                    task=TASK_TRANSFORM_CREATE,
                    general_guidelines=GENERAL_GUIDELINES,
                    output_guidelines=PYTHON_OUTPUT_GUIDELINES,
                    ocsf_version=ocsf_version,
                    ocsf_category_name=ocsf_category_name,
                    ocsf_category_schema=get_ocsf_category_schema(ocsf_version, ocsf_category_name),
                    ocsf_shapes=get_ocsf_shape_schemas(ocsf_version, ocsf_category_name),
                    input_entry=input_entry,
                    user_guidance=user_guidance,
                    previous_transform="",
                    validation_report="",
                    previous_input_entry="",
                    previous_output_entry=""
                )
            )
    
    return factory