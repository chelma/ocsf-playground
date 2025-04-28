"use client";

import React, { useState, useEffect } from 'react';
import { 
  Alert,
  Box, 
  SpaceBetween, 
  ColumnLayout, 
  Container, 
  Header,
  Textarea,
  CodeEditorProps,
  Button
} from '@cloudscape-design/components';
import CodeEditorWrapper from '../common/CodeEditorWrapper';
import SplitLayout from '../common/SplitLayout';
import ValidationReport from '../common/ValidationReport';
import FullPageDialog from '../common/FullPageDialog';
import { splitStyles, logBlockStyle } from '../../utils/styles';
import { EntityMapping, ExtractionPattern } from '../../utils/types';
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

export interface MappingDetailsModalProps {
  visible: boolean;
  mapping: EntityMapping | null;
  extractionPattern?: ExtractionPattern | null;
  selectedLog?: string;
  onClose: () => void;
  onTestPattern?: (patternId: string, editedPattern?: Partial<ExtractionPattern>) => void;
  isTestingPattern?: boolean;
}

const MappingDetailsModal: React.FC<MappingDetailsModalProps> = ({
  visible,
  mapping,
  extractionPattern,
  selectedLog,
  onClose,
  onTestPattern,
  isTestingPattern = false
}) => {
  const [editorPreferences, setEditorPreferences] = useState<CodeEditorProps.Preferences>({
     theme: 'dawn',
     wrapLines: true
  });
  
  // State to track edited logic
  const [extractLogic, setExtractLogic] = useState<string>("");
  const [transformLogic, setTransformLogic] = useState<string>("");
  const [hasMadeEdits, setHasMadeEdits] = useState<boolean>(false);
  
  // Update local state when extraction pattern changes
  useEffect(() => {
    if (extractionPattern) {
      setExtractLogic(extractionPattern.extract_logic);
      setTransformLogic(extractionPattern.transform_logic);
      setHasMadeEdits(false);
    }
  }, [extractionPattern]);
  
  if (!mapping) return null;

  // Find the extraction pattern for this mapping
  const pattern = extractionPattern || null;
  
  // Determine if we have extraction data to display
  const hasExtractionData = pattern !== null;
  
  // Handle testing with edited pattern
  const handleTestPattern = () => {
    if (!pattern || !onTestPattern) return;
    
    // Only include the edited fields if changes were made
    const editedPattern = hasMadeEdits ? {
      id: pattern.id,
      extract_logic: extractLogic,
      transform_logic: transformLogic,
      // Preserve the mapping if it exists
      ...(pattern.mapping && { mapping: pattern.mapping })
    } : undefined;
    
    onTestPattern(pattern.id, editedPattern);
  };

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
                        value={extractLogic}
                        onChange={(value) => {
                          setExtractLogic(value);
                          setHasMadeEdits(true);
                        }}
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
                        value={transformLogic}
                        onChange={(value) => {
                          setTransformLogic(value);
                          setHasMadeEdits(true);
                        }}
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
            header={<Header variant="h1">Validation & Output</Header>}
            fitHeight={true}
          >
          {!hasExtractionData ? (
            <Box variant="p">No validation report available. Click the "Extract Entities" button to generate.</Box>
          ) : (
            <SpaceBetween size="s">
              {/* Test Pattern Button */}
              <Button
                variant="primary"
                iconAlign="left"
                iconName="refresh"
                loading={isTestingPattern}
                onClick={handleTestPattern}
                disabled={!pattern || !onTestPattern}
              >
                Test Extraction Pattern
              </Button>

              {hasMadeEdits && (
                <Alert type="info">
                  Changes have been made to the extraction/transformation logic. 
                  Click "Test Extraction Pattern" to validate your changes.
                </Alert>
              )}

              <Header variant="h3">Extract/Transform Output</Header>
              <div style={{ height: '110px' }}>
                <Textarea
                  value={JSON.stringify(pattern.validation_report?.output, null, 4) || 'N/A'}
                  readOnly
                  rows={5}
                />
              </div>
              
              <ValidationReport
                report={pattern.validation_report?.report_entries || ["N/A"]}
                outcome={pattern.validation_report?.passed ? "PASSED" : "FAILED"}
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
