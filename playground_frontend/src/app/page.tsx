"use client";

import React, { useState, useEffect } from "react";
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

// Import utilities, constants, and types
import { 
  splitStyles, 
  paneStyles, 
  getGutterStyle, 
  logBlockStyle, 
  borderContainerStyle,
  transformContainerStyle,
  transformNestedSplitStyle,
  transformEditorContainerStyle,
  getValidationReportStyle
} from '../utils/styles';
import { 
  defaultTransformLogic, 
  ocsfCategoryOptions, 
  ocsfVersionOptions,
  transformLanguageOptions,
  defaultTransformLanguage
} from '../utils/constants';
import { 
  LogEntry, 
  RegexState, 
  CategoryState, 
  TransformState
} from '../utils/types';
import { 
  getRegexRecommendation, 
  getCategoryRecommendation, 
  getTransformRecommendation, 
  testTransformLogic,
  debugTransformLogic
} from '../api/transformerClient';
import { aceLoader } from './aceLoader';
import { OcsfCategoryEnum, TransformLanguageEnum } from '../generated-api-client';

const OcsfPlaygroundPage = () => {
  // Shared state objects
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importText, setImportText] = useState("");
  
  // Ace editor state
  const [ace, setAce] = useState<any>(null);
  const [aceLoading, setAceLoading] = useState(true);

  // Regex state
  const [regexState, setRegexState] = useState<RegexState>({
    pattern: "",
    guidance: "",
    guidanceTemp: "",
    guidanceModalVisible: false,
    rationale: "",
    rationaleModalVisible: false,
    error: null,
    isRecommending: false
  });

  // OCSF categorization state
  const [categoryState, setCategoryState] = useState<CategoryState>({
    version: ocsfVersionOptions[0],
    category: ocsfCategoryOptions[0],
    guidance: "",
    guidanceTemp: "",
    guidanceModalVisible: false,
    rationale: "",
    rationaleModalVisible: false,
    isRecommending: false
  });

  // Transform state
  const [transformState, setTransformState] = useState<TransformState>({
    logic: defaultTransformLogic,
    output: '',
    guidance: "",
    guidanceTemp: "",
    guidanceModalVisible: false,
    language: defaultTransformLanguage,
    isGenerating: false,
    editorPreferences: {
      theme: 'dawn',
      wrapLines: false,
    },
    validation: {
      report: [],
      outcome: ""
    }
  });

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

  // Function to handle row click for selection
  const handleRowClick = (item: LogEntry) => {
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
    if (!regexState.pattern.trim()) {
      setRegexState(prev => ({ ...prev, error: "Please enter a regex pattern" }));
      return;
    }

    try {
      // Create a new RegExp object from the pattern
      const regex = new RegExp(regexState.pattern);
      setRegexState(prev => ({ ...prev, error: null }));
      
      // Test against all logs and select matching ones
      const matchingIds = logs
        .map((log, index) => ({ id: index.toString(), matches: regex.test(log) }))
        .filter(item => item.matches)
        .map(item => item.id);
      
      // Update selection to only include matching logs
      setSelectedLogIds(matchingIds);
    } catch (error) {
      // Handle invalid regex
      setRegexState(prev => ({ ...prev, error: `Invalid regex: ${(error as Error).message}` }));
    }
  };

  // Function to clear selected logs, regex pattern and rationale
  const handleClear = () => {
    setRegexState(prev => ({
      ...prev,
      pattern: "",
      rationale: "",
      error: null
    }));
    setSelectedLogIds([]);
  };

  // Handle Get Regex Recommendation Request
  const handleGetRegexRecommendation = async () => {
    // Make sure one, and only one, log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a regex recommendation.");
      return;
    }
    const selectedLog = logs[parseInt(selectedLogIds[0])];

    setRegexState(prev => ({ ...prev, isRecommending: true }));

    try {
      const response = await getRegexRecommendation(
        selectedLog,
        regexState.pattern,
        regexState.guidance
      );

      setRegexState(prev => ({
        ...prev,
        pattern: response.new_heuristic,
        rationale: response.rationale,
        isRecommending: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setRegexState(prev => ({ ...prev, isRecommending: false }));
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
    setCategoryState(prev => ({ ...prev, isRecommending: true }));

    try {
      const response = await getCategoryRecommendation(
        selectedLog,
        categoryState.guidance
      );

      const recommendedCategory = ocsfCategoryOptions.find(
        option => option.value === response.ocsf_category
      ) || ocsfCategoryOptions[0];
      
      setCategoryState(prev => ({
        ...prev,
        category: recommendedCategory,
        rationale: response.rationale,
        isRecommending: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setCategoryState(prev => ({ ...prev, isRecommending: false }));
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
    setTransformState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await getTransformRecommendation(
        transformState.language.value as TransformLanguageEnum,
        categoryState.category.value as OcsfCategoryEnum,
        selectedLog,
        transformState.guidance
      );

      setTransformState(prev => ({
        ...prev,
        logic: response.transform_logic,
        output: response.transform_output,
        validation: {
          report: response.validation_report,
          outcome: response.validation_outcome
        },
        isGenerating: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setTransformState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Function for testing transformation logic
  const handleTestTransformLogic = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to test the transformation logic.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setTransformState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await testTransformLogic(
        transformState.language.value as TransformLanguageEnum,
        transformState.logic,
        categoryState.category.value as OcsfCategoryEnum,
        selectedLog
      );

      setTransformState(prev => ({
        ...prev,
        output: response.transform_output,
        validation: {
          report: response.validation_report,
          outcome: response.validation_outcome
        },
        isGenerating: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setTransformState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Function for iterate/debug functionality
  const handleDebugWithGenAI = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to debug the transformation.");
      return;
    }

    // Validate that we have existing transform code
    if (!transformState.logic.trim() || 
        transformState.logic === defaultTransformLogic) {
      alert("Please create a transformation first before debugging.");
      return;
    }

    // Validate that we have validation report or output
    if (transformState.validation.report.length === 0 && !transformState.output.trim()) {
      alert("Please test your transformation first to generate output to debug.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setTransformState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await debugTransformLogic(
        transformState.language.value as TransformLanguageEnum,
        transformState.logic,
        transformState.output,
        categoryState.category.value as OcsfCategoryEnum,
        selectedLog,
        transformState.guidance,
        transformState.validation.report,
        transformState.validation.outcome
      );

      setTransformState(prev => ({
        ...prev,
        logic: response.transform_logic,
        output: response.transform_output,
        validation: {
          report: response.validation_report,
          outcome: response.validation_outcome
        },
        isGenerating: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setTransformState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Function to clear transformation logic and results
  const handleClearTransform = () => {
    setTransformState(prev => ({
      ...prev,
      logic: defaultTransformLogic,
      output: '',
      validation: {
        report: [],
        outcome: 'N/A'
      }
    }));
  };

  return (
    <Split
      className="split"
      style={splitStyles}
      gutterStyle={getGutterStyle as any}
      sizes={[30, 70]} // Updated to two columns with new proportions
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
                          <div style={logBlockStyle}>
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

      {/* Right panel - OCSF Tools (now including transformation results) */}
      <div style={paneStyles}>
        <Container>
          <SpaceBetween size="m">
            <Header variant="h1">OCSF Tools</Header>
            
            {/* Regex Testing Section */}
            <div style={borderContainerStyle}>
              <Box>
                <Header variant="h3">Regex Pattern Testing</Header>
                <SpaceBetween size="m">
                  {/* Field to create and edit the regex */}
                  <FormField
                    label="Log Pattern Matcher"
                    description="Enter a regular expression to match log entries."
                    errorText={regexState.error}
                    stretch={true}  // Make the form field stretch to full width
                  >
                    <Input
                      value={regexState.pattern}
                      onChange={({ detail }) => 
                        setRegexState(prev => ({ ...prev, pattern: detail.value }))
                      }
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
                      {regexState.isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
                    </Button>

                    {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation for the Regex */}
                    <Button 
                      iconAlign="left" 
                      iconName="gen-ai" 
                      onClick={() => {
                        setRegexState(prev => ({ 
                          ...prev, 
                          guidanceModalVisible: true,
                          guidanceTemp: prev.guidance 
                        }));
                      }}
                      disabled={regexState.isRecommending}
                    >
                      {regexState.isRecommending ? <Spinner/> : "Set User Guidance"}
                    </Button>
                    
                    {/* Button to view the rationale for the generated regex */}
                    <Button 
                      iconAlign="left" 
                      iconName="status-info" 
                      onClick={() => 
                        setRegexState(prev => ({ ...prev, rationaleModalVisible: true }))
                      }
                      disabled={!regexState.rationale || regexState.isRecommending}
                    >
                      {regexState.isRecommending ? <Spinner/> : "View Rationale"}
                    </Button>
                  </SpaceBetween>
                  
                  <Modal
                    onDismiss={() => 
                      setRegexState(prev => ({ ...prev, guidanceModalVisible: false }))
                    }
                    visible={regexState.guidanceModalVisible}
                    footer={
                      <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button variant="link" onClick={() => {
                            setRegexState(prev => ({ ...prev, guidanceModalVisible: false }));
                          }}>
                            Cancel
                          </Button>
                          <Button variant="primary" onClick={() => {
                            setRegexState(prev => ({ 
                              ...prev, 
                              guidanceModalVisible: false,
                              guidance: prev.guidanceTemp 
                            }));
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
                        value={regexState.guidanceTemp}
                        onChange={({ detail }) => 
                          setRegexState(prev => ({ ...prev, guidanceTemp: detail.value }))
                        }
                        placeholder="Instead of the default behavior, I want you to do X instead..."
                        rows={25}
                      />
                    </FormField>
                  </Modal>
                  
                  {/* Modal for displaying regex rationale */}
                  <Modal
                    onDismiss={() => 
                      setRegexState(prev => ({ ...prev, rationaleModalVisible: false }))
                    }
                    visible={regexState.rationaleModalVisible}
                    footer={
                      <Box float="right">
                        <Button variant="primary" onClick={() => 
                          setRegexState(prev => ({ ...prev, rationaleModalVisible: false }))
                        }>
                          Close
                        </Button>
                      </Box>
                    }
                    header="Regex Generation Rationale"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{regexState.rationale}</p>
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
            <div style={borderContainerStyle}>
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
                          selectedOption={categoryState.version}
                          onChange={({ detail }) => 
                            setCategoryState(prev => ({ ...prev, version: detail.selectedOption }))
                          }
                          options={ocsfVersionOptions}
                          placeholder="Select an OCSF version"
                        />
                      </FormField>
                      <FormField
                        label="OCSF Category"
                      >
                        <Select
                          selectedOption={categoryState.category}
                          onChange={({ detail }) => 
                            setCategoryState(prev => ({ ...prev, category: detail.selectedOption }))
                          }
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
                        {categoryState.isRecommending ? <Spinner/> : "Get GenAI Recommendation"}
                      </Button>

                      {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation */}
                      <Button 
                        iconAlign="left" 
                        iconName="gen-ai" 
                        onClick={() => {
                          setCategoryState(prev => ({ 
                            ...prev, 
                            guidanceModalVisible: true,
                            guidanceTemp: prev.guidance 
                          }));
                        }}
                        disabled={categoryState.isRecommending}
                      >
                        {categoryState.isRecommending ? <Spinner/> : "Set User Guidance"}
                      </Button>
                      
                      {/* Button to view the rationale for the generated category */}
                      <Button 
                        iconAlign="left" 
                        iconName="status-info" 
                        onClick={() => 
                          setCategoryState(prev => ({ ...prev, rationaleModalVisible: true }))
                        }
                        disabled={!categoryState.rationale || categoryState.isRecommending}
                      >
                        {categoryState.isRecommending ? <Spinner/> : "View Rationale"}
                      </Button>
                    </SpaceBetween>
                  </div>
                  
                  {/* Modal for setting category guidance */}
                  <Modal
                    onDismiss={() => 
                      setCategoryState(prev => ({ ...prev, guidanceModalVisible: false }))
                    }
                    visible={categoryState.guidanceModalVisible}
                    footer={
                      <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button variant="link" onClick={() => {
                            setCategoryState(prev => ({ ...prev, guidanceModalVisible: false }));
                          }}>
                            Cancel
                          </Button>
                          <Button variant="primary" onClick={() => {
                            setCategoryState(prev => ({ 
                              ...prev, 
                              guidanceModalVisible: false,
                              guidance: prev.guidanceTemp 
                            }));
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
                        value={categoryState.guidanceTemp}
                        onChange={({ detail }) => 
                          setCategoryState(prev => ({ ...prev, guidanceTemp: detail.value }))
                        }
                        placeholder="Instead of the default behavior, I want you to do X instead..."
                        rows={25}
                      />
                    </FormField>
                  </Modal>
                  
                  {/* Modal for displaying category rationale */}
                  <Modal
                    onDismiss={() => 
                      setCategoryState(prev => ({ ...prev, rationaleModalVisible: false }))
                    }
                    visible={categoryState.rationaleModalVisible}
                    footer={
                      <Box float="right">
                        <Button variant="primary" onClick={() => 
                          setCategoryState(prev => ({ ...prev, rationaleModalVisible: false }))
                        }>
                          Close
                        </Button>
                      </Box>
                    }
                    header="OCSF Category Recommendation Rationale"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{categoryState.rationale}</p>
                    </Box>
                  </Modal>
                </SpaceBetween>
              </Box>
            </div>

            {/* Transformation Logic and Results Section - Now using a nested Split */}
            <div style={transformContainerStyle}>
              <Box>
                <Header variant="h3">Transformation Logic</Header>
                
                {/* Nested Split for transformation logic and results */}
                <Split
                  style={transformNestedSplitStyle}
                  gutterStyle={getGutterStyle as any}
                  sizes={[60, 40]} // 60% for logic, 40% for results
                  minSize={100}
                  gutterSize={10}
                  snapOffset={30}
                  dragInterval={1}
                  direction="horizontal"
                >
                  {/* Left nested pane - Transformation Controls */}
                  <div style={{ 
                    overflow: 'auto', 
                    width: '100%', 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    <SpaceBetween size="m">
                      {/* Transform Language Selection */}
                      <div key="transform-language-selection">
                        <FormField label="Transform Language">
                          <div style={{ width: 'fit-content' }}>
                            <Select
                              selectedOption={transformState.language}
                              onChange={({ detail }) => 
                                setTransformState(prev => ({ ...prev, language: detail.selectedOption }))
                              }
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
                          {transformState.isGenerating ? <Spinner/> : "Test Logic"}
                        </Button>

                        {/* Button to clear transform logic and results */}
                        <Button onClick={handleClearTransform}>
                        {transformState.isGenerating ? <Spinner/> : "Clear"}
                        </Button>

                        {/* Button to get a GenAI recommendation for the Transform Logic */}
                        <Button onClick={handleGetTransformRecommendation} variant="primary" iconAlign="left" iconName="gen-ai">
                          {transformState.isGenerating ? <Spinner/> : "Get GenAI Recommendation"}
                        </Button>

                        {/* Button to create a modal window that lets the user set guidance for the GenAI recommendation */}
                        <Button 
                          iconAlign="left" 
                          iconName="gen-ai" 
                          onClick={() => {
                            setTransformState(prev => ({ 
                              ...prev, 
                              guidanceModalVisible: true,
                              guidanceTemp: prev.guidance 
                            }));
                          }}
                          disabled={transformState.isGenerating}
                        >
                          {transformState.isGenerating ? <Spinner/> : "Set User Guidance"}
                        </Button>
                        
                        {/* New Button for debugging with GenAI */}
                        <Button 
                          iconAlign="left" 
                          iconName="gen-ai" 
                          onClick={handleDebugWithGenAI}
                          disabled={transformState.isGenerating || 
                            !transformState.logic.trim() || 
                            transformState.logic === defaultTransformLogic || 
                            (transformState.validation.report.length === 0 && !transformState.output.trim())}
                          variant="normal"
                        >
                          {transformState.isGenerating ? <Spinner/> : "Debug with GenAI"}
                        </Button>
                      </SpaceBetween>
                      
                      {/* Transformation Code Editor */}
                      <div key="transform-code-editor" style={transformEditorContainerStyle}>
                        <FormField
                          label="Transform Code"
                          stretch={true}
                        >
                          <CodeEditor
                            ace={ace}
                            language={transformState.language.value === TransformLanguageEnum.Python ? "python" : "javascript"}
                            value={transformState.logic}
                            onChange={({ detail }) => 
                              setTransformState(prev => ({ ...prev, logic: detail.value }))
                            }
                            preferences={transformState.editorPreferences}
                            onPreferencesChange={({ detail }) => 
                              setTransformState(prev => ({ ...prev, editorPreferences: detail }))
                            }
                            loading={aceLoading || transformState.isGenerating}
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
                  </div>

                  {/* Right nested pane - Transformation Results */}
                  <div style={{ overflow: 'auto', padding: '0 5px', width: '100%', height: '100%' }}>
                    <SpaceBetween size="m">
                      {/* Transformation Output */}
                      <div>
                        <Header variant="h3">Transformation Output</Header>
                        <FormField
                          description="The result of applying the transformation to the selected log entry"
                          stretch={true}
                        >
                          <Textarea
                            value={transformState.output}
                            readOnly
                            rows={10}
                            placeholder="Transformation output will appear here after you click 'Get GenAI Recommendation'"
                          />
                        </FormField>
                      </div>

                      {/* Validation Report */}
                      <div>
                        <Header variant="h3">Validation Report</Header>
                        <FormField
                          label={transformState.validation.outcome ? 
                            `Status: ${transformState.validation.outcome}` : 
                            "Status: Not Available"}
                          description="Results of validating against the OCSF schema"
                          stretch={true}
                        >
                          <div style={getValidationReportStyle(transformState.validation.outcome)}>
                            {transformState.validation.report.length > 0 ? (
                              transformState.validation.report.map((entry, index) => (
                                <div key={`validation-entry-${index}`} style={logBlockStyle}>
                                  {entry}
                                </div>
                              ))
                            ) : (
                              <p>Validation report will appear here after transformation</p>
                            )}
                          </div>
                        </FormField>
                      </div>
                    </SpaceBetween>
                  </div>
                </Split>
              </Box>
              
              {/* Modal for setting transform guidance */}
              <Modal
                onDismiss={() => 
                  setTransformState(prev => ({ ...prev, guidanceModalVisible: false }))
                }
                visible={transformState.guidanceModalVisible}
                footer={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button variant="link" onClick={() => {
                        setTransformState(prev => ({ ...prev, guidanceModalVisible: false }));
                      }}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={() => {
                        setTransformState(prev => ({ 
                          ...prev, 
                          guidanceModalVisible: false,
                          guidance: prev.guidanceTemp 
                        }));
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
                    value={transformState.guidanceTemp}
                    onChange={({ detail }) => 
                      setTransformState(prev => ({ ...prev, guidanceTemp: detail.value }))
                    }
                    placeholder="Instead of the default behavior, I want you to do X instead..."
                    rows={25}
                  />
                </FormField>
              </Modal>
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
