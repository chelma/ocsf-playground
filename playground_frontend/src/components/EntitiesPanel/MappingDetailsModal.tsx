"use client";

import React, { useState } from 'react';
import { 
  Box, 
  SpaceBetween, 
  ColumnLayout, 
  Container, 
  Header,
  Tabs,
  CodeEditorProps
} from '@cloudscape-design/components';
import CodeEditorWrapper from '../common/CodeEditorWrapper';
import ValidationReport from '../common/ValidationReport';
import ModalDialog from '../common/ModalDialog';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-dawn';

interface EntityMapping {
  id: string;
  entity: {
    value: string;
    description: string;
  };
  ocsf_path: string;
  path_rationale?: string;
}

interface ExtractionPattern {
  id: string;
  mapping: EntityMapping;
  dependency_setup?: string;
  extract_logic: string;
  transform_logic: string;
  validation_report: {
    input: string;
    output: any;
    report_entries: string[];
    passed: boolean;
  };
}

export interface MappingDetailsModalProps {
  visible: boolean;
  mapping: EntityMapping | null;
  extractionPattern?: ExtractionPattern | null;
  onClose: () => void;
}

const MappingDetailsModal: React.FC<MappingDetailsModalProps> = ({
  visible,
  mapping,
  extractionPattern,
  onClose
}) => {
  const [editorPreferences, setEditorPreferences] = useState<CodeEditorProps.Preferences>({
     theme: 'dawn',
     wrapLines: true
});
  
  if (!mapping) return null;

  // Find the extraction pattern for this mapping
  const pattern = extractionPattern || null;
  
  // Determine if we have extraction data to display
  const hasExtractionData = pattern !== null;

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

        {/* Extraction Pattern Section */}
        <Container
          header={
            <Header 
              variant="h3"
            >
              Extraction Pattern
            </Header>
          }
        >
          {!hasExtractionData ? (
            <Box variant="p">No extraction pattern available. Click the "Extract Entities" button to generate transformation code.</Box>
          ) : (
            <SpaceBetween size="m">
              <Tabs
                tabs={[
                  {
                    id: "extract",
                    label: "Extract Logic",
                    content: (
                      <div style={{ height: '350px' }}>
                        <CodeEditorWrapper
                          ace={ace}
                          language="python"
                          value={pattern.extract_logic}
                          onChange={() => {}} // Read-only
                          preferences={editorPreferences}
                          onPreferencesChange={setEditorPreferences}
                          ariaLabel="Extract logic code editor"
                          height={330}
                        />
                      </div>
                    )
                  },
                  {
                    id: "transform",
                    label: "Transform Logic",
                    content: (
                      <div style={{ height: '350px' }}>
                        <CodeEditorWrapper
                          ace={ace}
                          language="python"
                          value={pattern.transform_logic}
                          onChange={() => {}} // Read-only
                          preferences={editorPreferences}
                          onPreferencesChange={setEditorPreferences}
                          ariaLabel="Transform logic code editor"
                          height={330}
                        />
                      </div>
                    )
                  },
                  {
                    id: "setup",
                    label: "Dependencies",
                    content: (
                      <div style={{ height: '350px' }}>
                        <CodeEditorWrapper
                          ace={ace}
                          language="python"
                          value={pattern.dependency_setup || "# No dependencies required"}
                          onChange={() => {}} // Read-only
                          preferences={editorPreferences}
                          onPreferencesChange={setEditorPreferences}
                          ariaLabel="Dependencies code editor"
                          height={230}
                        />
                      </div>
                    )
                  },
                  {
                    id: "validation",
                    label: "Validation Report",
                    content: (
                      <SpaceBetween size="s">
                        <ValidationReport
                          report={pattern.validation_report.report_entries}
                          outcome={pattern.validation_report.passed ? "PASSED" : "FAILED"}
                          title="Extraction Validation"
                        />
                        
                        <Box variant="awsui-key-label">Output</Box>
                        <div style={{ height: '200px' }}>
                          <CodeEditorWrapper
                            ace={ace}
                            language="json"
                            value={JSON.stringify(pattern.validation_report.output, null, 2)}
                            onChange={() => {}} // Read-only
                            preferences={editorPreferences}
                            onPreferencesChange={setEditorPreferences}
                            ariaLabel="Validation output code editor"
                            height={180}
                          />
                        </div>
                      </SpaceBetween>
                    )
                  }
                ]}
              />
            </SpaceBetween>
          )}
        </Container>
      </SpaceBetween>
    </ModalDialog>
  );
};

export default MappingDetailsModal;
