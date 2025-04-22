import React from 'react';
import {
  FormField,
  Header,
  Textarea
} from '@cloudscape-design/components';

export interface TransformOutputProps {
  output: string;
}

const TransformOutput: React.FC<TransformOutputProps> = ({
  output
}) => {
  return (
    <div>
      <Header variant="h3">Transformation Output</Header>
      <FormField
        description="The result of applying the transformation to the selected log entry"
        stretch={true}
      >
        <Textarea
          value={output}
          readOnly
          rows={10}
          placeholder="Transformation output will appear here"
        />
      </FormField>
    </div>
  );
};

export default TransformOutput;
