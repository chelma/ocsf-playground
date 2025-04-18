from dataclasses import dataclass
import logging
from typing import Any, Dict, List

from backend.core.tasks import PlaygroundTask
from backend.entities_expert.entities import EntityReport, ExtractionPattern

logger = logging.getLogger("backend")

@dataclass
class AnalysisTask(PlaygroundTask):
    input: str
    entities_report: EntityReport = None

    def get_work_item(self) -> Any:
        return self.entities_report
    
    def set_work_item(self, new_work_item: Any):
        if not isinstance(new_work_item, EntityReport):
            raise TypeError("new_work_item must be of type EntityReport")
        self.entities_report = new_work_item

    def get_tool_name(self) -> str:
        return "CreateEntitiesReport"

    def to_json(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "entities_report": self.entities_report.to_json() if self.entities_report else None
        }
    
@dataclass
class ExtractTask(PlaygroundTask):
    input: str
    patterns: List[ExtractionPattern] = None

    def get_work_item(self) -> Any:
        return self.patterns
    
    def set_work_item(self, new_work_item: Any):
        if not isinstance(new_work_item, list) or not all(isinstance(item, ExtractionPattern) for item in new_work_item):
            raise TypeError("new_work_item must be a list of ExtractionPattern")
        self.patterns = new_work_item

    def get_tool_name(self) -> str:
        return "GenerateExtractionPatterns"

    def to_json(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "patterns": [pattern.to_json() for pattern in self.patterns] if self.patterns else None
        }