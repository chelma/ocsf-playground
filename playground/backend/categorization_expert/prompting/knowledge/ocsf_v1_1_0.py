import json

from backend.core.ocsf.ocsf_schema_v1_1_0 import OCSF_EVENT_CLASSES

OCSF_GUIDANCE = """

"""

OCSF_KNOWLEDGE = """
<ocsf_event_classes>
{ocsf_event_classes}
</ocsf_event_classes>
""".format(ocsf_event_classes=json.dumps(OCSF_EVENT_CLASSES, indent=4))