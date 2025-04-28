import React, { useEffect, useState } from 'react';
import { Box, Container, Header } from '@cloudscape-design/components';
import { logBlockStyle } from '../../utils/styles';

interface ExtractedHighlight {
  start: number;
  end: number;
}

interface ExtractionPattern {
  id: string;
  validation_report?: {
    input: string;
    output: any;
  };
  mapping: {
    id: string;
    ocsf_path: string;
  };
}

interface ExtractionVisualizationProps {
  log?: string;
  extractionPatterns: ExtractionPattern[];
}

const ExtractionVisualization: React.FC<ExtractionVisualizationProps> = ({
  log,
  extractionPatterns
}) => {
  const [highlights, setHighlights] = useState<ExtractedHighlight[]>([]);
  
  // Calculate highlights when log or extractionPatterns change
  useEffect(() => {
    if (!log) {
      setHighlights([]);
      return;
    }
    
    // Track all positions in the log that need to be highlighted
    const positions: {start: number, end: number}[] = [];
    
    // For each extraction pattern with output, try to find its value in the log
    extractionPatterns.forEach(pattern => {
      if (!pattern.validation_report?.output?.extract_output) return;
      
      const extractedValue = String(pattern.validation_report.output.extract_output);
      if (!extractedValue || extractedValue === "N/A") return;
      
      // Find the occurrence of the extracted value in the log
      const index = log.indexOf(extractedValue);
      if (index !== -1) {
        positions.push({
          start: index,
          end: index + extractedValue.length
        });
      }
    });
    
    // Sort positions by start index
    positions.sort((a, b) => a.start - b.start);
    
    // Merge overlapping highlights
    const mergedPositions: ExtractedHighlight[] = [];
    for (const pos of positions) {
      const lastPos = mergedPositions.length > 0 ? 
        mergedPositions[mergedPositions.length - 1] : null;
      
      if (lastPos && pos.start <= lastPos.end) {
        // If this position overlaps with the previous one, merge them
        lastPos.end = Math.max(lastPos.end, pos.end);
      } else {
        // No overlap, add as a new highlight position
        mergedPositions.push({...pos});
      }
    }
    
    setHighlights(mergedPositions);
  }, [log, extractionPatterns]);
  
  // Render log with highlighted sections
  const renderHighlightedLog = () => {
    if (!log) return <p>No log selected</p>;
    if (highlights.length === 0) return <div style={logBlockStyle}>{log}</div>;
    
    const result: JSX.Element[] = [];
    let lastIndex = 0;
    
    highlights.forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {log.substring(lastIndex, highlight.start)}
          </span>
        );
      }
      
      // Add highlighted text
      result.push(
        <span 
          key={`highlight-${index}`}
          style={{
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
            padding: '2px 0',
            borderRadius: '2px'
          }}
        >
          {log.substring(highlight.start, highlight.end)}
        </span>
      );
      
      lastIndex = highlight.end;
    });
    
    // Add any remaining text after the last highlight
    if (lastIndex < log.length) {
      result.push(
        <span key="text-end">
          {log.substring(lastIndex)}
        </span>
      );
    }
    
    return <div style={logBlockStyle}>{result}</div>;
  };
  
  return (
    <Container
      header={<Header variant="h3">Extraction Visualization</Header>}
    >
      <Box>
        {log ? renderHighlightedLog() : (
          <p>No log selected. Select a log entry to visualize extraction coverage.</p>
        )}
      </Box>
    </Container>
  );
};

export default ExtractionVisualization;
