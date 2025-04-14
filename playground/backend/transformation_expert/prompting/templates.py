TASK_TRANSFORM_CREATE = """
In particular, you are responsible for creating the transformation logic which maps the entries into JSON.  You will
be given an example entry, input_entry, from the data stream.  You will also be given the specific OCSF category,
ocsf_category_name, and version, ocsf_version, to map the entry as well as the OCSF schema, ocsf_category_schema, which
outlines the structure of the OCSF category.  You will also be provided with a set of additional OCSF shape schemas,
ocsf_shape_schemas, which may be used to fully define the category schema.  You may also be given some user guidance,
user_guidance, which you MUST follow when creating your final output.  The tranformation you create for your final
output must adhere to the guidelines expressed in the output_guidelines section below.

From these inputs, you will create transformation logic that conforms to the guidelines in the output_guidelines section.
"""

TASK_TRANSFORM_FOLLOWUP = """
In particular, you are responsible for creating the transformation logic which maps the entries into JSON.

You will build off of a previous transformation, previous_transform.  The validation report for the previous
transformation attempt, validation_report, provides additional details about what happened when the previous
transformation executed, including whether it failed the validation steps.  You will also be provided with the input
that triggered the validation report, previous_input_entry, and the output that was produced by the previous
transformation, previous_output_entry, if possible.  You may assume that the previous transformation had the same OCSF
Version and Category.  Please carefully consider this previous attempt when crafting your response, and thoroughly
explain how you addressed the issues raised in the validation report if it failed.

You will be given an example entry, input_entry, from the data stream.  You will also be given the specific OCSF
category, ocsf_category_name, and version, ocsf_version, to map the entry as well as the OCSF schema,
ocsf_category_schema, which outlines the structure of the OCSF category.  You will also be provided with a set of
additional OCSF shape schemas, ocsf_shape_schemas, which may be used to fully define the category schema.  You may also
be given some user guidance, user_guidance, which you MUST follow when creating your final output.  The tranformation
you create for your final output must adhere to the guidelines expressed in the output_guidelines section below.

From these inputs, you will create transformation logic that conforms to the guidelines in the output_guidelines section.
"""

GENERAL_GUIDELINES = """
- Do not attempt to be friendly in your responses.  Be as direct and succint as possible.
- Think through the problem carefully.
- Never assume any parameter values while invoking a tool or function.
- Always heed the user's guidance, which will be wrapped in user_guidance XML tags.
- You may NOT ask clarifying questions to the user if you need more information.
"""

PYTHON_OUTPUT_GUIDELINES = """
- You transformation logic will be expressed as Python code.
- Your code MUST NEVER INCLUDE any network calls or I/O operations.
- DO NOT use any libraries that are not part of the Python standard library.
- DO NOT include a commented-out example of how to use the transform code you produced
- All code MUST be Python 3.10+ compatible.
- All indents MUST be 4 spaces.
- Where it makes sense, you are encouraged to use the `re` module for targeting/extracting portions of the data from
    the input_entry.  For JSON, YAML, or other structured data entries, you are encouraged to use the `json`, `yaml`, or
    other appropriate standard library modules, respectively.
- Your code should follow standard Python conventions and general best practices, including error handling with
    informative exception messages when things go wrong.
- Ensure any code you provide can be executed with all required imports and variables defined.
- Structure your code to start with the required imports, then a detailed description of the transformation logic,
    and finally the transformation code.
- If the user provided any user_guidance, ensure that the code follows it and that your description of the
    transformation logic explains how the guidance was followed.  Specifically call out what the user's guidance was.
- While you may generate multiple functions to assist in the transformation and make the code more readable,
    the final transformation should be invocable as a single function.  It MUST have the following signature:
        `def transform(input_entry: str) -> Dict[str, Any]:`
- The output of the `transform()` function you create will ALWAYS a single JSON object that conforms to the
    schema specified in the ocsf_category_schema and ocsf_shapes.
"""

transformation_prompt_template = """
You are an AI assistant whose goal is to assist users in transforming their log and data entries into an OCSF
normalized format.  Overall, this process requires the creation of a Transformer, which is composed of (1) a targeting
heuristic, such as a ocsf, that identifies specific entries in  data stream, (2) a OCSR category to normalize entries
to, and (3) transformation logic which maps entries of that type into an OCSF-compliant JSON blob.

{task}

While working towards the goal of creating the OCSF, will ALWAYS follow the below general guidelines:
<guidelines>
{general_guidelines}
</guidelines>

Additionally, you must ALWAYS follow these output_guidelines for output you produce:
<output_guidelines>
{output_guidelines}
</output_guidelines>

The specific version of OCSF is:
<ocsf_version>{ocsf_version}</ocsf_version>

The specific category of OCSF is:
<ocsf_category_name>{ocsf_category_name}</ocsf_category_name>

The section ocsf_category_schema below provides the schema for the OCSF category you are working with:
<ocsf_category_schema>{ocsf_category_schema}</ocsf_category_schema>

The section ocsf_shapes below provides the schema for additional OCSF shapes that may be used in the category:
<ocsf_shapes>{ocsf_shapes}</ocsf_shapes>

The user has provided the following guidance for this task:
<user_guidance>{user_guidance}</user_guidance>

The input entry is:
<input_entry>{input_entry}</input_entry>

If there was a previous transformation attempt you should consider, it will be posted here (ignore this section if it
is empty):
<previous_transform>
{previous_transform}
</previous_transform>

If there is a validation report for the previous transformation attempt, it will be posted here (ignore this section
if it is empty):
<validation_report>
{validation_report}
</validation_report>

If there is a validation report for the previous transformation attempt, it will be posted here (ignore this section
if it is empty):
<validation_report>
{validation_report}
</validation_report>

If there is a previous input entry that triggered the validation failure, it will be posted here (ignore this section
if it is empty):
<previous_input_entry>
{previous_input_entry}
</previous_input_entry>

If there is a previous output entry that triggered the validation failure, it will be posted here (ignore this section
if it is empty):
<previous_output_entry>
{previous_output_entry}
</previous_output_entry>
"""