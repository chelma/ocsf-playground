from dataclasses import dataclass
import logging
from typing import Any, Dict

from backend.core.tasks import PlaygroundTask


logger = logging.getLogger("regex_expert")

@dataclass
class Regex:
    value: str
    rationale: str

    def to_json(self) -> Dict[str, str]:
        return {
            "value": self.value,
            "rationale": self.rationale
        }
    
@dataclass
class RegexTask(PlaygroundTask):
    input: str
    regex: Regex = None

    def get_work_item(self) -> Any:
        return self.regex
    
    def set_work_item(self, new_work_item: Any):
        if not isinstance(new_work_item, Regex):
            raise TypeError("new_work_item must be of type Regex")
        self.regex = new_work_item

    def get_tool_name(self) -> str:
        return "MakeJavascriptRegex"

    def to_json(self) -> Dict[str, Any]:
        return {
            "regex_id": self.task_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "regex": self.regex.to_json() if self.regex else None
        }