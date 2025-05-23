"use client";

import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import "@cloudscape-design/global-styles/index.css";
import 'ace-builds/css/ace.css';
import {
  Container,
  Header,
  SpaceBetween,
  Spinner
} from "@cloudscape-design/components";

// Import utilities
import { 
  splitStyles, 
  paneStyles,
} from '../utils/styles';

// Import common components
import SplitLayout from '../components/common/SplitLayout';

// Import custom hooks and components
import useLogsState from '../hooks/useLogsState';
import useRegexState from '../hooks/useRegexState';
import useCategoryState from '../hooks/useCategoryState';
import useEntitiesState from '../hooks/useEntitiesState';
import useTransformerState from '../hooks/useTransformerState';
import LogsPanel from '../components/LogsPanel';
import RegexPanel from '../components/RegexPanel';
import CategoryPanel from '../components/CategoryPanel';
import TransformerPanel from '../components/TransformerPanel';

// Import EntitiesPanel dynamically to avoid hydration issues
const EntitiesPanel = dynamic(() => import('../components/EntitiesPanel'), {
  ssr: false,
  loading: () => <Spinner size="normal" />
});
import { OcsfCategoryEnum } from '../generated-api-client';

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
  
  // Use the entities state hook with access to logs state and category
  const entitiesState = useEntitiesState({
    logs: logsState.logs,
    selectedLogIds: logsState.selectedLogIds,
    categoryValue: categoryState.category.value as OcsfCategoryEnum
  });
  
  // Use the transformer state hook with access to logs, category, and entities
  const transformerState = useTransformerState({
    logs: logsState.logs,
    selectedLogIds: logsState.selectedLogIds,
    categoryValue: categoryState.category.value as OcsfCategoryEnum,
    extractionPatterns: entitiesState.extractionPatterns,
    language: entitiesState.language
  });

  // Check if we have all required inputs for transformer creation
  const hasRequiredInputsForTransformer = 
    logsState.selectedLogIds.length > 0 &&
    categoryState.category.value !== "" &&
    entitiesState.extractionPatterns.length > 0;

  return (
    <SplitLayout
      style={splitStyles}
      sizes={[30, 70]}
      minSize={200}
      gutterSize={10}
      snapOffset={30}
      direction="horizontal"
    >
      {/* Logs Panel - Enables import of logs and other data entries into the playground */}
      <LogsPanel {...logsState} />

      {/* Right panel - OCSF Tools */}
      <div style={paneStyles}>
        <Container>
          <SpaceBetween size="m">
            <Header variant="h1">OCSF Tools</Header>
            
            {/* Regex Panel - enables creation/testing of a targeting heuristic/regex */}
            <RegexPanel {...regexState} />

            {/* Category Panel - enables selection of the OCSF event class for the new transformer */}
            <CategoryPanel {...categoryState} />
            
            {/* Entities Panel - enables creation/testing of extraction patterns for entities */}
            <EntitiesPanel 
              {...entitiesState} 
              logs={logsState.logs}
              selectedLogIds={logsState.selectedLogIds}
            />
            
            {/* Transformer Panel - enables creation of a transformer from extraction patterns */}
            <TransformerPanel 
              {...transformerState}
              hasRequiredInputs={hasRequiredInputsForTransformer}
            />
          </SpaceBetween>
        </Container>
      </div>
    </SplitLayout>
  );
};

export default OcsfPlaygroundPage;
