# Data Model: Authentication & API Security

**Feature**: 002-auth-api-security
**Date**: 2026-01-11
**Status**: Design Complete

## Overview

This document defines the data entities, relationships, and validation rules for the authentication system. The primary addition is the User entity, with updates to the existing Task entity to support user ownership.

## Entities

### User

Represents a registered user account with authentication credentials and profile information.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique identifier for the user |
| email | String | Unique, Not Null, Max 255 chars | User's email address (login identifier) |
| username | String | Unique, Not Null, 3-30 chars | Display name (alphanumeric + underscores only) |
| password_hash | String | Not Null, Max 255 chars | bcrypt hashed password (never store plaintext) |
| created_at | DateTime | Not Null, Auto-generated | Account creation timestamp (UTC) |
| updated_at | DateTime | Not Null, Auto-updated | Last modification timestamp (UTC) |

**Validation Rules**:
- **email**: Must match email format regex, case-insensitive uniqueness check
- **username**: Must match `^[a-zA-Z0-9_]{3,30}$` regex, case-sensitive uniqueness check
- **password** (before hashing): Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- **password_hash**: bcrypt with salt rounds=12, format `$2b$12$...`

**Indexes**:
- `idx_users_email` - Unique index on email (for login lookups)
- `idx_users_username` - Unique index on username (for uniqueness validation)

**Relationships**:
- **tasks**: One-to-Many relationship with Task entity (User has many Tasks)

**State Transitions**: None (users are always active in MVP, no soft delete or deactivation)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com",
  "username": "alice_dev",
  "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIRSk4kRzi",
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T10:30:00Z"
}
```

---

### Task (Updated)

Existing entity from Feature 001, now updated to support user ownership.

**New Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | UUID | Foreign Key (User.id), Not Null, Indexed | Owner of this task |

**Updated Constraints**:
- **user_id**: Must reference an existing User.id, cascade delete on user deletion
- All task queries MUST filter by user_id from authenticated token

**New Indexes**:
- `idx_tasks_user_id` - Index on user_id (for filtering user's tasks)
- `idx_tasks_user_created` - Composite index on (user_id, created_at DESC) for efficient sorting

**Relationships**:
- **user**: Many-to-One relationship with User entity (Task belongs to User)

**Migration Impact**:
- Existing tasks in database will need user_id populated (migration strategy: assign to a default admin user or delete orphaned tasks)
- All existing API endpoints must be updated to enforce user_id filtering

**Example** (updated):
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the API endpoints",
  "completed": false,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-11T10:35:00Z",
  "updated_at": "2026-01-11T10:35:00Z"
}
```

---

## Relationships Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ username (UNIQUE)   │
│ password_hash       │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│       Task          │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK) ───────┘
│ title               │
│ description         │
│ completed           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

**Relationship Rules**:
- One User can have many Tasks (1:N)
- Each Task belongs to exactly one User (mandatory relationship)
- Deleting a User cascades to delete all their Tasks
- Tasks cannot exist without a User (user_id is NOT NULL)

---

## Database Schema (SQL)

### User Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]{3,30}$')
);

CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

### Task Table (Updated)

```sql
ALTER TABLE tasks
ADD COLUMN user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

---

## SQLModel Definitions

### User Model

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True, nullable=False)
    username: str = Field(min_length=3, max_length=30, unique=True, index=True, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (not stored in DB, for ORM navigation)
    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
```

### Task Model (Updated)

```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (not stored in DB, for ORM navigation)
    user: User = Relationship(back_populates="tasks")
```

---

## Validation Logic

### Email Validation

```python
import re

EMAIL_REGEX = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')

def validate_email(email: str) -> bool:
    """Validate email format."""
    return bool(EMAIL_REGEX.match(email))

async def check_email_unique(email: str, db: AsyncSession) -> bool:
    """Check if email is unique (case-insensitive)."""
    result = await db.execute(
        select(User).where(func.lower(User.email) == email.lower())
    )
    return result.scalar_one_or_none() is None
```

### Username Validation

```python
import re

USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,30}$')

def validate_username(username: str) -> bool:
    """Validate username format (3-30 chars, alphanumeric + underscores)."""
    return bool(USERNAME_REGEX.match(username))

async def check_username_unique(username: str, db: AsyncSession) -> bool:
    """Check if username is unique (case-sensitive)."""
    result = await db.execute(
        select(User).where(User.username == username)
    )
    return result.scalar_one_or_none() is None
```

