"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Alert,
  Box, 
  SpaceBetween, 
  ColumnLayout, 
  Container, 
  Header,
  Textarea,
  CodeEditorProps,
  Button,
  Input,
  FormField,
  ExpandableSection,
  Icon
} from '@cloudscape-design/components';
import CodeEditorWrapper from '../common/CodeEditorWrapper';
import SplitLayout from '../common/SplitLayout';
import ValidationReport from '../common/ValidationReport';
import FullPageDialog from '../common/FullPageDialog';
import { splitStyles, logBlockStyle } from '../../utils/styles';
import { Entity, EntityMapping, ExtractionPattern } from '../../utils/types';
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
  onDeleteMapping?: (mappingId: string) => void;
  onUpdateMapping?: (mappingId: string, updatedMapping: Partial<EntityMapping>) => void;
  onExtractSingleMapping?: (mappingId: string) => Promise<void>; // New prop
  isTestingPattern?: boolean;
  isExtractingSingleMapping?: boolean; // New prop
}

const MappingDetailsModal: React.FC<MappingDetailsModalProps> = ({
  visible,
  mapping,
  extractionPattern,
  selectedLog,
  onClose,
  onTestPattern,
  onDeleteMapping,
  onUpdateMapping,
  onExtractSingleMapping,
  isTestingPattern = false,
  isExtractingSingleMapping = false
}) => {
  const [editorPreferences, setEditorPreferences] = useState<CodeEditorProps.Preferences>({
     theme: 'dawn',
     wrapLines: true
  });
  
  // State to track edited logic
  const [extractLogic, setExtractLogic] = useState<string>("");
  const [transformLogic, setTransformLogic] = useState<string>("");
  const [hasMadeEdits, setHasMadeEdits] = useState<boolean>(false);
  
  // State to track edited entity fields - now an array
  const [entities, setEntities] = useState<Entity[]>([]);
  const [ocsfPath, setOcsfPath] = useState<string>("");
  const [pathRationale, setPathRationale] = useState<string>("");
  const [hasMadeMappingEdits, setHasMadeMappingEdits] = useState<boolean>(false);
  
  // Ref to track if mapping data has been saved
  const justSaved = useRef<boolean>(false);
  // Ref to track last saved mapping data to compare with incoming props
  const lastSavedData = useRef<any>(null);
  
  // Update local state when mapping or extraction pattern changes
  // But prevent overriding with prop values immediately after saving
  useEffect(() => {
    if (mapping) {
      // Initialize entity array from mapping
      setEntities(mapping.entities || []);
      setOcsfPath(mapping.ocsf_path);
      setPathRationale(mapping.path_rationale || "");
      setHasMadeMappingEdits(false);
    }
    
    if (extractionPattern) {
      setExtractLogic(extractionPattern.extract_logic);
      setTransformLogic(extractionPattern.transform_logic);
      setHasMadeEdits(false);
    }
  }, [mapping, extractionPattern]);
  
  // Effect to reset the saved flag after component has rendered with saved values
  useEffect(() => {
    // If the component just saved, reset the flag after render
    if (justSaved.current) {
      const timeoutId = setTimeout(() => {
        justSaved.current = false;
      }, 100); // Short delay to ensure rendering is complete
      
      return () => clearTimeout(timeoutId);
    }
  }, [mapping]); // Only run when mapping changes
  
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

  // Handle mapping deletion
  const handleDeleteMapping = () => {
    if (onDeleteMapping && mapping) {
      onDeleteMapping(mapping.id);
      onClose(); // Close the modal after deletion
    }
  };
  
  // Handle saving mapping changes
  const handleSaveMapping = () => {
    if (onUpdateMapping && mapping) {
      const updatedMapping: Partial<EntityMapping> = {
        id: mapping.id,
        entities: entities,
        ocsf_path: ocsfPath,
        path_rationale: pathRationale || undefined
      };
      
      // Store the data we're saving for comparison in the future
      lastSavedData.current = {
        id: mapping.id,
        entities: [...entities],
        ocsf_path: ocsfPath,
        path_rationale: pathRationale || undefined
      };
      
      // Set the justSaved flag to prevent the useEffect from overriding our values
      justSaved.current = true;
      
      onUpdateMapping(mapping.id, updatedMapping);
      setHasMadeMappingEdits(false);
    }
  };
  
  // Track changes to mapping fields
  const handleMappingFieldChange = () => {
    setHasMadeMappingEdits(true);
  };

  // Handle adding a new entity
  const handleAddEntity = () => {
    setEntities([...entities, { value: "", description: "" }]);
    handleMappingFieldChange();
  };
  
  // Handle removing an entity
  const handleRemoveEntity = (index: number) => {
    const newEntities = [...entities];
    newEntities.splice(index, 1);
    setEntities(newEntities);
    handleMappingFieldChange();
  };
  
  // Handle updating an entity field
  const handleEntityChange = (index: number, field: keyof Entity, value: string) => {
    const newEntities = [...entities];
    newEntities[index] = { ...newEntities[index], [field]: value };
    setEntities(newEntities);
    handleMappingFieldChange();
  };

  return (
    <FullPageDialog
      title="Entity Mapping Details"
      visible={visible}
      onClose={onClose}
      hideCancel={true}
      confirmLabel="Close"
    >
      {/* Add the Delete Mapping button above the split layout */}
      <SpaceBetween size="m">
        <div style={{ display: 'flex' }}>
          <Button 
            variant="normal" 
            iconName="remove" 
            onClick={handleDeleteMapping}
            disabled={!onDeleteMapping}
          >
            Delete Mapping
          </Button>
          
          {hasMadeMappingEdits && (
            <Button 
              variant="primary"
              onClick={handleSaveMapping}
              disabled={!onUpdateMapping}
            >
              Save Mapping Changes
            </Button>
          )}
        </div>
        
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
                
                {/* Entities Section */}
                <Container
                  header={
                    <Header 
                      variant="h3" 
                      actions={
                        <Button 
                          iconName="add-plus" 
                          onClick={handleAddEntity}
                        >
                          Add Entity
                        </Button>
                      }
                    >
                      Entities ({entities.length})
                    </Header>
                  }
                >
                  {entities.length === 0 ? (
                    <Box variant="p">No entities defined for this mapping</Box>
                  ) : (
                    <SpaceBetween size="m">
                      {entities.map((entity, index) => (
                        <ExpandableSection
                          key={index}
                          headerText={`Entity ${index + 1}${entity.value ? `: ${entity.value.substring(0, 30)}${entity.value.length > 30 ? '...' : ''}` : ''}`}
                          variant="container"
                        >
                          <SpaceBetween size="m">
                            <FormField label="Value">
                              <Input
                                value={entity.value}
                                onChange={e => handleEntityChange(index, 'value', e.detail.value)}
                              />
                            </FormField>
                            <FormField label="Description">
                              <Textarea
                                value={entity.description}
                                onChange={e => handleEntityChange(index, 'description', e.detail.value)}
                                rows={3}
                              />
                            </FormField>
                            <div style={{ textAlign: 'right' }}>
                              <Button
                                iconName="remove"
                                onClick={() => handleRemoveEntity(index)}
                              >
                                Remove Entity
                              </Button>
                            </div>
                          </SpaceBetween>
                        </ExpandableSection>
                      ))}
                    </SpaceBetween>
                  )}
                </Container>

                {/* OCSF Mapping Section - Now Editable */}
                <Container
                  header={<Header variant="h3">OCSF Mapping</Header>}
                >
                  <SpaceBetween size="m">
                    <FormField label="OCSF Path">
                      <Input
                        value={ocsfPath}
                        onChange={e => {
                          setOcsfPath(e.detail.value);
                          handleMappingFieldChange();
                        }}
                      />
                    </FormField>
                    <FormField label="Path Rationale">
                      <Textarea
                        value={pathRationale}
                        onChange={e => {
                          setPathRationale(e.detail.value);
                          handleMappingFieldChange();
                        }}
                        rows={4}
                      />
                    </FormField>
                  </SpaceBetween>
                </Container>

            </SpaceBetween>
          </div>

          {/* Middle Column: Extraction Pattern */}
          <div style={{ height: '100%', overflow: 'auto' }}>
            <Container
              header={<Header variant="h1">Extraction Pattern</Header>}
              fitHeight={true}
            >
            <SpaceBetween size="s">
              {/* Extract Entity Mapping button - always displayed */}
              <Button
                variant="primary"
                iconAlign="left"
                iconName="gen-ai"
                loading={isExtractingSingleMapping}
                onClick={() => mapping && onExtractSingleMapping && onExtractSingleMapping(mapping.id)}
                disabled={!mapping || !onExtractSingleMapping}
              >
                Extract Entity Mapping
              </Button>
              
              {!hasExtractionData ? (
                <Box variant="p">No extraction pattern available yet.</Box>
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
            </SpaceBetween>
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
      </SpaceBetween>
    </FullPageDialog>
  );
};

export default MappingDetailsModal;
