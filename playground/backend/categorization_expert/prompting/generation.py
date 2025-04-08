from typing import Any, Callable, Dict

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.categorization_expert.prompting.knowledge import get_ocsf_guidance, get_ocsf_knowledge
from backend.categorization_expert.prompting.templates import categorization_prompt_template


def _get_base_template(ocsf_version: OcsfVersion) -> str:
    # Use the same template for all versions
    return categorization_prompt_template

def get_system_prompt_factory(ocsf_version: OcsfVersion) -> Callable[[Dict[str, Any]], SystemMessage]:
    base_template = _get_base_template(ocsf_version)
    
    def factory(user_guidance: str, input_entry: str) -> SystemMessage:
        return SystemMessage(
            content=base_template.format(
                ocsf_version=ocsf_version,
                ocsf_knowledge=get_ocsf_guidance(ocsf_version),
                ocsf_guidance=get_ocsf_knowledge(ocsf_version),
                input_entry=input_entry,
                user_guidance=user_guidance
            )
        )
    
    return factory