/**
 * SSE Connection Manager
 *
 * Manages Server-Sent Event connections with proper cleanup and lifecycle management
 */

export interface SSEConnection {
  eventSource: EventSource;
  url: string;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
}

class SSEManager {
  private connections: Map<string, SSEConnection> = new Map();
  private static instance: SSEManager;

  private constructor() {}

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  /**
   * Create a new SSE connection
   * @param id - Unique identifier for the connection
   * @param url - The SSE endpoint URL
   * @param callbacks - Optional callback functions
   * @returns The created EventSource
   */
  createConnection(
    id: string,
    url: string,
    callbacks?: {
      onClose?: () => void;
      onError?: (error: Event) => void;
      onMessage?: (event: MessageEvent) => void;
      onOpen?: () => void;
    }
  ): EventSource {
    // Close any existing connection with the same ID
    if (this.connections.has(id)) {
      this.closeConnection(id);
    }

    const eventSource = new EventSource(url);

    // Set up event listeners
    if (callbacks?.onOpen) {
      eventSource.onopen = callbacks.onOpen;
    } else {
      eventSource.onopen = () => {
        console.log(`SSE connection opened: ${id}`);
      };
    }

    if (callbacks?.onMessage) {
      eventSource.onmessage = callbacks.onMessage;
    } else {
      eventSource.onmessage = (event) => {
        console.log(`SSE message received on ${id}:`, event.data);
      };
    }

    if (callbacks?.onError) {
      eventSource.onerror = callbacks.onError;
    } else {
      eventSource.onerror = (error) => {
        console.error(`SSE error on ${id}:`, error);
      };
    }

    // Store the connection
    const connection: SSEConnection = {
      eventSource,
      url,
      onClose: callbacks?.onClose,
      onError: callbacks?.onError,
      onMessage: callbacks?.onMessage,
      onOpen: callbacks?.onOpen
    };

    this.connections.set(id, connection);

    return eventSource;
  }

  /**
   * Close a specific SSE connection
   * @param id - The connection ID to close
   */
  closeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.eventSource.close();

      // Call the close callback if provided
      if (connection.onClose) {
        connection.onClose();
      }

      this.connections.delete(id);
    }
  }

  /**
   * Close all SSE connections
   */
  closeAllConnections(): void {
    this.connections.forEach((connection, id) => {
      connection.eventSource.close();
      if (connection.onClose) {
        connection.onClose();
      }
    });
    this.connections.clear();
  }

  /**
   * Get a specific connection
   * @param id - The connection ID
   * @returns The SSE connection or undefined
   */
  getConnection(id: string): SSEConnection | undefined {
    return this.connections.get(id);
  }

  /**
   * Check if a connection exists
   * @param id - The connection ID
   * @returns True if connection exists, false otherwise
   */
  hasConnection(id: string): boolean {
    return this.connections.has(id);
  }

  /**
   * Get all connection IDs
   * @returns Array of connection IDs
   */
  getAllConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Get the count of active connections
   * @returns Number of active connections
   */
  getConnectionCount(): number {
    return this.connections.size;
  }
}

// Create a singleton instance
export const sseManager = SSEManager.getInstance();

// Export for convenience
export default sseManager;