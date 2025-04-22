import React from 'react';
import {
  Button,
  FormField,
  Input,
  SpaceBetween,
  Spinner
} from '@cloudscape-design/components';

export interface RegexControlsProps {
  pattern: string;
  error: string | null;
  isRecommending: boolean;
  onChange: (pattern: string) => void;
  onTest: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onOpenGuidance: () => void;
  onOpenRationale: () => void;
  hasRationale: boolean;
}

const RegexControls: React.FC<RegexControlsProps> = ({
  pattern,
  error,
  isRecommending,
  onChange,
  onTest,
  onClear,
  onGetRecommendation,
  onOpenGuidance,
  onOpenRationale,
  hasRationale
}) => {
  return (
    <SpaceBetween size="m">
      {/* Field to create and edit the regex */}
      <FormField
        label="Log Pattern Matcher"
        description="Enter a regular expression to match log entries."
        errorText={error}
        stretch={true}
      >
        <Input
          value={pattern}
          onChange={({ detail }) => onChange(detail.value)}
          placeholder="Enter regex pattern (e.g., .*error.*)"
          type="text"
        />
      </FormField>
      
      {/* Buttons in a horizontal row for pattern testing */}
      <SpaceBetween direction="horizontal" size="xs">
        {/* Button to test the regex by highlighting the log entries it applies to */}
        <Button onClick={onTest}>
          Test Pattern
        </Button>

        {/* Button to clear selections and input */}
        <Button onClick={onClear}>
          Clear
        </Button>
      </SpaceBetween>
      
      {/* GenAI buttons in a separate row */}
      <SpaceBetween direction="horizontal" size="xs">
        {/* Button to get a GenAI recommendation for the Regex */}
        <Button onClick={onGetRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
          {isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
        </Button>

        {/* Button for setting guidance */}
        <Button 
          iconAlign="left" 
          iconName="gen-ai" 
          onClick={onOpenGuidance}
          disabled={isRecommending}
        >
          {isRecommending ? <Spinner/> : "Set User Guidance"}
        </Button>
        
        {/* Button for viewing rationale */}
        <Button 
          iconAlign="left" 
          iconName="status-info" 
          onClick={onOpenRationale}
          disabled={!hasRationale || isRecommending}
        >
          {isRecommending ? <Spinner/> : "View Rationale"}
        </Button>
      </SpaceBetween>
    </SpaceBetween>
  );
};

export default RegexControls;
