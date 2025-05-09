import json
from typing import Any, Callable, Dict, List

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.entities_expert.entities import EntityMapping
from backend.entities_expert.prompting.templates import analyze_prompt_template, extract_prompt_template
from backend.entities_expert.prompting.knowledge import get_ocsf_event_class_knowledge, get_ocsf_event_schema, get_ocsf_object_schemas


def get_analyze_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_event_name: str) -> Callable[[Dict[str, Any]], SystemMessage]:
    
    def factory(input_entry: str) -> SystemMessage:
        event_schema = get_ocsf_event_schema(ocsf_version, ocsf_event_name, [])
        event_schema_simplified  = json.dumps(event_schema.to_dict(), indent=4) if event_schema else ""
        object_schemas = get_ocsf_object_schemas(ocsf_version, ocsf_event_name, [])
        object_schemas_simplified = json.dumps([obj.to_dict() for obj in object_schemas], indent=4)

        return SystemMessage(
            content=analyze_prompt_template.format(
                ocsf_version=ocsf_version,
                ocsf_event_class=get_ocsf_event_class_knowledge(ocsf_version, ocsf_event_name),
                ocsf_event_class_schema=event_schema_simplified,
                ocsf_object_schemas=object_schemas_simplified,
                input_entry=input_entry
            )
        )
    
    return factory

def get_extract_system_prompt_factory(ocsf_version: OcsfVersion, ocsf_event_name: str) -> Callable[[Dict[str, Any]], SystemMessage]:
    
    def factory(input_entry: str, mapping_list: List[EntityMapping]) -> SystemMessage:
        ocsf_paths = [mapping.ocsf_path for mapping in mapping_list]
        event_schema = get_ocsf_event_schema(ocsf_version, ocsf_event_name, ocsf_paths)
        event_schema_simplified  = json.dumps(event_schema.to_dict(filter_attributes=True), indent=4) if event_schema else ""
        object_schemas = get_ocsf_object_schemas(ocsf_version, ocsf_event_name, ocsf_paths)
        object_schemas_simplified = json.dumps([obj.to_dict(filter_attributes=True) for obj in object_schemas], indent=4)

        return SystemMessage(
            content=extract_prompt_template.format(
                ocsf_version=ocsf_version,
                ocsf_event_class=get_ocsf_event_class_knowledge(ocsf_version, ocsf_event_name),
                ocsf_event_class_schema=event_schema_simplified,
                ocsf_object_schemas=object_schemas_simplified,
                input_entry=input_entry,
                mapping_list=json.dumps([obj.to_json() for obj in mapping_list], indent=4)
            )
        )
    
    return factory