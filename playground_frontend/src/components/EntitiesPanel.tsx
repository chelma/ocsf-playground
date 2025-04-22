"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Table,
  TableProps,
  NonCancelableCustomEvent
} from "@cloudscape-design/components";
import { EntitiesState } from "../hooks/useEntitiesState";

interface EntitiesPanelProps extends EntitiesState {}

const EntitiesPanel: React.FC<EntitiesPanelProps> = ({
  isLoading,
  error,
  mappings,
  analyzeEntities,
  clearEntities
}) => {
  // Track column widths state
  const [columnWidths, setColumnWidths] = useState([
    { id: "id", width: 130 },
    { id: "entityValue", width: 200 },
    { id: "ocsfPath", width: 300 }
  ]);

  // Column IDs in order
  const columnIds = ["id", "entityValue", "ocsfPath"];

  // Handle column resize
  const handleColumnWidthChange = (event: NonCancelableCustomEvent<TableProps.ColumnWidthsChangeDetail>) => {
    // Map the readonly number[] to our state structure with ids
    const newWidths = columnIds.map((id, index) => ({
      id,
      width: event.detail.widths[index]
    }));
    
    setColumnWidths(newWidths);
  };

  // Define table columns
  const columnDefinitions: TableProps.ColumnDefinition<any>[] = [
    {
      id: "id",
      header: "ID",
      cell: item => item.id,
      sortingField: "id",
      minWidth: 50,
      width: columnWidths.find(col => col.id === "id")?.width
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
    <Container
      header={
        <Header variant="h2">Entities Analysis</Header>
      }
    >
      <SpaceBetween size="m">
        <Box>
          <SpaceBetween direction="horizontal" size="s">
            <Button
              variant="primary"
              loading={isLoading}
              onClick={analyzeEntities}
            >
              Analyze Entities
            </Button>
            <Button
              onClick={clearEntities}
              disabled={mappings.length === 0}
            >
              Clear
            </Button>
          </SpaceBetween>
        </Box>

        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

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
  );
};

export default EntitiesPanel;
