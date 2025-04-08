from abc import ABC, abstractmethod
from dataclasses import dataclass
import logging
from typing import Any, Dict

from backend.core.tasks import PlaygroundTask
from backend.transformation_expert.transforms import TransformBase


logger = logging.getLogger("backend")


@dataclass
class TransformTask(PlaygroundTask):
    category_name: str
    input: str
    transform: TransformBase = None

    def get_work_item(self) -> Any:
        return self.transform
    
    def set_work_item(self, new_work_item: Any):
        if not isinstance(new_work_item, TransformBase):
            raise TypeError("new_work_item must be of type TransformBase")
        self.transform = new_work_item

    @abstractmethod
    def get_tool_name(self) -> str:
        pass

    def to_json(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "transform": self.transform.to_json() if self.transform else None,
            "category_name": self.category_name,
        }
    
class PythonTransformTask(TransformTask):
    def get_tool_name(self) -> str:
        return "MakePythonTransform"