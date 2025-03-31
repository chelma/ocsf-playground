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
  Spinner
} from "@cloudscape-design/components";

import { Configuration, TransformerApi, TransformerHeuristicCreateRequest, TransformerHeuristicCreateResponse
  } from '../generated-api-client';

/*
A simple web page that allows users to import log entries and generate transformers to map them to OCSF.  Each
transformer is composed of: (1) a targeting heuristic, such as a regex, that identifies specific entries in the log
stream, (2) a OCSR category to normalize entries to, and (3) transformation logic which maps entries of
that type into an OCSF-compliant JSON blob.

Current features:
- The ability to import raw log entries and display them.
- The ability to write and test regexes as a targeting heuristic.

Planned features:
- A button to receive a GenAI recommendation for a transformer.
*/

const OcsfPlaygroundPage = () => {
  // Shared state objects
  const [isRecommending, setIsRecommending] = useState(false);

  // States for log entries
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importText, setImportText] = useState("");
  
  // State for regex pattern
  const [regexPattern, setRegexPattern] = useState("");
  const [regexGuidance, setRegexGuidance] = useState("");
  const [regexGuidanceTemp, setRegexGuidanceTemp] = useState("");
  const [regexGuidanceModalVisible, setRegexGuidanceModalVisible] = useState(false);
  const [regexRationale, setRegexRationale] = useState("");
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

  // API Configuration
  const apiConfig = new Configuration({ basePath: "http://localhost:8000" });
  const apiClient = new TransformerApi(apiConfig);

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

  // Function to test regex against log entries
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

  // Handle Get Regex Recommendation Request
  const handleGetRegexRecommendation = async () => {
    // Make sure one, and only one, log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a regex recommendation.");
      return;
    }
    const selectedLog = logs[parseInt(selectedLogIds[0])];

    setIsRecommending(true); // Start visual spinner

    try {
      // Call the API to get regex recommendation
      const payload: TransformerHeuristicCreateRequest = {
        input_entry: selectedLog,
        existing_heuristic: regexPattern,
        user_guidance: regexGuidance
      };
      const response = await apiClient.transformerHeuristicCreateCreate(payload);

      // Update state with response data
      setRegexPattern(response.data.new_heuristic);
      setRegexRationale(response.data.rationale);

    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrorMessage = error.response.data.error || "An unknown error occurred.";
        console.error("Server error:", serverErrorMessage);
        alert(`Failed to test transformation. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsRecommending(false); // Stop visual spinner
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

                {/* Field to create and edit the regex */}
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
                
                {/* Button to test the regex by highlighting the log entries it applies to */}
                <Button onClick={testRegexPattern}>
                  Test Pattern
                </Button>

                {/* Button to get a GenAI recommendation for the Regex */}
                <Button onClick={handleGetRegexRecommendation}>
                  {isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
                </Button>

                {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation for the Regex */}
                <Button onClick={() => {
                  setRegexGuidanceModalVisible(true);
                  setRegexGuidanceTemp(regexGuidance);
                }}>
                  Set User Guidance
                </Button>
                <Modal
                  onDismiss={() => setRegexGuidanceModalVisible(false)}
                  visible={regexGuidanceModalVisible}
                  footer={
                    <Box float="right">
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button variant="link" onClick={() => {
                          setRegexGuidanceModalVisible(false);
                        }}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={() => {
                          setRegexGuidanceModalVisible(false);
                          setRegexGuidance(regexGuidanceTemp);
                        }}>
                          Set
                        </Button>
                      </SpaceBetween>
                    </Box>
                  }
                  header="GenAI User Guidance (Regex)"
                >
                  <FormField
                    label="If you have guidance for the LLM when generating your regex, set it here:"
                  >
                    <Textarea
                      value={regexGuidanceTemp}
                      onChange={({ detail }) => setRegexGuidanceTemp(detail.value)}
                      placeholder="Instead of the default behavior, I want you to do X instead..."
                      rows={25}
                    />
                  </FormField>
                </Modal>
                
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

export default OcsfPlaygroundPage;
