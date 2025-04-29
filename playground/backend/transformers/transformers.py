from dataclasses import dataclass
import logging
from typing import List

from backend.entities_expert.extraction_pattern import ExtractionPattern
from backend.core.validation_report import ValidationReport


logger = logging.getLogger("backend")


@dataclass
class Transformer:
    id: str
    dependency_setup: str
    transformer_logic: str
    validation_report: ValidationReport = None

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "dependency_setup": self.dependency_setup,
            "transformer_logic": self.transformer_logic,
            "validation_report": self.validation_report.to_json() if self.validation_report else None
        }

def _get_pattern_function_name(pattern: ExtractionPattern) -> str:
    # Generate a function name based on the pattern ID
    return f"transformer_{pattern.mapping.ocsf_path.replace('.', '_').replace('/', '_')}"

def _get_pattern_function_code(pattern: ExtractionPattern) -> str:
    # Ensure the extract and transform logic are properly indented by adding 4 spaces to each line
    indented_extract_logic = "\n    ".join(pattern.extract_logic.splitlines())
    indented_transform_logic = "\n    ".join(pattern.transform_logic.splitlines())

    # Create/return the function code
    return f"""
def {_get_pattern_function_name(pattern)}(input_data: str) -> str:
    {indented_extract_logic}

    {indented_transform_logic}

    extracted_data = extract(input_data)
    transformed_data = transform(extracted_data)
    return transformed_data
"""

def _get_helper_code() -> str:
    return """
def set_path(d: typing.Dict[str, typing.Any], path: str, value: typing.Any) -> None:
    keys = path.split('.')
    for key in keys[:-1]:
        if key not in d or not isinstance(d[key], dict):
            d[key] = {}
        d = d[key]
    d[keys[-1]] = value

"""

def _get_transformer_wrapper_code(patterns: List[ExtractionPattern]) -> str:
    # Create a wrapper function that chains the extract and transform calls
    wrapper_code = "\n"
    wrapper_code += "def transformer(input_data: str) -> typing.Dict[str, typing.Any]:\n"
    wrapper_code += "    output = {}\n\n"

    for pattern in patterns:
        pattern_path = pattern.mapping.ocsf_path
        function_name = _get_pattern_function_name(pattern)
        wrapper_code += f"    {function_name}_result] = {function_name}(input_data)\n"
        wrapper_code += f"    set_path(output, '{pattern_path}', {function_name}_result)\n"
        wrapper_code += "\n"
    
    wrapper_code += "    return output\n"
    
    return wrapper_code


def create_transformer_python(transformer_id: str, patterns: List[ExtractionPattern]) -> Transformer:
    transformer_logic = ""

    # Add all the individual pattern functions to the transformer logic
    for pattern in patterns:
        function_code = _get_pattern_function_code(pattern)
        transformer_logic += function_code

    # Add any helper code
    helper_code = _get_helper_code()
    transformer_logic += helper_code

    # Add the wrapper function for the transformer logic
    transformer_logic += _get_transformer_wrapper_code(patterns)

    return Transformer(
        id=transformer_id,
        dependency_setup=patterns[0].dependency_setup if patterns else "",
        transformer_logic=transformer_logic
    )
