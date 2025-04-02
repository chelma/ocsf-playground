import logging

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.categorization_expert.task_def import OcsfCategory
from backend.categorization_expert.parameters import OcsfVersion

from backend.core.tools import ToolBundle


logger = logging.getLogger("categorization_expert")

def get_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=select_ocsf_category,
    )

class SelectOcsfCategory(BaseModel):
    """Select an OCSF category for specific data entry."""
    value: str = Field(description="A string value containing the OCSF Category name and NOTHING ELSE.")
    rationale: str = Field(description="A thorough explanation of why this particular OCSF category is the best pick available for the data entry.")

def select_ocsf_category(value: str, rationale: str) -> OcsfCategory:
    return OcsfCategory(value=value, rationale=rationale)

make_javascript_regex_tool = StructuredTool.from_function(
    func=select_ocsf_category,
    name="SelectOcsfCategory",
    args_schema=SelectOcsfCategory
)