### Password Validation

```python
import re

def validate_password(password: str) -> tuple[bool, list[str]]:
    """
    Validate password strength.
    Returns (is_valid, error_messages).
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r'[0-9]', password):
        errors.append("Password must contain at least one number")

    return (len(errors) == 0, errors)
```

### Password Hashing

```python
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt with 12 salt rounds."""
    salt = bcrypt.gensalt(rounds=12)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_hash.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(
        password.encode('utf-8'),
        password_hash.encode('utf-8')
    )
```

---

## Migration Strategy

### Migration 002: Create Users Table and Update Tasks

**Up Migration**:
1. Create users table with all fields and constraints
2. Create indexes on email and username
3. Add user_id column to tasks table (nullable initially)
4. Create default admin user for orphaned tasks
5. Update all existing tasks to reference default admin user
6. Make user_id NOT NULL
7. Add foreign key constraint and indexes

**Down Migration**:
1. Remove foreign key constraint from tasks.user_id
2. Drop indexes on tasks.user_id
3. Drop user_id column from tasks
4. Drop indexes on users table
5. Drop users table

**Alembic Migration File** (002_create_users_table.py):
```python
"""Create users table and add user_id to tasks

Revision ID: 002
Revises: 001
Create Date: 2026-01-11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(30), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create indexes
    op.create_index('idx_users_email', 'users', [sa.text('LOWER(email)')], unique=True)
    op.create_index('idx_users_username', 'users', ['username'], unique=True)

    # Add user_id to tasks (nullable initially)
    op.add_column('tasks', sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Create default admin user for orphaned tasks
    # Note: In production, handle existing tasks appropriately

    # Make user_id NOT NULL after populating
    op.alter_column('tasks', 'user_id', nullable=False)

    # Add foreign key and indexes
    op.create_foreign_key('fk_tasks_user_id', 'tasks', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', 'created_at'])

def downgrade() -> None:
    op.drop_index('idx_tasks_user_created', 'tasks')
    op.drop_index('idx_tasks_user_id', 'tasks')
    op.drop_constraint('fk_tasks_user_id', 'tasks', type_='foreignkey')
    op.drop_column('tasks', 'user_id')
    op.drop_index('idx_users_username', 'users')
    op.drop_index('idx_users_email', 'users')
    op.drop_table('users')
```

---

## Query Patterns

### User Queries

```python
# Get user by email (for login)
async def get_user_by_email(email: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(
        select(User).where(func.lower(User.email) == email.lower())
    )
    return result.scalar_one_or_none()

# Get user by username
async def get_user_by_username(username: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.username == username)
    )
    return result.scalar_one_or_none()

# Get user by ID (from JWT token)
async def get_user_by_id(user_id: UUID, db: AsyncSession) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()
```

### Task Queries (Updated with User Filtering)

```python
# Get all tasks for authenticated user
async def get_user_tasks(user_id: UUID, db: AsyncSession) -> List[Task]:
    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()

# Get specific task (with ownership check)
async def get_user_task(task_id: UUID, user_id: UUID, db: AsyncSession) -> Optional[Task]:
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id, Task.user_id == user_id)
    )
    return result.scalar_one_or_none()

# Create task (automatically set user_id from token)
async def create_task(task_data: TaskCreate, user_id: UUID, db: AsyncSession) -> Task:
    task = Task(**task_data.dict(), user_id=user_id)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task
```

---

## Data Integrity Rules

1. **User Uniqueness**: Email and username must be unique across all users
2. **Password Security**: Passwords must never be stored in plaintext, only bcrypt hashes
3. **Task Ownership**: Every task must belong to exactly one user (user_id NOT NULL)
4. **Cascade Deletion**: Deleting a user deletes all their tasks
5. **Referential Integrity**: user_id in tasks must reference valid users.id
6. **Timestamp Consistency**: created_at and updated_at must be UTC timestamps
7. **Email Case-Insensitivity**: Email lookups are case-insensitive (alice@example.com == ALICE@example.com)
8. **Username Case-Sensitivity**: Username lookups are case-sensitive (alice_dev ≠ Alice_Dev)

---

**Status**: ✅ Data model design complete and ready for implementation
**Next Step**: Generate API contracts in contracts/ directory
