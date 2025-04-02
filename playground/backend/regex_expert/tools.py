from dataclasses import dataclass
import logging
from typing import List

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.regex_expert.utils.regexes import RegexJavascript
from backend.regex_expert.parameters import RegexFlavor


logger = logging.getLogger("regex_expert")


"""
This module contains the LLM tools for each modality, and functionality to pull the correct set of tools
for a given task.
"""

@dataclass
class ToolBundle:
    make_regex_tool: StructuredTool

    def to_list(self) -> List[StructuredTool]:
        return [self.make_regex_tool]

def get_tool_bundle(regex_flavor: RegexFlavor) -> ToolBundle:
    if regex_flavor == regex_flavor.JAVASCRIPT:
        return ToolBundle(
            make_regex_tool=make_javascript_regex_tool
        )
    raise NotImplementedError(f"No tool bundle found for transform language: {regex_flavor}")

class MakeJavascriptRegex(BaseModel):
    """Makes a standard ECMAScript regex (per Javascript's RegExp)."""
    value: str = Field(description="The string value of the regular expression to be created.")
    rationale: str = Field(description="A thorough explanation of how the regex works and why it was chosen for the given input.")

def make_javascript_regex(value: str, rationale: str) -> RegexJavascript:
    return RegexJavascript(value=value, rationale=rationale)

make_javascript_regex_tool = StructuredTool.from_function(
    func=make_javascript_regex,
    name="MakeJavascriptRegex",
    args_schema=MakeJavascriptRegex
)
