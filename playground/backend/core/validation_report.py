from dataclasses import dataclass
from typing import Any, Dict, List, Callable

@dataclass
class ValidationReport:
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
    
    @classmethod
    def from_json(cls, json_data: Dict[str, Any]) -> 'ValidationReport':
        return cls(
            input=json_data['input'],
            output=json_data.get('output'),
            report_entries=json_data.get('report_entries', []),
            passed=json_data.get('passed', False)
        )
    
    def append_entry(self, entry: str, logging_function: Callable[..., None]):
        logging_function(entry)
        self.report_entries.append(entry)