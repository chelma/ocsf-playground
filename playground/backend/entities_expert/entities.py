from dataclasses import dataclass
import logging

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
class EntityReport:
    data_entry_type: str
    rationale: str
    entities: list[Entity]

    def to_json(self) -> dict:
        return {
            "data_entry_type": self.data_entry_type,
            "rationale": self.rationale,
            "entities": [entity.to_json() for entity in self.entities]
        }