# Research: ChatKit-based AI Chat Frontend Integration

**Feature**: 006-chat-frontend-integration
**Date**: 2026-01-20

## Overview

This document captures the research for implementing a ChatKit-based AI chat frontend that integrates with the existing backend infrastructure. The research covers technology choices, integration patterns, and architectural decisions for the streaming chat interface with tool call visualization.

## Streaming Method Decision

**Decision**: Use Server Sent Events (SSE) for real-time response streaming
**Rationale**: SSE provides a simple, reliable way to stream responses from the server to the client. It works well with existing HTTP authentication patterns (JWT in headers) and is supported across all modern browsers. SSE is specifically designed for server-to-client streaming which is exactly what we need for AI agent responses.
**Alternatives considered**:
- WebSockets: More complex setup, bidirectional when we only need server-to-client
- Long polling: Higher overhead, less efficient than SSE
- Chunked HTTP responses: Less standardized, more complex error handling

## Tool-Call UI Format Decision

**Decision**: Inline visualization with distinct styling
**Rationale**: The requirement specifies "tool calls and results are clearly visible in chat" and "inline tool indicators" were confirmed in clarifications. This approach maintains the conversational flow while making tool operations transparent to the user. Each tool call will appear as a distinct element within the message stream with clear visual separators.
**Alternatives considered**:
- Separate tool panel: Would break the natural conversation flow
- Hidden tool calls: Would not meet transparency requirements
- Tool summary only: Would not provide sufficient detail about operations

## ChatKit Integration Research

**Decision**: Integrate OpenAI ChatKit components with custom streaming handler
**Rationale**: The requirement specifically mentions "ChatKit UI component", so we'll use OpenAI's ChatKit or implement a similar interface pattern. This provides a familiar chat interface while allowing customization for our specific needs around tool call visualization and streaming responses.
**Alternatives considered**: Custom-built chat components would require more implementation work and might not match the desired user experience.

## Authentication Integration Research

**Decision**: Reuse existing JWT authentication infrastructure
**Rationale**: The existing authentication system already provides JWT token handling via Better Auth. We can reuse the existing `useAuth` hook and API client infrastructure to ensure consistent authentication across the application.
**Alternatives considered**: Separate authentication system would create inconsistency and additional maintenance.

## Message Rendering Logic Research

**Decision**: Component-based message rendering with special handling for tool calls
**Rationale**: Each message type (user, AI response, tool call, tool result) needs distinct visual representation. A component-based approach allows for flexible rendering while maintaining consistency. Tool calls need special visualization as confirmed in clarifications.
**Implementation approach**: Create a MessageRenderer component that detects message type and applies appropriate styling/formatting.

## API Connection Research

**Decision**: Use existing API infrastructure with new chat endpoint integration
**Rationale**: The backend already has the `/api/{user_id}/chat` endpoint implemented. We'll extend the existing API client to support this endpoint with proper JWT token inclusion and streaming response handling.
**Connection pattern**: Leverage existing patterns from the API client in `src/lib/api.ts` to maintain consistency.

## Error Handling Research

**Decision**: Implement user-friendly error messages with technical details for debugging
**Rationale**: The requirement specifies "comprehensive error handling with user-friendly messages" while still providing technical details for debugging. This requires a dual-layer approach to error presentation.
**Implementation**: Create error boundary components and error response handlers that can display appropriate messaging based on error type.

## State Management Research

**Decision**: Minimal client-side state with backend persistence
**Rationale**: The constitutional requirement for "Stateless Backend Architecture" means we cannot rely on in-memory state. However, for UI responsiveness, we can maintain minimal local state that syncs with backend. Conversations will be persisted to the database with client-side caching for performance.
**Pattern**: Use SWR/react-query for data fetching with proper cache invalidation strategies.

## SSE Implementation Research

**Decision**: Create custom SSE hook for streaming response handling
**Rationale**: While there are libraries for SSE handling, creating a custom hook allows for tight integration with our specific needs around AI responses, tool calls, and error handling.
**Implementation approach**: Create `useSSEStream` hook that handles connection management, error recovery, and message parsing.

## Conversation History Research

**Decision**: Backend-only persistence with 30-day retention
**Rationale**: As confirmed in clarifications, conversations will be stored only in the backend database with no local storage. This maintains stateless architecture while providing persistence. The 30-day retention policy ensures data freshness while maintaining history.
**Implementation**: Fetch conversation history from backend API and implement pagination for longer conversations.

## Integration Strategy Research

**Decision**: Non-breaking integration with existing application
**Rationale**: The requirement specifies "UI integrates without breaking existing pages". This means the chat interface must coexist with existing functionality without interfering with current operations.
**Approach**: Implement as separate page/route that follows existing layout and styling patterns.