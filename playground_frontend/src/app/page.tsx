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
  CategoryState, 
  TransformState
} from '../utils/types';
import { 
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
import useRegexState from '../hooks/useRegexState';
import useCategoryState from '../hooks/useCategoryState';
import LogsPanel from '../components/LogsPanel';
import RegexPanel from '../components/RegexPanel';
import CategoryPanel from '../components/CategoryPanel';

const OcsfPlaygroundPage = () => {
  // Use the logs state hook
  const logsState = useLogsState();
  
  // Use the regex state hook with access to logs state
  const regexState = useRegexState({
    logs: logsState.logs,
    selectedLogIds: logsState.selectedLogIds,
    setSelectedLogIds: logsState.setSelectedLogIds
  });

  // Use the category state hook with access to logs state
  const categoryState = useCategoryState({
    logs: logsState.logs,
    selectedLogIds: logsState.selectedLogIds
  });
  
  // Ace editor state
  const [ace, setAce] = useState<any>(null);
  const [aceLoading, setAceLoading] = useState(true);

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
      {/* Logs Panel - extracted to its own component */}
      <LogsPanel {...logsState} />

      {/* Right panel - OCSF Tools (now including transformation results) */}
      <div style={paneStyles}>
        <Container>
          <SpaceBetween size="m">
            <Header variant="h1">OCSF Tools</Header>
            
            {/* Regex Panel - extracted to its own component */}
            <RegexPanel {...regexState} />

            {/* Category Panel - extracted to its own component */}
            <CategoryPanel {...categoryState} />

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
