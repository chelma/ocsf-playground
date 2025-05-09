import json

from typing import List

from backend.core.ocsf.ocsf_schemas import make_get_ocsf_event_schema, make_get_ocsf_object_schemas, PrintableOcsfEvent, PrintableOcsfObject
from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_schema_v1_1_0 import OCSF_EVENT_CLASSES as ocsf_events_V1_1_0, OCSF_SCHEMA as v1_1_0_schema


def get_ocsf_event_class_knowledge(ocsf_version: OcsfVersion, ocsf_event_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        event_details = next(
            event for event in ocsf_events_V1_1_0 if event["event_name"] == ocsf_event_name
        )
        return json.dumps(event_details, indent=4)
    
    return ""

def get_ocsf_event_schema(ocsf_version: OcsfVersion, event_name: str, paths: List[str]) -> PrintableOcsfEvent:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_event_schema(v1_1_0_schema)(event_name, paths)
    
    return None

def get_ocsf_object_schemas(ocsf_version: OcsfVersion, category_name: str, paths: List[str]) -> List[PrintableOcsfObject]:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_object_schemas(v1_1_0_schema)(category_name, paths)
    
    return []