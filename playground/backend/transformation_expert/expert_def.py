import logging

from langchain_aws import ChatBedrockConverse

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.transformation_expert.parameters import TransformLanguage
from backend.transformation_expert.prompting import get_system_prompt_factory
from backend.transformation_expert.tool_def import get_tool_bundle
from backend.transformation_expert.task_def import TransformTask

from backend.core.experts import DEFULT_BOTO_CONFIG, Expert, invoke_expert


logger = logging.getLogger("backend")


def get_transformation_expert(ocsf_version: OcsfVersion, ocsf_category_name: str, transform_language: TransformLanguage, is_followup: bool) -> Expert:
    logger.info(f"Building expert for: {ocsf_version} {ocsf_category_name} {transform_language}")

    # Get the tool bundle for the given transform language
    tool_bundle = get_tool_bundle(transform_language)

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
            ocsf_version=ocsf_version,
            ocsf_category_name=ocsf_category_name,
            is_followup=is_followup
        ),
        tools=tool_bundle
    )

def invoke_transformation_expert(expert: Expert, task: TransformTask) -> TransformTask:
    logger.info(f"Invoking the Transformation Expert for task_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Transformation created for task_id: {task.task_id}")

    return task
