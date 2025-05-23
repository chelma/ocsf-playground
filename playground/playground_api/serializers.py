from typing import Dict, Any

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_event_classes import OcsfEventClassesV1_1_0
from backend.transformers.parameters import TransformLanguage

class EnumChoiceField(serializers.ChoiceField):
    """
    Custom ChoiceField to work seamlessly with Enum types.
    Converts values to Enum members on validation.
    """
    def __init__(self, enum, **kwargs):
        self.enum = enum
        # Create choices from enum members
        choices = [(item.value, item.name) for item in enum]
        super().__init__(choices=choices, **kwargs)

    def to_internal_value(self, data):
        try:
            # Find the matching enum member by value
            for enum_member in self.enum:
                if data == enum_member.value or data == enum_member.name:
                    return enum_member
            
            # If we get here, no match was found
            self.fail('invalid_choice', input=data)
        except Exception as e:
            self.fail('invalid_choice', input=data)
    
    def to_representation(self, value):
        if isinstance(value, self.enum):
            return value.value
        return value


class TransformerHeuristicCreateRequestSerializer(serializers.Serializer):
    input_entry = serializers.CharField()
    existing_heuristic = serializers.CharField(required=False, default=None, allow_blank=True)
    user_guidance = serializers.CharField(required=False, default=None, allow_blank=True)
    
class TransformerHeuristicCreateResponseSerializer(serializers.Serializer):
    new_heuristic = serializers.CharField()
    rationale = serializers.CharField()

class TransformerCategorizeV1_1_0RequestSerializer(serializers.Serializer):
    input_entry = serializers.CharField()
    user_guidance = serializers.CharField(required=False, default=None, allow_blank=True)
    
class TransformerCategorizeV1_1_0ResponseSerializer(serializers.Serializer):
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    rationale = serializers.CharField()

@extend_schema_field({
    "type": "object",
    "properties": {
        "value": {"type": "string"},
        "description": {"type": "string"},
    },
    "required": ["value", "description"],
})
class EntityField(serializers.Field):
    """
    Custom serializer field to validate entity data with the structure:
    {"value": <string>, "description": <dict>}
    """

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")

        # Ensure required keys exist
        if 'value' not in data or 'description' not in data:
            raise serializers.ValidationError(
                "Must contain 'value' and 'description' keys."
            )

        # Validate `value`
        if not isinstance(data['value'], str):
            raise serializers.ValidationError("'value' must be a string.")

        # Validate `description`
        if not isinstance(data['description'], str):
            raise serializers.ValidationError("'description' must be a string.")

        return data

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        # Pass-through representation logic
        return value
    
