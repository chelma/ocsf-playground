import React from 'react';
import { Box, FormField, Header, SelectProps, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { borderContainerStyle } from '../../utils/styles';
import CategoryControls from './CategoryControls';
import CategoryRationaleModal from './CategoryRationaleModal';
import ModalDialog from '../common/ModalDialog';

export interface CategoryPanelProps {
  version: SelectProps.Option;
  category: SelectProps.Option;
  versionOptions: SelectProps.Options;
  categoryOptions: SelectProps.Options;
  guidance: string;
  guidanceTemp: string;
  rationale: string;
  isRecommending: boolean;
  guidanceModalVisible: boolean;
  rationaleModalVisible: boolean;
  onVersionChange: (option: SelectProps.Option) => void;
  onCategoryChange: (option: SelectProps.Option) => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onOpenRationaleModal: () => void;
  onCloseRationaleModal: () => void;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({
  version,
  category,
  versionOptions,
  categoryOptions,
  guidance,
  guidanceTemp,
  rationale,
  isRecommending,
  guidanceModalVisible,
  rationaleModalVisible,
  onVersionChange,
  onCategoryChange,
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
        <Header variant="h3">OCSF Categorization</Header>
        <SpaceBetween size="m">
          <CategoryControls
            version={version}
            category={category}
            versionOptions={versionOptions}
            categoryOptions={categoryOptions}
            isRecommending={isRecommending}
            hasRationale={!!rationale}
            onVersionChange={onVersionChange}
            onCategoryChange={onCategoryChange}
            onGetRecommendation={onGetRecommendation}
            onOpenGuidance={onOpenGuidanceModal}
            onOpenRationale={onOpenRationaleModal}
          />
          
          {/* Modal for setting category guidance */}
          <ModalDialog
            title="GenAI User Guidance (OCSF Categorization)"
            visible={guidanceModalVisible}
            onClose={onCloseGuidanceModal}
            onConfirm={onSetGuidance}
            confirmLabel="Set"
          >
            <FormField
              label="If you have guidance for the LLM when categorizing, set it here:"
            >
              <Textarea
                value={guidanceTemp}
                onChange={({ detail }) => onGuidanceTempChange(detail.value)}
                placeholder="Instead of the default behavior, I want you to do X instead..."
                rows={25}
              />
            </FormField>
          </ModalDialog>
          
          {/* Modal for displaying category rationale */}
          <CategoryRationaleModal
            visible={rationaleModalVisible}
            rationale={rationale}
            onClose={onCloseRationaleModal}
          />
        </SpaceBetween>
      </Box>
    </div>
  );
};

export default CategoryPanel;
