"use client";

import React, { useState } from "react";
import "@cloudscape-design/global-styles/index.css";
import {
  Box,
  Button,
  Cards,
  Container,
  FormField,
  Grid,
  Modal,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";

const LogConverterPage = () => {
  // States for log entries
  const [logs, setLogs] = useState<string[]>([]);
  // Change from single selection to multiple selections
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importText, setImportText] = useState("");

  // Handle log import
  const handleImportLogs = () => {
    if (importText.trim()) {
      // Split by new line and filter out empty entries
      const logEntries = importText
        .split("\n")
        .filter(entry => entry.trim().length > 0);
      
      setLogs(logEntries);
      setSelectedLogIds([]);
      setImportDialogVisible(false);
      setImportText("");
    }
  };

  return (
    <Grid
      gridDefinition={[
        { colspan: 4 }, // Left column - 1/3 of page width
        { colspan: 8 }, // Right column - 2/3 of page width (for future use)
      ]}
    >
      {/* Left column - Log entries list */}
      <Container header="Log Entries">
        <SpaceBetween size="m">
          <Button onClick={() => setImportDialogVisible(true)}>
            Import Logs
          </Button>

          {logs.length > 0 ? (
            <Box>
              <p>{logs.length} log entries available</p>
              <div 
                style={{ 
                  maxHeight: "1000px",  // Set a fixed maximum height
                  overflowY: "auto",   // Enable vertical scrolling
                  padding: "10px"       // Add small padding inside scroll container
                }}
              >
                <Cards
                  items={logs.map((log, index) => ({
                    id: index.toString(),
                    content: log
                  }))}
                  selectedItems={selectedLogIds.map(id => ({ 
                    id, 
                    content: logs[parseInt(id)] 
                  }))}
                  onSelectionChange={({ detail }) => {
                    const selectedIds = detail.selectedItems.map(item => item.id);
                    setSelectedLogIds(selectedIds);
                  }}
                  cardDefinition={{
                    header: item => `Entry ${parseInt(item.id) + 1}`,
                    sections: [
                      {
                        id: "content",
                        content: item => item.content
                      }
                    ]
                  }}
                  selectionType="multi"
                  trackBy="id"
                  cardsPerRow={[{ cards: 1 }]} // Force single column display
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No logs</b>
                      <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                        No log entries to display
                      </Box>
                    </Box>
                  }
                />
              </div>
            </Box>
          ) : (
            <Box>
              <p>No logs imported. Click "Import Logs" to get started.</p>
            </Box>
          )}
        </SpaceBetween>
      </Container>

      {/* Right column - Empty for now, reserved for future functionality */}
      <Container header="OCSF Playground">
        <Box padding="m">
          <p>Select logs from the left panel to convert them to OCSF format.</p>
        </Box>
      </Container>

      {/* Import Dialog */}
      <Modal
        visible={importDialogVisible}
        onDismiss={() => setImportDialogVisible(false)}
        header="Import Log Entries"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setImportDialogVisible(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleImportLogs}>
                Import
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <FormField
          label="Paste your log entries below (one per line)"
          description="Each line will be treated as a separate log entry"
        >
          <Textarea
            value={importText}
            onChange={({ detail }) => setImportText(detail.value)}
            placeholder="Paste your log entries here..."
            rows={20}
          />
        </FormField>
      </Modal>
    </Grid>
  );
};

export default LogConverterPage;
