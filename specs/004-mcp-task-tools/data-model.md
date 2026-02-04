# Data Model: MCP Task Tools

**Feature**: 004-mcp-task-tools
**Date**: 2026-01-20

## Overview

This document defines the data models for the MCP Task Tools feature, focusing on the entities required to support the task management operations with proper user ownership and authentication.

## Entity Definitions

### Task Entity (Existing)

**Purpose**: Represents a user's todo item with properties for title, description, completion status, and timestamps. This entity already exists in the system at `src/models/task.py`.

**Fields** (from existing model):
- `id` (UUID): Primary key, unique identifier for the task
- `user_id` (UUID): Foreign key linking to the user who owns this task
- `title` (String): The title or subject of the task (required, 1-200 chars)
- `description` (Text): Optional detailed description of the task (nullable, 0-2000 chars)
- `completed` (Boolean): Flag indicating whether the task is completed (default: False)
- `created_at` (DateTime): Timestamp when the task was created (auto-populated)
- `updated_at` (DateTime): Timestamp when the task was last updated (auto-populated)

**Validation Rules** (from existing model):
- `title` must be 1-200 characters and cannot be empty or whitespace-only
- `description` can be up to 2000 characters (optional)
- `user_id` must reference a valid user in the system (foreign key constraint)
- `completed` must be a boolean value

**Relationships** (from existing model):
- Belongs to one User (via `user_id` foreign key)
- Each user can have multiple tasks (user.tasks relationship)

### User Entity (Existing)

**Purpose**: Represents a system user authenticated via Better Auth. This entity already exists in the system at `src/models/user.py`.

**Fields** (from existing model):
- `id` (UUID): Unique identifier for the user
- `email` (String): User's email address
- `name` (String): User's name (optional)
- `created_at` (DateTime): When the user account was created
- `tasks` (Relationship): List of tasks owned by this user


## State Transitions

### Task State Transitions

**Initial State**: New task is created with `completed = False`

**Transitions**:
1. **Create Task**: `status = pending` (default)
2. **Complete Task**: `completed = True` (from False)
3. **Reopen Task**: `completed = False` (from True)
4. **Update Task**: Fields like title/description can be modified while preserving ownership
5. **Delete Task**: Task is removed from the system

## Indexes

**Required Indexes**:
- Index on `user_id` for efficient querying of user-specific tasks
- Composite index on `(user_id, completed)` for efficient filtering by user and completion status
- Index on `created_at` for chronological ordering

## Constraints

**Data Integrity**:
- Foreign key constraint on `user_id` to ensure referential integrity
- Non-null constraints on required fields (`title`, `user_id`)
- Check constraint to ensure `user_id` is valid and exists in the user table

**Business Logic**:
- Users can only access tasks where `user_id` matches their authenticated user ID
- Only the owner of a task can modify or delete it
- Completed tasks can be reopened but maintain their creation history

## SQLModel Implementation

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
import uuid
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)  # Assuming user.id is string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime

class TaskUpdate(TaskBase):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    completed: Optional[bool] = Field(default=None)
```

## Access Control Patterns

**Query Patterns**:
- Always filter queries by `user_id` to enforce data isolation
- Use parameterized queries to prevent injection attacks
- Validate user_id matches authenticated user before any operations

**Authorization Checks**:
- Before reading: Verify task.user_id == authenticated_user_id
- Before updating: Verify task.user_id == authenticated_user_id
- Before deleting: Verify task.user_id == authenticated_user_id