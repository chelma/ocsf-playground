import React from 'react';
import { CodeEditor, CodeEditorProps } from '@cloudscape-design/components';

export interface CodeEditorWrapperProps {
  ace: any;
  language: string;
  value: string;
  onChange: (value: string) => void;
  preferences?: CodeEditorProps.Preferences;
  onPreferencesChange?: (preferences: CodeEditorProps.Preferences) => void;
  loading?: boolean;
  height?: number;
  ariaLabel?: string;
}

const CodeEditorWrapper: React.FC<CodeEditorWrapperProps> = ({
  ace,
  language,
  value,
  onChange,
  preferences,
  onPreferencesChange,
  loading = false,
  height,
  ariaLabel = 'Code editor'
}) => {
  // Common i18n strings for code editor
  const i18nStrings = {
    loadingState: 'Loading code editor',
    errorState: 'There was an error loading the code editor.',
    errorStateRecovery: 'Retry',
    editorGroupAriaLabel: ariaLabel,
    statusBarGroupAriaLabel: 'Status bar',
    cursorPosition: (row: number, column: number) => `Ln ${row}, Col ${column}`,
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
  };

  // Wrapper style to ensure proper sizing
  const wrapperStyle = {
    height,
    width: '100%',
    position: 'relative' as const,
  };

  // Create base props object for the editor
  const editorProps: React.ComponentProps<typeof CodeEditor> = {
    ace,
    language,
    value,
    onChange: ({ detail }) => onChange(detail.value),
    preferences,
    onPreferencesChange: ({ detail }) => {
      if (onPreferencesChange) {
        onPreferencesChange(detail);
      }
    },
    loading,
    i18nStrings,
  };

  // Only add editorContentHeight if height is defined
  if (height !== undefined) {
    editorProps.editorContentHeight = height;
  }

  return (
    <div style={wrapperStyle}>
      <CodeEditor {...editorProps} />
    </div>
  );
};

export default CodeEditorWrapper;
