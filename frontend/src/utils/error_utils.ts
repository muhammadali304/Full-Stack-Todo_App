/**
 * Comprehensive Error Handling Utilities
 *
 * Provides utilities for handling errors throughout the chat interface
 * with user-friendly messages and technical details for debugging.
 */

import { ChatError, ChatErrorType } from '../exceptions/chat_errors';

/**
 * Error context for enhanced error reporting
 */
export interface ErrorContext {
  userId?: string;
  conversationId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced error handler with user-friendly messages
 */
export class ErrorHandler {
  /**
   * Handle an error and return a user-friendly message
   * @param error - The error to handle
   * @param context - Additional context for the error
   * @returns Formatted error object with user-friendly message
   */
  static handle(error: any, context?: ErrorContext): ChatError {
    // If it's already a ChatError, return it as is
    if (error instanceof ChatError) {
      return error;
    }

    // Determine error type based on the error characteristics
    let errorType: ChatErrorType = ChatErrorType.MESSAGE_PROCESSING_ERROR;
    let message = 'An unexpected error occurred';

    if (error.message) {
      const lowerMsg = error.message.toLowerCase();

      if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) {
        errorType = ChatErrorType.NETWORK_ERROR;
        message = 'Network connection issue. Please check your internet connection.';
      } else if (lowerMsg.includes('401') || lowerMsg.includes('auth') || lowerMsg.includes('unauthorized')) {
        errorType = ChatErrorType.AUTHENTICATION_ERROR;
        message = 'Authentication failed. Please log in again.';
      } else if (lowerMsg.includes('timeout') || error.name === 'AbortError') {
        errorType = ChatErrorType.TIMEOUT_ERROR;
        message = 'Request timed out. Please try again.';
      } else if (lowerMsg.includes('parse') || lowerMsg.includes('json')) {
        errorType = ChatErrorType.PARSING_ERROR;
        message = 'Received unexpected data format. Please refresh and try again.';
      } else if (lowerMsg.includes('server') || lowerMsg.includes('500')) {
        errorType = ChatErrorType.SERVER_ERROR;
        message = 'Server error occurred. Please try again later.';
      }
    }

    return new ChatError(
      message,
      errorType,
      error,
      context?.userId,
      context?.conversationId
    );
  }

  /**
   * Format error for display in UI
   * @param error - The error to format
   * @param includeTechnicalDetails - Whether to include technical details
   * @returns Formatted error message for UI
   */
  static formatForUI(error: ChatError, includeTechnicalDetails: boolean = false): {
    userMessage: string;
    technicalDetails?: string;
  } {
    return {
      userMessage: error.getUserFriendlyMessage(),
      technicalDetails: includeTechnicalDetails ? error.getLogDetails() : undefined
    };
  }

  /**
   * Log error with context
   * @param error - The error to log
   * @param context - Additional context for logging
   */
  static logError(error: ChatError, context?: ErrorContext): void {
    console.group('Chat Error');
    console.error('Message:', error.getUserFriendlyMessage());
    console.error('Type:', error.type);
    console.error('Technical Details:', error.getLogDetails());
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }

  /**
   * Create error with specific type
   * @param type - The error type
   * @param message - The error message
   * @param technicalDetails - Technical details about the error
   * @param context - Error context
   * @returns New ChatError instance
   */
  static createError(
    type: ChatErrorType,
    message: string,
    technicalDetails?: any,
    context?: ErrorContext
  ): ChatError {
    return new ChatError(
      message,
      type,
      technicalDetails,
      context?.userId,
      context?.conversationId
    );
  }

  /**
   * Handle API errors specifically
   * @param error - The API error
   * @param context - Error context
   * @returns Formatted ChatError
   */
  static handleApiError(error: any, context?: ErrorContext): ChatError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      let message = 'API request failed';
      let type = ChatErrorType.SERVER_ERROR;

      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          type = ChatErrorType.MESSAGE_PROCESSING_ERROR;
          break;
        case 401:
          message = 'Authentication required. Please log in.';
          type = ChatErrorType.AUTHENTICATION_ERROR;
          break;
        case 403:
          message = 'Access forbidden. You do not have permission to perform this action.';
          type = ChatErrorType.AUTHENTICATION_ERROR;
          break;
        case 404:
          message = 'Resource not found. Please try again.';
          type = ChatErrorType.MESSAGE_PROCESSING_ERROR;
          break;
        case 429:
          message = 'Too many requests. Please slow down and try again.';
          type = ChatErrorType.SERVER_ERROR;
          break;
        case 500:
          message = 'Server error occurred. Please try again later.';
          type = ChatErrorType.SERVER_ERROR;
          break;
        default:
          message = `Server error (${status}). Please try again.`;
      }

      return new ChatError(
        message,
        type,
        error.response.data || error,
        context?.userId,
        context?.conversationId
      );
    }

    return this.handle(error, context);
  }

  /**
   * Handle network errors specifically
   * @param error - The network error
   * @param context - Error context
   * @returns Formatted ChatError
   */
  static handleNetworkError(error: any, context?: ErrorContext): ChatError {
    let message = 'Network connection failed';
    let technicalDetails = error;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      message = 'Cannot connect to the server. Please check your network connection.';
    } else if (error.name === 'AbortError') {
      message = 'Request timed out. Please check your connection and try again.';
    }

    return new ChatError(
      message,
      ChatErrorType.NETWORK_ERROR,
      technicalDetails,
      context?.userId,
      context?.conversationId
    );
  }

  /**
   * Handle streaming errors specifically
   * @param error - The streaming error
   * @param context - Error context
   * @returns Formatted ChatError
   */
  static handleStreamingError(error: any, context?: ErrorContext): ChatError {
    let message = 'Streaming connection failed';
    let type = ChatErrorType.STREAM_CONNECTION_ERROR;

    if (error.type === 'error' || error.type === 'close') {
      message = 'Connection to chat service lost. Please try again.';
    } else if (error.message?.includes('timeout')) {
      message = 'Streaming connection timed out.';
      type = ChatErrorType.TIMEOUT_ERROR;
    }

    return new ChatError(
      message,
      type,
      error,
      context?.userId,
      context?.conversationId
    );
  }
}

/**
 * Error boundary component for chat components
 */
export class ChatErrorBoundary {
  private static fallbackRender(error: ChatError): React.ReactElement {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '1px solid #d32828',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Something went wrong</h3>
        <p>{error.getUserFriendlyMessage()}</p>
        <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
          {error.getLogDetails()}
        </details>
      </div>
    ) as any; // Type assertion since we're returning JSX from a utility class
  }

  /**
   * Wrap a function with error handling
   * @param fn - The function to wrap
   * @param fallback - Fallback function to call on error
   * @param context - Error context
   * @returns Promise with error handling
   */
  static async wrapWithErrorHandling<T>(
    fn: () => Promise<T>,
    fallback?: (error: ChatError) => T | Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const chatError = ErrorHandler.handle(error, context);
      ErrorHandler.logError(chatError, context);

      if (fallback) {
        return fallback(chatError);
      }

      throw chatError;
    }
  }
}

// Export a convenience function for handling errors
export const handleError = (error: any, context?: ErrorContext): ChatError => {
  return ErrorHandler.handle(error, context);
};

// Export a convenience function for logging errors
export const logError = (error: ChatError, context?: ErrorContext): void => {
  ErrorHandler.logError(error, context);
};