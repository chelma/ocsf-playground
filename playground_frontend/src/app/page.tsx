"use client";

// Update imports
import React, { useState, CSSProperties, useEffect } from "react";
import "@cloudscape-design/global-styles/index.css";
import 'ace-builds/css/ace.css';
import Split from 'react-split';
import {
  Box,
  Button,
  CodeEditor,
  Container,
  FormField,
  Modal,
  SpaceBetween,
  Table,
  Textarea,
  Header,
  Input,
  Spinner,
  Select,
  SelectProps,
  CodeEditorProps
} from "@cloudscape-design/components";

import { aceLoader } from './aceLoader';
import { Configuration, TransformerApi, TransformerHeuristicCreateRequest, OcsfCategoryEnum, OcsfVersionEnum,
  TransformerCategorizeV110Request, TransformLanguageEnum, TransformerLogicV110CreateRequest, TransformerLogicV110TestRequest, 
  TransformerLogicV110IterateRequest } from '../generated-api-client';

// Update the Split component styles to ensure it works properly
const splitStyles: CSSProperties = {
  display: 'flex',
  width: '100%',
  height: 'calc(100vh - 40px)',
  overflow: 'hidden'
};

const paneStyles: CSSProperties = {
  overflow: 'auto',
  padding: '0 10px',
  width: '100%',  // Ensure panes expand to fill available space
  height: '100%'
};

// Replace the gutterStyle function with this version
const getGutterStyle = (dimension: "width" | "height", gutterSize: number, index: number) => {
  return {
    backgroundColor: '#eee',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50%',
    cursor: dimension === 'width' ? 'col-resize' : 'row-resize',
  } as const;
};

