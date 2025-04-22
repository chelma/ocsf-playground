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
  dataType: string;
  typeRationale: string;
  hasRationale: boolean;
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
  const [dataType, setDataType] = useState<string>('');
  const [typeRationale, setTypeRationale] = useState<string>('');

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

  const clearEntities = () => {
    setMappings([]);
    setDataType('');
    setTypeRationale('');
    setError(null);
  };

  return {
    isLoading,
    error,
    mappings,
    dataType,
    typeRationale,
    hasRationale: typeRationale !== '',
    analyzeEntities: handleAnalyzeEntities,
    clearEntities
  };
};

export default useEntitiesState;
