import { useState, useEffect } from 'react';
import { TransformState } from '../utils/types';
import { CodeEditorProps, SelectProps } from '@cloudscape-design/components';
import { 
  getTransformRecommendation, 
  testTransformLogic,
  debugTransformLogic
} from '../utils/transformerClient';
import { 
  defaultTransformLogic, 
  transformLanguageOptions, 
  defaultTransformLanguage 
} from '../utils/constants';
import { aceLoader } from '../app/aceLoader';
import { OcsfCategoryEnum, TransformLanguageEnum } from '../generated-api-client';

export interface UseTransformStateProps {
  logs: string[];
  selectedLogIds: string[];
  categoryValue: OcsfCategoryEnum;
}

export interface UseTransformStateResult {
  language: SelectProps.Option;
  languageOptions: SelectProps.Options;
  logic: string;
  output: string;
  guidance: string;
  guidanceTemp: string;
  guidanceModalVisible: boolean;
  isGenerating: boolean;
  editorPreferences: CodeEditorProps.Preferences;
  validation: {
    report: string[];
    outcome: string;
  };
  ace: any;
  aceLoading: boolean;
  isDefaultTransform: boolean;
  onLanguageChange: (option: SelectProps.Option) => void;
  onLogicChange: (value: string) => void;
  onPreferencesChange: (preferences: CodeEditorProps.Preferences) => void;
  onTest: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onDebug: () => void;
}

const useTransformState = ({ 
  logs, 
  selectedLogIds,
  categoryValue
}: UseTransformStateProps): UseTransformStateResult => {
  // Transform state
  const [state, setState] = useState<TransformState>({
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

  // Ace editor state
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

  const onLanguageChange = (option: SelectProps.Option) => {
    setState(prev => ({ ...prev, language: option }));
  };

  const onLogicChange = (value: string) => {
    setState(prev => ({ ...prev, logic: value }));
  };

  const onPreferencesChange = (preferences: CodeEditorProps.Preferences) => {
    setState(prev => ({ ...prev, editorPreferences: preferences }));
  };

  const onGuidanceTempChange = (value: string) => {
    setState(prev => ({ ...prev, guidanceTemp: value }));
  };

  // Handler for testing transformation logic
  const onTest = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to test the transformation logic.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await testTransformLogic(
        state.language.value as TransformLanguageEnum,
        state.logic,
        categoryValue,
        selectedLog
      );

      setState(prev => ({
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
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Handler for getting a transform recommendation
  const onGetRecommendation = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a transform logic recommendation.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await getTransformRecommendation(
        state.language.value as TransformLanguageEnum,
        categoryValue,
        selectedLog,
        state.guidance
      );

      setState(prev => ({
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
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Handler for debugging transform logic with GenAI
  const onDebug = async () => {
    // Make sure one log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to debug the transformation.");
      return;
    }

    // Validate that we have existing transform code
    if (!state.logic.trim() || state.logic === defaultTransformLogic) {
      alert("Please create a transformation first before debugging.");
      return;
    }

    // Validate that we have validation report or output
    if (state.validation.report.length === 0 && !state.output.trim()) {
      alert("Please test your transformation first to generate output to debug.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await debugTransformLogic(
        state.language.value as TransformLanguageEnum,
        state.logic,
        state.output,
        categoryValue,
        selectedLog,
        state.guidance,
        state.validation.report,
        state.validation.outcome
      );

      setState(prev => ({
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
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Handler for clearing the transform
  const onClear = () => {
    setState(prev => ({
      ...prev,
      logic: defaultTransformLogic,
      output: '',
      validation: {
        report: [],
        outcome: 'N/A'
      }
    }));
  };

  // Handler for setting guidance
  const onSetGuidance = () => {
    setState(prev => ({ 
      ...prev, 
      guidanceModalVisible: false,
      guidance: prev.guidanceTemp 
    }));
  };

  // Handler for opening guidance modal
  const onOpenGuidanceModal = () => {
    setState(prev => ({ 
      ...prev, 
      guidanceModalVisible: true,
      guidanceTemp: prev.guidance 
    }));
  };

  // Handler for closing guidance modal
  const onCloseGuidanceModal = () => {
    setState(prev => ({ ...prev, guidanceModalVisible: false }));
  };

  // Check if the current transform is the default template
  const isDefaultTransform = state.logic === defaultTransformLogic;

  return {
    language: state.language,
    languageOptions: transformLanguageOptions,
    logic: state.logic,
    output: state.output,
    guidance: state.guidance,
    guidanceTemp: state.guidanceTemp,
    guidanceModalVisible: state.guidanceModalVisible,
    isGenerating: state.isGenerating,
    editorPreferences: state.editorPreferences,
    validation: state.validation,
    ace,
    aceLoading,
    isDefaultTransform,
    onLanguageChange,
    onLogicChange,
    onPreferencesChange,
    onTest,
    onClear,
    onGetRecommendation,
    onGuidanceTempChange,
    onSetGuidance,
    onOpenGuidanceModal,
    onCloseGuidanceModal,
    onDebug
  };
};

export default useTransformState;
