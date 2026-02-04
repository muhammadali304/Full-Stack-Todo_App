# Quickstart Guide: AI Agent Chat Endpoint

**Feature**: 005-ai-agent-chat
**Date**: 2026-01-20

## Overview

This guide provides instructions for setting up and running the AI Agent Chat Endpoint server that enables users to manage their todos through natural language processing via the OpenAI Agents SDK.

## Prerequisites

- Python 3.11+
- Poetry or pip for dependency management
- Neon PostgreSQL database
- Better Auth configured for JWT generation
- OpenAI API key (for AI agent integration)
- Official MCP SDK for Python
- Existing MCP tools from Spec-4 (already implemented)

## Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   poetry install  # or pip install -r requirements.txt
   ```

3. **Set up backend environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```

   Update backend `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/dbname
   BETTER_AUTH_SECRET=your-jwt-secret-here
   OPENAI_API_KEY=your-openai-api-key
   MCP_SERVER_URL=http://localhost:8000
   ```

4. **Set up frontend environment variables** (if applicable):
   ```bash
   cd frontend
   cp .env.local .env.local
   ```

   Update frontend `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Database Setup

1. **Run database migrations**:
   ```bash
   python -m alembic upgrade head
   ```

   Or if using a different migration tool:
   ```bash
   python -m backend.src.models.migrations
   ```

2. **Verify database connectivity**:
   ```bash
   python -c "from backend.src.models.database import engine; print('DB connected')"
   ```

## Running the Server

1. **Start the existing backend server (which will be extended with AI agent chat)**:
   ```bash
   cd backend
   python -m backend.src.main
   ```

   Or using uvicorn:
   ```bash
   cd backend
   uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Note: The existing server already runs the basic task API. The AI agent chat endpoint will be integrated into this same server.

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev  # or yarn dev
   ```

   The frontend will be available at http://localhost:3000

3. **Verify the server is running**:
   - Check server health: `GET http://localhost:8000/api/health` (existing endpoint)
   - Check existing API: `GET http://localhost:8000/docs` (Swagger UI)
   - AI agent chat endpoint will be available after implementation at: `POST http://localhost:8000/api/{user_id}/chat`

## Using AI Agent Chat Endpoint

### Available Endpoint

**Chat Endpoint**: `POST /api/{user_id}/chat`

- **Purpose**: Process natural language requests from users to manage their todos
- **Authentication**: Requires valid JWT token in Authorization header
- **Parameters**: `{user_id}` in path (must match authenticated user)
- **Body**: JSON with `message` field containing the user's natural language request

**Example Request**:
```json
{
  "message": "Add a task to buy groceries"
}
```

**Example Response**:
```json
{
  "response": "I've added a task 'buy groceries' to your list.",
  "tool_calls": [
    {
      "name": "add_task",
      "parameters": {
        "title": "buy groceries"
      },
      "result": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "buy groceries",
        "completed": false
      }
    }
  ],
  "conversation_id": "123e4567-e89b-12d3-a456-426614174001"
}
```

### Authentication

The AI agent chat endpoint requires a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

The JWT token must be obtained through the Better Auth system and contain the user's identity information. The user_id in the URL path must match the user_id in the authenticated JWT token.

### Supported Natural Language Requests

The AI agent understands various natural language patterns:

- **Add tasks**: "Add a task to buy groceries", "Create a new task: walk the dog", "I need to remember to call mom"
- **List tasks**: "Show me my tasks", "What do I need to do?", "List all my tasks"
- **Complete tasks**: "Mark grocery shopping as complete", "Finish the report task", "I completed the meeting prep"
- **Delete tasks**: "Remove the grocery task", "Delete the workout task", "Cancel the appointment"
- **Update tasks**: "Change the grocery task to buy groceries and clothes", "Update the workout task description"

## Testing the Implementation

1. **Run unit tests**:
   ```bash
   pytest tests/unit/
   ```

2. **Run integration tests**:
   ```bash
   pytest tests/integration/
   ```

3. **Run contract tests**:
   ```bash
   pytest tests/contract/
   ```

## Troubleshooting

### Common Issues

- **JWT Validation Failed**: Ensure the `BETTER_AUTH_SECRET` matches the one used by your Better Auth instance
- **Database Connection Error**: Verify `DATABASE_URL` is correctly configured and the database is accessible
- **AI Agent Not Responding**: Check that the OpenAI API key is valid and the service is accessible
- **User Isolation Not Working**: Verify that all database queries are properly filtered by `user_id`
- **MCP Tools Not Called**: Check that the agent is properly configured to call the existing MCP tools

### Health Checks

- **Health endpoint**: `GET /health` - Returns server status
- **Metrics endpoint**: `GET /metrics` - Returns server metrics
- **Chat endpoint**: `POST /api/{user_id}/chat` - Processes natural language requests
- **Tool registry**: `GET /mcp/tools` - Lists available MCP tools (from Spec-4)

## Integration with Existing Features

The AI agent chat endpoint integrates with the existing MCP tools:

1. **Task Management**: Reuses the existing add_task, list_tasks, complete_task, delete_task, and update_task MCP tools
2. **Authentication**: Uses the existing JWT validation infrastructure
3. **Database**: Uses the existing SQLModel models and database connections
4. **Error Handling**: Follows the existing error response patterns

The implementation maintains compatibility with existing features while adding the AI-powered natural language interface.