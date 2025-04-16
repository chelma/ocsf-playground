import json

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORIES as ocsf_categories_V1_1_0


def get_ocsf_category_knowledge(ocsf_version: OcsfVersion, ocsf_category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        category_details = next(
            category for category in ocsf_categories_V1_1_0 if category["category_name"] == ocsf_category_name
        )
        return json.dumps(category_details, indent=4)
    
    return ""