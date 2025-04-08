import logging

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from backend.transformation_expert.parameters import TransformLanguage
from backend.transformation_expert.transforms import TransformPython

from backend.core.tools import ToolBundle


logger = logging.getLogger("backend")

def get_tool_bundle(transform_language: TransformLanguage) -> ToolBundle:
    if transform_language == TransformLanguage.PYTHON:
        return ToolBundle(
            task_tool=make_python_transform_tool
        )
    raise NotImplementedError(f"No tool bundle found for transform language: {transform_language}")

class MakePythonTransform(BaseModel):
    """Makes a Python transformation function to convert the input entry to OCSF JSON."""
    imports: str = Field(description="Some executable code that imports all necessary modules for the transform and NOTHING ELSE.")
    description: str = Field(description="A detailed description of the transformation logic.")
    code: str = Field(description="The executable code that performs the transformation.")

def make_python_transform(imports: str, description: str, code: str) -> TransformPython:
    return TransformPython(imports=imports, description=description, code=code)

make_python_transform_tool = StructuredTool.from_function(
    func=make_python_transform,
    name="MakePythonTransform",
    args_schema=MakePythonTransform
)