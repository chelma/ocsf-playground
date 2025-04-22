"use client";

import React from 'react';
import { 
  Box, 
  SpaceBetween, 
  ColumnLayout, 
  Container, 
  Header 
} from '@cloudscape-design/components';
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
      size="large"
    >
      <SpaceBetween size="l">
        {/* Data Type Section */}
        <Container
          header={<Header variant="h3">Data Type</Header>}
        >
          <Box variant="code">{dataType}</Box>
        </Container>
        
        {/* Type Rationale Section */}
        <Container
          header={<Header variant="h3">Type Rationale</Header>}
        >
          <ColumnLayout columns={1} variant="text-grid">
            <div>
              <Box variant="p">
                <span style={{ whiteSpace: 'pre-wrap' }}>{typeRationale}</span>
              </Box>
            </div>
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ModalDialog>
  );
};

export default EntitiesRationaleModal;
