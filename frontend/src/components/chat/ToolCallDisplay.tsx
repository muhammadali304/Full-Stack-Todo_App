/**
 * Tool Call Display Component
 *
 * Displays tool calls and their results inline in the conversation flow
 * with clear visual separators and status indicators.
 */

import React from 'react';
import { ToolCall, ToolCallResult } from '../../lib/types';
import { formatToolCall, formatToolCallResult } from '../../utils/message_utils';

interface ToolCallDisplayProps {
  toolCall: ToolCall;
}

interface ToolCallResultDisplayProps {
  result: ToolCallResult;
}

const ToolCallDisplay: React.FC<ToolCallDisplayProps> & {
  Result: React.FC<ToolCallResultDisplayProps>;
} = ({ toolCall }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffa726';
      case 'executing':
        return '#29b6f6';
      case 'completed':
        return '#66bb6a';
      case 'error':
        return '#ef5350';
      default:
        return '#bdbdbd';
    }
  };

  const getDisplayTypeClass = (displayType: string) => {
    switch (displayType) {
      case 'inline':
        return {
          borderLeft: '3px solid #2196f3',
          marginLeft: '10px',
          paddingLeft: '10px',
          fontSize: '0.9em'
        };
      case 'card':
        return {
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#f5f5f5',
          fontSize: '0.9em'
        };
      case 'expanded':
      default:
        return {
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px',
          margin: '8px 0',
          backgroundColor: '#fff8e1',
          fontSize: '0.9em'
        };
    }
  };

  return (
    <div
      style={{
        ...getDisplayTypeClass(toolCall.displayType),
        fontFamily: 'monospace',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(toolCall.status),
              marginRight: '5px'
            }}
          />
          <strong style={{ color: '#1976d2' }}>Tool Call:</strong>
          <span style={{ fontWeight: 'bold', color: '#333' }}>{toolCall.name}</span>
        </div>
        <span style={{
          fontSize: '0.8em',
          color: '#666',
          backgroundColor: '#e3f2fd',
          padding: '2px 6px',
          borderRadius: '10px'
        }}>
          {toolCall.status}
        </span>
      </div>

      <div style={{
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.85em',
        overflowX: 'auto'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>Arguments:</strong>
        </div>
        <pre style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: '#555'
        }}>
          {JSON.stringify(toolCall.arguments, null, 2)}
        </pre>
      </div>

      {toolCall.result && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px dashed #ccc'
        }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Result:</strong>
          </div>
          <div style={{
            padding: '8px',
            backgroundColor: toolCall.status === 'error' ? '#ffebee' : '#e8f5e8',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em'
          }}>
            {typeof toolCall.result === 'string' ? toolCall.result : JSON.stringify(toolCall.result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for displaying tool call results
ToolCallDisplay.Result = ({ result }: ToolCallResultDisplayProps) => {
  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
        margin: '8px 0',
        backgroundColor: result.success ? '#e8f5e8' : '#ffebee',
        fontSize: '0.9em',
        borderLeft: result.success ? '3px solid #4caf50' : '3px solid #f44336'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: result.success ? '#4caf50' : '#f44336'
          }}
        />
        <strong style={{ color: result.success ? '#2e7d32' : '#c62828' }}>
          {result.success ? 'Tool Result' : 'Tool Error'}
        </strong>
      </div>

      {result.success ? (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Success:</div>
          <div style={{
            padding: '8px',
            backgroundColor: '#f1f8e9',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            overflowX: 'auto'
          }}>
            {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#d32f2f' }}>Error:</div>
          <div style={{
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            color: '#c62828',
            fontFamily: 'monospace',
            fontSize: '0.85em'
          }}>
            {result.error || 'Unknown error occurred'}
          </div>
        </div>
      )}
    </div>
  );
};

export { ToolCallDisplay };