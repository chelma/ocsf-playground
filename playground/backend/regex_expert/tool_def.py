import logging

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.regex_expert.task_def import Regex
from backend.regex_expert.parameters import RegexFlavor

from backend.core.tools import ToolBundle


logger = logging.getLogger("backend")

"""
This module contains the LLM tools for each modality, and functionality to pull the correct set of tools
for a given task.
"""

def get_tool_bundle(regex_flavor: RegexFlavor) -> ToolBundle:
    if regex_flavor == regex_flavor.JAVASCRIPT:
        return ToolBundle(
            task_tool=make_javascript_regex_tool,
        )
    raise NotImplementedError(f"No tool bundle found for regex flavor: {regex_flavor}")

class MakeJavascriptRegex(BaseModel):
    """Makes a standard ECMAScript regex (per Javascript's RegExp)."""
    value: str = Field(description="The string value of the regular expression to be created.")
    rationale: str = Field(description="A thorough explanation of how the regex works and why it was chosen for the given input.")

def make_javascript_regex(value: str, rationale: str) -> Regex:
    return Regex(value=value, rationale=rationale)

make_javascript_regex_tool = StructuredTool.from_function(
    func=make_javascript_regex,
    name="MakeJavascriptRegex",
    args_schema=MakeJavascriptRegex
)
