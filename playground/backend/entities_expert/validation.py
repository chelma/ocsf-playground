from dataclasses import dataclass
import logging
from typing import Any, Callable, Dict, List


logger = logging.getLogger("backend")


@dataclass
class ValidationReportExtraction:
    input: str
    output: Dict[str, Any]
    report_entries: List[str]
    passed: bool

    def to_json(self) -> Dict[str, Any]:
        return {
            "input": self.input,
            "output": self.output if self.output else None,
            "report_entries": self.report_entries if self.report_entries else None,
            "passed": self.passed
        }
    
    def append_entry(self, entry: str, logging_function: Callable[..., None]):
        logging_function(entry)
        self.report_entries.append(entry)
