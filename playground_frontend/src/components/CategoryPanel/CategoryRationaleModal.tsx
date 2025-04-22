import React from 'react';
import { Box } from '@cloudscape-design/components';
import ModalDialog from '../common/ModalDialog';

export interface CategoryRationaleModalProps {
  visible: boolean;
  rationale: string;
  onClose: () => void;
}

const CategoryRationaleModal: React.FC<CategoryRationaleModalProps> = ({
  visible,
  rationale,
  onClose
}) => {
  return (
    <ModalDialog
      title="OCSF Category Recommendation Rationale"
      visible={visible}
      onClose={onClose}
      hideCancel={true}
      confirmLabel="Close"
    >
      <Box>
        <p style={{ whiteSpace: 'pre-wrap' }}>{rationale}</p>
      </Box>
    </ModalDialog>
  );
};

export default CategoryRationaleModal;
