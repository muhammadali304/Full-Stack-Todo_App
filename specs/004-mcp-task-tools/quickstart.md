# Quickstart Guide: MCP Task Tools

**Feature**: 004-mcp-task-tools
**Date**: 2026-01-20

## Overview

This guide provides instructions for setting up and running the MCP Task Tools server that enables AI agents to perform task management operations through standardized tools.

## Prerequisites

- Python 3.11+ (Backend)
- Node.js 18+ and npm/yarn (Frontend)
- Poetry or pip for backend dependency management
- Neon PostgreSQL database
- Better Auth configured for JWT generation
- OpenAI API key (for AI agent integration)
- MCP SDK for Python
- NEXT_PUBLIC_API_URL environment variable for frontend API communication

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

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install  # or yarn install
   ```

4. **Set up backend environment variables**:
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

5. **Set up frontend environment variables**:
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

1. **Start the existing backend server (which will be extended with MCP tools)**:
   ```bash
   cd backend
   python -m backend.src.main
   ```

   Or using uvicorn:
   ```bash
   cd backend
   uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Note: The existing server already runs the basic task API. The MCP tools will be integrated into this same server.

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev  # or yarn dev
   ```

   The frontend will be available at http://localhost:3000

3. **Verify the server is running**:
   - Check server health: `GET http://localhost:8000/api/health` (existing endpoint)
   - Check existing API: `GET http://localhost:8000/docs` (Swagger UI)
   - MCP tools will be available after implementation at: `GET http://localhost:8000/mcp/tools`

## Using MCP Task Tools

### Available Tools

1. **add_task**
   - Purpose: Create a new task for the authenticated user
   - Parameters: `title` (string), `description` (optional string)
   - Example:
     ```json
     {
       "tool": "add_task",
       "params": {
         "title": "Buy groceries",
         "description": "Milk, bread, eggs"
       }
     }
     ```

2. **list_tasks**
   - Purpose: Retrieve all tasks for the authenticated user
   - Parameters: `completed` (optional boolean, filter by completion status)
   - Example:
     ```json
     {
       "tool": "list_tasks",
       "params": {
         "completed": false
       }
     }
     ```

3. **complete_task**
   - Purpose: Mark a task as completed
   - Parameters: `task_id` (UUID string)
   - Example:
     ```json
     {
       "tool": "complete_task",
       "params": {
         "task_id": "123e4567-e89b-12d3-a456-426614174000"
       }
     }
     ```

4. **delete_task**
   - Purpose: Remove a task from the user's list
   - Parameters: `task_id` (UUID string)
   - Example:
     ```json
     {
       "tool": "delete_task",
       "params": {
         "task_id": "123e4567-e89b-12d3-a456-426614174000"
       }
     }
     ```

5. **update_task**
   - Purpose: Modify an existing task
   - Parameters: `task_id` (UUID string), `title` (optional string), `description` (optional string), `completed` (optional boolean)
   - Example:
     ```json
     {
       "tool": "update_task",
       "params": {
         "task_id": "123e4567-e89b-12d3-a456-426614174000",
         "title": "Buy groceries - urgent",
         "completed": true
       }
     }
     ```

### Authentication

All MCP tools require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

The JWT token must be obtained through the Better Auth system and contain the user's identity information.

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
- **Tool Not Found**: Check that the MCP server is properly initialized with all tools registered
- **User Isolation Not Working**: Verify that all database queries are properly filtered by `user_id`

### Health Checks

- **Health endpoint**: `GET /health` - Returns server status
- **Metrics endpoint**: `GET /metrics` - Returns server metrics
- **Tool registry**: `GET /mcp/tools` - Lists available MCP tools

## Integration with AI Agent

To use these tools with an AI agent:

1. Register the tools with your AI agent framework
2. Ensure the agent passes JWT tokens with each tool call
3. Handle structured JSON responses from the tools
4. Implement proper error handling for failed operations

Example integration:
```python
# Example of how an AI agent might call the tools
response = await ai_agent.run(
    prompt="Please add a task to buy milk",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
    auth_token=user_jwt_token
)
```