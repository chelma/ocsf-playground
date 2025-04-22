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
  NonCancelableCustomEvent
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

interface EntitiesPanelProps extends EntitiesState {}

const EntitiesPanel: React.FC<EntitiesPanelProps> = ({
  isLoading,
  isExtracting,
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
  clearEntities,
  onLanguageChange
}) => {
  // Track column widths state
  const [columnWidths, setColumnWidths] = useState([
    { id: "details", width: 115 },
    { id: "entityValue", width: 300 },
    { id: "ocsfPath", width: 200 }
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
  const columnIds = ["details", "entityValue", "ocsfPath"];

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

  // Define table columns
  const columnDefinitions: TableProps.ColumnDefinition<any>[] = [
    {
      id: "details",
      header: "",
      cell: item => (
        <Button 
          onClick={() => handleOpenDetails(item)} 
          // iconName="external"
          // variant="icon"
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
      header: "Entity Value",
      cell: item => item.entity.value,
      sortingField: "entity.value",
      minWidth: 300,
      width: columnWidths.find(col => col.id === "entityValue")?.width
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
            loading={isLoading}
            loadingText="Analyzing entities"
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
        onClose={() => {
          setIsDetailsModalVisible(false);
          setSelectedMapping(null);
        }}
      />
    </>
  );
};

export default EntitiesPanel;
