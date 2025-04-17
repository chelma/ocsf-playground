import logging
from typing import Any, Dict, List

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.tools import ToolBundle
from backend.entities_expert.entities import Entity, EntityMapping, EntityReport


logger = logging.getLogger("backend")

def get_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=create_entities_resport_tool,
    )

class EntityInput(BaseModel):
    """A single entity extracted from the data entry"""
    value: str = Field(description="The raw value extracted from the input data.  It MUST have the exact value as it appears in the input entry.")
    description: str = Field(description="A precise, but succinct, explanation of what the value represents in the context of the entry. For example, 'Source IP address' is much better than 'IP address' or 'source address'.  Similarly, 'Event creation timestamp' is much better than 'timestamp' or 'time'.")

class EntityMappingInput(BaseModel):
    """A mapping for a single entity extracted from the data entry to a specific OCSF path"""
    entity: EntityInput = Field(description="The entity extracted from the input data")
    ocsf_path: str = Field(description="Period-delimited path through the OCSF schema to a specific leaf field (e.g., 'http_request.url.port').  If you do not know which path to map the entity to, you can use 'unknown' as a placeholder.")
    path_rationale: str = Field(description="A precise, but succinct, explanation of why the entity is mapped to the specified OCSF path")

class CreateEntitiesReport(BaseModel):
    """Create a list of entities extracted from a data entry"""
    data_type: str = Field(description="A brief, but precise, explanation of the data entry's type, such as: 'SSH Auth log line from a RHEL host' or 'Active Directory Login event'")
    type_rationale: str = Field(description="A detailed and precise justification for your selection of the entry type.  It should also include any other options you considered and why you rejected them.")
    mappings: List[EntityMappingInput] = Field(
        description="List of entity mappings created from the input data entry",
    )

def create_entities_report(data_type: str, type_rationale: str, mappings: List[EntityMappingInput]) -> EntityReport:
    return EntityReport(
        data_type=data_type,
        type_rationale=type_rationale,
        mappings=[
            EntityMapping(
                entity=Entity(
                    value=entity_mapping.entity.value,
                    description=entity_mapping.entity.description
                ),
                ocsf_path=entity_mapping.ocsf_path,
                path_rationale=entity_mapping.path_rationale
            )
            for entity_mapping in mappings
        ]
    )

create_entities_resport_tool = StructuredTool.from_function(
    func=create_entities_report,
    name="CreateEntitiesReport",
    args_schema=CreateEntitiesReport
)