const OcsfPlaygroundPage = () => {
  // Select options for dropdowns using enumerated types
  const ocsfCategoryOptions: SelectProps.Options = Object.values(OcsfCategoryEnum).map((value) => ({
    label: value,
    value,
  }));
  const ocsfVersionOptions: SelectProps.Options = Object.values(OcsfVersionEnum).map((value) => ({
    label: value,
    value,
  }));
  const transformLanguageOptions: SelectProps.Options = Object.values(TransformLanguageEnum).map((value) => ({
    label: value,
    value,
  }));

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
  const [regexRationaleModalVisible, setRegexRationaleModalVisible] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  // State for OCSF categorization
  const [ocsfVersion, setOcsfVersion] = useState<SelectProps.Option>(ocsfVersionOptions[0]);
  const [ocsfCategory, setOcsfCategory] = useState<SelectProps.Option>(ocsfCategoryOptions[0]);
  const [isRecommendingCategory, setIsRecommendingCategory] = useState(false);
  const [categoryGuidance, setCategoryGuidance] = useState("");
  const [categoryGuidanceTemp, setCategoryGuidanceTemp] = useState("");
  const [categoryGuidanceModalVisible, setCategoryGuidanceModalVisible] = useState(false);
  const [categoryRationale, setCategoryRationale] = useState("");
  const [categoryRationaleModalVisible, setCategoryRationaleModalVisible] = useState(false);

  // State for Transform Logic
  const [transformLanguage, setTransformLanguage] = useState<SelectProps.Option>(
    transformLanguageOptions.find(option => option.value === TransformLanguageEnum.Python) || transformLanguageOptions[0]
  );

  const defaultTransformLogic = '# Write your transformation logic here\n\ndef transform(input_entry):\n    """Transform the input entry into OCSF format"""\n    # Your transformation code here\n    return {}';

  const [transformLogic, setTransformLogic] = useState<string>(defaultTransformLogic);
  const [transformOutput, setTransformOutput] = useState<string>('');
  const [transformGuidance, setTransformGuidance] = useState("");
  const [transformGuidanceTemp, setTransformGuidanceTemp] = useState("");
  const [transformGuidanceModalVisible, setTransformGuidanceModalVisible] = useState(false);
  const [isGeneratingTransform, setIsGeneratingTransform] = useState(false);
  const [validationReport, setValidationReport] = useState<string[]>([]);
  const [validationOutcome, setValidationOutcome] = useState<string>("");
  // Add editor preferences state
  const [transformEditorPreferences, setTransformEditorPreferences] = useState<CodeEditorProps.Preferences>({
    theme: 'dawn',
    wrapLines: false,
  });

  // Add state for Ace instance
  const [ace, setAce] = useState<any>(null);
  const [aceLoading, setAceLoading] = useState(true);

  // Load Ace editor when component mounts
  useEffect(() => {
    aceLoader()
      .then(aceInstance => {
        setAce(aceInstance);
      })
      .catch(error => {
        console.error("Failed to load Ace editor:", error);
      })
      .finally(() => {
        setAceLoading(false);
      });
  }, []);

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

  // Function to clear selected logs, regex pattern and rationale
  const handleClear = () => {
    setRegexPattern("");
    setSelectedLogIds([]);
    setRegexRationale("");
    setRegexError(null);
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
        alert(`Failed to get regex recommendation. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsRecommending(false); // Stop visual spinner
    }
  };

  // Handle Get OCSF Category Recommendation
  const handleGetCategoryRecommendation = async () => {
    // Make sure a log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a category recommendation.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setIsRecommendingCategory(true); // Start visual spinner

    try {
      // Call the API to get category recommendation
      const payload: TransformerCategorizeV110Request = {
        input_entry: selectedLog,
        user_guidance: categoryGuidance
      };
      const response = await apiClient.transformerCategorizeV110Create(payload);

      // Update state with response data
      const recommendedCategory = ocsfCategoryOptions.find(
        option => option.value === response.data.ocsf_category
      ) || ocsfCategoryOptions[0];
      
      setOcsfCategory(recommendedCategory);
      setCategoryRationale(response.data.rationale);

    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrorMessage = error.response.data.error || "An unknown error occurred.";
        console.error("Server error:", serverErrorMessage);
        alert(`Failed to get category recommendation. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsRecommendingCategory(false); // Stop visual spinner
    }
  };

  // Handle Get Transform Logic Recommendation
  const handleGetTransformRecommendation = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a transform logic recommendation.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setIsGeneratingTransform(true); // Start visual spinner

    try {
      // Call the API to get a new transform logic recommendation
      const payload: TransformerLogicV110CreateRequest = {
        transform_language: transformLanguage.value as TransformLanguageEnum,
        ocsf_category: ocsfCategory.value as OcsfCategoryEnum,
        input_entry: selectedLog,
        user_guidance: transformGuidance
      };
      
      const response = await apiClient.transformerLogicV110CreateCreate(payload);

      // Update state with response data
      setTransformLogic(response.data.transform_logic);
      setTransformOutput(response.data.transform_output);
      setValidationReport(response.data.validation_report);
      setValidationOutcome(response.data.validation_outcome);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrorMessage = error.response.data.error || "An unknown error occurred.";
        console.error("Server error:", serverErrorMessage);
        alert(`Failed to get transform logic recommendation. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsGeneratingTransform(false); // Stop visual spinner
    }
  };

  // New function for iterate/debug functionality
  const handleDebugWithGenAI = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to debug the transformation.");
      return;
    }

    // Validate that we have existing transform code
    if (!transformLogic.trim() || 
        transformLogic === defaultTransformLogic) {
      alert("Please create a transformation first before debugging.");
      return;
    }

    // Validate that we have validation report or output
    if (validationReport.length === 0 && !transformOutput.trim()) {
      alert("Please test your transformation first to generate output to debug.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setIsGeneratingTransform(true); // Start visual spinner

    try {
      // Call the API to iterate on transform logic
      const payload: TransformerLogicV110IterateRequest = {
        transform_language: transformLanguage.value as TransformLanguageEnum,
        transform_logic: transformLogic,
        transform_output: transformOutput.trim() !== '' ? transformOutput : undefined,
        ocsf_category: ocsfCategory.value as OcsfCategoryEnum,
        input_entry: selectedLog,
        user_guidance: transformGuidance,
        validation_report: validationReport,
        validation_outcome: validationOutcome || 'FAILED'
      };
      
      const response = await apiClient.transformerLogicV110IterateCreate(payload);

      // Update state with response data
      setTransformLogic(response.data.transform_logic);
      setTransformOutput(response.data.transform_output);
      setValidationReport(response.data.validation_report);
      setValidationOutcome(response.data.validation_outcome);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrorMessage = error.response.data.error || "An unknown error occurred.";
        console.error("Server error:", serverErrorMessage);
        alert(`Failed to debug transform logic. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsGeneratingTransform(false); // Stop visual spinner
    }
  };

  // Add a new API client function for testing transformation logic
  const handleTestTransformLogic = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to test the transformation logic.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setIsGeneratingTransform(true); // Start visual spinner

    try {
      // Call the API to test transform logic
      const payload: TransformerLogicV110TestRequest = {
        transform_language: transformLanguage.value as TransformLanguageEnum,
        transform_logic: transformLogic,
        ocsf_category: ocsfCategory.value as OcsfCategoryEnum,
        input_entry: selectedLog,
      };
      
      const response = await apiClient.transformerLogicV110TestCreate(payload);

      // Update state with response data
      setTransformOutput(response.data.transform_output);
      setValidationReport(response.data.validation_report);
      setValidationOutcome(response.data.validation_outcome);

    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrorMessage = error.response.data.error || "An unknown error occurred.";
        console.error("Server error:", serverErrorMessage);
        alert(`Failed to test transform logic. Error:\n\n${serverErrorMessage}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsGeneratingTransform(false); // Stop visual spinner
    }
  };

  // Function to clear transformation logic and results
  const handleClearTransform = () => {
    setTransformLogic(defaultTransformLogic);
    setTransformOutput('');
    setValidationReport([]);
    setValidationOutcome('N/A');
  };

  return (
    <Split
      className="split"
      style={splitStyles}
      gutterStyle={getGutterStyle as any}
      sizes={[25, 50, 25]} // Initial width percentages for each pane
      minSize={200} // Minimum size in pixels
      gutterSize={10}  // Make gutters easier to grab
      snapOffset={30}  // Snap when close to default position
      dragInterval={1}  // Smoother dragging
      direction="horizontal"  // Explicitly set direction
    >
      {/* Left panel - Log entries list */}
      <div style={paneStyles}>
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
                    maxHeight: "1150px",  
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
      </div>

      {/* Middle panel - OCSF Playground Tools */}
      <div style={paneStyles}>
        <Container>
          <SpaceBetween size="m">
            <Header variant="h1">OCSF Tools</Header>
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
                    stretch={true}  // Make the form field stretch to full width
                  >
                    <Input
                      value={regexPattern}
                      onChange={({ detail }) => setRegexPattern(detail.value)}
                      placeholder="Enter regex pattern (e.g., .*error.*)"
                      type="text"
                    />
                  </FormField>
                  
                  {/* Buttons in a horizontal row for pattern testing */}
                  <SpaceBetween direction="horizontal" size="xs">
                    {/* Button to test the regex by highlighting the log entries it applies to */}
                    <Button onClick={testRegexPattern}>
                      Test Pattern
                    </Button>

                    {/* Button to clear selections and input */}
                    <Button onClick={handleClear}>
                      Clear
                    </Button>
                  </SpaceBetween>
                  
                  {/* GenAI buttons in a separate row */}
                  <SpaceBetween direction="horizontal" size="xs">
                    {/* Button to get a GenAI recommendation for the Regex */}
                    <Button onClick={handleGetRegexRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
                      {isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
                    </Button>

                    {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation for the Regex */}
                    <Button 
                      iconAlign="left" 
                      iconName="gen-ai" 
                      onClick={() => {
                        setRegexGuidanceModalVisible(true);
                        setRegexGuidanceTemp(regexGuidance);
                      }}
                      disabled={isRecommending}
                    >
                      {isRecommending ? <Spinner/> : "Set User Guidance"}
                    </Button>
                    
                    {/* Button to view the rationale for the generated regex */}
                    <Button 
                      iconAlign="left" 
                      iconName="status-info" 
                      onClick={() => setRegexRationaleModalVisible(true)}
                      disabled={!regexRationale || isRecommending}
                    >
                      {isRecommending ? <Spinner/> : "View Rationale"}
                    </Button>
                  </SpaceBetween>
                  
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
                      stretch={true}  // Make the form field stretch to full width
                    >
                      <Textarea
                        value={regexGuidanceTemp}
                        onChange={({ detail }) => setRegexGuidanceTemp(detail.value)}
                        placeholder="Instead of the default behavior, I want you to do X instead..."
                        rows={25}
                      />
                    </FormField>
                  </Modal>
                  
                  {/* Modal for displaying regex rationale */}
                  <Modal
                    onDismiss={() => setRegexRationaleModalVisible(false)}
                    visible={regexRationaleModalVisible}
                    footer={
                      <Box float="right">
                        <Button variant="primary" onClick={() => setRegexRationaleModalVisible(false)}>
                          Close
                        </Button>
                      </Box>
                    }
                    header="Regex Generation Rationale"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{regexRationale}</p>
                    </Box>
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

            {/* OCSF Categorization Section */}
            <div style={{ 
              border: '1px solid #d5dbdb', 
              padding: '10px',
              borderRadius: '3px'
            }}>
              <Box>
                <Header variant="h3">OCSF Categorization</Header>
                <SpaceBetween size="m">
                  {/* Version and Category Selection */}
                  <div key="ocsf-version-category-selection">
                    <SpaceBetween direction="horizontal" size="xs">
                      <FormField
                        label="OCSF Version"
                      >
                        <Select
                          selectedOption={ocsfVersion}
                          onChange={({ detail }) => setOcsfVersion(detail.selectedOption)}
                          options={ocsfVersionOptions}
                          placeholder="Select an OCSF version"
                        />
                      </FormField>
                      <FormField
                        label="OCSF Category"
                      >
                        <Select
                          selectedOption={ocsfCategory}
                          onChange={({ detail }) => setOcsfCategory(detail.selectedOption)}
                          options={ocsfCategoryOptions}
                          placeholder="Select an OCSF category"
                        />
                      </FormField>
                    </SpaceBetween>
                  </div>
                  
                  {/* GenAI buttons for OCSF categorization */}
                  <div key="ocsf-genai-buttons">
                    <SpaceBetween direction="horizontal" size="xs">
                      {/* Button to get a GenAI recommendation for the Category */}
                      <Button onClick={handleGetCategoryRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
                        {isRecommendingCategory ? <Spinner/> : "Get GenAI Recommendation"}
                      </Button>

                      {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation */}
                      <Button 
                        iconAlign="left" 
                        iconName="gen-ai" 
                        onClick={() => {
                          setCategoryGuidanceModalVisible(true);
                          setCategoryGuidanceTemp(categoryGuidance);
                        }}
                        disabled={isRecommendingCategory}
                      >
                        {isRecommendingCategory ? <Spinner/> : "Set User Guidance"}
                      </Button>
                      
                      {/* Button to view the rationale for the generated category */}
                      <Button 
                        iconAlign="left" 
                        iconName="status-info" 
                        onClick={() => setCategoryRationaleModalVisible(true)}
                        disabled={!categoryRationale || isRecommendingCategory}
                      >
                        {isRecommendingCategory ? <Spinner/> : "View Rationale"}
                      </Button>
                    </SpaceBetween>
                  </div>
                  
                  {/* Modal for setting category guidance */}
                  <Modal
                    onDismiss={() => setCategoryGuidanceModalVisible(false)}
                    visible={categoryGuidanceModalVisible}
                    footer={
                      <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button variant="link" onClick={() => {
                            setCategoryGuidanceModalVisible(false);
                          }}>
                            Cancel
                          </Button>
                          <Button variant="primary" onClick={() => {
                            setCategoryGuidanceModalVisible(false);
                            setCategoryGuidance(categoryGuidanceTemp);
                          }}>
                            Set
                          </Button>
                        </SpaceBetween>
                      </Box>
                    }
                    header="GenAI User Guidance (OCSF Category)"
                  >
                    <FormField
                      label="If you have guidance for the LLM when categorizing, set it here:"
                    >
                      <Textarea
                        value={categoryGuidanceTemp}
                        onChange={({ detail }) => setCategoryGuidanceTemp(detail.value)}
                        placeholder="Instead of the default behavior, I want you to do X instead..."
                        rows={25}
                      />
                    </FormField>
                  </Modal>
                  
                  {/* Modal for displaying category rationale */}
                  <Modal
                    onDismiss={() => setCategoryRationaleModalVisible(false)}
                    visible={categoryRationaleModalVisible}
                    footer={
                      <Box float="right">
                        <Button variant="primary" onClick={() => setCategoryRationaleModalVisible(false)}>
                          Close
                        </Button>
                      </Box>
                    }
                    header="OCSF Category Recommendation Rationale"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{categoryRationale}</p>
                    </Box>
                  </Modal>
                </SpaceBetween>
              </Box>
            </div>

            {/* Transformation Logic Section */}
            <div style={{ 
              border: '1px solid #d5dbdb', 
              padding: '10px',
              borderRadius: '3px'
            }}>
              <Box>
                <Header variant="h3">Transformation Logic</Header>
                <SpaceBetween size="m">
                  {/* Transform Language Selection */}
                  <div key="transform-language-selection">
                    <FormField
                      label="Transform Language"
                    >
                      <div style={{ width: 'fit-content' }}>
                        <Select
                          selectedOption={transformLanguage}
                          onChange={({ detail }) => setTransformLanguage(detail.selectedOption)}
                          options={transformLanguageOptions}
                          placeholder="Select a transform language"
                          expandToViewport
                        />
                      </div>
                    </FormField>
                  </div>
                  
                  {/* Buttons for testing, clearing, and getting GenAI recommendations */}
                  <SpaceBetween direction="horizontal" size="xs">
                    {/* Button to test the transform logic against the selected log entry */}
                    <Button onClick={handleTestTransformLogic}>
                      {isGeneratingTransform ? <Spinner/> : "Test Logic"}
                    </Button>

                    {/* Button to clear transform logic and results */}
                    <Button onClick={handleClearTransform}>
                    {isGeneratingTransform ? <Spinner/> : "Clear"}
                    </Button>

                    {/* Button to get a GenAI recommendation for the Transform Logic */}
                    <Button onClick={handleGetTransformRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
                      {isGeneratingTransform ? <Spinner/> : "Get GenAI Recommendation"}
                    </Button>

                    {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation */}
                    <Button 
                      iconAlign="left" 
                      iconName="gen-ai" 
                      onClick={() => {
                        setTransformGuidanceModalVisible(true);
                        setTransformGuidanceTemp(transformGuidance);
                      }}
                      disabled={isGeneratingTransform}
                    >
                      {isGeneratingTransform ? <Spinner/> : "Set User Guidance"}
                    </Button>
                    
                    {/* New Button for debugging with GenAI */}
                    <Button 
                      iconAlign="left" 
                      iconName="gen-ai" 
                      onClick={handleDebugWithGenAI}
                      disabled={isGeneratingTransform || !transformLogic.trim() || 
                        (validationReport.length === 0 && !transformOutput.trim())}
                      variant="normal"
                    >
                      {isGeneratingTransform ? <Spinner/> : "Debug with GenAI"}
                    </Button>
                  </SpaceBetween>
                  
                  {/* Transformation Code Editor */}
                  <div key="transform-code-editor">
                    <FormField
                      label="Transform Code"
                      stretch={true}  // Make the form field stretch to full width
                    >
                      <CodeEditor
                        ace={ace}
                        language={transformLanguage.value === TransformLanguageEnum.Python ? "python" : "javascript"}
                        value={transformLogic}
                        onChange={({ detail }) => setTransformLogic(detail.value)}
                        preferences={transformEditorPreferences}
                        onPreferencesChange={({ detail }) => setTransformEditorPreferences(detail)}
                        loading={aceLoading || isGeneratingTransform}
                        i18nStrings={{
                          loadingState: 'Loading code editor',
                          errorState: 'There was an error loading the code editor.',
                          errorStateRecovery: 'Retry',
                          editorGroupAriaLabel: 'Code editor',
                          statusBarGroupAriaLabel: 'Status bar',
                          cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
                          errorsTab: 'Errors',
                          warningsTab: 'Warnings',
                          preferencesButtonAriaLabel: 'Preferences',
                          paneCloseButtonAriaLabel: 'Close',
                          preferencesModalHeader: 'Preferences',
                          preferencesModalCancel: 'Cancel',
                          preferencesModalConfirm: 'Confirm',
                          preferencesModalWrapLines: 'Wrap lines',
                          preferencesModalTheme: 'Theme',
                          preferencesModalLightThemes: 'Light themes',
                          preferencesModalDarkThemes: 'Dark themes'
                        }}
                      />
                    </FormField>
                  </div>
                </SpaceBetween>
              </Box>
              
              {/* Modal for setting transform guidance */}
              <Modal
                onDismiss={() => setTransformGuidanceModalVisible(false)}
                visible={transformGuidanceModalVisible}
                footer={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button variant="link" onClick={() => {
                        setTransformGuidanceModalVisible(false);
                      }}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={() => {
                        setTransformGuidanceModalVisible(false);
                        setTransformGuidance(transformGuidanceTemp);
                      }}>
                        Set
                      </Button>
                    </SpaceBetween>
                  </Box>
                }
                header="GenAI User Guidance (Transform Logic)"
              >
                <FormField
                  label="If you have guidance for the LLM when generating transform logic, set it here:"
                >
                  <Textarea
                    value={transformGuidanceTemp}
                    onChange={({ detail }) => setTransformGuidanceTemp(detail.value)}
                    placeholder="Instead of the default behavior, I want you to do X instead..."
                    rows={25}
                  />
                </FormField>
              </Modal>
            </div>
          </SpaceBetween>
        </Container>
      </div>

      {/* Right panel - Transformation Output */}
      <div style={paneStyles}>
        <Container>
          <SpaceBetween size="m">
            <Header variant="h1">Transformation Results</Header>

            {/* Transformation Output */}
            <div style={{ 
              border: '1px solid #d5dbdb', 
              padding: '10px',
              borderRadius: '3px'
            }}>
              <Box>
                <Header variant="h3">Transformation Output</Header>
                <SpaceBetween size="m">
                  <FormField
                    label="JSON Result"
                    description="The result of applying the transformation to the selected log entry"
                    stretch={true}  // Make the form field stretch to full width
                  >
                    <Textarea
                      value={transformOutput}
                      readOnly
                      rows={20}
                      placeholder="Transformation output will appear here after you click 'Get GenAI Recommendation'"
                    />
                  </FormField>
                </SpaceBetween>
              </Box>
            </div>

            {/* Validation Report */}
            <div style={{ 
              border: '1px solid #d5dbdb', 
              padding: '10px',
              borderRadius: '3px'
            }}>
              <Box>
                <Header variant="h3">Validation Report</Header>
                <SpaceBetween size="m">
                  <FormField
                    label={validationOutcome ? `Status: ${validationOutcome}` : "Status: Not Available"}
                    description="The results of validating the transformed output against the OCSF schema"
                    stretch={true}  // Make the form field stretch to full width
                  >
                    <div style={{ 
                      width: '100%',  // Ensure the div takes full width
                      minHeight: '100px',
                      maxHeight: '400px', 
                      overflowY: 'auto', 
                      padding: '10px',
                      backgroundColor: validationOutcome === 'PASSED' ? '#f2fcf3' : 
                                      validationOutcome === 'FAILED' ? '#fff0f0' : '#f5f5f5',
                      borderRadius: '4px',
                      border: `1px solid ${
                        validationOutcome === 'PASSED' ? '#d5e8d8' : 
                        validationOutcome === 'FAILED' ? '#ffd7d7' : '#e0e0e0'
                      }`
                    }}>
                      {validationReport.length > 0 ? (
                        validationReport.map((entry, index) => (
                          <div key={`validation-entry-${index}`} style={codeBlockStyle}>
                            {entry}
                          </div>
                        ))
                      ) : (
                        <p>Validation report will appear here after transformation</p>
                      )}
                    </div>
                  </FormField>
                </SpaceBetween>
              </Box>
            </div>
          </SpaceBetween>
        </Container>
      </div>

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
    </Split>
  );
};

export default OcsfPlaygroundPage;
