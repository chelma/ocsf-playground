from enum import Enum

"""
This module contains enumerated types representing the separate axes that a transformation can be defined along.
"""

class OcsfVersion(Enum):
    V_1_0 = "OCSF 1.0"
    V_1_0_RC_2 = "OCSF 1.0 RC2"
    V_1_0_RC_3 = "OCSF 1.0 RC3"
    V_1_1 = "OCSF 1.1"
    V_1_2 = "OCSF 1.2"
    V_1_3 = "OCSF 1.3"
    V_1_4 = "OCSF 1.4"
    V_1_5 = "OCSF 1.5"