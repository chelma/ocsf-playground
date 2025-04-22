import { 
  Configuration, 
  TransformerApi, 
  TransformerHeuristicCreateRequest, 
  TransformerCategorizeV110Request, 
  TransformerLogicV110CreateRequest, 
  TransformerLogicV110TestRequest,
  TransformerLogicV110IterateRequest,
  OcsfCategoryEnum,
  TransformLanguageEnum
} from '../generated-api-client';
import { API_BASE_URL } from './constants';
import { ApiError } from './types';

// Create API configuration and client
const apiConfig = new Configuration({ basePath: API_BASE_URL });
const apiClient = new TransformerApi(apiConfig);

// Centralized error handling for API calls
const handleApiError = (error: unknown): never => {
  const apiError = error as ApiError;
  
  if (apiError.response && apiError.response.data) {
    const serverErrorMessage = apiError.response.data.error || "An unknown error occurred.";
    console.error("Server error:", serverErrorMessage);
    throw new Error(`API error: ${serverErrorMessage}`);
  } else {
    console.error("Unexpected error:", apiError);
    throw new Error("An unexpected error occurred. Please try again later.");
  }
};

// Get regex heuristic recommendation
export const getRegexRecommendation = async (
  logEntry: string,
  existingPattern: string,
  guidance: string
) => {
  try {
    const payload: TransformerHeuristicCreateRequest = {
      input_entry: logEntry,
      existing_heuristic: existingPattern,
      user_guidance: guidance
    };
    const response = await apiClient.transformerHeuristicCreateCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get OCSF category recommendation
export const getCategoryRecommendation = async (
  logEntry: string,
  guidance: string
) => {
  try {
    const payload: TransformerCategorizeV110Request = {
      input_entry: logEntry,
      user_guidance: guidance
    };
    const response = await apiClient.transformerCategorizeV110Create(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Analyze entities in a log entry
export const analyzeEntities = async (
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string
) => {
  try {
    const payload = {
      ocsf_category: ocsfCategory,
      input_entry: logEntry
    };
    
    const response = await apiClient.transformerEntitiesV110AnalyzeCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get transform logic recommendation
export const getTransformRecommendation = async (
  transformLanguage: TransformLanguageEnum,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string,
  guidance: string
) => {
  try {
    const payload: TransformerLogicV110CreateRequest = {
      transform_language: transformLanguage,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
      user_guidance: guidance
    };
    
    const response = await apiClient.transformerLogicV110CreateCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Test transform logic
export const testTransformLogic = async (
  transformLanguage: TransformLanguageEnum,
  transformLogic: string,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string
) => {
  try {
    const payload: TransformerLogicV110TestRequest = {
      transform_language: transformLanguage,
      transform_logic: transformLogic,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
    };
    
    const response = await apiClient.transformerLogicV110TestCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Debug/iterate transform logic
export const debugTransformLogic = async (
  transformLanguage: TransformLanguageEnum,
  transformLogic: string,
  transformOutput: string | undefined,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string,
  guidance: string,
  validationReport: string[],
  validationOutcome: string
) => {
  try {
    const payload: TransformerLogicV110IterateRequest = {
      transform_language: transformLanguage,
      transform_logic: transformLogic,
      transform_output: transformOutput?.trim() !== '' ? transformOutput : undefined,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
      user_guidance: guidance,
      validation_report: validationReport,
      validation_outcome: validationOutcome || 'FAILED'
    };
    
    const response = await apiClient.transformerLogicV110IterateCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
