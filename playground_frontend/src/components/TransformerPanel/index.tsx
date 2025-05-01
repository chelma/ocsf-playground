"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";
import { TransformerState } from "../../hooks/useTransformerState";
import SplitLayout from "../common/SplitLayout";
import ValidationReport from "../common/ValidationReport";
import { splitStyles } from "../../utils/styles";

interface TransformerPanelProps extends TransformerState {
  hasRequiredInputs: boolean;
}

// Modified split styles to auto-size height based on content
const contentFitSplitStyles = {
  ...splitStyles,
  width: '100%',
  height: 'auto',
  overflow: 'visible'
};

// Column container styles
const columnStyle = {
  height: 'auto',
  width: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column' as const
};

const TransformerPanel: React.FC<TransformerPanelProps> = ({
  isLoading,
  error,
  transformer,
  createTransformer,
  clearTransformer,
  hasRequiredInputs
}) => {
  return (
      <Container
        header={
          <Header variant="h2">Finalized Transformer</Header>
        }
      >
        <SpaceBetween size="m">
          {/* Primary action buttons */}
          <Box>
            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="primary"
                iconAlign="left"
                loading={isLoading}
                onClick={createTransformer}
                disabled={!hasRequiredInputs}
              >
                Generate
              </Button>
              <Button
                onClick={clearTransformer}
                disabled={!transformer}
              >
                Clear
              </Button>
            </SpaceBetween>
          </Box>

          {/* Error alerts */}
          {error && (
            <Alert type="error">
              {error}
            </Alert>
          )}
          
          {/* Transformer Logic and Validation Display */}
          {transformer && (
            <Box padding="m">
              <SplitLayout
                style={contentFitSplitStyles}
                sizes={[60, 40]}
                minSize={200}
                gutterSize={10}
                snapOffset={30}
                direction="horizontal"
              >
                {/* Left Column: Transformer Logic */}
                <div style={columnStyle}>
                  <Container
                    header={<Header variant="h3">Transformer Logic</Header>}
                  >
                    <Textarea
                      value={transformer.dependency_setup ? `${transformer.dependency_setup}\n\n${transformer.transformer_logic}` : transformer.transformer_logic}
                      readOnly
                      rows={50}
                    />
                  </Container>
                </div>
                
                {/* Right Column: Validation Report */}
                <div style={columnStyle}>
                  <Container
                    header={<Header variant="h3">Validation & Output</Header>}
                  >
                    <SpaceBetween size="m">
                      {transformer.validation_report ? (
                        <>
                          <Header variant="h3">Transformer Output</Header>
                          <div>
                            <Textarea
                              value={JSON.stringify(transformer.validation_report.output, null, 4) || 'N/A'}
                              readOnly
                              rows={25}
                            />
                          </div>
                          
                          <ValidationReport
                            report={transformer.validation_report.report_entries}
                            outcome={transformer.validation_report.passed ? "PASSED" : "FAILED"}
                            title="Validation Report"
                          />
                        </>
                      ) : (
                        <Box variant="p">No validation report available.</Box>
                      )}
                    </SpaceBetween>
                  </Container>
                </div>
              </SplitLayout>
            </Box>
          )}
        </SpaceBetween>
      </Container>
  );
};

export default TransformerPanel;
