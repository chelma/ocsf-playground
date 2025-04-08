from typing import Any, Callable, Dict

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.transformation_expert.prompting.knowledge import get_ocsf_guidance, get_ocsf_category_schema, get_ocsf_shape_schemas
from backend.transformation_expert.prompting.templates import python_transformation_prompt_template


def _get_base_template(ocsf_version: OcsfVersion) -> str:
    # Use the same template for all versions
    return python_transformation_prompt_template

def get_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_category_name: str) -> Callable[[Dict[str, Any]], SystemMessage]:
    base_template = _get_base_template(ocsf_version)
    
    def factory(user_guidance: str, input_entry: str) -> SystemMessage:
        return SystemMessage(
            content=base_template.format(
                ocsf_version=ocsf_version,
                ocsf_category_name=ocsf_category_name,
                ocsf_category_schema=get_ocsf_category_schema(ocsf_version, ocsf_category_name),
                ocsf_shapes=get_ocsf_shape_schemas(ocsf_version, ocsf_category_name),
                input_entry=input_entry,
                user_guidance=user_guidance
            )
        )
    
    return factory