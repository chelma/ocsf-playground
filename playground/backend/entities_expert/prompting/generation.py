import json
from typing import Any, Callable, Dict, List

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.entities_expert.entities import EntityMapping
from backend.entities_expert.prompting.templates import analyze_prompt_template, extract_prompt_template
from backend.entities_expert.prompting.knowledge import get_ocsf_category_knowledge, get_ocsf_category_schema, get_ocsf_shape_schemas


def get_analyze_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_category_name: str) -> Callable[[Dict[str, Any]], SystemMessage]:
    
    def factory(input_entry: str) -> SystemMessage:
        return SystemMessage(
            content=analyze_prompt_template.format(
                ocsf_version=ocsf_version,
                ocsf_category=get_ocsf_category_knowledge(ocsf_version, ocsf_category_name),
                ocsf_category_schema=get_ocsf_category_schema(ocsf_version, ocsf_category_name),
                ocsf_shape_schemas=get_ocsf_shape_schemas(ocsf_version, ocsf_category_name),
                input_entry=input_entry
            )
        )
    
    return factory

def get_extract_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_category_name: str) -> Callable[[Dict[str, Any]], SystemMessage]:
    
    def factory(input_entry: str, mapping_list: List[EntityMapping]) -> SystemMessage:
        return SystemMessage(
            content=extract_prompt_template.format(
                ocsf_version=ocsf_version,
                ocsf_category=get_ocsf_category_knowledge(ocsf_version, ocsf_category_name),
                ocsf_category_schema=get_ocsf_category_schema(ocsf_version, ocsf_category_name),
                ocsf_shape_schemas=get_ocsf_shape_schemas(ocsf_version, ocsf_category_name),
                input_entry=input_entry,
                mapping_list=json.dumps(mapping_list, indent=4)
            )
        )
    
    return factory