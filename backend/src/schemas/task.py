"""
Pydantic schemas for Task API request and response validation.

This module defines the data transfer objects (DTOs) for the Task API:
- TaskCreate: Schema for creating new tasks
- TaskUpdate: Schema for updating existing tasks (partial updates)
- TaskResponse: Schema for task responses

All schemas include validation rules to ensure data integrity.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Attributes:
        title: Task title (required, 1-200 characters, cannot be empty or whitespace-only)
        description: Optional task description (0-2000 characters)
        completed: Optional completion status (defaults to False)

    Validation:
        - Title must not be empty or contain only whitespace
        - Title must be between 1 and 200 characters
        - Description must not exceed 2000 characters if provided

    Example:
        {
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation for the API endpoints",
            "completed": false
        }
    """

    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task description (0-2000 characters)"
    )

    completed: Optional[bool] = Field(
        default=False,
        description="Optional completion status (defaults to False)"
    )

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """
        Validate that title is not empty or whitespace-only.

        Args:
            v: Title string to validate

        Returns:
            str: Validated title string

        Raises:
            ValueError: If title is empty or contains only whitespace
        """
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API endpoints"
            }
        }


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task (partial updates).

    Attributes:
        title: Optional task title (1-200 characters if provided)
        description: Optional task description (0-2000 characters if provided)

    Validation:
        - If title is provided, it must not be empty or whitespace-only
        - If title is provided, it must be between 1 and 200 characters
        - If description is provided, it must not exceed 2000 characters

    Note:
        - All fields are optional to support partial updates (PATCH semantics)
        - Only provided fields will be updated in the database
        - Omitted fields will remain unchanged

    Example:
        {
            "title": "Updated task title"
        }
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Optional task title (1-200 characters if provided)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task description (0-2000 characters if provided)"
    )

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate that title is not empty or whitespace-only if provided.

        Args:
            v: Title string to validate (can be None)

        Returns:
            Optional[str]: Validated title string or None

        Raises:
            ValueError: If title is provided but empty or contains only whitespace
        """
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty or whitespace-only')
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Updated task title",
                "description": "Updated task description"
            }
        }


class TaskResponse(BaseModel):
    """
    Schema for task responses.

    Attributes:
        id: Unique task identifier (UUID)
        title: Task title
        description: Optional task description
        completed: Completion status (true = completed, false = incomplete)
        user_id: User identifier for future multi-user support (currently None)
        created_at: Task creation timestamp (UTC)
        updated_at: Last modification timestamp (UTC)

    Note:
        - This schema is used for all API responses that return task data
        - Timestamps are returned in ISO 8601 format
        - from_attributes=True enables ORM mode for SQLModel compatibility

    Example:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation for the API endpoints",
            "completed": false,
            "user_id": null,
            "created_at": "2026-01-11T10:30:00Z",
            "updated_at": "2026-01-11T10:30:00Z"
        }
    """

    id: UUID = Field(description="Unique task identifier")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(description="Optional task description")
    completed: bool = Field(description="Completion status")
    user_id: Optional[UUID] = Field(description="User identifier (future multi-user support)")
    created_at: datetime = Field(description="Task creation timestamp (UTC)")
    updated_at: datetime = Field(description="Last modification timestamp (UTC)")

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API endpoints",
                "completed": False,
                "user_id": None,
                "created_at": "2026-01-11T10:30:00Z",
                "updated_at": "2026-01-11T10:30:00Z"
            }
        }
