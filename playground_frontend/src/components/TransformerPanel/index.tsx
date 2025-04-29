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

interface TransformerPanelProps extends TransformerState {
  hasRequiredInputs: boolean;
}

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
        <Header variant="h2">Transformer Creation</Header>
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
              Create Transformer
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
        
        {/* Transformer Logic Display */}
        {transformer && (
            <Container
            header={<Header variant="h3">Generated Transformer Logic</Header>}
            >
            <Textarea
              value={transformer.dependency_setup ? `${transformer.dependency_setup}\n\n${transformer.transformer_logic}` : transformer.transformer_logic}
              readOnly
              rows={50}
            />
            </Container>
        )}
      </SpaceBetween>
    </Container>
  );
};

export default TransformerPanel;
