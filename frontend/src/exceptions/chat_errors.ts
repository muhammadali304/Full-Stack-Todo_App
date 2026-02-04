/**
 * Chat Error Handling
 *
 * Comprehensive error handling for chat operations with user-friendly messages
 * and technical details for debugging.
 */

import { StreamChunk } from '../lib/types';

// Define chat-specific error types
export enum ChatErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  STREAM_CONNECTION_ERROR = 'STREAM_CONNECTION_ERROR',
  MESSAGE_PROCESSING_ERROR = 'MESSAGE_PROCESSING_ERROR',
  TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',
  CONVERSATION_LOAD_ERROR = 'CONVERSATION_LOAD_ERROR',
  TOKEN_EXPIRED_ERROR = 'TOKEN_EXPIRED_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSING_ERROR = 'PARSING_ERROR'
}

// Base error class for chat operations
export class ChatError extends Error {
  public readonly type: ChatErrorType;
  public readonly technicalDetails?: any;
  public readonly timestamp: Date;
  public readonly userId?: string;
  public readonly conversationId?: string;

  constructor(
    message: string,
    type: ChatErrorType,
    technicalDetails?: any,
    userId?: string,
    conversationId?: string
  ) {
    super(message);
    this.name = 'ChatError';
    this.type = type;
    this.technicalDetails = technicalDetails;
    this.timestamp = new Date();
    this.userId = userId;
    this.conversationId = conversationId;

    // Set prototype for proper instanceof checks
    Object.setPrototypeOf(this, ChatError.prototype);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case ChatErrorType.NETWORK_ERROR:
        return 'Network connection issue. Please check your internet connection and try again.';

      case ChatErrorType.AUTHENTICATION_ERROR:
        return 'Authentication failed. Please log in again.';

      case ChatErrorType.STREAM_CONNECTION_ERROR:
        return 'Unable to connect to the chat service. Please try refreshing the page.';

      case ChatErrorType.MESSAGE_PROCESSING_ERROR:
        return 'There was an issue processing your message. Please try again.';

      case ChatErrorType.TOOL_EXECUTION_ERROR:
        return 'The AI agent encountered an error while performing the requested operation.';

      case ChatErrorType.CONVERSATION_LOAD_ERROR:
        return 'Failed to load conversation history. Please try again.';

      case ChatErrorType.TOKEN_EXPIRED_ERROR:
        return 'Your session has expired. Please log in again.';

      case ChatErrorType.SERVER_ERROR:
        return 'The server encountered an error. Please try again later.';

      case ChatErrorType.TIMEOUT_ERROR:
        return 'Request timed out. Please check your connection and try again.';

      case ChatErrorType.PARSING_ERROR:
        return 'Received unexpected data format. Please refresh and try again.';

      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get error details for logging/debugging
   */
  getLogDetails(): string {
    return `ChatError [${this.type}]: ${this.message}
    Timestamp: ${this.timestamp.toISOString()}
    Technical Details: ${JSON.stringify(this.technicalDetails, null, 2)}
    User ID: ${this.userId || 'unknown'}
    Conversation ID: ${this.conversationId || 'unknown'}`;
  }
}

/**
 * Handle network errors specifically
 */
export function handleNetworkError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Network error occurred',
    ChatErrorType.NETWORK_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Authentication error occurred',
    ChatErrorType.AUTHENTICATION_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle stream connection errors
 */
export function handleStreamConnectionError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Stream connection error occurred',
    ChatErrorType.STREAM_CONNECTION_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle message processing errors
 */
export function handleMessageProcessingError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Message processing error occurred',
    ChatErrorType.MESSAGE_PROCESSING_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle tool execution errors
 */
export function handleToolExecutionError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Tool execution error occurred',
    ChatErrorType.TOOL_EXECUTION_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle conversation loading errors
 */
export function handleConversationLoadError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Conversation load error occurred',
    ChatErrorType.CONVERSATION_LOAD_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle timeout errors
 */
export function handleTimeoutError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Request timeout error occurred',
    ChatErrorType.TIMEOUT_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Handle parsing errors
 */
export function handleParsingError(error: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'Data parsing error occurred',
    ChatErrorType.PARSING_ERROR,
    error,
    userId,
    conversationId
  );
}

/**
 * Generic error handler that maps different error types
 */
export function handleChatError(
  error: any,
  type?: ChatErrorType,
  userId?: string,
  conversationId?: string
): ChatError {
  // If it's already a ChatError, return it as is
  if (error instanceof ChatError) {
    return error;
  }

  // Determine error type based on error characteristics
  let errorType = type || ChatErrorType.MESSAGE_PROCESSING_ERROR;

  if (error.message && error.message.toLowerCase().includes('network')) {
    errorType = ChatErrorType.NETWORK_ERROR;
  } else if (error.message && (error.message.includes('401') || error.message.toLowerCase().includes('auth'))) {
    errorType = ChatErrorType.AUTHENTICATION_ERROR;
  } else if (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout')) {
    errorType = ChatErrorType.TIMEOUT_ERROR;
  } else if (error.message && error.message.toLowerCase().includes('parse')) {
    errorType = ChatErrorType.PARSING_ERROR;
  }

  return new ChatError(
    error.message || 'Unknown error occurred',
    errorType,
    error,
    userId,
    conversationId
  );
}

/**
 * Format error for display in the chat UI
 */
export function formatErrorForUI(chatError: ChatError): {
  message: string;
  technicalDetails?: string;
  type: ChatErrorType;
  timestamp: string;
} {
  return {
    message: chatError.getUserFriendlyMessage(),
    technicalDetails: process.env.NODE_ENV === 'development'
      ? chatError.getLogDetails()
      : undefined,
    type: chatError.type,
    timestamp: chatError.timestamp.toISOString()
  };
}

/**
 * Error boundary handler for chat components
 */
export function handleComponentError(error: any, info: any, userId?: string, conversationId?: string): ChatError {
  return new ChatError(
    'A component error occurred in the chat interface',
    ChatErrorType.MESSAGE_PROCESSING_ERROR,
    { error, info },
    userId,
    conversationId
  );
}

/**
 * Validate stream chunk and handle parsing errors
 */
export function validateAndHandleStreamChunk(rawData: any): StreamChunk | ChatError {
  try {
    // If it's a string, parse it
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    // Validate required properties
    if (!data.type) {
      throw new Error('Missing type property in stream chunk');
    }

    if (!data.data) {
      throw new Error('Missing data property in stream chunk');
    }

    if (!data.timestamp) {
      throw new Error('Missing timestamp property in stream chunk');
    }

    if (!data.correlationId) {
      throw new Error('Missing correlationId property in stream chunk');
    }

    return data as StreamChunk;
  } catch (parseError) {
    return handleParsingError(parseError);
  }
}

/**
 * Log chat errors to console and potentially to an external service
 */
export function logChatError(chatError: ChatError): void {
  console.error('[Chat Error]', chatError.getLogDetails());

  // In a real implementation, you might also send this to an error tracking service
  // like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(chatError);
}