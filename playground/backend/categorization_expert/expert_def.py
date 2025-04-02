import logging

from langchain_aws import ChatBedrockConverse

from backend.categorization_expert.parameters import OcsfVersion
from backend.categorization_expert.prompting import get_system_prompt_factory
from backend.categorization_expert.tool_def import get_tool_bundle
from backend.categorization_expert.task_def import CategorizationTask

from backend.core.experts import DEFULT_BOTO_CONFIG, Expert, invoke_expert


logger = logging.getLogger("categorization_expert")


def get_categorization_expert(ocsf_version: OcsfVersion) -> Expert:
    logger.info(f"Building expert for: {ocsf_version}")

    # Get the tool bundle for the given transform language
    tool_bundle = get_tool_bundle(ocsf_version)

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
            regex_flavor=ocsf_version
        ),
        tools=tool_bundle
    )

def invoke_categorization_expert(expert: Expert, task: CategorizationTask) -> CategorizationTask:
    logger.info(f"Invoking the Categorization Expert for task_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Regex created for task_id: {task.task_id}")

    return task
