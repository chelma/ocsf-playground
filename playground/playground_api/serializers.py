from rest_framework import serializers

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