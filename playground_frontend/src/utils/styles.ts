import { CSSProperties } from "react";

// Split component styles
export const splitStyles: CSSProperties = {
  display: 'flex',
  width: '100%',
  height: 'calc(100vh - 40px)',
  overflow: 'hidden'
};

// Style for the panes in the Split component
export const paneStyles: CSSProperties = {
  overflow: 'auto',
  padding: '0 10px',
  width: '100%',
  height: '100%'
};

// Gutter style function for Split component
export const getGutterStyle = (dimension: "width" | "height", gutterSize: number, index: number) => {
  return {
    backgroundColor: '#eee',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50%',
    cursor: dimension === 'width' ? 'col-resize' : 'row-resize',
  } as const;
};

// Style for log content display
export const logBlockStyle: CSSProperties = {
  fontFamily: 'monospace',
  backgroundColor: '#f6f8fa',
  padding: '3px',
  borderRadius: '4px',
  overflowX: 'auto',
  whiteSpace: 'normal',
  fontSize: '13px',
  display: 'block',
  border: '1px solid #dfe3e8'
};

// Border container style
export const borderContainerStyle: CSSProperties = {
  border: '1px solid #d5dbdb',
  padding: '10px',
  borderRadius: '3px'
};

// Style for transform section
export const transformContainerStyle: CSSProperties = {
  ...borderContainerStyle,
  height: 'auto',
  minHeight: '600px'
};

// Nested split for transformation section
export const transformNestedSplitStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  height: 'calc(100% - 40px)',
  overflow: 'hidden',
  marginTop: '10px'
};

// Style for transform editor container
export const transformEditorContainerStyle: CSSProperties = {
  flex: '1 1 auto',
  minHeight: '200px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

// Style for validation report container
export const getValidationReportStyle = (validationOutcome: string): CSSProperties => ({
  width: '100%',
  minHeight: '100px',
  maxHeight: '300px',
  overflowY: 'auto',
  padding: '10px',
  backgroundColor: validationOutcome === 'PASSED' ? '#f2fcf3' :
    validationOutcome === 'FAILED' ? '#fff0f0' : '#f5f5f5',
  borderRadius: '4px',
  border: `1px solid ${
    validationOutcome === 'PASSED' ? '#d5e8d8' :
    validationOutcome === 'FAILED' ? '#ffd7d7' : '#e0e0e0'
  }`
});
