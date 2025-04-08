import json

from backend.core.ocsf.ocsf_v1_1_0 import OCSF_CATEGORIES

OCSF_GUIDANCE = """

"""

OCSF_KNOWLEDGE = """
<ocsf_categories>
{ocsf_categories}
</ocsf_categories>
""".format(ocsf_categories=json.dumps(OCSF_CATEGORIES, indent=4))