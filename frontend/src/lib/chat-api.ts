/**
 * MCP API Client for Chat Operations
 *
 * This module provides functions for interacting with the MCP task tools
 * from the frontend specifically for chat operations.
 */

import { apiRequest } from './api';
import { ChatRequest, ChatResponse, Conversation, StreamChunk } from './types';
import { sseManager } from './sse-manager';

/**
 * Chat API Client for task management operations via MCP tools
 */
class ChatAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:8000';
  }

  /**
   * Send a chat message to the AI agent
   * @param userId - The ID of the authenticated user
   * @param message - The message to send to the AI agent
   * @param conversationId - Optional ID of existing conversation to continue
   * @returns Response from the AI agent
   */
  async sendMessage(userId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    try {
      const response = await apiRequest<ChatResponse>(`/api/chat/${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          content: message,
          conversation_id: conversationId
        }),
      });

      return response;
    } catch (error) {
      console.error('Error sending message to AI agent:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   * @param userId - The ID of the authenticated user
   * @param conversationId - The ID of the conversation to retrieve
   * @returns Conversation details with message history
   */
  async getConversationHistory(userId: string, conversationId: string): Promise<Conversation> {
    try {
      const response = await apiRequest<Conversation>(`/api/chat/${userId}/conversations/${conversationId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  /**
   * List user's conversations
   * @param userId - The ID of the authenticated user
   * @param limit - Maximum number of conversations to return (default: 10)
   * @param offset - Number of conversations to skip (default: 0)
   * @returns List of user's conversations
   */
  async listConversations(userId: string, limit: number = 10, offset: number = 0): Promise<{
    conversations: Conversation[];
    total_count: number;
    limit: number;
    offset: number;
  }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await apiRequest<{
        conversations: Conversation[];
        total_count: number;
        limit: number;
        offset: number;
      }>(`/api/chat/${userId}/conversations?${params}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  }

  /**
   * Start a new conversation
   * @param userId - The ID of the authenticated user
   * @returns New conversation details
   */
  async startNewConversation(userId: string): Promise<Conversation> {
    try {
      // For now, we'll create a conversation by sending the first message
      // In a real implementation, there might be a dedicated endpoint for creating conversations
      const response = await apiRequest<Conversation>(`/api/chat/${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          content: "Starting new conversation",
          conversation_id: undefined // No conversation ID to start a new one
        }),
      });

      return response;
    } catch (error) {
      console.error('Error starting new conversation:', error);
      throw error;
    }
  }

  /**
   * Stream chat responses using Server Sent Events
   * @param userId - The ID of the authenticated user
   * @param message - The message to send to the AI agent
   * @param onMessage - Callback function to handle incoming messages
   * @param onError - Callback function to handle errors
   * @param onCompletion - Callback function when streaming completes
   * @param conversationId - Optional ID of existing conversation to continue
   * @param timeoutMs - Timeout in milliseconds (defaults to 30 seconds)
   */
  async streamChatResponse(
    userId: string,
    message: string,
    onMessage: (chunk: StreamChunk) => void,
    onError: (error: any) => void,
    onCompletion: () => void,
    conversationId?: string,
    timeoutMs: number = 30000
  ): Promise<void> {
    try {
      // Create a unique ID for this connection
      const connectionId = `chat_stream_${userId}_${Date.now()}`;

      // Create a new EventSource for streaming with optional conversation ID
      const streamUrl = conversationId
        ? `${this.baseUrl}/api/chat/${userId}/stream?conversation_id=${encodeURIComponent(conversationId)}`
        : `${this.baseUrl}/api/chat/${userId}/stream`;

      // Send the initial message with conversation context
      await this.sendMessage(userId, message, conversationId);

      // Create connection using SSE manager
      const eventSource = sseManager.createConnection(connectionId, streamUrl, {
        onMessage: (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (parseError) {
            console.error('Error parsing SSE message:', parseError);
            onError(parseError);
          }
        },
        onError: (error) => {
          console.error('SSE connection error:', error);
          onError(error);
          sseManager.closeConnection(connectionId);
        },
        onClose: () => {
          console.log(`SSE connection closed: ${connectionId}`);
          onCompletion();
        },
        onOpen: () => {
          console.log(`SSE connection opened: ${connectionId}`);
        }
      });

      // Close the connection after the specified timeout
      const timeoutId = setTimeout(() => {
        console.warn(`SSE connection timed out after ${timeoutMs}ms`);
        sseManager.closeConnection(connectionId);
        onError(new Error(`Operation timed out after ${timeoutMs}ms`));
        onCompletion();
      }, timeoutMs);

      // Clear timeout when the connection closes normally
      eventSource.addEventListener('close', () => {
        clearTimeout(timeoutId);
        onCompletion();
      });

    } catch (error) {
      console.error('Error setting up chat streaming:', error);
      onError(error);
    }
  }
}

// Create and export a singleton instance
export const chatAPI = new ChatAPIClient();

export default chatAPI;