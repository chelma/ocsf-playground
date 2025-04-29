from dataclasses import dataclass

from backend.core.validation_report import ValidationReport
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
    
    @classmethod
    def from_json(cls, json_data: dict) -> 'ExtractionPattern':
        mapping = EntityMapping.from_json(json_data['mapping']) if json_data.get('mapping') else None
        validation_report = ValidationReport.from_json(json_data['validation_report']) if json_data.get('validation_report') else None
        return cls(
            id=json_data['id'],
            dependency_setup=json_data['dependency_setup'],
            extract_logic=json_data['extract_logic'],
            transform_logic=json_data['transform_logic'],
            mapping=mapping,
            validation_report=validation_report
        )