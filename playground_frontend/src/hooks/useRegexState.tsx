import { useState } from 'react';
import { RegexState } from '../utils/types';
import { getRegexRecommendation } from '../utils/transformerClient';

export interface UseRegexStateProps {
  logs: string[];
  selectedLogIds: string[];
  setSelectedLogIds: (ids: string[]) => void;
}

export interface UseRegexStateResult {
  pattern: string;
  guidance: string;
  guidanceTemp: string;
  rationale: string;
  error: string | null;
  isRecommending: boolean;
  guidanceModalVisible: boolean;
  rationaleModalVisible: boolean;
  matchCount: number;
  totalLogsCount: number;
  onPatternChange: (value: string) => void;
  onTestPattern: () => void;
  onClear: () => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onOpenRationaleModal: () => void;
  onCloseRationaleModal: () => void;
}

const useRegexState = ({ 
  logs, 
  selectedLogIds, 
  setSelectedLogIds 
}: UseRegexStateProps): UseRegexStateResult => {
  const [state, setState] = useState<RegexState>({
    pattern: "",
    guidance: "",
    guidanceTemp: "",
    guidanceModalVisible: false,
    rationale: "",
    rationaleModalVisible: false,
    error: null,
    isRecommending: false
  });

  const onPatternChange = (value: string) => {
    setState(prev => ({ ...prev, pattern: value }));
  };

  const onGuidanceTempChange = (value: string) => {
    setState(prev => ({ ...prev, guidanceTemp: value }));
  };

  const onTestPattern = () => {
    if (!state.pattern.trim()) {
      setState(prev => ({ ...prev, error: "Please enter a regex pattern" }));
      return;
    }

    try {
      // Create a new RegExp object from the pattern
      const regex = new RegExp(state.pattern);
      setState(prev => ({ ...prev, error: null }));
      
      // Test against all logs and select matching ones
      const matchingIds = logs
        .map((log, index) => ({ id: index.toString(), matches: regex.test(log) }))
        .filter(item => item.matches)
        .map(item => item.id);
      
      // Update selection to only include matching logs
      setSelectedLogIds(matchingIds);
    } catch (error) {
      // Handle invalid regex
      setState(prev => ({ 
        ...prev, 
        error: `Invalid regex: ${(error as Error).message}` 
      }));
    }
  };

  const onClear = () => {
    setState(prev => ({
      ...prev,
      pattern: "",
      rationale: "",
      error: null
    }));
    setSelectedLogIds([]);
  };

  const onGetRecommendation = async () => {
    // Make sure one, and only one, log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a regex recommendation.");
      return;
    }
    const selectedLog = logs[parseInt(selectedLogIds[0])];

    setState(prev => ({ ...prev, isRecommending: true }));

    try {
      const response = await getRegexRecommendation(
        selectedLog,
        state.pattern,
        state.guidance
      );

      setState(prev => ({
        ...prev,
        pattern: response.new_heuristic,
        rationale: response.rationale,
        isRecommending: false
      }));
    } catch (error) {
      alert((error as Error).message);
      setState(prev => ({ ...prev, isRecommending: false }));
    }
  };

  const onSetGuidance = () => {
    setState(prev => ({ 
      ...prev, 
      guidanceModalVisible: false,
      guidance: prev.guidanceTemp 
    }));
  };

  const onOpenGuidanceModal = () => {
    setState(prev => ({ 
      ...prev, 
      guidanceModalVisible: true,
      guidanceTemp: prev.guidance 
    }));
  };

  const onCloseGuidanceModal = () => {
    setState(prev => ({ ...prev, guidanceModalVisible: false }));
  };

  const onOpenRationaleModal = () => {
    setState(prev => ({ ...prev, rationaleModalVisible: true }));
  };

  const onCloseRationaleModal = () => {
    setState(prev => ({ ...prev, rationaleModalVisible: false }));
  };

  return {
    pattern: state.pattern,
    guidance: state.guidance,
    guidanceTemp: state.guidanceTemp,
    rationale: state.rationale,
    error: state.error,
    isRecommending: state.isRecommending,
    guidanceModalVisible: state.guidanceModalVisible,
    rationaleModalVisible: state.rationaleModalVisible,
    matchCount: selectedLogIds.length,
    totalLogsCount: logs.length,
    onPatternChange,
    onTestPattern,
    onClear,
    onGetRecommendation,
    onGuidanceTempChange,
    onSetGuidance,
    onOpenGuidanceModal,
    onCloseGuidanceModal,
    onOpenRationaleModal,
    onCloseRationaleModal
  };
};

export default useRegexState;
