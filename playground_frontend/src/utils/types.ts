import { SelectProps, CodeEditorProps } from "@cloudscape-design/components";

export interface Entity {
  value: string;
  description: string;
}

export interface EntityMapping {
  id: string;
  entity: Entity;
  ocsf_path: string;
  path_rationale?: string;
}

export interface ValidationReport {
  input: string;
  output: any;
  report_entries: string[];
  passed: boolean;
}

export interface ExtractionPattern {
  id: string;
  mapping?: EntityMapping;
  dependency_setup?: string;
  extract_logic: string;
  transform_logic: string;
  validation_report?: ValidationReport;
}

export interface LogEntry {
  id: string;
  content: string;
}

// Validation data interface
export interface ValidationData {
  report: string[];
  outcome: string;
}

// Transform state interface
export interface TransformState {
  logic: string;
  output: string;
  guidance: string;
  guidanceTemp: string;
  guidanceModalVisible: boolean;
  language: SelectProps.Option;
  isGenerating: boolean;
  editorPreferences: CodeEditorProps.Preferences;
  validation: ValidationData;
}

// Regex state interface
export interface RegexState {
  pattern: string;
  guidance: string;
  guidanceTemp: string;
  guidanceModalVisible: boolean;
  rationale: string;
  rationaleModalVisible: boolean;
  error: string | null;
  isRecommending: boolean;
}

// OCSF Category state interface
export interface CategoryState {
  version: SelectProps.Option;
  category: SelectProps.Option;
  guidance: string;
  guidanceTemp: string;
  guidanceModalVisible: boolean;
  rationale: string;
  rationaleModalVisible: boolean;
  isRecommending: boolean;
}

// API Error type
export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}
