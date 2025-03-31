"use client";

import React, { useState, CSSProperties } from "react";
import "@cloudscape-design/global-styles/index.css";
import {
  Box,
  Button,
  Container,
  FormField,
  Grid,
  Modal,
  SpaceBetween,
  Table,
  Textarea,
  Header,
  Input,
} from "@cloudscape-design/components";

const LogConverterPage = () => {
  // States for log entries
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importText, setImportText] = useState("");
  
  // New state for regex pattern
  const [regexPattern, setRegexPattern] = useState("");
  const [regexError, setRegexError] = useState<string | null>(null);

  // Style for log content with proper typing
  const codeBlockStyle: CSSProperties = {
    fontFamily: 'monospace',
    backgroundColor: '#f6f8fa',
    padding: '3px',
    borderRadius: '4px',
    overflowX: 'auto',
    whiteSpace: 'normal',
    fontSize: '13px',
    display: 'block',
    border: '1px solid #dfe3e8'
  };

  // Function to handle row click for selection
  const handleRowClick = (item: { id: string; content: string }) => {
    setSelectedLogIds(prevSelectedIds => {
      const id = item.id;
      if (prevSelectedIds.includes(id)) {
        // If already selected, deselect it
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        // If not selected, add it to selection
        return [...prevSelectedIds, id];
      }
    });
  };

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

  // New function to test regex against log entries
  const testRegexPattern = () => {
    if (!regexPattern.trim()) {
      setRegexError("Please enter a regex pattern");
      return;
    }

    try {
      // Create a new RegExp object from the pattern
      const regex = new RegExp(regexPattern);
      setRegexError(null);
      
      // Test against all logs and select matching ones
      const matchingIds = logs
        .map((log, index) => ({ id: index.toString(), matches: regex.test(log) }))
        .filter(item => item.matches)
        .map(item => item.id);
      
      // Update selection to only include matching logs
      setSelectedLogIds(matchingIds);
    } catch (error) {
      // Handle invalid regex
      setRegexError(`Invalid regex: ${(error as Error).message}`);
    }
  };

  return (
    <Grid
      gridDefinition={[
        { colspan: 4 }, // Left column - 1/3 of page width
        { colspan: 8 }, // Right column - 2/3 of page width
      ]}
    >
      {/* Left column - Log entries list */}
      <Container>
        <SpaceBetween size="m">
          <Header variant="h1">Log Entries</Header>

          <Button onClick={() => setImportDialogVisible(true)}>
            Import Logs
          </Button>

          {logs.length > 0 ? (
            <Box>
              <p>{logs.length} log entries available</p>
              <div 
                style={{ 
                  maxHeight: "1200px",  
                  overflowY: "auto" as const,   
                  padding: "10px"       
                }}
              >
                <Table
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
                  columnDefinitions={[
                    {
                      id: "index",
                      header: "ID",
                      cell: item => parseInt(item.id) + 1,
                      width: 50,
                    },
                    {
                      id: "content",
                      header: "Log Content",
                      cell: item => (
                        <div style={codeBlockStyle}>
                          {item.content}
                        </div>
                      ),
                    }
                  ]}
                  trackBy="id"
                  selectionType="multi"
                  variant="container"
                  
                  // Instead of selectableRows, use onRowClick
                  onRowClick={({ detail }) => handleRowClick(detail.item)}
                  
                  ariaLabels={{
                    selectionGroupLabel: "Log entries selection",
                    allItemsSelectionLabel: ({ selectedItems }) =>
                      `${selectedItems.length} ${
                        selectedItems.length === 1 ? "item" : "items"
                      } selected`,
                    itemSelectionLabel: ({ selectedItems }, item) => {
                      const isSelected = selectedItems.some(
                        selectedItem => selectedItem.id === item.id
                      );
                      return `${isSelected ? "Deselect" : "Select"} log entry ${
                        parseInt(item.id) + 1
                      }`;
                    }
                  }}
                  
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

      {/* Right column - OCSF Playground */}
      <Container>
        <SpaceBetween size="m">
          <Header variant="h1">OCSF Playground</Header>
          
          {/* Regex Testing Section */}
          <div style={{ 
            border: '1px solid #d5dbdb', 
            padding: '10px',
            borderRadius: '3px'
          }}>
            <Box>
              <Header variant="h3">Regex Pattern Testing</Header>
              <SpaceBetween size="m">
                <FormField
                  label="Log Pattern Matcher"
                  description="Enter a regular expression to match log entries."
                  errorText={regexError}
                >
                  <Input
                    value={regexPattern}
                    onChange={({ detail }) => setRegexPattern(detail.value)}
                    placeholder="Enter regex pattern (e.g., .*error.*)"
                    type="text"
                  />
                </FormField>
                
                <Button onClick={testRegexPattern}>
                  Test Pattern
                </Button>
                
                {selectedLogIds.length > 0 && (
                  <Box>
                    <p>{selectedLogIds.length} log entries matched your pattern.</p>
                  </Box>
                )}
                
                {selectedLogIds.length === 0 && logs.length > 0 && (
                  <Box>
                    <p>No log entries matched your pattern.</p>
                  </Box>
                )}
              </SpaceBetween>
            </Box>
          </div>
        </SpaceBetween>
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
