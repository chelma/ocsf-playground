from dataclasses import dataclass
import logging
from typing import List

from langchain_core.tools import StructuredTool


logger = logging.getLogger("core")


@dataclass
class ToolBundle:
    task_tool: StructuredTool

    def to_list(self) -> List[StructuredTool]:
        return [self.task_tool]