@extend_schema_field({
    "type": "object",
    "properties": {
        "id": {"type": "string", "description": "Unique identifier for the entity mapping"},
        "entities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "value": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["value", "description"]
            },
            "description": "List of entities associated with this mapping"
        },
        "ocsf_path": {"type": "string", "description": "Period-delimited path in OCSF schema (e.g., 'http_request.url.port')"},
        "path_rationale": {"type": "string", "description": "A precise explanation of why the entity was mapped to the OCSF path"},
    },
    "required": ["id", "ocsf_path"],
})
class EntityMappingField(serializers.Field):
    """Custom serializer field for entity mapping data with OCSF path"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.entity_field = EntityField()

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")

        # Ensure required keys exist
        required_keys = ['id', 'ocsf_path']
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise serializers.ValidationError(
                f"Must contain {', '.join(required_keys)} keys."
            )

        # Validate id
        if not isinstance(data['id'], str):
            raise serializers.ValidationError("'id' must be a string.")
            
        # Validate entities using the existing EntityField
        if 'entities' in data:
            if not isinstance(data['entities'], list):
                raise serializers.ValidationError("'entities' must be a list.")
            for entity in data['entities']:
                try:
                    self.entity_field.to_internal_value(entity)
                except serializers.ValidationError as e:
                    raise serializers.ValidationError({"entities": e.detail})
        
        # Validate ocsf_path
        if not isinstance(data['ocsf_path'], str):
            raise serializers.ValidationError("'ocsf_path' must be a string.")
        
        # Validate path_rationale
        if 'path_rationale' in data and not isinstance(data['path_rationale'], str):
            raise serializers.ValidationError("'path_rationale' must be a string.")
            
        return {
            'id': data['id'],
            'entities': data.get('entities', None),
            'ocsf_path': data['ocsf_path'],
            'path_rationale': data.get('path_rationale', None)
        }

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        return value

class TransformerEntitiesV1_1_0AnalyzeRequestSerializer(serializers.Serializer):
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()

class TransformerEntitiesV1_1_0AnalyzeResponseSerializer(serializers.Serializer):
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    data_type = serializers.CharField()
    type_rationale = serializers.CharField()
    mappings = serializers.ListField(child=EntityMappingField())


@extend_schema_field({
    "type": "object",
    "properties": {
        "input": {"type": "string", "description": "Input data that was validated"},
        "output": {
            "type": "object",
            "additionalProperties": {"type": "string"},
            "description": "Output data that was generated"
        },
        "report_entries": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of validation messages or details"
        },
        "passed": {"type": "boolean", "description": "Whether validation passed (true) or failed (false)"}
    },
    "required": ["input", "output", "report_entries", "passed"],
})
class ValidationReportField(serializers.Field):
    """
    Custom serializer field for validation report data with the structure:
    {
        "input": <string>,
        "output": <dict>,
        "report_entries": [<string>, ...],
        "passed": <boolean>
    }
    """

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")

        # Ensure required keys exist
        required_keys = ['input', 'output', 'report_entries', 'passed']
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise serializers.ValidationError(
                f"Must contain {', '.join(required_keys)} keys."
            )

        # Validate input
        if not isinstance(data['input'], str):
            raise serializers.ValidationError("'input' must be a string.")

        # Validate output
        if not isinstance(data['output'], dict):
            raise serializers.ValidationError("'output' must be a dictionary.")

        # Validate report_entries
        if not isinstance(data['report_entries'], list):
            raise serializers.ValidationError("'report_entries' must be a list.")
        
        if not all(isinstance(entry, str) for entry in data['report_entries']):
            raise serializers.ValidationError("All entries in 'report_entries' must be strings.")

        # Validate passed
        if not isinstance(data['passed'], bool):
            raise serializers.ValidationError("'passed' must be a boolean.")

        return {
            'input': data['input'],
            'output': data['output'],
            'report_entries': data['report_entries'],
            'passed': data['passed']
        }

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        return value


@extend_schema_field({
    "type": "object",
    "properties": {
        "id": {"type": "string", "description": "Unique identifier for the extraction pattern"},
        "mapping": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "Unique identifier for the entity mapping"},
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "value": {"type": "string"},
                            "description": {"type": "string"},
                        },
                        "required": ["value", "description"]
                    },
                    "description": "List of entities associated with this mapping"
                },
                "ocsf_path": {"type": "string", "description": "Period-delimited path in OCSF schema (e.g., 'http_request.url.port')"},
                "path_rationale": {"type": "string", "description": "A precise explanation of why the entity was mapped to the OCSF path"},
            },
            "required": ["id", "entity", "ocsf_path"]
        },
        "dependency_setup": {"type": "string", "description": "The logic to set up any dependencies for the extraction/transformation logic, such as package import statements"},
        "extract_logic": {"type": "string", "description": "The extraction logic for the entity mapping, such a some Python or Javascript code"},
        "transform_logic": {"type": "string", "description": "The transformation logic for the entity mapping, such a some Python or Javascript code"},
        "validation_report": {
            "type": "object",
            "description": "Validation information for the extraction pattern",
            "properties": {
                "input": {"type": "string", "description": "Input data that was validated"},
                "output": {
                    "type": "object",
                    "additionalProperties": {"type": "string"},
                    "description": "Output data that was generated"
                },
                "report_entries": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of validation messages or details"
                },
                "passed": {"type": "boolean", "description": "Whether validation passed (true) or failed (false)"}
            },
            "required": ["input", "output", "report_entries", "passed"]
        }
    },
    "required": ["id", "extract_logic", "transform_logic"],
})
class ExtractionPatternField(serializers.Field):
    """Custom serializer field for an extraction patterns on entity mappings"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.mapping_field = EntityMappingField()
        self.validation_report_field = ValidationReportField()

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")

        # Ensure required keys exist
        required_keys = ['id', 'extract_logic', 'transform_logic']
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise serializers.ValidationError(
                f"Must contain {', '.join(required_keys)} keys."
            )

        # Validate id
        if not isinstance(data['id'], str):
            raise serializers.ValidationError("'id' must be a string.")

        # Validate mapping using the existing EntityMappingField
        if 'mapping' in data:
            try:
                mapping = self.mapping_field.to_internal_value(data['mapping'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"mapping": e.detail})
        
        # Validate dependency_setup
        if 'dependency_setup' in data and not isinstance(data['dependency_setup'], str):
            raise serializers.ValidationError("'dependency_setup' must be a string.")
            
        # Validate extract_logic
        if not isinstance(data['extract_logic'], str):
            raise serializers.ValidationError("'extract_logic' must be a string.")
            
        # Validate transform_logic
        if not isinstance(data['transform_logic'], str):
            raise serializers.ValidationError("'transform_logic' must be a string.")
        
        # Validate validation_report if present
        if 'validation_report' in data:
            try:
                validation_report = self.validation_report_field.to_internal_value(data['validation_report'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"validation_report": e.detail})
            
        return {
            'id': data['id'],
            'mapping': mapping if 'mapping' in data else None,
            'dependency_setup': data['dependency_setup'] if 'dependency_setup' in data else None,
            'extract_logic': data['extract_logic'],
            'transform_logic': data['transform_logic'],
            'validation_report': validation_report if 'validation_report' in data else None
        }

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        return value

