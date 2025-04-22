import { useState } from 'react';

export interface UseLogsStateResult {
  logs: string[];
  selectedLogIds: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLogIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const useLogsState = (): UseLogsStateResult => {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

  return {
    logs,
    selectedLogIds,
    setLogs,
    setSelectedLogIds
  };
};

export default useLogsState;
