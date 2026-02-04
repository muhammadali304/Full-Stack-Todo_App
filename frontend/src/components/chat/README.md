# Chat Components

This directory contains the core chat interface components for the AI chatbot functionality.

## Components

### ChatInterface
The main chat interface component that provides a real-time chat experience with streaming responses, conversation history, and tool call visualization.

**Features:**
- Real-time streaming responses using Server-Sent Events (SSE)
- Conversation history with pagination support
- Tool call visualization with status indicators
- User authentication integration
- Message formatting and display

**Props:**
- `initialConversation`: Optional initial conversation to load
- `userId`: Optional user ID (will be retrieved from auth context if not provided)
- `onConversationChange`: Callback fired when conversation changes

### MessageRenderer
Renders individual chat messages with proper styling and formatting.

**Features:**
- User vs assistant message differentiation
- Timestamp display
- Markdown rendering support
- Streaming status indicators

### ToolCallDisplay
Displays tool calls and their results inline in the conversation flow with clear visual separators and status indicators.

**Features:**
- Visual representation of tool calls
- Status indicators (pending, executing, completed, error)
- Arguments and result display
- Multiple display types (inline, card, expanded)

## Architecture

The chat interface follows a stateless architecture where all data is persisted to the backend database. The UI components are responsible for:
- Managing UI state (messages, input, loading states)
- Handling authentication via existing middleware
- Managing SSE connections for streaming responses
- Displaying tool call information

## Error Handling

Comprehensive error handling is implemented with user-friendly messages and technical details for debugging. Errors are categorized by type and handled appropriately.

## Performance Monitoring

Performance metrics are collected for response times, rendering performance, and user interactions. Average response times are monitored to ensure performance targets are met (<500ms).

## Integration Points

- Authentication: Uses existing JWT-based authentication from `middleware/chatAuthMiddleware`
- API: Communicates with backend via `lib/chat-api`
- State Management: Uses React hooks for local state management
- Types: Leverages shared types from `lib/types`