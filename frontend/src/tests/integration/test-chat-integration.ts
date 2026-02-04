/**
 * Integration Tests for Full AI Chat Workflow
 *
 * Tests the complete AI chat workflow including:
 * - Message sending and receiving
 * - Streaming responses
 * - Tool call execution
 * - Conversation management
 * - Authentication flow
 */

import { chatAPI } from '../../lib/chat-api';

describe('AI Chat Workflow Integration Tests', () => {
  // Mock data
  const mockUserId = 'test-user-123';
  const mockConversationId = 'test-conversation-456';

  // Mock API responses
  const mockChatResponse = {
    response: 'Sure, I can help you with that.',
    conversationId: mockConversationId,
    toolCalls: [],
    toolCallResults: []
  };

  const mockConversation = {
    id: mockConversationId,
    userId: mockUserId,
    title: 'Test Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    isActive: true,
    messageCount: 1
  };

  beforeEach(() => {
    // Set up mock localStorage for authentication
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'auth_token') return 'mock-jwt-token';
      if (key === 'user') return JSON.stringify({ id: mockUserId, email: 'test@example.com' });
      return null;
    });

    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockChatResponse),
      } as Response)
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully send a message and receive a response', async () => {
    // Arrange
    const message = 'Hello, can you help me create a task?';

    // Act
    const response = await chatAPI.sendMessage(mockUserId, message, mockConversationId);

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/${mockUserId}/chat`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        })
      })
    );

    expect(response).toEqual(mockChatResponse);
  });

  test('should create a new conversation when starting chat', async () => {
    // Act
    const conversation = await chatAPI.startNewConversation(mockUserId);

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/${mockUserId}/chat`),
      expect.objectContaining({
        method: 'POST',
      })
    );

    expect(conversation.id).toBeDefined();
    expect(conversation.userId).toBe(mockUserId);
  });

  test('should list user conversations', async () => {
    // Arrange
    const mockConversationsResponse = {
      conversations: [mockConversation],
      total_count: 1,
      limit: 10,
      offset: 0
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockConversationsResponse),
    } as Response);

    // Act
    const result = await chatAPI.listConversations(mockUserId, 10, 0);

    // Assert
    expect(result).toEqual(mockConversationsResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/${mockUserId}/conversations?limit=10&offset=0`),
      expect.any(Object)
    );
  });

  test('should retrieve specific conversation history', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockConversation),
    } as Response);

    // Act
    const conversation = await chatAPI.getConversationHistory(mockUserId, mockConversationId);

    // Assert
    expect(conversation.id).toBe(mockConversationId);
    expect(conversation.userId).toBe(mockUserId);
  });

  test('should handle tool calls in chat responses', async () => {
    // Arrange
    const mockResponseWithToolCall = {
      ...mockChatResponse,
      toolCalls: [{
        id: 'tool-call-1',
        name: 'add_task',
        arguments: { title: 'Buy groceries', description: 'Milk, bread, eggs' },
        status: 'pending' as const,
        displayType: 'card' as const
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponseWithToolCall),
    } as Response);

    // Act
    const response = await chatAPI.sendMessage(mockUserId, 'Add a task to buy groceries', mockConversationId);

    // Assert
    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls![0].name).toBe('add_task');
  });

  test('should maintain conversation context across messages', async () => {
    // Arrange
    const firstMessage = 'I want to create a task called "Test Task"';
    const secondMessage = 'Was that task created successfully?';

    // Act
    const firstResponse = await chatAPI.sendMessage(mockUserId, firstMessage, mockConversationId);
    const secondResponse = await chatAPI.sendMessage(mockUserId, secondMessage, mockConversationId);

    // Assert
    expect(firstResponse.conversationId).toBe(mockConversationId);
    expect(secondResponse.conversationId).toBe(mockConversationId);

    // Verify the same conversation ID was used in both requests
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(mockConversationId);
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(mockConversationId);
  });

  test('should authenticate requests properly', async () => {
    // Act
    await chatAPI.sendMessage(mockUserId, 'Test message', mockConversationId);

    // Assert
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const options = fetchCall[1];

    expect(options.headers.Authorization).toBe('Bearer mock-jwt-token');
    expect(fetchCall[0]).toContain(mockUserId); // URL should contain user ID
  });

  test('should handle streaming responses correctly', (done) => {
    // Arrange
    const mockStreamChunks = [
      { type: 'message', data: 'Processing', timestamp: new Date().toISOString(), correlationId: 'corr-1' },
      { type: 'tool_call', data: { id: 'tc-1', name: 'add_task', arguments: {}, status: 'pending', displayType: 'card' }, timestamp: new Date().toISOString(), correlationId: 'corr-2' },
      { type: 'message', data: 'Task created', timestamp: new Date().toISOString(), correlationId: 'corr-3' },
    ];

    // Create a mock EventSource
    const mockEventSource = {
      onmessage: jest.fn(),
      onerror: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: 0,
    } as unknown as EventSource;

    // Mock the EventSource constructor
    const originalEventSource = global.EventSource;
    global.EventSource = jest.fn(() => mockEventSource) as any;

    // Mock the onmessage handler to trigger with our test data
    const onMessageCallback = jest.fn();
    const onErrorCallback = jest.fn();
    const onCompletionCallback = jest.fn();

    // Act
    chatAPI.streamChatResponse(
      mockUserId,
      'Test streaming message',
      onMessageCallback,
      onErrorCallback,
      onCompletionCallback,
      mockConversationId
    );

    // Simulate receiving messages
    mockStreamChunks.forEach((chunk, index) => {
      setTimeout(() => {
        if (mockEventSource.onmessage) {
          mockEventSource.onmessage({ data: JSON.stringify(chunk) } as MessageEvent);
        }

        if (index === mockStreamChunks.length - 1) {
          // Complete the test
          expect(onMessageCallback).toHaveBeenCalledTimes(mockStreamChunks.length);

          // Restore original EventSource
          global.EventSource = originalEventSource;
          done();
        }
      }, 10 * index);
    });
  });

  test('should handle authentication errors gracefully', async () => {
    // Arrange
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    } as Response);

    // Act & Assert
    await expect(
      chatAPI.sendMessage(mockUserId, 'Test message', mockConversationId)
    ).rejects.toThrow('Authentication required');
  });

  test('should handle network errors gracefully', async () => {
    // Arrange
    (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));

    // Act & Assert
    await expect(
      chatAPI.sendMessage(mockUserId, 'Test message', mockConversationId)
    ).rejects.toThrow('Network error - please check your connection');
  });
});

export {};