"use client";

import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';
import ModalDialog from '../common/ModalDialog';

export interface EntitiesRationaleModalProps {
  visible: boolean;
  dataType: string;
  typeRationale: string;
  onClose: () => void;
}

const EntitiesRationaleModal: React.FC<EntitiesRationaleModalProps> = ({
  visible,
  dataType,
  typeRationale,
  onClose
}) => {
  return (
    <ModalDialog
      title="Entities Analysis Rationale"
      visible={visible}
      onClose={onClose}
      hideCancel={true}
      confirmLabel="Close"
    >
      <SpaceBetween size="m">
        <Box>
          <h3>Data Type</h3>
          <p>{dataType}</p>
        </Box>
        <Box>
          <h3>Type Rationale</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{typeRationale}</p>
        </Box>
      </SpaceBetween>
    </ModalDialog>
  );
};

export default EntitiesRationaleModal;
