import React, { useState } from 'react';
import { Button, Container, Header, SpaceBetween } from '@cloudscape-design/components';
import { LogEntry } from '../../utils/types';
import LogsList from './LogsList';
import ImportDialog from './ImportDialog';
import { paneStyles } from '../../utils/styles';

export interface LogsPanelProps {
  logs: string[];
  selectedLogIds: string[];
  setLogs: (logs: string[]) => void;
  setSelectedLogIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const LogsPanel: React.FC<LogsPanelProps> = ({
  logs,
  selectedLogIds,
  setLogs,
  setSelectedLogIds
}) => {
  const [importDialogVisible, setImportDialogVisible] = useState(false);

  // Function to handle row click for selection
  const handleRowClick = (item: LogEntry) => {
    setSelectedLogIds((prevSelectedIds: string[]) => {
      const id: string = item.id;
      if (prevSelectedIds.includes(id)) {
        // If already selected, deselect it
        return prevSelectedIds.filter((selectedId: string) => selectedId !== id);
      } else {
        // If not selected, add it to selection
        return [...prevSelectedIds, id];
      }
    });
  };

  // Function to handle log import
  const handleImportLogs = (logEntries: string[]) => {
    setLogs(logEntries);
    setSelectedLogIds([]);
    setImportDialogVisible(false);
  };

  return (
    <div style={paneStyles}>
      <Container>
        <SpaceBetween size="m">
          <Header variant="h1">Log Entries</Header>

          <Button onClick={() => setImportDialogVisible(true)}>
            Import Logs
          </Button>

          <LogsList
            logs={logs}
            selectedLogIds={selectedLogIds}
            onSelectionChange={setSelectedLogIds}
            onRowClick={handleRowClick}
          />

          <ImportDialog
            visible={importDialogVisible}
            onClose={() => setImportDialogVisible(false)}
            onImport={handleImportLogs}
          />
        </SpaceBetween>
      </Container>
    </div>
  );
};

export default LogsPanel;
