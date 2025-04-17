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
class EntityMapping:
    entity: Entity
    ocsf_path: str
    path_rationale: str

    def to_json(self) -> dict:
        return {
            "entity": self.entity.to_json(),
            "ocsf_path": self.ocsf_path,
            "path_rationale": self.path_rationale
        }
    
@dataclass
class EntityReport:
    data_type: str
    type_rationale: str
    mappings: list[EntityMapping]

    def to_json(self) -> dict:
        return {
            "data_type": self.data_type,
            "type_rationale": self.type_rationale,
            "mappings": [mapping.to_json() for mapping in self.mappings]
        }