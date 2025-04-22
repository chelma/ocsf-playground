import React from 'react';
import {
  Box,
  FormField,
  Header
} from '@cloudscape-design/components';
import { getValidationReportStyle, logBlockStyle } from '../../utils/styles';

export interface ValidationReportProps {
  report: string[];
  outcome: string;
  title?: string;
}

const ValidationReport: React.FC<ValidationReportProps> = ({
  report,
  outcome,
  title = "Validation Report"
}) => {
  return (
    <div>
      <Header variant="h3">{title}</Header>
      <FormField
        label={outcome ? `Status: ${outcome}` : "Status: Not Available"}
        stretch={true}
      >
        <div style={getValidationReportStyle(outcome)}>
          {report.length > 0 ? (
            report.map((entry, index) => (
              <div key={`validation-entry-${index}`} style={logBlockStyle}>
                {entry}
              </div>
            ))
          ) : (
            <p>Validation report will appear here</p>
          )}
        </div>
      </FormField>
    </div>
  );
};

export default ValidationReport;
