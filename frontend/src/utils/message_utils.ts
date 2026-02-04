/**
 * Message Formatting Utilities
 *
 * Utility functions for formatting and processing chat messages, including
 * handling tool calls, timestamps, and message content transformation.
 */

import { ChatMessage, ToolCall, ToolCallResult, StreamChunk } from '../lib/types';
import { format, parseISO } from 'date-fns';

/**
 * Format a timestamp for display in the chat interface
 * @param timestamp - ISO string timestamp
 * @param formatString - Optional format string (defaults to 'HH:mm')
 * @returns Formatted time string
 */
export function formatTimestamp(timestamp: string, formatString: string = 'HH:mm'): string {
  try {
    const date = parseISO(timestamp);
    return format(date, formatString);
  } catch {
    // If parsing fails, return the original timestamp
    return timestamp;
  }
}

/**
 * Format message content for display, handling special cases like tool calls
 * @param content - Raw message content
 * @returns Formatted content string
 */
export function formatMessageContent(content: string): string {
  // Replace any special formatting characters if needed
  // For now, just return the content as-is
  return content;
}

/**
 * Format a tool call for display in the chat interface
 * @param toolCall - Tool call object
 * @returns Formatted tool call display string
 */
export function formatToolCall(toolCall: ToolCall): string {
  const args = Object.entries(toolCall.arguments)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(', ');

  return `[${toolCall.status}] ${toolCall.name}(${args})`;
}

/**
 * Format a tool call result for display in the chat interface
 * @param result - Tool call result object
 * @returns Formatted tool call result display string
 */
export function formatToolCallResult(result: ToolCallResult): string {
  if (result.success) {
    return `[SUCCESS] Result: ${JSON.stringify(result.data)}`;
  } else {
    return `[ERROR] ${result.error}`;
  }
}

/**
 * Determine the display class for a message based on its role
 * @param role - Message role ('user' or 'assistant')
 * @returns CSS class string
 */
export function getMessageDisplayClass(role: 'user' | 'assistant'): string {
  return role === 'user' ? 'user-message' : 'assistant-message';
}

/**
 * Format a message for display in the chat UI
 * @param message - ChatMessage object
 * @returns Formatted message object with additional display properties
 */
export function formatChatMessage(message: ChatMessage): {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formattedTimestamp: string;
  displayClass: string;
  status: string;
  hasToolCalls: boolean;
  hasToolCallResults: boolean;
  toolCalls?: ToolCall[];
  toolCallResults?: ToolCallResult[];
} {
  return {
    id: message.id,
    role: message.role,
    content: formatMessageContent(message.content),
    formattedTimestamp: formatTimestamp(message.createdAt),
    displayClass: getMessageDisplayClass(message.role),
    status: message.status,
    hasToolCalls: !!(message.toolCalls && message.toolCalls.length > 0),
    hasToolCallResults: !!(message.toolCallResults && message.toolCallResults.length > 0),
    ...(message.toolCalls && message.toolCalls.length > 0 ? { toolCalls: message.toolCalls } : {}),
    ...(message.toolCallResults && message.toolCallResults.length > 0 ? { toolCallResults: message.toolCallResults } : {})
  };
}

/**
 * Sanitize user input for security
 * @param input - User input string
 * @returns Sanitized input string
 */
export function sanitizeUserInput(input: string): string {
  // Remove any potentially harmful content
  // For now, just trim whitespace and remove basic script tags
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Transform stream chunk into a display-ready message
 * @param chunk - Stream chunk from SSE
 * @param messageId - ID to assign to the message
 * @returns Partial ChatMessage object
 */
export function transformStreamChunk(chunk: StreamChunk, messageId: string): Partial<ChatMessage> {
  switch (chunk.type) {
    case 'message':
      return {
        id: messageId,
        content: typeof chunk.data === 'string' ? chunk.data : JSON.stringify(chunk.data),
        status: 'streaming',
        createdAt: chunk.timestamp
      };
    case 'tool_call':
      return {
        id: messageId,
        toolCalls: [chunk.data as ToolCall],
        status: 'streaming',
        createdAt: chunk.timestamp
      };
    case 'tool_result':
      return {
        id: messageId,
        toolCallResults: [chunk.data as ToolCallResult],
        status: 'streaming',
        createdAt: chunk.timestamp
      };
    case 'error':
      return {
        id: messageId,
        content: `Error: ${chunk.data}`,
        status: 'error',
        createdAt: chunk.timestamp
      };
    default:
      return {
        id: messageId,
        content: JSON.stringify(chunk.data),
        status: 'completed',
        createdAt: chunk.timestamp
      };
  }
}

/**
 * Generate a unique message ID
 * @returns UUID-like string
 */
export function generateMessageId(): string {
  return 'msg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Check if a message contains tool calls
 * @param message - ChatMessage object
 * @returns Boolean indicating if message has tool calls
 */
export function hasToolCalls(message: ChatMessage): boolean {
  return !!(message.toolCalls && message.toolCalls.length > 0);
}

/**
 * Check if a message contains tool call results
 * @param message - ChatMessage object
 * @returns Boolean indicating if message has tool call results
 */
export function hasToolCallResults(message: ChatMessage): boolean {
  return !!(message.toolCallResults && message.toolCallResults.length > 0);
}

/**
 * Merge partial message updates into a complete message
 * @param existingMessage - Existing message object
 * @param partialUpdate - Partial message update
 * @returns Merged message object
 */
export function mergeMessageUpdates(
  existingMessage: ChatMessage,
  partialUpdate: Partial<ChatMessage>
): ChatMessage {
  return {
    ...existingMessage,
    ...partialUpdate,
    // Preserve original properties if not in the update
    id: existingMessage.id,
    role: existingMessage.role,
    createdAt: existingMessage.createdAt,
    // Merge arrays if they exist in both
    toolCalls: partialUpdate.toolCalls
      ? [...(existingMessage.toolCalls || []), ...(partialUpdate.toolCalls || [])]
      : existingMessage.toolCalls,
    toolCallResults: partialUpdate.toolCallResults
      ? [...(existingMessage.toolCallResults || []), ...(partialUpdate.toolCallResults || [])]
      : existingMessage.toolCallResults
  };
}