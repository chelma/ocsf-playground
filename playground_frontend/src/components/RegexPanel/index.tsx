import React from 'react';
import { Box, FormField, Header, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { borderContainerStyle } from '../../utils/styles';
import RegexControls from './RegexControls';
import RegexRationaleModal from './RegexRationaleModal';
import ModalDialog from '../common/ModalDialog';

export interface RegexPanelProps {
  pattern: string;
  guidance: string;
  guidanceTemp: string;
  rationale: string;
  error: string | null;
  isRecommending: boolean;
  guidanceModalVisible: boolean;
  rationaleModalVisible: boolean;
  matchCount: number;
  totalLogsCount: number;
  onPatternChange: (value: string) => void;
  onTestPattern: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onOpenRationaleModal: () => void;
  onCloseRationaleModal: () => void;
}

const RegexPanel: React.FC<RegexPanelProps> = ({
  pattern,
  guidance,
  guidanceTemp,
  rationale,
  error,
  isRecommending,
  guidanceModalVisible,
  rationaleModalVisible,
  matchCount,
  totalLogsCount,
  onPatternChange,
  onTestPattern,
  onClear,
  onGetRecommendation,
  onGuidanceTempChange,
  onSetGuidance,
  onOpenGuidanceModal,
  onCloseGuidanceModal,
  onOpenRationaleModal,
  onCloseRationaleModal
}) => {
  return (
    <div style={borderContainerStyle}>
      <Box>
        <Header variant="h3">Regex Pattern Testing</Header>
        <SpaceBetween size="m">
          <RegexControls
            pattern={pattern}
            error={error}
            isRecommending={isRecommending}
            onChange={onPatternChange}
            onTest={onTestPattern}
            onClear={onClear}
            onGetRecommendation={onGetRecommendation}
            onOpenGuidance={onOpenGuidanceModal}
            onOpenRationale={onOpenRationaleModal}
            hasRationale={!!rationale}
          />
          
          {/* User Guidance Modal Dialog */}
          <ModalDialog
            title="GenAI User Guidance (Regex)"
            visible={guidanceModalVisible}
            onClose={onCloseGuidanceModal}
            onConfirm={onSetGuidance}
            confirmLabel="Set"
          >
            <FormField
              label="If you have guidance for the LLM when generating your regex, set it here:"
              stretch={true}
            >
              <Textarea
                value={guidanceTemp}
                onChange={({ detail }) => onGuidanceTempChange(detail.value)}
                placeholder="Instead of the default behavior, I want you to do X instead..."
                rows={25}
              />
            </FormField>
          </ModalDialog>
          
          {/* Modal for displaying regex rationale */}
          <RegexRationaleModal
            visible={rationaleModalVisible}
            rationale={rationale}
            onClose={onCloseRationaleModal}
          />
          
          {matchCount > 0 && (
            <Box>
              <p>{matchCount} log entries matched your pattern.</p>
            </Box>
          )}
          
          {matchCount === 0 && totalLogsCount > 0 && (
            <Box>
              <p>No log entries matched your pattern.</p>
            </Box>
          )}
        </SpaceBetween>
      </Box>
    </div>
  );
};

export default RegexPanel;
