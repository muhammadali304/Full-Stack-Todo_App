/**
 * useSSEStream Hook
 *
 * Custom React hook for handling Server-Sent Events (SSE) streaming from the AI agent.
 * Provides connection management, error handling, and message parsing for real-time
 * chat responses.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { StreamChunk } from '../lib/types';

interface SSEStreamOptions {
  onMessage?: (chunk: StreamChunk) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
}

interface SSEStreamReturn {
  data: StreamChunk | null;
  error: Event | null;
  isConnected: boolean;
  connect: (url: string) => void;
  disconnect: () => void;
  send: (data: any) => void;
}

/**
 * Custom hook for managing Server-Sent Events (SSE) connections.
 *
 * This hook handles connecting to an SSE endpoint, receiving streaming data,
 * managing connection state, and providing error handling.
 */
export function useSSEStream(options: SSEStreamOptions = {}): SSEStreamReturn {
  const [data, setData] = useState<StreamChunk | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef<number>(0);
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  // Connect to SSE endpoint
  const connect = useCallback((url: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Create new EventSource connection
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      retryCountRef.current = 0;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (onOpen) onOpen();
      };

      eventSource.onmessage = (event) => {
        try {
          const parsedData: StreamChunk = JSON.parse(event.data);
          setData(parsedData);

          if (onMessage) {
            onMessage(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError);
          setError(new Event('parse-error'));
        }
      };

      eventSource.onerror = (event) => {
        setIsConnected(false);

        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          // Connection was closed intentionally
          if (onClose) onClose();
        } else {
          // Connection error - try to reconnect
          setError(event as Event);

          if (onError) {
            onError(event as Event);
          }

          // Attempt to reconnect if within retry limit
          if (retryCountRef.current < retryAttempts) {
            retryCountRef.current++;
            setTimeout(() => {
              connect(url);
            }, retryDelay);
          }
        }
      };
    } catch (connectionError) {
      console.error('Error creating SSE connection:', connectionError);
      setError(new Event('connection-error'));
      if (onError) onError(new Event('connection-error'));
    }
  }, [onMessage, onError, onOpen, onClose, retryAttempts, retryDelay]);

  // Disconnect from SSE endpoint
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      if (onClose) onClose();
    }
  }, [onClose]);

  // Send data through the SSE connection (this would typically be handled differently for SSE)
  const send = useCallback((data: any) => {
    console.warn('Sending data through SSE is not typical; consider using a different transport for outgoing messages');
    // In a real implementation, this might send data to initiate a new SSE stream
    // SSE is typically for server-to-client only
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    data,
    error,
    isConnected,
    connect,
    disconnect,
    send
  };
}

export default useSSEStream;