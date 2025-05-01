from dataclasses import dataclass
from typing import List


@dataclass
class Entity:
    value: str
    description: str

    def to_json(self) -> dict:
        return {
            "value": self.value,
            "description": self.description
        }
    
    @classmethod
    def from_json(cls, json_data: dict) -> 'Entity':
        return cls(
            value=json_data['value'],
            description=json_data['description']
        )
    
@dataclass
class EntityMapping:
    id: str
    entities: List[Entity]
    ocsf_path: str
    path_rationale: str

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "entities": [entity.to_json() for entity in self.entities],
            "ocsf_path": self.ocsf_path,
            "path_rationale": self.path_rationale
        }
    
    @classmethod
    def from_json(cls, json_data: dict) -> 'EntityMapping':
        entities = [Entity.from_json(entity) for entity in json_data['entities']]
        return cls(
            id=json_data['id'],
            entities=entities,
            ocsf_path=json_data['ocsf_path'],
            path_rationale=json_data['path_rationale']
        )
    
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