import json

from backend.core.ocsf.ocsf_schemas import make_get_ocsf_category_schema, make_get_ocsf_shape_schemas
from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORIES as ocsf_categories_V1_1_0, OCSF_CATEGORY_SCHEMAS as v1_1_0_categories, OCSF_SHAPE_SCHEMAS as v1_1_0_shapes


def get_ocsf_category_knowledge(ocsf_version: OcsfVersion, ocsf_category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        category_details = next(
            category for category in ocsf_categories_V1_1_0 if category["category_name"] == ocsf_category_name
        )
        return json.dumps(category_details, indent=4)
    
    return ""

def get_ocsf_category_schema(ocsf_version: OcsfVersion, category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_category_schema(v1_1_0_categories)(category_name)
    
    return ""

def get_ocsf_shape_schemas(ocsf_version: OcsfVersion, category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_shape_schemas(v1_1_0_categories, v1_1_0_shapes)(category_name)
    
    return ""