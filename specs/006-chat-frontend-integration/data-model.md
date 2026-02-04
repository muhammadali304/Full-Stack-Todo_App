# Data Model: ChatKit Frontend Integration

**Feature**: 006-chat-frontend-integration
**Date**: 2026-01-20

## Overview

This document defines the frontend data models for the ChatKit-based AI chat integration, focusing on the client-side representations of conversations, messages, and tool calls that will be rendered in the UI. These models complement the backend data models while providing appropriate structures for frontend rendering and state management.

## Frontend Entity Definitions

### ChatMessage Entity (Frontend)

**Purpose**: Represents a single message in the UI with properties for rendering, status tracking, and tool call visualization.

**Fields**:
- `id` (string/UUID): Unique identifier for the message (may come from backend or be client-generated initially)
- `role` (string): Role of the message sender - either "user" or "assistant"
- `content` (string): The text content of the message to be displayed to the user
- `createdAt` (Date): Timestamp when the message was created (for chronological display)
- `status` (string): Current status of the message - "sending", "streaming", "completed", or "error"
- `toolCalls` (array of ToolCall objects): Array of tool calls made during this message interaction (if any)
- `toolCallResults` (array of ToolResult objects): Array of results from the tool calls (if any)
- `isStreaming` (boolean): Flag indicating if the message content is still being streamed
- `streamingError` (string): Error message if streaming failed (if status is "error")

