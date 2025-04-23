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
import useTransformState from '../hooks/useTransformState';
import LogsPanel from '../components/LogsPanel';
import RegexPanel from '../components/RegexPanel';
import CategoryPanel from '../components/CategoryPanel';
// Import EntitiesPanel dynamically to avoid hydration issues
const EntitiesPanel = dynamic(() => import('../components/EntitiesPanel'), {
  ssr: false,
  loading: () => <Spinner size="normal" />
});
import TransformPanel from '../components/TransformPanel';
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
  
  // Use the transform state hook with access to logs state and category
  const transformState = useTransformState({
    logs: logsState.logs,
    selectedLogIds: logsState.selectedLogIds,
    categoryValue: categoryState.category.value as OcsfCategoryEnum
  });

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
            
            {/* Entities Panel - new component with client-only rendering */}
            <EntitiesPanel 
              {...entitiesState} 
              logs={logsState.logs}
              selectedLogIds={logsState.selectedLogIds}
            />

            {/* Transform Panel - extracted to its own component */}
            {/* <TransformPanel {...transformState} /> */}
          </SpaceBetween>
        </Container>
      </div>
    </SplitLayout>
  );
};

export default OcsfPlaygroundPage;