class TransformerEntitiesV1_1_0ExtractRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    mappings = serializers.ListField(child=EntityMappingField())

class TransformerEntitiesV1_1_0ExtractResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    patterns = serializers.ListField(child=ExtractionPatternField())
    
    def validate_patterns(self, patterns):
        for i, pattern in enumerate(patterns):
            if not pattern.get('mapping'):
                raise serializers.ValidationError(
                    f"Pattern at index {i} must have a 'mapping' field in EntitiesExtractResponse context"
                )
            
            if not pattern.get('validation_report'):
                raise serializers.ValidationError(
                    f"Pattern at index {i} must have a 'validation_report' field in EntitiesExtractResponse context"
                )
        
        return patterns

class TransformerEntitiesV1_1_0TestRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    patterns = serializers.ListField(child=ExtractionPatternField())
    
    def validate_patterns(self, patterns):
        for i, pattern in enumerate(patterns):
            if not pattern.get('mapping'):
                raise serializers.ValidationError(
                    f"Pattern at index {i} must have a 'mapping' field in EntitiesTestRequest context"
                )
        
        return patterns

class TransformerEntitiesV1_1_0TestResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    patterns = serializers.ListField(child=ExtractionPatternField())
    
    def validate_patterns(self, patterns):
        for i, pattern in enumerate(patterns):
            if not pattern.get('validation_report'):
                raise serializers.ValidationError(
                    f"Pattern at index {i} must have a 'validation_report' field in EntitiesTestResponse context"
                )
        
        return patterns

class TransformerLogicV1_1_0CreateRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    input_entry = serializers.CharField()
    patterns = serializers.ListField(child=ExtractionPatternField())
    
    def validate_patterns(self, patterns):
        for i, pattern in enumerate(patterns):
            if not pattern.get('mapping'):
                raise serializers.ValidationError(
                    f"Pattern at index {i} must have a 'mapping' field in LogicCreateRequest context"
                )
        
        return patterns
    

@extend_schema_field({
    "type": "object",
    "properties": {
        "id": {"type": "string", "description": "Unique identifier for the transformer"},
        "dependency_setup": {"type": "string", "description": "The logic to set up any dependencies for the extraction/transformation logic, such as package import statements"},
        "transformer_logic": {"type": "string", "description": "The transformation logic, such a some Python or Javascript code"},
        "validation_report": {
            "type": "object",
            "description": "Validation information for the extraction pattern",
            "properties": {
                "input": {"type": "string", "description": "Input data that was validated"},
                "output": {
                    "type": "object",
                    "additionalProperties": {"type": "string"},
                    "description": "Output data that was generated"
                },
                "report_entries": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of validation messages or details"
                },
                "passed": {"type": "boolean", "description": "Whether validation passed (true) or failed (false)"}
            },
            "required": ["input", "output", "report_entries", "passed"]
        }
    },
    "required": ["id", "transformer_logic"],
})
class TransformerField(serializers.Field):
    """Custom serializer field for a transformer"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validation_report_field = ValidationReportField()

    def to_internal_value(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")

        # Ensure required keys exist
        required_keys = ["id", "transformer_logic"]
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise serializers.ValidationError(
                f"Must contain {', '.join(required_keys)} keys."
            )

        # Validate id
        if not isinstance(data['id'], str):
            raise serializers.ValidationError("'id' must be a string.")
        
        # Validate dependency_setup
        if 'dependency_setup' in data and not isinstance(data['dependency_setup'], str):
            raise serializers.ValidationError("'dependency_setup' must be a string.")
            
        # Validate transformer_logic
        if not isinstance(data['transformer_logic'], str):
            raise serializers.ValidationError("'transformer_logic' must be a string.")
        
        # Validate validation_report if present
        if 'validation_report' in data:
            try:
                validation_report = self.validation_report_field.to_internal_value(data['validation_report'])
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"validation_report": e.detail})
            
        return {
            'id': data['id'],
            'dependency_setup': data['dependency_setup'] if 'dependency_setup' in data else None,
            'transformer_logic': data['transformer_logic'],
            'validation_report': validation_report if 'validation_report' in data else None
        }

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        return value

class TransformerLogicV1_1_0CreateResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfEventClassesV1_1_0)
    transformer = TransformerField()
