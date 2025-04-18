from dataclasses import dataclass
import logging
from typing import List

from backend.entities_expert.validation import ValidationReportExtraction

logger = logging.getLogger("backend")

@dataclass
class Entity:
    value: str
    description: str

    def to_json(self) -> dict:
        return {
            "value": self.value,
            "description": self.description
        }
    
@dataclass
class EntityMapping:
    id: str
    entity: Entity
    ocsf_path: str
    path_rationale: str

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "entity": self.entity.to_json(),
            "ocsf_path": self.ocsf_path,
            "path_rationale": self.path_rationale
        }
    
@dataclass
class EntityReport:
    data_type: str
    type_rationale: str
    mappings: List[EntityMapping]

    def to_json(self) -> dict:
        return {
            "data_type": self.data_type,
            "type_rationale": self.type_rationale,
            "mappings": [mapping.to_json() for mapping in self.mappings]
        }
    
@dataclass
class ExtractionPattern:
    id: str
    logic: str
    mapping: EntityMapping = None
    validation_report: ValidationReportExtraction = None

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "mapping": self.mapping.to_json() if self.mapping else None,
            "logic": self.logic,
            "validation_report": self.validation_report.to_json() if self.validation_report else None
        }