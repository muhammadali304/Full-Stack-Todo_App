# Quickstart Guide: ChatKit-based AI Chat Frontend Integration

**Feature**: 006-chat-frontend-integration
**Date**: 2026-01-20

## Overview

This guide provides instructions for setting up and running the ChatKit-based AI chat frontend integration that enables users to manage their todos through natural language processing with real-time streaming responses.

## Prerequisites

- Node.js 18+ and npm/yarn (for frontend development)
- Python 3.11+ (for backend development and API)
- OpenAI API key (for AI agent processing)
- Backend server running with MCP tools (from Spec-4 implementation)
- Better Auth configured for JWT generation (for authentication)
- Existing database with user and task models (from Phase-II)
- MCP SDK for Python (for backend tool integration)

## Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install  # or yarn install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt  # or use poetry install
   ```

4. **Set up frontend environment variables**:
   ```bash
   cd frontend
   cp .env.local .env.local
   ```

   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CHAT_STREAM_TIMEOUT=30000  # 30 seconds timeout for SSE connections
   ```

5. **Set up backend environment variables**:
   ```bash
   cd backend
   cp .env .env
   ```

   Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/dbname
   BETTER_AUTH_SECRET=your-jwt-secret-here
   OPENAI_API_KEY=your-openai-api-key
   MCP_SERVER_URL=http://localhost:8000
   ```

## Database Setup

1. **Run database migrations**:
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

2. **Verify database connectivity**:
   ```bash
   python -c "from backend.src.core.database import engine; print('DB connected')"
   ```

## Running the Application

1. **Start the backend server**:
   ```bash
   cd backend
   python -m backend.src.main
   ```

   Or using uvicorn:
   ```bash
   cd backend
   uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev  # or yarn dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Chat endpoint: http://localhost:8000/api/{user_id}/chat
   - Backend docs: http://localhost:8000/docs

## Using the Chat Interface

### Accessing the Chat Page

1. Navigate to the chat page in the application
2. Authenticate with your existing account credentials
3. The chat interface will load with any existing conversation history

### Natural Language Interactions

The AI agent supports natural language processing for various task management operations:

**Adding Tasks**:
- "Add a task to buy groceries"
- "Create a task to schedule dentist appointment"
- "I need to remember to call mom tomorrow"

**Listing Tasks**:
- "Show me my tasks"
- "What do I have to do today?"
- "List my incomplete tasks"

**Completing Tasks**:
- "Mark grocery shopping as complete"
- "Complete the report task"
- "Finish the meeting prep task"

**Updating Tasks**:
- "Change the grocery task to buy groceries and clothes"
- "Update the workout task description to include yoga"
- "Change the meeting task to tomorrow at 2 PM"

**Deleting Tasks**:
- "Remove the old task about..."
- "Delete the cancelled appointment"
- "Cancel the meeting task"

### Streaming Responses

The chat interface uses Server Sent Events (SSE) to provide real-time streaming responses:

1. When you submit a message, the AI agent begins processing immediately
2. Response chunks appear in real-time as they are generated
3. Tool calls made by the AI agent are displayed inline with clear visual indicators
4. Tool results are shown as they are received from the backend

### Conversation Persistence

- All conversations are automatically saved to the backend database
- Previous conversations can be accessed through the conversation history panel
- Conversations are retained for 30 days before automatic cleanup
- Each user can only access their own conversations

## API Integration

### Frontend API Client

The chat functionality uses the existing API client infrastructure with JWT authentication:

```typescript
// Example API call using the existing client
import { apiClient } from '@/lib/api';

const response = await apiClient.post(`/api/${userId}/chat`, {
  content: "Add a task to buy groceries"
}, {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Streaming Response Handling

The frontend uses Server Sent Events to handle streaming responses:

```typescript
// Example SSE connection
const eventSource = new EventSourcePolyfill(
  `${API_BASE_URL}/api/${userId}/chat/stream`,
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle streaming response chunks
  updateChatMessage(data);
};
```

## Testing the Implementation

1. **Unit tests**:
   ```bash
   # Frontend tests
   cd frontend
   npm test

   # Backend tests
   cd backend
   pytest tests/unit/
   ```

2. **Integration tests**:
   ```bash
   # Backend integration tests
   cd backend
   pytest tests/integration/test_chat_integration.py
   ```

3. **Manual testing**:
   - Test natural language task creation with various phrasings
   - Verify conversation persistence across sessions
   - Test tool call visualization in the UI
   - Verify authentication and user isolation
   - Test error handling with invalid requests

## Troubleshooting

### Common Issues

- **Authentication failures**: Ensure JWT token is properly included in requests and hasn't expired
- **Streaming not working**: Check that the backend supports SSE and CORS is properly configured
- **Tool calls not showing**: Verify that MCP tools are properly configured and accessible
- **Conversation history not loading**: Check database connectivity and user permissions

### Health Checks

- Backend health: `GET http://localhost:8000/api/health` (should return 200)
- Chat endpoint: `POST http://localhost:8000/api/{user_id}/chat` (should return 401 without auth)
- Database connection: Check logs for any database connection errors
- MCP tools: `GET http://localhost:8000/api/mcp/tools` (should return list of tools)

### Error Logs

Check the following log locations for troubleshooting:

- Frontend: Browser console and network tab
- Backend: Console output from uvicorn/fastapi server
- Database: Connection and query logs (if enabled)
- Authentication: JWT validation logs in backend