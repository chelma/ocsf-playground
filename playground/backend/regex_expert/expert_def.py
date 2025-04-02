from dataclasses import dataclass
import logging

from langchain_aws import ChatBedrockConverse

from backend.regex_expert.parameters import RegexFlavor
from backend.regex_expert.prompting import get_system_prompt_factory
from backend.regex_expert.tool_def import get_tool_bundle
from backend.regex_expert.task_def import RegexTask

from backend.core.experts import DEFULT_BOTO_CONFIG, Expert, invoke_expert


logger = logging.getLogger("regex_expert")


def get_regex_expert(regex_flavor: RegexFlavor) -> Expert:
    logger.info(f"Building expert for: {regex_flavor}")

    # Get the tool bundle for the given transform language
    tool_bundle = get_tool_bundle(regex_flavor)

    # Define our Bedrock LLM and attach the tools to it
    llm = ChatBedrockConverse(
        model="anthropic.claude-3-5-sonnet-20240620-v1:0", # This is the older version of the model, should be updated
        temperature=0, # Suitable for straightforward, practical code generation
        max_tokens=4096, # The maximum number of output tokens for this model
        region_name="us-west-2", # Somewhat necessary to hardcode, as models are only available in limited regions
        config=DEFULT_BOTO_CONFIG
    )
    llm_w_tools = llm.bind_tools(tool_bundle.to_list())

    return Expert(
        llm=llm_w_tools,
        system_prompt_factory=get_system_prompt_factory(
            regex_flavor=regex_flavor
        ),
        tools=tool_bundle
    )

def invoke_regex_expert(expert: Expert, task: RegexTask) -> RegexTask:
    logger.info(f"Invoking the Regex Expert for regex_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Regex created for regex_id: {task.task_id}")

    return task
