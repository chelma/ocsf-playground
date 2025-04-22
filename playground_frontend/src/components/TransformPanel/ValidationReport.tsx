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
}

const ValidationReport: React.FC<ValidationReportProps> = ({
  report,
  outcome
}) => {
  return (
    <div>
      <Header variant="h3">Validation Report</Header>
      <FormField
        label={outcome ? `Status: ${outcome}` : "Status: Not Available"}
        description="Results of validating against the OCSF schema"
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
