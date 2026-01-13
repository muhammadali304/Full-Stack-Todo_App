# Quickstart Guide: Backend API & Database Foundation

**Feature**: Backend API & Database Foundation
**Date**: 2026-01-11
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for setting up the backend API development environment, initializing the database, running the FastAPI server, and testing the API endpoints.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Neon PostgreSQL account and database
- Git (for version control)
- curl or httpie (for API testing)

## Environment Setup

### 1. Clone Repository and Navigate to Backend

```bash
cd backend/
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Required Dependencies** (requirements.txt):
```
fastapi==0.104.1
sqlmodel==0.0.14
pydantic==2.5.0
asyncpg==0.29.0
uvicorn[standard]==0.24.0
alembic==1.13.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### 4. Configure Environment Variables

Create a `.env` file in the backend/ directory:

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require

# Application Configuration
APP_ENV=development
DEBUG=true

# Future: Authentication (stubbed for this phase)
# BETTER_AUTH_SECRET=your-secret-key-here
```

**Neon PostgreSQL Connection String Format**:
```
postgresql+asyncpg://[user]:[password]@[host]/[database]?sslmode=require
```

**How to get Neon connection string**:
1. Log in to Neon Console (https://console.neon.tech)
2. Select your project
3. Navigate to "Connection Details"
4. Copy the connection string
5. Replace `postgresql://` with `postgresql+asyncpg://` for async support

## Database Initialization

### 1. Initialize Alembic (First Time Only)

```bash
# Initialize Alembic migrations
alembic init alembic

# Configure alembic.ini with your DATABASE_URL
# Edit alembic/env.py to import SQLModel models
```

### 2. Create Initial Migration

```bash
# Generate migration from SQLModel models
alembic revision --autogenerate -m "Create tasks table"

# Review the generated migration in alembic/versions/
```

### 3. Apply Migrations

```bash
# Run migrations to create database schema
alembic upgrade head
```

### 4. Verify Database Schema

Connect to your Neon database and verify the tasks table:

```sql
-- Check table structure
\d tasks

-- Expected output:
-- Column      | Type                     | Nullable | Default
-- ------------+--------------------------+----------+-------------------
-- id          | uuid                     | not null | gen_random_uuid()
-- title       | character varying(200)   | not null |
-- description | text                     |          |
-- completed   | boolean                  | not null | false
-- user_id     | uuid                     |          |
-- created_at  | timestamp                | not null | CURRENT_TIMESTAMP
-- updated_at  | timestamp                | not null | CURRENT_TIMESTAMP
```

## Running the Application

### 1. Start FastAPI Server

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Verify Server is Running

Open browser and navigate to:
- API Documentation: http://localhost:8000/docs (Swagger UI)
- Alternative Docs: http://localhost:8000/redoc (ReDoc)
- Health Check: http://localhost:8000/api/health (if implemented)

## API Usage Examples

### Using curl

#### 1. Create a Task

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "completed": false,
  "user_id": null,
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T10:30:00Z"
}
```

#### 2. List All Tasks

```bash
curl http://localhost:8000/api/tasks
```

**Expected Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "completed": false,
    "user_id": null,
    "created_at": "2026-01-11T10:30:00Z",
    "updated_at": "2026-01-11T10:30:00Z"
  }
]
```

#### 3. Get Specific Task

```bash
curl http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

#### 4. Update Task

```bash
curl -X PATCH http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title"
  }'
```

**Expected Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Write comprehensive API documentation",
  "completed": false,
  "user_id": null,
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T11:15:00Z"
}
```

#### 5. Toggle Task Completion

```bash
curl -X POST http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle
```

**Expected Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Write comprehensive API documentation",
  "completed": true,
  "user_id": null,
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T11:20:00Z"
}
```

#### 6. Delete Task

```bash
curl -X DELETE http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response** (204 No Content)

### Using httpie (Alternative)

```bash
# Create task
http POST localhost:8000/api/tasks title="New task" description="Task details"

# List tasks
http GET localhost:8000/api/tasks

# Get task
http GET localhost:8000/api/tasks/{task_id}

# Update task
http PATCH localhost:8000/api/tasks/{task_id} title="Updated title"

# Toggle completion
http POST localhost:8000/api/tasks/{task_id}/toggle

# Delete task
http DELETE localhost:8000/api/tasks/{task_id}
```

