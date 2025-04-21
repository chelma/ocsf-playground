from dataclasses import dataclass

from backend.entities_expert.validation_report import ValidationReport
from backend.entities_expert.entities import EntityMapping


@dataclass
class ExtractionPattern:
    id: str
    dependency_setup: str
    extract_logic: str
    transform_logic: str
    mapping: EntityMapping = None
    validation_report: ValidationReport = None

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "mapping": self.mapping.to_json() if self.mapping else None,
            "dependency_setup": self.dependency_setup,
            "extract_logic": self.extract_logic,
            "transform_logic": self.transform_logic,
            "validation_report": self.validation_report.to_json() if self.validation_report else None
        }