import { useState } from 'react';
import { OcsfCategoryEnum, TransformLanguageEnum } from '../generated-api-client';
import { analyzeEntities, extractEntityPatterns, testExtractionPattern } from '../utils/transformerClient';
import { SelectProps } from '@cloudscape-design/components';
import { transformLanguageOptions, defaultTransformLanguage } from '../utils/constants';
import { EntityMapping, ExtractionPattern } from '../utils/types';

// Use the imported EntityMapping type instead of redefining
type EntityMappingField = EntityMapping;

export interface EntitiesState {
  isLoading: boolean;
  error: string | null;
  mappings: EntityMappingField[];
  extractionPatterns: ExtractionPattern[];
  isExtracting: boolean;
  dataType: string;
  typeRationale: string;
  hasRationale: boolean;
  language: SelectProps.Option;
  languageOptions: SelectProps.Options;
  analyzeEntities: () => Promise<void>;
  extractEntities: () => Promise<void>;
  clearEntities: () => void;
  onLanguageChange: (option: SelectProps.Option) => void;
  isTestingPattern: boolean;
  testPattern: (patternId: string, editedPattern?: Partial<ExtractionPattern>) => Promise<void>;
  updateMappings: (updatedMappings: EntityMappingField[]) => void;
}

interface EntitiesStateProps {
  logs: string[];
  selectedLogIds: string[];
  categoryValue?: OcsfCategoryEnum;
}

const useEntitiesState = ({
  logs,
  selectedLogIds,
  categoryValue,
}: EntitiesStateProps): EntitiesState => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<EntityMappingField[]>([]);
  const [extractionPatterns, setExtractionPatterns] = useState<ExtractionPattern[]>([]);
  const [dataType, setDataType] = useState<string>('');
  const [typeRationale, setTypeRationale] = useState<string>('');
  
  // Add language selection state using constants for consistency
  const [language, setLanguage] = useState<SelectProps.Option>(defaultTransformLanguage);
  
  // Use language options from constants.ts
  const languageOptions: SelectProps.Options = transformLanguageOptions;
  const [isTestingPattern, setIsTestingPattern] = useState<boolean>(false);

  const handleAnalyzeEntities = async () => {
    if (!selectedLogIds.length || !categoryValue) {
      setError("Please select a log entry and category before analyzing entities");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get the selected log entry
      const selectedLogEntry = logs[parseInt(selectedLogIds[0])];
      
      // Call the transformer client function
      const response = await analyzeEntities(categoryValue, selectedLogEntry);
      
      // Update state with the response
      setMappings(response.mappings);
      setDataType(response.data_type);
      setTypeRationale(response.type_rationale);
    } catch (error) {
      console.error('Error analyzing entities:', error);
      setError('Failed to analyze entities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractEntities = async () => {
    if (!selectedLogIds.length || !categoryValue) {
      setError("Please select a log entry and category before extracting entities");
      return;
    }

    if (mappings.length === 0) {
      setError("Please analyze entities first to get mappings for extraction");
      return;
    }

    try {
      setIsExtracting(true);
      setError(null);
      
      // Get the selected log entry
      const selectedLogEntry = logs[parseInt(selectedLogIds[0])];
      
      // Get transform language value
      const transformLanguage = language.value as TransformLanguageEnum;

      // Call the transformer client function for extraction
      const response = await extractEntityPatterns(
        transformLanguage, 
        categoryValue, 
        selectedLogEntry,
        mappings
      );
      
      // Update state with the response
      setExtractionPatterns(response.patterns);
    } catch (error) {
      console.error('Error extracting entity patterns:', error);
      setError('Failed to extract entity patterns. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTestPattern = async (patternId: string, editedPattern?: Partial<ExtractionPattern>) => {
    if (!selectedLogIds.length || !categoryValue) {
      setError("Please select a log entry and category before testing extraction pattern");
      return;
    }

    const patternToTest = extractionPatterns.find(p => p.id === patternId);
    if (!patternToTest) {
      setError(`Pattern with ID ${patternId} not found`);
      return;
    }

    try {
      setIsTestingPattern(true);
      setError(null);
      
      // Get the selected log entry
      const selectedLogEntry = logs[parseInt(selectedLogIds[0])];
      
      // Get transform language value
      const transformLanguage = language.value as TransformLanguageEnum;

      // Create a modified pattern if edits were provided, preserving mapping if it exists
      const testPattern = editedPattern 
        ? { 
            ...patternToTest, 
            ...editedPattern, 
            // Make sure we're not overriding the mapping if it wasn't explicitly provided
            mapping: editedPattern.mapping || patternToTest.mapping 
          }
        : patternToTest;

      // Call the transformer client function for testing the pattern
      const response = await testExtractionPattern(
        transformLanguage, 
        categoryValue, 
        selectedLogEntry,
        testPattern
      );
      
      // Update state with the response - replace the pattern in the array
      setExtractionPatterns(prevPatterns => {
        const newPatterns = [...prevPatterns];
        const index = newPatterns.findIndex(p => p.id === patternId);
        if (index !== -1 && response.patterns.length > 0) {
          newPatterns[index] = response.patterns[0];
        }
        return newPatterns;
      });
    } catch (error) {
      console.error('Error testing extraction pattern:', error);
      setError('Failed to test extraction pattern. Please try again.');
    } finally {
      setIsTestingPattern(false);
    }
  };

  const clearEntities = () => {
    setMappings([]);
    setExtractionPatterns([]);
    setDataType('');
    setTypeRationale('');
    setError(null);
  };

  const handleLanguageChange = (option: SelectProps.Option) => {
    setLanguage(option);
  };

  const updateMappings = (updatedMappings: EntityMappingField[]) => {
    setMappings(updatedMappings);
  };

  return {
    isLoading,
    isExtracting,
    error,
    mappings,
    extractionPatterns,
    dataType,
    typeRationale,
    hasRationale: typeRationale !== '',
    language,
    languageOptions,
    analyzeEntities: handleAnalyzeEntities,
    extractEntities: handleExtractEntities,
    clearEntities,
    onLanguageChange: handleLanguageChange,
    isTestingPattern,
    testPattern: handleTestPattern,
    updateMappings
  };
};

export default useEntitiesState;
