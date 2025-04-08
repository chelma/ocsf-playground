import logging

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.categorization_expert.task_def import OcsfCategory
from backend.core.ocsf.ocsf_versions import OcsfVersion

from backend.core.tools import ToolBundle


logger = logging.getLogger("backend")

def get_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=select_ocsf_category_tool,
    )

class SelectOcsfCategory(BaseModel):
    """Select an OCSF category for specific data entry."""
    name: str = Field(description="A string value containing the full OCSF Category name and NOTHING ELSE.")
    id: str = Field(description="A string value containing the OCSF Category id and NOTHING ELSE.")
    rationale: str = Field(description="A thorough explanation of why this particular OCSF category is the best pick available for the data entry.")

def select_ocsf_category(name: str, id: str, rationale: str) -> OcsfCategory:
    category = f"{name} ({id})"

    return OcsfCategory(value=category, rationale=rationale)

select_ocsf_category_tool = StructuredTool.from_function(
    func=select_ocsf_category,
    name="SelectOcsfCategory",
    args_schema=SelectOcsfCategory
)
