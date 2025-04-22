import React from 'react';
import { Box, FormField, Header, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { transformContainerStyle, transformNestedSplitStyle } from '../../utils/styles';
import TransformControls from './TransformControls';
import TransformOutput from './TransformOutput';
import ValidationReport from './ValidationReport';
import ModalDialog from '../common/ModalDialog';
import SplitLayout from '../common/SplitLayout';
import { CodeEditorProps, SelectProps } from '@cloudscape-design/components';

export interface TransformPanelProps {
  language: SelectProps.Option;
  languageOptions: SelectProps.Options;
  logic: string;
  output: string;
  guidance: string;
  guidanceTemp: string;
  guidanceModalVisible: boolean;
  isGenerating: boolean;
  editorPreferences: CodeEditorProps.Preferences;
  validation: {
    report: string[];
    outcome: string;
  };
  ace: any;
  aceLoading: boolean;
  isDefaultTransform: boolean;
  onLanguageChange: (option: SelectProps.Option) => void;
  onLogicChange: (value: string) => void;
  onPreferencesChange: (preferences: CodeEditorProps.Preferences) => void;
  onTest: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onDebug: () => void;
}

const TransformPanel: React.FC<TransformPanelProps> = ({
  language,
  languageOptions,
  logic,
  output,
  guidance,
  guidanceTemp,
  guidanceModalVisible,
  isGenerating,
  editorPreferences,
  validation,
  ace,
  aceLoading,
  isDefaultTransform,
  onLanguageChange,
  onLogicChange,
  onPreferencesChange,
  onTest,
  onClear,
  onGetRecommendation,
  onGuidanceTempChange,
  onSetGuidance,
  onOpenGuidanceModal,
  onCloseGuidanceModal,
  onDebug
}) => {
  // Check if we have valid transform and output for the debug button
  const hasValidTransform = logic.trim().length > 0;
  const hasValidOutput = validation.report.length > 0 || output.trim().length > 0;

  return (
    <div style={transformContainerStyle}>
      <Box>
        <Header variant="h3">Transformation Logic</Header>
        
        {/* Nested Split for transformation logic and results */}
        <SplitLayout
          style={transformNestedSplitStyle}
          sizes={[60, 40]} // 60% for logic, 40% for results
          minSize={100}
          direction="horizontal"
        >
          {/* Left nested pane - Transformation Controls */}
          <div style={{ 
            overflow: 'auto', 
            width: '100%', 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <TransformControls
              language={language}
              languageOptions={languageOptions}
              logic={logic}
              ace={ace}
              isGenerating={isGenerating}
              hasValidOutput={hasValidOutput}
              hasValidTransform={hasValidTransform}
              isDefaultTransform={isDefaultTransform}
              editorPreferences={editorPreferences}
              aceLoading={aceLoading}
              onLanguageChange={onLanguageChange}
              onLogicChange={onLogicChange}
              onPreferencesChange={onPreferencesChange}
              onTest={onTest}
              onClear={onClear}
              onGetRecommendation={onGetRecommendation}
              onOpenGuidanceModal={onOpenGuidanceModal}
              onDebug={onDebug}
            />
          </div>

          {/* Right nested pane - Transformation Results */}
          <div style={{ overflow: 'auto', padding: '0 5px', width: '100%', height: '100%' }}>
            <SpaceBetween size="m">
              {/* Transformation Output */}
              <TransformOutput output={output} />

              {/* Validation Report */}
              <ValidationReport report={validation.report} outcome={validation.outcome} />
            </SpaceBetween>
          </div>
        </SplitLayout>
      </Box>
      
      {/* Modal for setting transform guidance */}
      <ModalDialog
        title="GenAI User Guidance (Transform Logic)"
        visible={guidanceModalVisible}
        onClose={onCloseGuidanceModal}
        onConfirm={onSetGuidance}
        confirmLabel="Set"
      >
        <FormField
          label="If you have guidance for the LLM when generating transform logic, set it here:"
        >
          <Textarea
            value={guidanceTemp}
            onChange={({ detail }) => onGuidanceTempChange(detail.value)}
            placeholder="Instead of the default behavior, I want you to do X instead..."
            rows={25}
          />
        </FormField>
      </ModalDialog>
    </div>
  );
};

export default TransformPanel;
