import React from 'react';
import {
  Button,
  FormField,
  Select,
  SelectProps,
  SpaceBetween,
  Spinner
} from '@cloudscape-design/components';
import { CodeEditorProps } from '@cloudscape-design/components';
import CodeEditorWrapper from '../common/CodeEditorWrapper';
import { transformEditorContainerStyle } from '../../utils/styles';

export interface TransformControlsProps {
  language: SelectProps.Option;
  languageOptions: SelectProps.Options;
  logic: string;
  ace: any;
  isGenerating: boolean;
  hasValidOutput: boolean;
  hasValidTransform: boolean;
  isDefaultTransform: boolean;
  editorPreferences: CodeEditorProps.Preferences;
  aceLoading: boolean;
  onLanguageChange: (option: SelectProps.Option) => void;
  onLogicChange: (value: string) => void;
  onPreferencesChange: (preferences: CodeEditorProps.Preferences) => void;
  onTest: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onOpenGuidanceModal: () => void;
  onDebug: () => void;
}

const TransformControls: React.FC<TransformControlsProps> = ({
  language,
  languageOptions,
  logic,
  ace,
  isGenerating,
  hasValidOutput,
  hasValidTransform,
  isDefaultTransform,
  editorPreferences,
  aceLoading,
  onLanguageChange,
  onLogicChange,
  onPreferencesChange,
  onTest,
  onClear,
  onGetRecommendation,
  onOpenGuidanceModal,
  onDebug
}) => {
  return (
    <SpaceBetween size="m">
      {/* Transform Language Selection */}
      <div key="transform-language-selection">
        <FormField label="Transform Language">
          <div style={{ width: 'fit-content' }}>
            <Select
              selectedOption={language}
              onChange={({ detail }) => onLanguageChange(detail.selectedOption)}
              options={languageOptions}
              placeholder="Select a transform language"
              expandToViewport
            />
          </div>
        </FormField>
      </div>
      
      {/* Buttons for testing, clearing, and getting GenAI recommendations */}
      <SpaceBetween direction="horizontal" size="xs">
        {/* Button to test the transform logic against the selected log entry */}
        <Button onClick={onTest}>
          {isGenerating ? <Spinner/> : "Test Logic"}
        </Button>

        {/* Button to clear transform logic and results */}
        <Button onClick={onClear}>
          {isGenerating ? <Spinner/> : "Clear"}
        </Button>

        {/* Button to get a GenAI recommendation for the Transform Logic */}
        <Button onClick={onGetRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
          {isGenerating ? <Spinner/> : "Get GenAI Recommendation"}
        </Button>

        {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation */}
        <Button 
          iconAlign="left" 
          iconName="gen-ai" 
          onClick={onOpenGuidanceModal}
          disabled={isGenerating}
        >
          {isGenerating ? <Spinner/> : "Set User Guidance"}
        </Button>
        
        {/* New Button for debugging with GenAI */}
        <Button 
          iconAlign="left" 
          iconName="gen-ai" 
          onClick={onDebug}
          disabled={isGenerating || 
            !hasValidTransform || 
            isDefaultTransform || 
            !hasValidOutput}
          variant="normal"
        >
          {isGenerating ? <Spinner/> : "Debug with GenAI"}
        </Button>
      </SpaceBetween>
      
      {/* Transformation Code Editor */}
      <div key="transform-code-editor" style={transformEditorContainerStyle}>
        <FormField
          label="Transform Code"
          stretch={true}
        >
          <CodeEditorWrapper
            ace={ace}
            language={language.value === 'python' ? "python" : "javascript"}
            value={logic}
            onChange={onLogicChange}
            preferences={editorPreferences}
            onPreferencesChange={onPreferencesChange}
            loading={aceLoading || isGenerating}
          />
        </FormField>
      </div>
    </SpaceBetween>
  );
};

export default TransformControls;
