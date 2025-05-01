import logging
from typing import List
import uuid

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.tools import ToolBundle
from backend.entities_expert.entities import Entity, EntityMapping, EntityReport
from backend.entities_expert.extraction_pattern import ExtractionPattern


logger = logging.getLogger("backend")

def get_analyze_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=create_entities_resport_tool,
    )

class EntityInput(BaseModel):
    """A single entity extracted from the data entry"""
    value: str = Field(description="The raw value extracted from the input data.  It MUST have the exact value as it appears in the input entry.")
    description: str = Field(description="A precise explanation of what the value represents in the context of the entry. For example, 'Source IP address' is much better than 'IP address' or 'source address'.  Similarly, 'Event creation timestamp' is much better than 'timestamp' or 'time'.")

class EntityMappingInput(BaseModel):
    """A flexible mapping from the data entry to an OCSF path.  It can handle three cases: 1) the OCSF path is known and the entities are known, 2) the OCSF path is known but the entities are not, and 3) the OCSF path is unknown but the entities are known."""
    entities: List[EntityInput] = Field(description="The list of entities extracted from the input data.  Might be empty if the OCSF path is known but the entities are not.")
    ocsf_path: str = Field(description="Period-delimited path through the OCSF schema to a specific leaf field (e.g., 'http_request.url.port').  If you do not know which path to map the entity to, you can use 'unknown' as a placeholder.")
    path_rationale: str = Field(description="A precise explanation of how the mapping relates to the specified OCSF path.  If you know the entities are are relevant but the correct OCSF path, you can just explain their significance in the context of the schema.  If you know you need a mapping to the specific OCSF path but there are no matching entities, you can explain why you need the mapping, what its value should be, and what the OCSF path represents in the context of the entry.")

class CreateEntitiesReport(BaseModel):
    """Create a list of mappings for entities extracted from a data entry"""
    data_type: str = Field(description="A brief, but precise, explanation of the data entry's type, such as: 'SSH Auth log line from a RHEL host' or 'Active Directory Login event'")
    type_rationale: str = Field(description="A detailed and precise justification for your selection of the entry type.  It should also include any other options you considered and why you rejected them.")
    mappings: List[EntityMappingInput] = Field(
        description="List of entity mappings created from the input data entry",
    )

def create_entities_report(data_type: str, type_rationale: str, mappings: List[EntityMappingInput]) -> EntityReport:
    return EntityReport(
        data_type=data_type,
        type_rationale=type_rationale,
        mappings=[
            EntityMapping(
                id=str(uuid.uuid4()),
                entities=[
                    Entity(
                        value=entity.value,
                        description=entity.description
                    )
                    for entity in mapping.entities
                ],
                ocsf_path=mapping.ocsf_path,
                path_rationale=mapping.path_rationale
            )
            for mapping in mappings
        ]
    )

create_entities_resport_tool = StructuredTool.from_function(
    func=create_entities_report,
    name="CreateEntitiesReport",
    args_schema=CreateEntitiesReport
)


def get_extract_tool_bundle(ocsf_version: OcsfVersion) -> ToolBundle:
    # Use the same tool for all versions
    return ToolBundle(
        task_tool=generate_extraction_patterns_tool,
    )

class PythonExtractionPatternInput(BaseModel):
    """The Python extraction pattern for a single mapping of the input data entry to a specific OCSF schema path"""
    id: str = Field(description="The unique identifier for the mapping the pattern is associated with.  It MUST be the EXACT SAME as the mapping's identifier.")
    extract_logic: str = Field(description="The executable code that performs the extraction.  It MUST be a single function with the signature `def extract(input_entry: str) -> str:`.")
    transform_logic: str = Field(description="The executable code that performs the transformation.  It MUST be a single function with the signature `def transform(extracted_value: str) -> str:`.")
    

class GenerateExtractionPatterns(BaseModel):
    """Create a list of extraction patterns based on the input data entry and mappings."""
    patterns: List[PythonExtractionPatternInput] = Field(
        description="List of extraction patterns created for input data entry and mappings",
    )

def generate_extraction_patterns(patterns: List[PythonExtractionPatternInput]) -> List[ExtractionPattern]:
    static_imports = "import re\nimport typing\nimport json\nimport yaml\nimport xml\nimport datetime\nimport urllib"

    return [
        ExtractionPattern(
            id=pattern.id,
            dependency_setup=static_imports,
            extract_logic=pattern.extract_logic,
            transform_logic=pattern.transform_logic,
        )
        for pattern in patterns
    ]

generate_extraction_patterns_tool = StructuredTool.from_function(
    func=generate_extraction_patterns,
    name="GenerateExtractionPatterns",
    args_schema=GenerateExtractionPatterns
)