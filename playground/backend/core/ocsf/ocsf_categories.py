from enum import Enum
import re

from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORIES as OCSF_CATEGORIES_V1_1_0


# Create a custom Enum class that can extract name and ID
class OcsfCategoryEnum(Enum):
    def get_category_name(self):
        """Extract the category name from the value"""
        # Value format is "Category Name (ID)"
        return re.match(r"(.+) \(\d+\)", self.value).group(1)
    
    def get_category_id(self):
        """Extract the category ID from the value"""
        # Value format is "Category Name (ID)"
        return re.search(r"\((\d+)\)", self.value).group(1)

# Dynamically create the enum members for OCSF categories based on the master list
# Prepare the enum members dictionary
category_members = {
    f"{category['category_name']} {category['category_id']}".upper().replace(' ', '_').replace('-', '_'): 
    f"{category['category_name']} ({category['category_id']})"
    for category in OCSF_CATEGORIES_V1_1_0
}

# Create the enum class with all members at once, using the custom base class
OcsfCategoriesV1_1_0 = OcsfCategoryEnum(
    'OcsfCategoriesV1_1_0',
    category_members,
    module=__name__,  # Important to make the enum picklable
)