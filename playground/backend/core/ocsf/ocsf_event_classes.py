from enum import Enum
import re

from backend.core.ocsf.ocsf_schema_v1_1_0 import OCSF_EVENT_CLASSES as ocsf_events_V1_1_0


# Create a custom Enum class that can extract name and ID
class OcsfEventClassEnum(Enum):
    def get_event_name(self):
        """Extract the event name from the value"""
        # Value format is "Event Name (ID)"
        return re.match(r"(.+) \(\d+\)", self.value).group(1)
    
    def get_event_id(self):
        """Extract the event ID from the value"""
        # Value format is "Event Name (ID)"
        return re.search(r"\((\d+)\)", self.value).group(1)

# Dynamically create the enum members for OCSF categories based on the master list
# Prepare the enum members dictionary
members = {
    f"{event_class["event_name"]} {event_class["event_id"]}".upper().replace(" ", "_").replace("-", "_"): 
    f"{event_class["event_name"]} ({event_class["event_id"]})"
    for event_class in ocsf_events_V1_1_0
}

# Create the enum class with all members at once, using the custom base class
OcsfEventClassesV1_1_0 = OcsfEventClassEnum(
    "OcsfEventClassesV1_1_0",
    members,
    module=__name__,  # Important to make the enum picklable
)