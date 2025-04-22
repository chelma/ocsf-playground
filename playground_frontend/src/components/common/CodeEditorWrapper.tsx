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
  height?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const CodeEditorWrapper: React.FC<CodeEditorWrapperProps> = ({
  ace,
  language,
  value,
  onChange,
  preferences,
  onPreferencesChange,
  loading = false,
  height = '100%',
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

  return (
    <div style={wrapperStyle}>
      <CodeEditor
        ace={ace}
        language={language}
        value={value}
        onChange={({ detail }) => onChange(detail.value)}
        preferences={preferences}
        onPreferencesChange={({ detail }) => {
          if (onPreferencesChange) {
            onPreferencesChange(detail);
          }
        }}
        loading={loading}
        i18nStrings={i18nStrings}
      />
    </div>
  );
};

export default CodeEditorWrapper;
