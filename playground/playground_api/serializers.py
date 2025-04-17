from typing import Dict, Any

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_categories import OcsfCategoriesV1_1_0
from backend.transformation_expert.parameters import TransformLanguage

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
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
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
        "entity": {
            "type": "object",
            "properties": {
                "value": {"type": "string"},
                "description": {"type": "string"},
            },
            "required": ["value", "description"]
        },
        "ocsf_path": {"type": "string", "description": "Period-delimited path in OCSF schema (e.g., 'http_request.url.port')"},
        "path_rationale": {"type": "string", "description": "A precise explanation of why the entity was mapped to the OCSF path"},
    },
    "required": ["entity", "ocsf_path"],
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
        required_keys = ['entity', 'ocsf_path']
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise serializers.ValidationError(
                f"Must contain {', '.join(required_keys)} keys."
            )

        # Validate entity using the existing EntityField
        try:
            entity = self.entity_field.to_internal_value(data['entity'])
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"entity": e.detail})
            
        # Validate ocsf_path
        if not isinstance(data['ocsf_path'], str):
            raise serializers.ValidationError("'ocsf_path' must be a string.")
        
        # Validate path_rationale
        if 'path_rationale' in data and not isinstance(data['path_rationale'], str):
            raise serializers.ValidationError("'path_rationale' must be a string.")
            
        return {
            'entity': entity,
            'ocsf_path': data['ocsf_path'],
            'path_rationale': data.get('path_rationale', None)
        }

    def to_representation(self, value: Dict[str, Any]) -> Dict[str, Any]:
        return value

class TransformerEntitiesV1_1_0AnalyzeRequestSerializer(serializers.Serializer):
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()

class TransformerEntitiesV1_1_0AnalyzeResponseSerializer(serializers.Serializer):
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    data_type = serializers.CharField()
    type_rationale = serializers.CharField()
    mappings = serializers.ListField(child=EntityMappingField())

class TransformerLogicV1_1_0CreateRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    user_guidance = serializers.CharField(required=False, default=None, allow_blank=True)

class TransformerLogicV1_1_0CreateResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    transform_logic = serializers.CharField()
    transform_output = serializers.CharField()
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    validation_report = serializers.ListField(child=serializers.CharField())
    validation_outcome = serializers.CharField()

class TransformerLogicV1_1_0TestRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    transform_logic = serializers.CharField()
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()

class TransformerLogicV1_1_0TestResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    transform_logic = serializers.CharField()
    transform_output = serializers.CharField()
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    validation_report = serializers.ListField(child=serializers.CharField())
    validation_outcome = serializers.CharField()

class TransformerLogicV1_1_0IterateRequestSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    transform_logic = serializers.CharField()
    transform_output = serializers.CharField(required=False, default=None, allow_blank=True)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    user_guidance = serializers.CharField(required=False, default=None, allow_blank=True)
    validation_report = serializers.ListField(child=serializers.CharField())
    validation_outcome = serializers.CharField()

class TransformerLogicV1_1_0IterateResponseSerializer(serializers.Serializer):
    transform_language = EnumChoiceField(enum=TransformLanguage)
    transform_logic = serializers.CharField()
    transform_output = serializers.CharField()
    ocsf_version = EnumChoiceField(enum=OcsfVersion)
    ocsf_category = EnumChoiceField(enum=OcsfCategoriesV1_1_0)
    input_entry = serializers.CharField()
    validation_report = serializers.ListField(child=serializers.CharField())
    validation_outcome = serializers.CharField()