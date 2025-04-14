import logging

from langchain_aws import ChatBedrockConverse

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.categorization_expert.prompting import get_system_prompt_factory
from backend.categorization_expert.tool_def import get_tool_bundle
from backend.categorization_expert.task_def import CategorizationTask

from backend.core.experts import DEFULT_BOTO_CONFIG, Expert, invoke_expert


logger = logging.getLogger("backend")


def get_categorization_expert(ocsf_version: OcsfVersion) -> Expert:
    logger.info(f"Building expert for: {ocsf_version}")

    # Get the tool bundle for the given transform language
    tool_bundle = get_tool_bundle(ocsf_version)

    # Define our Bedrock LLM and attach the tools to it
    llm = ChatBedrockConverse(
        model="us.anthropic.claude-3-7-sonnet-20250219-v1:0", 
        temperature=0, # Suitable for straightforward, practical code generation
        max_tokens=16000,
        region_name="us-west-2", # Models are only available in limited regions
        additional_model_request_fields={
            "thinking": {
                "type": "disabled"
            }
        },
        config=DEFULT_BOTO_CONFIG
    )
    llm_w_tools = llm.bind_tools(tool_bundle.to_list())

    return Expert(
        llm=llm_w_tools,
        system_prompt_factory=get_system_prompt_factory(
            ocsf_version=ocsf_version
        ),
        tools=tool_bundle
    )

def invoke_categorization_expert(expert: Expert, task: CategorizationTask) -> CategorizationTask:
    logger.info(f"Invoking the Categorization Expert for task_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Categorization performed for task_id: {task.task_id}")

    return task
