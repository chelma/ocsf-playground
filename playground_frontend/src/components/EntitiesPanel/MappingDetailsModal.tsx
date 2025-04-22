"use client";

import React, { useState } from 'react';
import { 
  Box, 
  SpaceBetween, 
  ColumnLayout, 
  Container, 
  Header,
  Textarea,
  CodeEditorProps
} from '@cloudscape-design/components';
import CodeEditorWrapper from '../common/CodeEditorWrapper';
import SplitLayout from '../common/SplitLayout';
import ValidationReport from '../common/ValidationReport';
import FullPageDialog from '../common/FullPageDialog';
import { splitStyles, logBlockStyle } from '../../utils/styles';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-dawn';

const enhancedSplitStyles = {
  ...splitStyles,
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};

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
  selectedLog?: string;
  onClose: () => void;
}

const MappingDetailsModal: React.FC<MappingDetailsModalProps> = ({
  visible,
  mapping,
  extractionPattern,
  selectedLog,
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
    <FullPageDialog
      title="Entity Mapping Details"
      visible={visible}
      onClose={onClose}
      hideCancel={true}
      confirmLabel="Close"
    >
      <SplitLayout
        style={enhancedSplitStyles}
        sizes={[30, 40, 30]}
        minSize={200}
        gutterSize={10}
        snapOffset={30}
        direction="horizontal"
      >
        {/* Left Column: Log and Mapping Details */}
        <div style={{ height: '100%', overflow: 'auto' }}>
          <SpaceBetween size="s">
              {/* Selected Log Section */}
              {selectedLog && (
                <Container
                  header={<Header variant="h3">Selected Log</Header>}
                >
                  <div style={logBlockStyle}>
                    {selectedLog}
                  </div>
                </Container>
              )}
              
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
        </div>

        {/* Middle Column: Extraction Pattern */}
        <div style={{ height: '100%', overflow: 'auto' }}>
          <Container
            header={<Header variant="h1">Extraction Pattern</Header>}
            fitHeight={true}
          >
          {!hasExtractionData ? (
            <Box variant="p">No extraction pattern available. Click the "Extract Entities" button to generate.</Box>
          ) : (
              <SpaceBetween size="s">

                <Container
                  header={<Header variant="h3">Dependency Setup</Header>}
                >
                  <div style={{ height: '150px' }}>
                    <Textarea
                      value={pattern.dependency_setup || "# No dependencies required"}
                      readOnly
                      rows={7}
                    />
                  </div>
                </Container>

                <Container
                  header={<Header variant="h3">Extraction Logic</Header>}
                >
                  <div style={{ height: '280px' }}>
                      <CodeEditorWrapper
                      ace={ace}
                      language="python"
                      value={pattern.extract_logic}
                      onChange={() => {}} // Read-only
                      preferences={editorPreferences}
                      onPreferencesChange={setEditorPreferences}
                      ariaLabel="Extract logic code editor"
                      height={250}
                      />
                  </div>
                </Container>

                <Container
                  header={<Header variant="h3">Transformation Logic</Header>}
                >
                  <div style={{ height: '280px' }}>
                      <CodeEditorWrapper
                      ace={ace}
                      language="python"
                      value={pattern.transform_logic}
                      onChange={() => {}} // Read-only
                      preferences={editorPreferences}
                      onPreferencesChange={setEditorPreferences}
                      ariaLabel="Transform logic code editor"
                      height={250}
                      />
                  </div>
                </Container>
              </SpaceBetween>
          )}
          </Container>
        </div>

        {/* Right Column: Validation and Output */}
        <div style={{ height: '100%', overflow: 'auto' }}>
          <Container
            header={<Header variant="h1">Validation</Header>}
            fitHeight={true}
          >
          {!hasExtractionData ? (
            <Box variant="p">No validation report available. Click the "Extract Entities" button to generate.</Box>
          ) : (
            <SpaceBetween size="s">

              <Header variant="h3">Extract/Transform Output</Header>
              <div style={{ height: '110px' }}>
                <Textarea
                  value={JSON.stringify(pattern.validation_report.output, null, 4)}
                  readOnly
                  rows={5}
                />
              </div>
              
              <ValidationReport
                report={pattern.validation_report.report_entries}
                outcome={pattern.validation_report.passed ? "PASSED" : "FAILED"}
                title="Validation Report"
              />
            </SpaceBetween>
          )}
          </Container>
        </div>
      </SplitLayout>
    </FullPageDialog>
  );
};

export default MappingDetailsModal;
