from backend.core.ocsf.ocsf_versions import OcsfVersion

from backend.categorization_expert.prompting.knowledge.ocsf_v1_1_0 import OCSF_GUIDANCE as v1_1_0_guidance, OCSF_KNOWLEDGE as v1_1_0_knowledge


def get_ocsf_guidance(ocsf_version: OcsfVersion) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return v1_1_0_guidance
    
    return ""

def get_ocsf_knowledge(ocsf_version: OcsfVersion) -> str:
    if ocsf_version == OcsfVersion.V1_1_0:
        return v1_1_0_knowledge
    
    return ""