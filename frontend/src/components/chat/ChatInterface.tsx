/**
 * Chat Interface Component
 *
 * Main chat interface component that provides a real-time chat experience
 * with streaming responses, conversation history, and tool call visualization.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSSEStream } from '../../hooks/useSSEStream';
import { ChatMessage, StreamChunk, Conversation } from '../../lib/types';
import { formatChatMessage, generateMessageId, sanitizeUserInput } from '../../utils/message_utils';
import { formatErrorForUI, ChatError, logChatError } from '../../exceptions/chat_errors';
import { chatAPI } from '../../lib/chat-api';
import { conversationService } from '../../services/conversation_service';
import { MessageRenderer } from './MessageRenderer';
import { ToolCallDisplay } from './ToolCallDisplay';
import { isChatAuthenticated, getChatAuthContext } from '../../middleware/chatAuthMiddleware';

interface ChatInterfaceProps {
  initialConversation?: Conversation;
  userId?: string;
  onConversationChange?: (conversation: Conversation) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialConversation,
  userId: propUserId,
  onConversationChange
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(initialConversation || null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showConversationSelector, setShowConversationSelector] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    title: string;
    lastActive: string;
    messageCount: number;
  }>>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [historyOffset, setHistoryOffset] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // We now use chatAPI.streamChatResponse directly in handleSendMessage
  // So we don't need the useSSEStream hook anymore for this component
  // Keeping it commented in case we need it for other purposes later
  // const { connect, disconnect, isConnected, data, error: sseError } = useSSEStream({
  //   onMessage: (chunk: StreamChunk) => {
  //     handleStreamMessage(chunk);
  //   },
  //   onError: (error: Event) => {
  //     console.error('SSE Error:', error);
  //     setError('Connection to chat service lost. Please try again.');
  //   },
  //   onOpen: () => {
  //     console.log('SSE connection opened');
  //     setIsStreaming(true);
  //   },
  //   onClose: () => {
  //     console.log('SSE connection closed');
  //     setIsStreaming(false);
  //   }
  // });

  // Get user ID from props or auth context
  const getUserId = (): string => {
    if (propUserId) return propUserId;

    const authContext = getChatAuthContext();
    if (authContext.userId) return authContext.userId;

    throw new Error('User ID is required for chat operations');
  };

  // Load conversations for selector
  const loadConversations = async () => {
    try {
      const userId = getUserId();
      const convList = await conversationService.getUserConversationSummaries(userId, 20);
      setConversations(convList);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Toggle conversation selector visibility
  const toggleConversationSelector = () => {
    setShowConversationSelector(!showConversationSelector);
    if (!showConversationSelector) {
      loadConversations();
    }
  };

  // Switch to a different conversation
  const switchToConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = getUserId();
      const conversation = await chatAPI.getConversationHistory(userId, conversationId);

      setCurrentConversation(conversation);
      setShowConversationSelector(false);
      setMessages([]); // Clear current messages to load new conversation
      setHasMoreHistory(true);
      setHistoryOffset(0);

      if (onConversationChange) {
        onConversationChange(conversation);
      }

      // Load initial messages for the conversation
      await loadMoreHistory(conversationId, userId);
    } catch (err) {
      const chatError = new ChatError(
        'Failed to switch conversation',
        'CONVERSATION_LOAD_ERROR',
        err
      );
      logChatError(chatError);
      setError(chatError.getUserFriendlyMessage());
    } finally {
      setIsLoading(false);
    }
  };

  // Load more conversation history (pagination)
  const loadMoreHistory = async (conversationId?: string, userId?: string) => {
    if (!hasMoreHistory) return;

    try {
      const currentUserId = userId || getUserId();
      const convId = conversationId || currentConversation?.id;

      if (!convId) {
        throw new Error('No conversation ID available');
      }

      // In a real implementation, this would call the paginated API
      // For now, we'll simulate by just showing a message
      const newMessages: ChatMessage[] = [{
        id: generateMessageId(),
        role: 'assistant',
        content: 'Historical messages would load here with pagination.',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }];

      setMessages(prev => [...newMessages, ...prev]);

      // For demo purposes, set hasMoreHistory to false after first load
      setHasMoreHistory(false);
    } catch (err) {
      console.error('Error loading more history:', err);
      // Don't treat this as a critical error, just stop loading more
    }
  };

  // Handle scroll to load more history when reaching top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop === 0 && hasMoreHistory && currentConversation) {
      loadMoreHistory(currentConversation.id);
    }
  };

  // Handle stream messages
  const handleStreamMessage = (chunk: StreamChunk) => {
    setMessages(prev => {
      // Find if there's an existing assistant message being streamed
      const lastAssistantMsgIndex = prev.findLastIndex(msg => msg.role === 'assistant');

      if (lastAssistantMsgIndex !== -1 && prev[lastAssistantMsgIndex].status === 'streaming') {
        // Update the existing message
        const updatedMessages = [...prev];
        const existingMsg = updatedMessages[lastAssistantMsgIndex];

        let updatedContent = existingMsg.content || '';
        let updatedToolCalls = existingMsg.toolCalls ? [...existingMsg.toolCalls] : [];
        let updatedToolResults = existingMsg.toolCallResults ? [...existingMsg.toolCallResults] : [];

        switch (chunk.type) {
          case 'message':
            updatedContent += typeof chunk.data === 'string' ? chunk.data : JSON.stringify(chunk.data);
            break;
          case 'tool_call':
            updatedToolCalls.push(chunk.data);
            break;
          case 'tool_result':
            updatedToolResults.push(chunk.data);
            break;
          case 'error':
            updatedContent += `\nError: ${chunk.data}`;
            break;
        }

        updatedMessages[lastAssistantMsgIndex] = {
          ...existingMsg,
          content: updatedContent,
          toolCalls: updatedToolCalls.length > 0 ? updatedToolCalls : undefined,
          toolCallResults: updatedToolResults.length > 0 ? updatedToolResults : undefined
        };

        return updatedMessages;
      } else {
        // Create a new message
        let newMessage: Partial<ChatMessage> = {
          id: generateMessageId(),
          role: 'assistant',
          status: 'streaming',
          createdAt: chunk.timestamp,
        };

        switch (chunk.type) {
          case 'message':
            newMessage.content = typeof chunk.data === 'string' ? chunk.data : JSON.stringify(chunk.data);
            break;
          case 'tool_call':
            newMessage.toolCalls = [chunk.data];
            break;
          case 'tool_result':
            newMessage.toolCallResults = [chunk.data];
            break;
          case 'error':
            newMessage.content = `Error: ${chunk.data}`;
            newMessage.status = 'error';
            break;
        }

        return [...prev, newMessage as ChatMessage];
      }
    });
  };

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize conversation
  useEffect(() => {
    if (initialConversation) {
      setCurrentConversation(initialConversation);
      // Load conversation history if needed
      loadConversationHistory(initialConversation.id);
    }
  }, [initialConversation]);

  // With the updated streaming approach, we handle data and errors directly in handleSendMessage
  // These effects are no longer needed

  // Load conversation history
  const loadConversationHistory = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      const conversation = await chatAPI.getConversationHistory(userId, conversationId);
      setCurrentConversation(conversation);

      // Update messages with conversation history
      // For simplicity, we'll assume messages come as part of the conversation
      // In a real implementation, this would be handled differently
    } catch (err) {
      const chatError = new ChatError(
        'Failed to load conversation history',
        'CONVERSATION_LOAD_ERROR',
        err
      );
      logChatError(chatError);
      setError(chatError.getUserFriendlyMessage());
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const sanitizedInput = sanitizeUserInput(inputValue);
      const userId = getUserId();

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: sanitizedInput,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      // Use the streaming API to send the message and get responses
      await chatAPI.streamChatResponse(
        userId,
        sanitizedInput,
        (chunk: StreamChunk) => {
          handleStreamMessage(chunk);
        },
        (error: any) => {
          console.error('Streaming error:', error);
          setError('Connection to chat service lost. Please try again.');
        },
        () => {
          console.log('Streaming completed');
          setIsLoading(false);
        },
        currentConversation?.id, // Pass the conversation ID if available
        45000 // 45 second timeout for tool invocations
      );

    } catch (err) {
      const chatError = new ChatError(
        'Failed to send message',
        'MESSAGE_PROCESSING_ERROR',
        err
      );
      logChatError(chatError);
      setError(chatError.getUserFriendlyMessage());
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = getUserId();
      const newConversation = await chatAPI.startNewConversation(userId);
      setCurrentConversation(newConversation);

      if (onConversationChange) {
        onConversationChange(newConversation);
      }

      setMessages([]);
      // Reload conversations to include the new one
      loadConversations();
    } catch (err) {
      const chatError = new ChatError(
        'Failed to start new conversation',
        'CONVERSATION_LOAD_ERROR',
        err
      );
      logChatError(chatError);
      setError(chatError.getUserFriendlyMessage());
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      // Perform any necessary cleanup when component unmounts
      // Currently, the EventSource connections are managed by the chatAPI
      // which handles its own cleanup
    };
  }, []);

  return (
    <div className="chat-interface flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden m-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">AI Chat Assistant</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleConversationSelector}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors duration-200 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              {showConversationSelector ? 'Hide' : 'Chats'}
            </button>
            <button
              onClick={handleNewConversation}
              disabled={isLoading}
              className={`bg-white text-blue-600 px-4 py-1 rounded-lg font-medium transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
              }`}
            >
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Selector Panel */}
      {showConversationSelector && (
        <div className="bg-gray-50 border-b p-3 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Previous Conversations
          </h3>
          {conversations.length > 0 ? (
            <ul className="space-y-2">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => switchToConversation(conv.id)}
                    disabled={isLoading}
                    className={`w-full text-left p-2 rounded-lg transition-colors duration-200 flex justify-between items-center ${
                      currentConversation?.id === conv.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`truncate ${currentConversation?.id === conv.id ? 'font-medium' : ''}`}>
                      {conv.title || 'Untitled Conversation'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {new Date(conv.lastActive).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm py-2">No previous conversations</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-3 mt-2 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {hasMoreHistory && messages.length > 0 && (
          <div className="text-center text-gray-500 text-sm italic py-2">
            Loading more messages...
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
            <p className="text-gray-600 max-w-md">
              Type your message below to start chatting with the AI assistant. You can ask me to help manage your tasks!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="animate-fadeIn">
                <MessageRenderer message={formatChatMessage(message)} />
                {message.toolCalls && message.toolCalls.map((toolCall) => (
                  <ToolCallDisplay key={toolCall.id} toolCall={toolCall} />
                ))}
                {message.toolCallResults && message.toolCallResults.map((result, idx) => (
                  <div key={`${message.id}-result-${idx}`} className="ml-6 mt-2">
                    <ToolCallDisplay.Result result={result} />
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px] max-h-[150px]"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`px-6 rounded-lg font-medium transition-colors duration-200 flex items-center ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="bg-blue-50 border-t border-blue-200 p-2 text-center">
          <div className="inline-flex items-center text-blue-700">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            AI is thinking...
          </div>
        </div>
      )}
    </div>
  );
};