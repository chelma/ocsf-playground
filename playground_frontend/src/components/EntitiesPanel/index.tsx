"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormField,
  Header,
  Select,
  SelectProps,
  SpaceBetween,
  Table,
  TableProps,
  NonCancelableCustomEvent,
  StatusIndicator
} from "@cloudscape-design/components";
import { EntitiesState } from "../../hooks/useEntitiesState";
import EntitiesRationaleModal from "./EntitiesRationaleModal";
import MappingDetailsModal from "./MappingDetailsModal";

interface EntityMapping {
  id: string;
  entity: {
    value: string;
    description: string;
  };
  ocsf_path: string;
  path_rationale?: string;
}

interface EntitiesPanelProps extends EntitiesState {
  logs: string[];
  selectedLogIds: string[];
}

const EntitiesPanel: React.FC<EntitiesPanelProps> = ({
  isLoading,
  isExtracting,
  isTestingPattern,
  error,
  mappings,
  extractionPatterns,
  dataType,
  typeRationale,
  hasRationale,
  language,
  languageOptions,
  analyzeEntities,
  extractEntities,
  testPattern,
  clearEntities,
  onLanguageChange,
  logs,
  selectedLogIds
}) => {
  // Track column widths state
  const [columnWidths, setColumnWidths] = useState([
    { id: "details", width: 115 },
    { id: "ocsfPath", width: 175 },
    { id: "entityValue", width: 450 },
    { id: "extractedValue", width: 450 },
    { id: "transformedValue", width: 450 },
    { id: "validationStatus", width: 120 }
  ]);

  // Rationale modal state
  const [isRationaleModalVisible, setIsRationaleModalVisible] = useState(false);
  
  // Mapping details modal state
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<EntityMapping | null>(null);

  // Open mapping details modal
  const handleOpenDetails = (mapping: EntityMapping) => {
    setSelectedMapping(mapping);
    setIsDetailsModalVisible(true);
  };

  // Column IDs in order
  const columnIds = ["details", "ocsfPath", "entityValue", "extractedValue", "transformedValue", "validationStatus"];

  // Handle column resize
  const handleColumnWidthChange = (event: NonCancelableCustomEvent<TableProps.ColumnWidthsChangeDetail>) => {
    // Map the readonly number[] to our state structure with ids
    const newWidths = columnIds.map((id, index) => ({
      id,
      width: event.detail.widths[index]
    }));
    
    setColumnWidths(newWidths);
  };

  // Get the corresponding extraction pattern for a mapping
  const getExtractionPatternForMapping = (mappingId: string) => {
    return extractionPatterns.find(pattern => pattern.id === mappingId) || null;
  };

  // Get the selected log entry
  const selectedLog = selectedLogIds.length > 0 ? logs[parseInt(selectedLogIds[0])] : undefined;

  // Helper to get extraction output for a mapping
  const getExtractedValue = (mappingId: string) => {
    const pattern = getExtractionPatternForMapping(mappingId);
    if (!pattern || !pattern.validation_report || !pattern.validation_report.output) {
      return "N/A";
    }
    return pattern.validation_report.output.extract_output || "N/A";
  };

  // Helper to get transform output for a mapping
  const getTransformedValue = (mappingId: string) => {
    const pattern = getExtractionPatternForMapping(mappingId);
    if (!pattern || !pattern.validation_report || !pattern.validation_report.output) {
      return "N/A";
    }
    return pattern.validation_report.output.transform_output || "N/A";
  };

  // Helper to get validation status for a mapping
  const getValidationStatus = (mappingId: string) => {
    const pattern = getExtractionPatternForMapping(mappingId);
    if (!pattern || !pattern.validation_report) {
      return { text: "N/A", type: "info" };
    }
    return pattern.validation_report.passed 
      ? { text: "PASSED", type: "success" } 
      : { text: "FAILED", type: "error" };
  };

  // Define table columns
  const columnDefinitions: TableProps.ColumnDefinition<any>[] = [
    {
      id: "details",
      header: "",
      cell: item => (
        <Button 
          onClick={() => handleOpenDetails(item)} 
          ariaLabel={`View details for mapping ${item.id}`}
        >
          Details
        </Button>
      ),
      minWidth: 115,
      width: columnWidths.find(col => col.id === "details")?.width
    },
    {
      id: "ocsfPath",
      header: "OCSF Path",
      cell: item => item.ocsf_path,
      sortingField: "ocsf_path",
      minWidth: 150,
      width: columnWidths.find(col => col.id === "ocsfPath")?.width
    },
    {
      id: "entityValue",
      header: "Raw Entity Value",
      cell: item => item.entity.value,
      sortingField: "entity.value",
      minWidth: 250,
      width: columnWidths.find(col => col.id === "entityValue")?.width
    },
    {
      id: "extractedValue",
      header: "Extracted Value",
      cell: item => getExtractedValue(item.id),
      minWidth: 150,
      width: columnWidths.find(col => col.id === "extractedValue")?.width
    },
    {
      id: "transformedValue",
      header: "Transformed Value",
      cell: item => getTransformedValue(item.id),
      minWidth: 150,
      width: columnWidths.find(col => col.id === "transformedValue")?.width
    },
    {
      id: "validationStatus",
      header: "Validation Status",
      cell: item => {
        const status = getValidationStatus(item.id);
        return status.text === "N/A" ? 
          "N/A" : status.text;
      },
      minWidth: 120,
      width: columnWidths.find(col => col.id === "validationStatus")?.width
    }
  ];

  return (
    <>
      <Container
        header={
          <Header variant="h2">Entities Analysis</Header>
        }
      >
        <SpaceBetween size="m">          
          {/* Transform Language Selection */}
          <FormField label="Transform Language">
            <div style={{ width: 'fit-content' }}>
              <Select
                selectedOption={language}
                onChange={({ detail }) => onLanguageChange(detail.selectedOption)}
                options={languageOptions}
                placeholder="Select a transform language"
                expandToViewport
              />
            </div>
          </FormField>

          {/* Primary action buttons */}
          <Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="primary"
                iconAlign="left" 
                iconName="gen-ai"
                loading={isLoading}
                onClick={analyzeEntities}
              >
                Analyze Entities
              </Button>
              <Button 
                iconAlign="left" 
                iconName="status-info" 
                onClick={() => setIsRationaleModalVisible(true)}
                disabled={!hasRationale}
              >
                View Rationale
              </Button>
              <Button
                variant="primary"
                iconAlign="left" 
                iconName="gen-ai"
                loading={isExtracting}
                onClick={extractEntities}
                disabled={mappings.length === 0}
              >
                Extract Entities
              </Button>
              <Button
                onClick={clearEntities}
                disabled={mappings.length === 0}
              >
                Clear
              </Button>
            </SpaceBetween>
          </Box>

          {/* Error alerts */}
          {error && (
            <Alert type="error">
              {error}
            </Alert>
          )}

          {/* Entities Table */}
          <Table
            columnDefinitions={columnDefinitions}
            items={mappings}
            loading={isLoading || isExtracting}
            loadingText={isExtracting ? "Extracting entities" : "Analyzing entities"}
            sortingDisabled
            resizableColumns
            onColumnWidthsChange={handleColumnWidthChange}
            empty={
              <Box textAlign="center" color="inherit">
                <b>No entities analyzed</b>
                <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                  Select a log entry and category, then click "Analyze Entities".
                </Box>
              </Box>
            }
            header={
              <Header 
                counter={mappings.length > 0 ? `(${mappings.length})` : undefined}
              >
                Entities Table
              </Header>
            }
          />
        </SpaceBetween>
      </Container>

      {/* Rationale Modal */}
      <EntitiesRationaleModal
        visible={isRationaleModalVisible}
        dataType={dataType}
        typeRationale={typeRationale}
        onClose={() => setIsRationaleModalVisible(false)}
      />

      {/* Mapping Details Modal */}
      <MappingDetailsModal
        visible={isDetailsModalVisible}
        mapping={selectedMapping}
        extractionPattern={selectedMapping ? getExtractionPatternForMapping(selectedMapping.id) : null}
        selectedLog={selectedLog}
        onTestPattern={testPattern}
        isTestingPattern={isTestingPattern}
        onClose={() => {
          setIsDetailsModalVisible(false);
          setSelectedMapping(null);
        }}
      />
    </>
  );
};

export default EntitiesPanel;
