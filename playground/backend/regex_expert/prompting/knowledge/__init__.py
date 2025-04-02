from backend.regex_expert.parameters import RegexFlavor

from backend.regex_expert.prompting.knowledge.javascript import REGEX_GUIDANCE as javascript_guidance, REGEX_KNOWLEDGE as javascript_knowledge


def get_regex_guidance(regex_flavor: RegexFlavor) -> str:
    if regex_flavor == RegexFlavor.JAVASCRIPT:
        return javascript_guidance
    
    return ""

def get_regex_knowledge(regex_flavor: RegexFlavor) -> str:
    if regex_flavor == RegexFlavor.JAVASCRIPT:
        return javascript_knowledge
    
    return ""