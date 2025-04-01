from abc import ABC, abstractmethod
from dataclasses import dataclass
import logging
from typing import Any, Dict, List

from langchain_core.messages import BaseMessage


logger = logging.getLogger("regex_expert")

@dataclass
class RegexBase(ABC):
    value: str
    rationale: str

    def to_json(self) -> Dict[str, str]:
        return {
            "value": self.value,
            "rationale": self.rationale
        }

    @abstractmethod
    def get_tool_name(self) -> str:
        pass

@dataclass
class RegexJavascript(RegexBase):
    def get_tool_name(self) -> str:
        return "MakeJavascriptRegex"
    
@dataclass
class RegexTask:
    regex_id: str
    input: str
    context: List[BaseMessage]
    regex: RegexBase = None

    def to_json(self) -> Dict[str, Any]:
        return {
            "regex_id": self.regex_id,
            "input": self.input,
            "context": [turn.to_json() for turn in self.context],
            "regex": self.regex.to_json() if self.regex else None
        }