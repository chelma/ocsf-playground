from typing import Any, Callable, Dict

from langchain_core.messages import SystemMessage

from regex_expert.parameters import RegexFlavor
from regex_expert.prompting.knowledge import get_regex_guidance, get_regex_knowledge
from regex_expert.prompting.templates import javascript_regex_prompt_template


def _get_base_template(regex_flavor: RegexFlavor) -> str:
    if regex_flavor == RegexFlavor.JAVASCRIPT:
        return javascript_regex_prompt_template
    
    raise NotImplementedError(f"Regex flavor {regex_flavor} not currently supported.")

def get_system_prompt_factory(regex_flavor: RegexFlavor) -> Callable[[Dict[str, Any]], SystemMessage]:
    base_template = _get_base_template(regex_flavor)
    
    def factory(user_guidance: str, input_entry: str) -> SystemMessage:
        return SystemMessage(
            content=base_template.format(
                regex_flavor=regex_flavor,
                regex_guidance=get_regex_guidance(regex_flavor),
                regex_knowledge=get_regex_knowledge(regex_flavor),
                input_entry=input_entry,
                user_guidance=user_guidance
            )
        )
    
    return factory