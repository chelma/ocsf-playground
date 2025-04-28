import React from 'react';
import {
  Button,
  FormField,
  Select,
  SelectProps,
  SpaceBetween,
  Spinner
} from '@cloudscape-design/components';

export interface CategoryControlsProps {
  version: SelectProps.Option;
  category: SelectProps.Option;
  versionOptions: SelectProps.Options;
  categoryOptions: SelectProps.Options;
  isRecommending: boolean;
  hasRationale: boolean;
  onVersionChange: (option: SelectProps.Option) => void;
  onCategoryChange: (option: SelectProps.Option) => void;
  onGetRecommendation: () => void;
  onOpenGuidance: () => void;
  onOpenRationale: () => void;
}

const CategoryControls: React.FC<CategoryControlsProps> = ({
  version,
  category,
  versionOptions,
  categoryOptions,
  isRecommending,
  hasRationale,
  onVersionChange,
  onCategoryChange,
  onGetRecommendation,
  onOpenGuidance,
  onOpenRationale
}) => {
  return (
    <SpaceBetween size="m">
      {/* Version and Category Selection */}
      <div key="ocsf-version-category-selection">
        <SpaceBetween direction="horizontal" size="xs">
          <FormField label="OCSF Version">
            <Select
              selectedOption={version}
              onChange={({ detail }) => onVersionChange(detail.selectedOption)}
              options={versionOptions}
              placeholder="Select an OCSF version"
            />
          </FormField>
          <FormField label="OCSF Event Class">
            <Select
              selectedOption={category}
              onChange={({ detail }) => onCategoryChange(detail.selectedOption)}
              options={categoryOptions}
              placeholder="Select an OCSF event class"
            />
          </FormField>
        </SpaceBetween>
      </div>
      
      {/* GenAI buttons for OCSF categorization */}
      <div key="ocsf-genai-buttons">
        <SpaceBetween direction="horizontal" size="xs">
          {/* Button to get a GenAI recommendation for the Category */}
          <Button 
            onClick={onGetRecommendation} 
            variant="primary" 
            iconAlign="left" 
            iconName="gen-ai"
          >
            {isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
          </Button>

          {/* Button to set guidance */}
          <Button 
            iconAlign="left" 
            iconName="gen-ai" 
            onClick={onOpenGuidance}
            disabled={isRecommending}
          >
            {isRecommending ? <Spinner/> : "Set User Guidance"}
          </Button>
          
          {/* Button to view the rationale */}
          <Button 
            iconAlign="left" 
            iconName="status-info" 
            onClick={onOpenRationale}
            disabled={!hasRationale || isRecommending}
          >
            {isRecommending ? <Spinner/> : "View Rationale"}
          </Button>
        </SpaceBetween>
      </div>
    </SpaceBetween>
  );
};

export default CategoryControls;
