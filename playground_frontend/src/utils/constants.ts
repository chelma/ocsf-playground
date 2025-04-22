import { OcsfCategoryEnum, OcsfVersionEnum, TransformLanguageEnum } from '../generated-api-client';
import { SelectProps } from "@cloudscape-design/components";

// Default transform logic template
export const defaultTransformLogic = '# Write your transformation logic here\n\ndef transform(input_entry):\n    """Transform the input entry into OCSF format"""\n    # Your transformation code here\n    return {}';

// API base URL
export const API_BASE_URL = "http://localhost:8000";

// Select options for OCSF categories
export const ocsfCategoryOptions: SelectProps.Options = Object.values(OcsfCategoryEnum).map((value) => ({
  label: value,
  value,
}));

// Select options for OCSF versions
export const ocsfVersionOptions: SelectProps.Options = Object.values(OcsfVersionEnum).map((value) => ({
  label: value,
  value,
}));

// Select options for transform languages
export const transformLanguageOptions: SelectProps.Options = Object.values(TransformLanguageEnum).map((value) => ({
  label: value,
  value,
}));

// Default transform language
export const defaultTransformLanguage = transformLanguageOptions.find(
  option => option.value === TransformLanguageEnum.Python
) || transformLanguageOptions[0];
