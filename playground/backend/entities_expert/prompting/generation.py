import json
import logging
from typing import Any, Callable, Dict, List

from langchain_core.messages import SystemMessage

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.entities_expert.entities import EntityMapping
from backend.entities_expert.prompting.templates import analyze_prompt_template, extract_prompt_template
from backend.entities_expert.prompting.knowledge import get_ocsf_event_class_knowledge, get_ocsf_event_schema, get_ocsf_object_schemas

logger = logging.getLogger("backend")


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

        # Get the JSON representation of the event class schema, but only include the attributes that are relevant to the mapping
        # in order to reduce the size of the prompt
        event_schema = get_ocsf_event_schema(ocsf_version, ocsf_event_name, ocsf_paths)
        event_schema_simplified  = json.dumps(event_schema.to_dict(filter_attributes=True), indent=4) if event_schema else ""
        logger.debug(f"OCSF event class schema provided to the LLM: {event_schema_simplified}")

        # Like the event class schema, we get a reduced JSON representation of the object schemas.  We only include the objects
        # that are relevant to the OCSF paths being worked with, and only attributes in each object that are relevant to the mapping.
        object_schemas = get_ocsf_object_schemas(ocsf_version, ocsf_event_name, ocsf_paths)
        object_schemas_simplified = [obj.to_dict(filter_attributes=True) for obj in object_schemas]
        object_schemas_final = json.dumps([schema for schema in object_schemas_simplified if schema.get("attributes", None)], indent=4)
        logger.debug(f"OCSF object schemas provided to the LLM: {object_schemas_final}")

        return SystemMessage(
            content=extract_prompt_template.format(
                ocsf_version=ocsf_version,
                ocsf_event_class=get_ocsf_event_class_knowledge(ocsf_version, ocsf_event_name),
                ocsf_event_class_schema=event_schema_simplified,
                ocsf_object_schemas=object_schemas_final,
                input_entry=input_entry,
                mapping_list=json.dumps([obj.to_json() for obj in mapping_list], indent=4)
            )
        )
    
    return factory