**Validation Rules**:
- `role` must be either "user" or "assistant"
- `content` must be provided and not empty (unless it's a tool call only message)
- `status` must be one of the allowed values
- `createdAt` must be a valid date/time

**Relationships**:
- Belongs to one Conversation (via conversation context in the UI)
- Each conversation can contain multiple ChatMessage objects

### ToolCall Object

**Purpose**: Represents a tool call made by the AI agent, displayed inline in the conversation for transparency.

**Fields**:
- `id` (string): Unique identifier for the tool call
- `name` (string): Name of the tool being called (e.g., "add_task", "list_tasks", "complete_task")
- `arguments` (object): Arguments passed to the tool call
- `status` (string): Status of the tool call - "pending", "executing", "completed", or "error"
- `result` (any): Result of the tool call execution (populated when completed)
- `displayType` (string): How to display this tool call in the UI - "inline", "card", "expanded"

**Validation Rules**:
- `name` must be one of the supported tool names
- `arguments` must be a valid object matching the tool's schema
- `status` must be one of the allowed values

### ToolResult Object

**Purpose**: Represents the result of a tool call, displayed inline in the conversation.

**Fields**:
- `toolCallId` (string): Reference to the corresponding tool call ID
- `success` (boolean): Whether the tool call succeeded
- `data` (any): Data returned by the tool call (if successful)
- `error` (string): Error message if the tool call failed (if unsuccessful)

**Validation Rules**:
- `toolCallId` must reference a valid tool call
- Either `success` must be true with `data`, or `success` must be false with `error`
- `success` must be a boolean value

### Conversation Entity (Frontend)

**Purpose**: Represents a user's chat session with the AI agent for UI state management.

**Fields**:
- `id` (string/UUID): Unique identifier for the conversation
- `userId` (string/UUID): ID of the user who owns this conversation
- `title` (string): Auto-generated title based on first message or topic
- `createdAt` (Date): Timestamp when the conversation was created
- `updatedAt` (Date): Timestamp when the conversation was last updated
- `expiresAt` (Date): Timestamp when the conversation should be archived/purged (30-day retention)
- `messages` (array of ChatMessage): Array of messages in this conversation
- `isActive` (boolean): Whether this conversation is currently active in the UI

**Validation Rules**:
- `userId` must match the authenticated user's ID
- `title` must be provided and not empty
- `expiresAt` must be set to 30 days after creation
- `messages` must be an array of valid ChatMessage objects

**Relationships**:
- Belongs to one User (via `userId` reference)
- Contains many ChatMessage objects (via `messages` array)

## State Transitions

### ChatMessage State Transitions

**Initial State**: New message is created with status "sending"

**Transitions**:
1. **Sending → Streaming**: When the server begins sending response chunks, status changes to "streaming"
2. **Sending → Error**: If an error occurs before streaming starts, status changes to "error"
3. **Streaming → Completed**: When the server finishes sending all response chunks, status changes to "completed"
4. **Streaming → Error**: If an error occurs during streaming, status changes to "error"

### Conversation State Transitions

**Initial State**: New conversation is created with no messages

**Transitions**:
1. **New**: Conversation created, waiting for first message
2. **Active**: Conversation receives first message and becomes active
3. **Inactive**: Conversation has no activity for a period but still within retention window
4. **Archived**: Conversation reaches retention limit (30 days) and is marked for cleanup

## UI-Specific Models

### ChatState Model

**Purpose**: Manages the overall state of the chat interface for React state management.

**Fields**:
- `currentConversationId` (string/UUID): ID of the currently active conversation
- `conversations` (Map<string, Conversation>): Map of all loaded conversations by ID
- `isLoading` (boolean): Whether the chat interface is loading data
- `isStreaming` (boolean): Whether a response is currently being streamed
- `error` (string): Any error message to display to the user
- `inputValue` (string): Current value of the chat input field

### StreamChunk Model

**Purpose**: Represents a single chunk of data received from the SSE stream.

**Fields**:
- `type` (string): Type of chunk - "message", "tool_call", "tool_result", "error"
- `data` (any): The actual data payload for this chunk
- `timestamp` (Date): When this chunk was received
- `correlationId` (string): ID to correlate related chunks

## TypeScript Type Definitions

```typescript
// Frontend TypeScript type definitions for chat entities

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: any;
  displayType: 'inline' | 'card' | 'expanded';
}

export interface ToolResult {
  toolCallId: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  status: 'sending' | 'streaming' | 'completed' | 'error';
  toolCalls?: ToolCall[];
  toolCallResults?: ToolResult[];
  isStreaming?: boolean;
  streamingError?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  messages: ChatMessage[];
  isActive: boolean;
}

export interface ChatState {
  currentConversationId: string | null;
  conversations: Map<string, Conversation>;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  inputValue: string;
}

export interface StreamChunk {
  type: 'message' | 'tool_call' | 'tool_result' | 'error';
  data: any;
  timestamp: Date;
  correlationId: string;
}
```

## Integration with Backend Models

The frontend data models are designed to work seamlessly with the existing backend models:

### Mapping to Backend Conversation Model
- Frontend `Conversation.id` ↔ Backend `Conversation.id`
- Frontend `Conversation.userId` ↔ Backend `Conversation.user_id`
- Frontend `Conversation.createdAt` ↔ Backend `Conversation.created_at`
- Frontend `Conversation.updatedAt` ↔ Backend `Conversation.updated_at`
- Frontend `Conversation.expiresAt` ↔ Backend `Conversation.expires_at`

### Mapping to Backend Message Model
- Frontend `ChatMessage.id` ↔ Backend `Message.id`
- Frontend `ChatMessage.role` ↔ Backend `Message.role`
- Frontend `ChatMessage.content` ↔ Backend `Message.content`
- Frontend `ChatMessage.createdAt` ↔ Backend `Message.created_at`
- Frontend `ChatMessage.toolCalls` ↔ Backend `Message.tool_calls` (JSON field)
- Frontend `ChatMessage.toolCallResults` ↔ Backend `Message.tool_call_results` (JSON field)

## Validation Strategy

### Client-Side Validation
- Input sanitization before sending to backend
- Status transitions validation to prevent invalid states
- Type checking using TypeScript interfaces

### Server-Side Validation (Backend)
- JWT token validation for all requests
- User ownership verification for conversations and messages
- Data format validation for tool calls and results
- Rate limiting and abuse prevention

## Performance Considerations

### Data Transfer Optimization
- Pagination for large conversation histories (>50 messages)
- Delta updates for streaming responses instead of full message refreshes
- Efficient serialization of tool call data to minimize bandwidth

### Rendering Optimization
- Virtual scrolling for long message histories
- Memoization of message components to prevent unnecessary re-renders
- Lazy loading of older conversation messages