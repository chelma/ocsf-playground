import { useState } from 'react';
import { CategoryState } from '../utils/types';
import { SelectProps } from '@cloudscape-design/components';
import { getCategoryRecommendation } from '../utils/transformerClient';
import { ocsfCategoryOptions, ocsfVersionOptions } from '../utils/constants';

export interface UseCategoryStateProps {
  logs: string[];
  selectedLogIds: string[];
}

export interface UseCategoryStateResult {
  version: SelectProps.Option;
  category: SelectProps.Option;
  versionOptions: SelectProps.Options;
  categoryOptions: SelectProps.Options;
  guidance: string;
  guidanceTemp: string;
  rationale: string;
  isRecommending: boolean;
  guidanceModalVisible: boolean;
  rationaleModalVisible: boolean;
  onVersionChange: (option: SelectProps.Option) => void;
  onCategoryChange: (option: SelectProps.Option) => void;
  onGetRecommendation: () => void;
  onGuidanceTempChange: (value: string) => void;
  onSetGuidance: () => void;
  onOpenGuidanceModal: () => void;
  onCloseGuidanceModal: () => void;
  onOpenRationaleModal: () => void;
  onCloseRationaleModal: () => void;
}

const useCategoryState = ({ 
  logs, 
  selectedLogIds 
}: UseCategoryStateProps): UseCategoryStateResult => {
  const [state, setState] = useState<CategoryState>({
    version: ocsfVersionOptions[0],
    category: ocsfCategoryOptions[0],
    guidance: "",
    guidanceTemp: "",
    guidanceModalVisible: false,
    rationale: "",
    rationaleModalVisible: false,
    isRecommending: false
  });

  const onVersionChange = (option: SelectProps.Option) => {
    setState(prev => ({ ...prev, version: option }));
  };

  const onCategoryChange = (option: SelectProps.Option) => {
    setState(prev => ({ ...prev, category: option }));
  };

  const onGuidanceTempChange = (value: string) => {
    setState(prev => ({ ...prev, guidanceTemp: value }));
  };

  const onGetRecommendation = async () => {
    // Make sure a log entry is selected
    if (selectedLogIds.length !== 1) {
      alert("Please select exactly one log entry to get a category recommendation.");
      return;
    }

    const selectedLog = logs[parseInt(selectedLogIds[0])];
    setState(prev => ({ ...prev, isRecommending: true }));

    try {
      const response = await getCategoryRecommendation(
        selectedLog,
        state.guidance
      );

      const recommendedCategory = ocsfCategoryOptions.find(
        option => option.value === response.ocsf_category
      ) || ocsfCategoryOptions[0];
      
      setState(prev => ({
        ...prev,
        category: recommendedCategory,
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
    version: state.version,
    category: state.category,
    versionOptions: ocsfVersionOptions,
    categoryOptions: ocsfCategoryOptions,
    guidance: state.guidance,
    guidanceTemp: state.guidanceTemp,
    rationale: state.rationale,
    isRecommending: state.isRecommending,
    guidanceModalVisible: state.guidanceModalVisible,
    rationaleModalVisible: state.rationaleModalVisible,
    onVersionChange,
    onCategoryChange,
    onGetRecommendation,
    onGuidanceTempChange,
    onSetGuidance,
    onOpenGuidanceModal,
    onCloseGuidanceModal,
    onOpenRationaleModal,
    onCloseRationaleModal
  };
};

export default useCategoryState;
