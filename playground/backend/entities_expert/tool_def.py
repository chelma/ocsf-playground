import logging
from typing import Any, Dict, List

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.tools import ToolBundle
from backend.entities_expert.entities import Entity, EntityReport


logger = logging.getLogger("backend")

def get_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=select_ocsf_category_tool,
    )

class EntityInput(BaseModel):
    """A single entity extracted from the data entry"""
    value: str = Field(description="The raw value extracted from the input data")
    description: str = Field(description="Explanation of what the value represents in context (e.g., source IP, event creation timestamp)")

class CreateEntitiesReport(BaseModel):
    """Create a list of entities extracted from a data entry"""
    data_entry_type: str = Field(description="A description of the type of data entry being processed")
    rationale: str = Field(description="The rationale for why you believe the data entry is the type you specified")
    entities: List[EntityInput] = Field(
        description="List of entities identified in the input data"
    )

def create_entities_report(data_entry_type: str, rationale: str, entities: List[EntityInput]) -> EntityReport:
    return EntityReport(
        data_entry_type=data_entry_type,
        rationale=rationale,
        entities=[Entity(value=entity.value, description=entity.description) for entity in entities]
    )

select_ocsf_category_tool = StructuredTool.from_function(
    func=create_entities_report,
    name="CreateEntitiesReport",
    args_schema=CreateEntitiesReport
)
