from enum import Enum

from backend.categorization_expert.prompting.knowledge.ocsf_v1_1_0 import OCSF_CATEGORIES as OCSF_CATEGORIES_V1_1_0


# Dynamically the enum members for OCSF categories based on the master list in the knowledge module
# Prepare the enum members dictionary
category_members = {
    f"{category['category_name']}".upper().replace(' ', '_').replace('-', '_'): 
    f"{category['category_name']}"
    for category in OCSF_CATEGORIES_V1_1_0
}

# Create the enum class with all members at once
OcsfCategoriesV1_1_0 = Enum(
    'OcsfCategoriesV1_1_0',
    category_members,
    module=__name__,  # Important to make the enum picklable
)



# class OcsfCategoriesV1_1_0(Enum):
#     """OCSF Categories for version 1.1.0"""
#     pass

# for category in OCSF_CATEGORIES_V1_1_0:
#     # Add the enum member dynamically
#     enum_name = f"{category['category_name']}_{category['category_id']}".upper().replace(' ', '_')
#     enum_value = f"{category['category_name']} {category['category_id']}"    
#     setattr(OcsfCategoriesV1_1_0, enum_name, enum_value)