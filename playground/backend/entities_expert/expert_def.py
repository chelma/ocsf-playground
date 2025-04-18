import logging

from langchain_aws import ChatBedrockConverse

from backend.core.ocsf.ocsf_versions import OcsfVersion
from backend.entities_expert.prompting import get_analyze_system_prompt_factory, get_extract_system_prompt_factory
from backend.entities_expert.tool_def import get_analyze_tool_bundle, get_extract_tool_bundle
from backend.entities_expert.task_def import AnalysisTask, ExtractTask

from backend.core.experts import DEFULT_BOTO_CONFIG, Expert, invoke_expert


logger = logging.getLogger("backend")


def get_analysis_expert(ocsf_version: OcsfVersion, ocsf_category_name: str) -> Expert:
    logger.info(f"Building expert for: {ocsf_version}")

    tool_bundle = get_analyze_tool_bundle(ocsf_version)

    # Define our Bedrock LLM and attach the tools to it
    llm = ChatBedrockConverse(
            model="us.anthropic.claude-3-7-sonnet-20250219-v1:0", 
            temperature=1, # Must be 1 for "thinking" mode
            max_tokens=16001,
            region_name="us-west-2", # Models are only available in limited regions
            additional_model_request_fields={
                "thinking": {
                    "type": "enabled",
                    "budget_tokens": 16000
                }
            },
            config=DEFULT_BOTO_CONFIG
        )
    llm_w_tools = llm.bind_tools(tool_bundle.to_list())

    return Expert(
        llm=llm_w_tools,
        system_prompt_factory=get_analyze_system_prompt_factory(
            ocsf_version=ocsf_version,
            ocsf_category_name=ocsf_category_name
        ),
        tools=tool_bundle
    )

def invoke_analysis_expert(expert: Expert, task: AnalysisTask) -> AnalysisTask:
    logger.info(f"Invoking the Analysis Expert for task_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Analysis performed for task_id: {task.task_id}")

    return task

def get_extraction_expert(ocsf_version: OcsfVersion, ocsf_category_name: str) -> Expert:
    logger.info(f"Building expert for: {ocsf_version}")

    tool_bundle = get_extract_tool_bundle(ocsf_version)

    # Define our Bedrock LLM and attach the tools to it
    llm = ChatBedrockConverse(
            model="us.anthropic.claude-3-7-sonnet-20250219-v1:0", 
            temperature=0, # Good for straightforward, practical code generation
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
        system_prompt_factory=get_extract_system_prompt_factory(
            ocsf_version=ocsf_version,
            ocsf_category_name=ocsf_category_name
        ),
        tools=tool_bundle
    )

def invoke_extraction_expert(expert: Expert, task: ExtractTask) -> ExtractTask:
    logger.info(f"Invoking the Extraction Expert for task_id: {task.task_id}")
    invoke_expert(expert, task)
    logger.info(f"Extraction performed for task_id: {task.task_id}")

    return task
