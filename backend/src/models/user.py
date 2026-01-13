"""
User model definition using SQLModel.

This module defines the User entity for authentication and user management
with validation rules, database constraints, and automatic timestamp management.
"""

from datetime import datetime
from typing import List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .task import Task


class User(SQLModel, table=True):
    """
    User entity representing a registered user account.

    Attributes:
        id: Unique identifier (UUID, auto-generated)
        email: User's email address (unique, required, max 255 characters)
        username: Display name (unique, required, 3-30 characters, alphanumeric + underscores)
        password_hash: bcrypt hashed password (required, max 255 characters)
        created_at: Account creation timestamp (UTC, auto-generated)
        updated_at: Last modification timestamp (UTC, auto-updated)
        tasks: Relationship to user's tasks (one-to-many)

    Database Table: users

    Indexes:
        - Primary key on id (automatic)
        - Unique index on email (case-insensitive for lookups)
        - Unique index on username (case-sensitive)

    Validation:
        - Email: Must match email format, case-insensitive uniqueness
        - Username: 3-30 chars, alphanumeric + underscores only, case-sensitive uniqueness
        - Password: Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number (validated before hashing)
        - Password Hash: bcrypt format with 12 salt rounds
    """

    __tablename__ = "users"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the user"
    )

    # Required Fields
    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        nullable=False,
        description="User's email address (login identifier)"
    )

    username: str = Field(
        min_length=3,
        max_length=30,
        unique=True,
        index=True,
        nullable=False,
        description="Display name (alphanumeric + underscores only)"
    )

    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="bcrypt hashed password (never store plaintext)"
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Account creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last modification timestamp (UTC)"
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "alice@example.com",
                "username": "alice_dev",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIRSk4kRzi",
                "created_at": "2026-01-11T10:30:00Z",
                "updated_at": "2026-01-11T10:30:00Z"
            }
        }

    def __repr__(self) -> str:
        """String representation of User for debugging."""
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
