"""
Task model definition using SQLModel.

This module defines the Task entity for the todo application with
validation rules, database constraints, and automatic timestamp management.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item.

    Attributes:
        id: Unique identifier (UUID, auto-generated)
        user_id: Owner of this task (required, foreign key to users.id)
        title: Task title (required, 1-200 characters)
        description: Optional task description (0-2000 characters)
        completed: Completion status (defaults to False)
        created_at: Task creation timestamp (UTC, auto-generated)
        updated_at: Last modification timestamp (UTC, auto-generated and updated on changes)
        user: Relationship to the User who owns this task

    Database Table: tasks

    Indexes:
        - Primary key on id (automatic)
        - Index on user_id (for filtering user's tasks)
        - Composite index on (user_id, created_at) for efficient sorting

    Validation:
        - Title: 1-200 characters, cannot be empty or whitespace-only
        - Description: 0-2000 characters, optional (can be NULL)
        - Completed: Boolean, defaults to False
        - User ID: Must reference an existing user, cascade delete on user deletion
        - Timestamps: Automatically managed (created_at on insert, updated_at on insert/update)
    """

    __tablename__ = "tasks"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the task"
    )

    # Foreign Key
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner of this task (foreign key to users.id)"
    )

    # Required Fields
    title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
        description="Task title (required, 1-200 characters)"
    )

    # Optional Fields
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        nullable=True,
        description="Optional task description (0-2000 characters)"
    )

    # Status Field
    completed: bool = Field(
        default=False,
        nullable=False,
        description="Completion status (True = completed, False = incomplete)"
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Task creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last modification timestamp (UTC)"
    )

    # Relationships
    user: "User" = Relationship(back_populates="tasks")

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API endpoints",
                "completed": False,
                "created_at": "2026-01-11T10:35:00Z",
                "updated_at": "2026-01-11T10:35:00Z"
            }
        }

    def __repr__(self) -> str:
        """String representation of Task for debugging."""
        return f"<Task(id={self.id}, title='{self.title[:30]}...', completed={self.completed})>"
