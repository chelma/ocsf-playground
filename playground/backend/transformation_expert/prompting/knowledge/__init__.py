from backend.core.ocsf.ocsf_schemas import make_get_ocsf_category_schema, make_get_ocsf_shape_schemas
from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORY_SCHEMAS as v1_1_0_categories, OCSF_SHAPE_SCHEMAS as v1_1_0_shapes
from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.transformation_expert.prompting.knowledge.ocsf_v1_1_0 import OCSF_GUIDANCE as v1_1_0_guidance


def get_ocsf_guidance(ocsf_version: OcsfVersion) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return v1_1_0_guidance
    
    return ""

def get_ocsf_category_schema(ocsf_version: OcsfVersion, category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_category_schema(v1_1_0_categories)(category_name)
    
    return ""

def get_ocsf_shape_schemas(ocsf_version: OcsfVersion, category_name: str) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return make_get_ocsf_shape_schemas(v1_1_0_categories, v1_1_0_shapes)(category_name)
    
    return ""