## Error Handling Examples

### Validation Error (400 Bad Request)

```bash
# Empty title
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

**Response**:
```json
{
  "type": "validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Title cannot be empty or whitespace-only",
  "instance": "/api/tasks"
}
```

### Not Found Error (404 Not Found)

```bash
# Non-existent task ID
curl http://localhost:8000/api/tasks/00000000-0000-0000-0000-000000000000
```

**Response**:
```json
{
  "type": "not_found",
  "title": "Not Found",
  "status": 404,
  "detail": "Task with id 00000000-0000-0000-0000-000000000000 not found",
  "instance": "/api/tasks/00000000-0000-0000-0000-000000000000"
}
```

## Testing

### Run Unit Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_task_api.py

# Run with verbose output
pytest -v
```

### Run Integration Tests

```bash
# Run integration tests only
pytest tests/integration/

# Run with test database
DATABASE_URL=postgresql+asyncpg://test:test@localhost/test_db pytest
```

### Manual Testing Checklist

- [ ] Create task with valid data → 201 Created
- [ ] Create task with empty title → 400 Bad Request
- [ ] Create task with title > 200 chars → 400 Bad Request
- [ ] List tasks when empty → 200 OK with empty array
- [ ] List tasks with data → 200 OK with tasks ordered newest first
- [ ] Get existing task → 200 OK with task data
- [ ] Get non-existent task → 404 Not Found
- [ ] Update task with valid data → 200 OK with updated task
- [ ] Update non-existent task → 404 Not Found
- [ ] Toggle task completion → 200 OK with flipped status
- [ ] Delete existing task → 204 No Content
- [ ] Delete non-existent task → 404 Not Found

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test list endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:8000/api/tasks

# Test create endpoint
ab -n 100 -c 10 -p task.json -T application/json http://localhost:8000/api/tasks
```

**Expected Results**:
- List endpoint: <500ms average response time
- Create endpoint: <1s average response time
- 100 concurrent operations: No errors or data corruption

### Database Query Performance

```sql
-- Check query execution time
EXPLAIN ANALYZE SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100;

-- Verify index usage
EXPLAIN SELECT * FROM tasks WHERE user_id = 'some-uuid';
```

## Troubleshooting

### Database Connection Issues

**Problem**: `asyncpg.exceptions.InvalidPasswordError`
**Solution**: Verify DATABASE_URL credentials in .env file

**Problem**: `Connection refused`
**Solution**: Check Neon database is accessible and not paused

### Migration Issues

**Problem**: `alembic.util.exc.CommandError: Target database is not up to date`
**Solution**: Run `alembic upgrade head` to apply pending migrations

**Problem**: Migration conflicts
**Solution**: Resolve conflicts manually or create new migration

### API Errors

**Problem**: 500 Internal Server Error
**Solution**: Check server logs for detailed error messages

**Problem**: Validation errors not showing details
**Solution**: Verify RFC 7807 error handler is registered in FastAPI app

## Development Workflow

1. **Make Changes**: Edit code in src/ directory
2. **Run Tests**: `pytest` to verify changes
3. **Test Manually**: Use curl/httpie to test endpoints
4. **Create Migration**: `alembic revision --autogenerate -m "description"`
5. **Apply Migration**: `alembic upgrade head`
6. **Commit Changes**: `git add . && git commit -m "description"`

## Next Steps

After completing this quickstart:

1. **Implement Authentication**: Add JWT validation (future feature)
2. **Add Pagination**: Implement pagination for task list endpoint
3. **Add Filtering**: Support filtering tasks by completion status
4. **Add Search**: Implement full-text search on title/description
5. **Deploy to Production**: Configure production environment and deploy

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Neon Documentation**: https://neon.tech/docs
- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **RFC 7807 Specification**: https://tools.ietf.org/html/rfc7807

## Support

For issues or questions:
- Check API documentation at http://localhost:8000/docs
- Review error logs in console output
- Consult data-model.md for schema details
- Refer to contracts/openapi.yaml for API contract
