"use client";

import React, { useState, useEffect } from "react";
import "@cloudscape-design/global-styles/index.css";
import 'ace-builds/css/ace.css';
import {
  Box,
  Button,
  Container,
  FormField,
  SpaceBetween,
  Textarea,
  Header,
  Input,
  Spinner,
  Select,
} from "@cloudscape-design/components";

// Import utilities, constants, and types
import { 
  splitStyles, 
  paneStyles, 
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

// Import common components
import CodeEditorWrapper from '../components/common/CodeEditorWrapper';
import ModalDialog from '../components/common/ModalDialog';
import SplitLayout from '../components/common/SplitLayout';

// Import custom hooks and components
import useLogsState from '../hooks/useLogsState';
import LogsPanel from '../components/LogsPanel';

const OcsfPlaygroundPage = () => {
  // Use the logs state hook
  const logsState = useLogsState();
  
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
      const matchingIds = logsState.logs
        .map((log, index) => ({ id: index.toString(), matches: regex.test(log) }))
        .filter(item => item.matches)
        .map(item => item.id);
      
      // Update selection to only include matching logs
      logsState.setSelectedLogIds(matchingIds);
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
    logsState.setSelectedLogIds([]);
  };

  // Handle Get Regex Recommendation Request
  const handleGetRegexRecommendation = async () => {
    // Make sure one, and only one, log entry is selected
    if (logsState.selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a regex recommendation.");
      return;
    }
    const selectedLog = logsState.logs[parseInt(logsState.selectedLogIds[0])];

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
    if (logsState.selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a category recommendation.");
      return;
    }

    const selectedLog = logsState.logs[parseInt(logsState.selectedLogIds[0])];
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
    if (logsState.selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a transform logic recommendation.");
      return;
    }

    const selectedLog = logsState.logs[parseInt(logsState.selectedLogIds[0])];
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
    if (logsState.selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to test the transformation logic.");
      return;
    }

    const selectedLog = logsState.logs[parseInt(logsState.selectedLogIds[0])];
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
    if (logsState.selectedLogIds.length !== 1) {
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

    const selectedLog = logsState.logs[parseInt(logsState.selectedLogIds[0])];
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

  // Function to handle setting regex guidance
  const handleSetRegexGuidance = () => {
    setRegexState(prev => ({ 
      ...prev, 
      guidanceModalVisible: false,
      guidance: prev.guidanceTemp 
    }));
  };

  // Function to handle setting category guidance
  const handleSetCategoryGuidance = () => {
    setCategoryState(prev => ({ 
      ...prev, 
      guidanceModalVisible: false,
      guidance: prev.guidanceTemp 
    }));
  };

  // Function to handle setting transform guidance
  const handleSetTransformGuidance = () => {
    setTransformState(prev => ({ 
      ...prev, 
      guidanceModalVisible: false,
      guidance: prev.guidanceTemp 
    }));
  };

  return (
    <SplitLayout
      style={splitStyles}
      sizes={[30, 70]}
      minSize={200}
      gutterSize={10}
      snapOffset={30}
      direction="horizontal"
    >
      {/* Logs Panel - now extracted to its own component */}
      <LogsPanel {...logsState} />

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
                  
                  {/* User Guidance Modal Dialog */}
                  <ModalDialog
                    title="GenAI User Guidance (Regex)"
                    visible={regexState.guidanceModalVisible}
                    onClose={() => setRegexState(prev => ({ ...prev, guidanceModalVisible: false }))}
                    onConfirm={handleSetRegexGuidance}
                    confirmLabel="Set"
                  >
                    <FormField
                      label="If you have guidance for the LLM when generating your regex, set it here:"
                      stretch={true}
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
                  </ModalDialog>
                  
                  {/* Modal for displaying regex rationale */}
                  <ModalDialog
                    title="Regex Generation Rationale"
                    visible={regexState.rationaleModalVisible}
                    onClose={() => setRegexState(prev => ({ ...prev, rationaleModalVisible: false }))}
                    hideCancel={true}
                    confirmLabel="Close"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{regexState.rationale}</p>
                    </Box>
                  </ModalDialog>
                  
                  {logsState.selectedLogIds.length > 0 && (
                    <Box>
                      <p>{logsState.selectedLogIds.length} log entries matched your pattern.</p>
                    </Box>
                  )}
                  
                  {logsState.selectedLogIds.length === 0 && logsState.logs.length > 0 && (
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
                  <ModalDialog
                    title="GenAI User Guidance (OCSF Category)"
                    visible={categoryState.guidanceModalVisible}
                    onClose={() => setCategoryState(prev => ({ ...prev, guidanceModalVisible: false }))}
                    onConfirm={handleSetCategoryGuidance}
                    confirmLabel="Set"
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
                  </ModalDialog>
                  
                  {/* Modal for displaying category rationale */}
                  <ModalDialog
                    title="OCSF Category Recommendation Rationale"
                    visible={categoryState.rationaleModalVisible}
                    onClose={() => setCategoryState(prev => ({ ...prev, rationaleModalVisible: false }))}
                    hideCancel={true}
                    confirmLabel="Close"
                  >
                    <Box>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{categoryState.rationale}</p>
                    </Box>
                  </ModalDialog>
                </SpaceBetween>
              </Box>
            </div>

            {/* Transformation Logic and Results Section - Now using a nested Split */}
            <div style={transformContainerStyle}>
              <Box>
                <Header variant="h3">Transformation Logic</Header>
                
                {/* Nested Split for transformation logic and results */}
                <SplitLayout
                  style={transformNestedSplitStyle}
                  sizes={[60, 40]} // 60% for logic, 40% for results
                  minSize={100}
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
                          <CodeEditorWrapper
                            ace={ace}
                            language={transformState.language.value === TransformLanguageEnum.Python ? "python" : "javascript"}
                            value={transformState.logic}
                            onChange={(value) => 
                              setTransformState(prev => ({ ...prev, logic: value }))
                            }
                            preferences={transformState.editorPreferences}
                            onPreferencesChange={(preferences) => 
                              setTransformState(prev => ({ ...prev, editorPreferences: preferences }))
                            }
                            loading={aceLoading || transformState.isGenerating}
                            height="100%"
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
                </SplitLayout>
              </Box>
              
              {/* Modal for setting transform guidance */}
              <ModalDialog
                title="GenAI User Guidance (Transform Logic)"
                visible={transformState.guidanceModalVisible}
                onClose={() => setTransformState(prev => ({ ...prev, guidanceModalVisible: false }))}
                onConfirm={handleSetTransformGuidance}
                confirmLabel="Set"
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
              </ModalDialog>
            </div>
          </SpaceBetween>
        </Container>
      </div>
    </SplitLayout>
  );
};

export default OcsfPlaygroundPage;
