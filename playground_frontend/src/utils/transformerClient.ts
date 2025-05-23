import { 
  Configuration, 
  TransformerApi, 
  TransformerHeuristicCreateRequest, 
  TransformerCategorizeV110Request, 
  TransformerLogicV110CreateRequest, 
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

// Extract transformation patterns for entities
export const extractEntityPatterns = async (
  transformLanguage: TransformLanguageEnum,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string,
  mappings: any[]
) => {
  try {
    const payload = {
      transform_language: transformLanguage,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
      mappings: mappings
    };
    
    const response = await apiClient.transformerEntitiesV110ExtractCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Test extraction pattern
export const testExtractionPattern = async (
  transformLanguage: TransformLanguageEnum,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string,
  pattern: any
) => {
  try {
    const payload = {
      transform_language: transformLanguage,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
      patterns: [pattern]
    };
    
    const response = await apiClient.transformerEntitiesV110TestCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create transformer logic
export const createTransformerLogic = async (
  transformLanguage: TransformLanguageEnum,
  ocsfCategory: OcsfCategoryEnum,
  logEntry: string,
  patterns: any[]
) => {
  try {
    const payload = {
      transform_language: transformLanguage,
      ocsf_category: ocsfCategory,
      input_entry: logEntry,
      patterns: patterns
    };
    
    const response = await apiClient.transformerLogicV110CreateCreate(payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
