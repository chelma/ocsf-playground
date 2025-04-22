import React from 'react';
import { Box } from '@cloudscape-design/components';
import ModalDialog from '../common/ModalDialog';

export interface RegexRationaleModalProps {
  visible: boolean;
  rationale: string;
  onClose: () => void;
}

const RegexRationaleModal: React.FC<RegexRationaleModalProps> = ({
  visible,
  rationale,
  onClose
}) => {
  return (
    <ModalDialog
      title="Regex Generation Rationale"
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

export default RegexRationaleModal;
