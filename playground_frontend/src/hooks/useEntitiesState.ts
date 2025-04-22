import { useState } from 'react';
import { OcsfCategoryEnum } from '../generated-api-client';
import { analyzeEntities } from '../utils/transformerClient';

interface EntityMappingField {
  id: string;
  entity: {
    value: string;
    description: string;
  };
  ocsf_path: string;
  path_rationale?: string;
}

export interface EntitiesState {
  isLoading: boolean;
  error: string | null;
  mappings: EntityMappingField[];
  analyzeEntities: () => Promise<void>;
  clearEntities: () => void;
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
  const [error, setError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<EntityMappingField[]>([]);

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
      
      // Call the transformer client function instead of directly using the API client
      const response = await analyzeEntities(categoryValue, selectedLogEntry);
      
      // Update state with the response
      setMappings(response.mappings);
    } catch (error) {
      console.error('Error analyzing entities:', error);
      setError('Failed to analyze entities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearEntities = () => {
    setMappings([]);
    setError(null);
  };

  return {
    isLoading,
    error,
    mappings,
    analyzeEntities: handleAnalyzeEntities,
    clearEntities
  };
};

export default useEntitiesState;
