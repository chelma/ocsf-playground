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

interface EntityMapping {
  id: string;
  entity: {
    value: string;
    description: string;
  };
  ocsf_path: string;
  path_rationale?: string;
}

export interface MappingDetailsModalProps {
  visible: boolean;
  mapping: EntityMapping | null;
  onClose: () => void;
}

const MappingDetailsModal: React.FC<MappingDetailsModalProps> = ({
  visible,
  mapping,
  onClose
}) => {
  if (!mapping) return null;

  return (
    <ModalDialog
      title="Entity Mapping Details"
      visible={visible}
      onClose={onClose}
      hideCancel={true}
      confirmLabel="Close"
      size="large"
    >
      <SpaceBetween size="l">
        {/* ID Section */}
        <Container
          header={<Header variant="h3">Mapping ID</Header>}
        >
          <Box variant="code">{mapping.id}</Box>
        </Container>
        
        {/* Entity Section */}
        <Container
          header={<Header variant="h3">Entity</Header>}
        >
          <ColumnLayout columns={1} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Value</Box>
              <Box variant="p">{mapping.entity.value}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <Box variant="p">{mapping.entity.description}</Box>
            </div>
          </ColumnLayout>
        </Container>

        {/* OCSF Mapping Section */}
        <Container
          header={<Header variant="h3">OCSF Mapping</Header>}
        >
          <ColumnLayout columns={1} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">OCSF Path</Box>
              <Box variant="code">{mapping.ocsf_path}</Box>
            </div>
            {mapping.path_rationale && (
              <div>
                <Box variant="awsui-key-label">Path Rationale</Box>
                <Box variant="p">{mapping.path_rationale}</Box>
              </div>
            )}
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ModalDialog>
  );
};

export default MappingDetailsModal;
