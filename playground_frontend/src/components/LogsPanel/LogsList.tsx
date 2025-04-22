import React from 'react';
import { Box, Table } from '@cloudscape-design/components';
import { LogEntry } from '../../utils/types';
import { logBlockStyle } from '../../utils/styles';

export interface LogsListProps {
  logs: string[];
  selectedLogIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick: (item: LogEntry) => void;
}

const LogsList: React.FC<LogsListProps> = ({
  logs,
  selectedLogIds,
  onSelectionChange,
  onRowClick
}) => {
  if (logs.length === 0) {
    return (
      <Box>
        <p>No logs imported. Click "Import Logs" to get started.</p>
      </Box>
    );
  }

  return (
    <Box>
      <p>{logs.length} log entries available</p>
      <div
        style={{
          maxHeight: "1150px",
          overflowY: "auto",
          padding: "10px"
        }}
      >
        <Table
          items={logs.map((log, index) => ({
            id: index.toString(),
            content: log
          }))}
          selectedItems={selectedLogIds.map(id => ({
            id,
            content: logs[parseInt(id)]
          }))}
          onSelectionChange={({ detail }) => {
            const selectedIds = detail.selectedItems.map(item => item.id);
            onSelectionChange(selectedIds);
          }}
          columnDefinitions={[
            {
              id: "index",
              header: "ID",
              cell: item => parseInt(item.id) + 1,
              width: 50,
            },
            {
              id: "content",
              header: "Log Content",
              cell: item => (
                <div style={logBlockStyle}>
                  {item.content}
                </div>
              ),
            }
          ]}
          trackBy="id"
          selectionType="multi"
          variant="container"
          onRowClick={({ detail }) => onRowClick(detail.item)}
          ariaLabels={{
            selectionGroupLabel: "Log entries selection",
            allItemsSelectionLabel: ({ selectedItems }) =>
              `${selectedItems.length} ${
                selectedItems.length === 1 ? "item" : "items"
              } selected`,
            itemSelectionLabel: ({ selectedItems }, item) => {
              const isSelected = selectedItems.some(
                selectedItem => selectedItem.id === item.id
              );
              return `${isSelected ? "Deselect" : "Select"} log entry ${
                parseInt(item.id) + 1
              }`;
            }
          }}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No logs</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                No log entries to display
              </Box>
            </Box>
          }
        />
      </div>
    </Box>
  );
};

export default LogsList;
