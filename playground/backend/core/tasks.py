from abc import ABC, abstractmethod
from dataclasses import dataclass
import logging
from typing import Any, Dict, List

from langchain_core.messages import BaseMessage
from backend.core.inference import InferenceRequest


logger = logging.getLogger("backend")

@dataclass
class PlaygroundTask(ABC):
    task_id: str
    context: List[BaseMessage]

    @abstractmethod
    def get_work_item(self) -> Any:
        pass

    @abstractmethod
    def set_work_item(self, new_work_item: Any):
        pass

    @abstractmethod
    def get_tool_name(self) -> str:
        pass

    @abstractmethod
    def to_json(self) -> Dict[str, Any]:
        pass
    
    def to_inference_task(self) -> InferenceRequest:
        return InferenceRequest(
            task_id=self.task_id,
            context=self.context
        )