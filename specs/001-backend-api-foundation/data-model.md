# Data Model: Backend API & Database Foundation

**Feature**: Backend API & Database Foundation
**Date**: 2026-01-11
**Status**: Design Complete

## Overview

This document defines the data entities, their attributes, relationships, validation rules, and database schema for the todo task management system. The model supports single-user task management with preparation for future multi-user expansion.

## Entities

### Task

**Description**: Represents a todo item with title, description, completion status, and audit timestamps.

**Table Name**: `tasks`

**Fields**:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | auto-generated | Unique identifier for the task |
| title | VARCHAR(200) | NOT NULL, LENGTH(1-200) | - | Task title (required) |
| description | TEXT | NULLABLE, LENGTH(0-2000) | NULL | Optional task description |
| completed | BOOLEAN | NOT NULL | FALSE | Completion status (true = completed, false = incomplete) |
| user_id | UUID | NULLABLE, INDEX | NULL | User identifier for future multi-user support (currently unused) |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Task creation timestamp (UTC) |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last modification timestamp (UTC) |

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- INDEX on `user_id` (for future multi-user queries)
- INDEX on `created_at` (for ordering by newest first)

**Validation Rules**:

1. **Title Validation**:
   - MUST NOT be empty or whitespace-only
   - MUST be between 1 and 200 characters (inclusive)
   - Enforced at application layer (Pydantic) and database layer (CHECK constraint)

2. **Description Validation**:
   - MAY be NULL (optional field)
   - If provided, MUST NOT exceed 2000 characters
   - Enforced at application layer (Pydantic) and database layer (CHECK constraint)

3. **Completed Validation**:
   - MUST be boolean (true or false)
   - Defaults to false for new tasks
   - Enforced at database layer (BOOLEAN type)

4. **Timestamp Validation**:
   - created_at MUST be set on insert (database default)
   - updated_at MUST be updated on every modification
   - Both stored in UTC timezone
   - Returned in ISO 8601 format in API responses

**State Transitions**:

```
[New Task]
    ↓ (create)
[Incomplete Task] (completed = false)
    ↓ (toggle)
[Complete Task] (completed = true)
    ↓ (toggle)
[Incomplete Task] (completed = false)
    ↓ (delete)
[Deleted]
```

**Business Rules**:

1. Tasks are created with `completed = false` by default
2. Tasks can be toggled between completed and incomplete states
3. Tasks can be updated (title, description) regardless of completion status
4. Tasks can be deleted regardless of completion status
5. Timestamps are managed automatically (no manual updates allowed)
6. user_id field is reserved for future multi-user implementation (currently NULL)

## Relationships

**Current Phase**: No relationships (single entity model)

**Future Expansion**:
- Task → User (many-to-one): Each task belongs to one user
- User → Tasks (one-to-many): Each user has many tasks

**Note**: User entity and relationships will be added in authentication feature phase.

## Database Schema (SQL)

```sql
-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) >= 1 AND LENGTH(title) <= 200),
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 2000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Create trigger for updated_at (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## SQLModel Definition (Python)

```python
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    """SQLModel representation of a task entity."""

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False, nullable=False)
    user_id: Optional[UUID] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

## Pydantic Schemas (Request/Response)

```python
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v

class TaskUpdate(BaseModel):
    """Schema for updating an existing task (partial updates)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v

class TaskResponse(BaseModel):
    """Schema for task responses."""
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    user_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
```

## Data Migration Strategy

**Initial Migration** (Alembic):
1. Create tasks table with all fields and constraints
2. Create indexes on user_id and created_at
3. Create trigger for automatic updated_at management

**Future Migrations**:
1. Add users table (authentication feature)
2. Add foreign key constraint from tasks.user_id to users.id
3. Populate user_id for existing tasks (migration strategy TBD)

## Data Validation Layers

1. **Database Layer** (PostgreSQL):
   - Type constraints (UUID, VARCHAR, TEXT, BOOLEAN, TIMESTAMP)
   - NOT NULL constraints
   - CHECK constraints for length validation
   - DEFAULT values for completed, created_at, updated_at
   - Trigger for updated_at automation

2. **ORM Layer** (SQLModel):
   - Field type validation
   - min_length/max_length constraints
   - default_factory for auto-generated values
   - Nullable/non-nullable enforcement

3. **API Layer** (Pydantic):
   - Request schema validation
   - Custom validators for business rules (e.g., non-empty title)
   - Automatic error messages for validation failures
   - Type coercion and parsing

## Performance Considerations

**Query Optimization**:
- Index on `created_at DESC` enables efficient ordering for list queries
- Index on `user_id` prepares for future multi-user filtering
- UUID primary key provides globally unique identifiers without collisions

**Expected Query Patterns**:
1. List all tasks ordered by newest first: `SELECT * FROM tasks ORDER BY created_at DESC`
2. Get task by ID: `SELECT * FROM tasks WHERE id = ?`
3. Update task: `UPDATE tasks SET ... WHERE id = ?`
4. Delete task: `DELETE FROM tasks WHERE id = ?`
5. Toggle completion: `UPDATE tasks SET completed = NOT completed WHERE id = ?`

**Scalability**:
- Current design supports 10,000+ tasks efficiently
- Pagination can be added in future (LIMIT/OFFSET or cursor-based)
- Partitioning by user_id possible for future multi-user scale

## Data Integrity

**Constraints**:
- Primary key ensures unique task identifiers
- NOT NULL constraints prevent missing required data
- CHECK constraints enforce length limits
- Boolean type ensures valid completion states

**Audit Trail**:
- created_at provides task creation timestamp
- updated_at tracks last modification
- Immutable created_at (never updated)
- Automatic updated_at via database trigger

**Concurrency**:
- Last-write-wins strategy (acceptable for this phase)
- updated_at timestamp indicates most recent modification
- No optimistic locking in initial implementation
- Future: Add version field for optimistic locking if needed

## Testing Considerations

**Model Tests**:
1. Validate title length constraints (1-200 chars)
2. Validate description length constraints (0-2000 chars)
3. Validate default values (completed=false, timestamps auto-generated)
4. Validate UUID generation for id field
5. Test validation error messages

**Database Tests**:
1. Verify table creation with correct schema
2. Test CHECK constraints enforcement
3. Test trigger for updated_at automation
4. Verify index creation and usage
5. Test concurrent inserts/updates

**Integration Tests**:
1. Create task and verify persistence
2. Update task and verify updated_at changes
3. Toggle completion and verify state change
4. Delete task and verify removal
5. Query ordering by created_at descending
