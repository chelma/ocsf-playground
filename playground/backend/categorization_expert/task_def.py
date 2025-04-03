from dataclasses import dataclass
import logging
from typing import Any, Dict

from backend.core.tasks import PlaygroundTask


logger = logging.getLogger("backend")

@dataclass
class OcsfCategory:
    value: str
    rationale: str

    def to_json(self) -> Dict[str, str]:
        return {
            "value": self.value,
            "rationale": self.rationale
        }
    
@dataclass
class CategorizationTask(PlaygroundTask):
    input: str
    category: OcsfCategory = None

    def get_work_item(self) -> Any:
        return self.category
    
    def set_work_item(self, new_work_item: Any):
        if not isinstance(new_work_item, OcsfCategory):
            raise TypeError("new_work_item must be of type OcsfCategory")
        self.category = new_work_item

    def get_tool_name(self) -> str:
        return "SelectOcsfCategory"

    def to_json(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "category": self.category.to_json() if self.category else None
        }