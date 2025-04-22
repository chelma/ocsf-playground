import React, { useState } from 'react';
import { FormField, Textarea } from '@cloudscape-design/components';
import ModalDialog from '../common/ModalDialog';

export interface ImportDialogProps {
  visible: boolean;
  onClose: () => void;
  onImport: (logEntries: string[]) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  visible,
  onClose,
  onImport
}) => {
  const [importText, setImportText] = useState('');

  const handleImport = () => {
    if (importText.trim()) {
      // Split by new line and filter out empty entries
      const logEntries = importText
        .split('\n')
        .filter(entry => entry.trim().length > 0);
        
      onImport(logEntries);
      setImportText(''); // Clear the input after import
    }
  };

  return (
    <ModalDialog
      title="Import Log Entries"
      visible={visible}
      onClose={onClose}
      onConfirm={handleImport}
      confirmLabel="Import"
    >
      <FormField
        label="Paste your log entries below (one per line)"
        description="Each line will be treated as a separate log entry"
      >
        <Textarea
          value={importText}
          onChange={({ detail }) => setImportText(detail.value)}
          placeholder="Paste your log entries here..."
          rows={20}
        />
      </FormField>
    </ModalDialog>
  );
};

export default ImportDialog;
