"""
Conversation model definition using SQLModel.

This module defines the Conversation entity for the AI agent chat feature with
proper validation rules, database constraints, and relationships to ensure
data integrity and user isolation.
"""

from datetime import datetime, timedelta
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User
    from .message import Message


class ConversationBase(SQLModel):
    """Base model for Conversation with common fields."""

    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Foreign key linking to the user who owns this conversation"
    )
    title: str = Field(
        default="New Conversation",
        max_length=200,
        description="Auto-generated title based on first message or topic"
    )


class Conversation(ConversationBase, table=True):
    """
    Conversation entity representing a user's chat session with the AI agent.

    Attributes:
        id: Unique identifier for the conversation (UUID, auto-generated)
        user_id: Foreign key linking to the user who owns this conversation
        title: Auto-generated title based on first message or topic (max 200 chars)
        created_at: Timestamp when the conversation was created (auto-populated)
        updated_at: Timestamp when the conversation was last updated (auto-populated)
        expires_at: Timestamp when the conversation should be archived/purged (auto-calculated)

    Database Table: conversations
    Indexes:
        - Primary key on id (automatic)
        - Index on user_id (for filtering user's conversations)
        - Index on expires_at (for efficient cleanup of expired conversations)
        - Composite index on (user_id, created_at) for chronological ordering

    Validation Rules:
        - user_id must reference a valid user in the system (foreign key constraint)
        - title must be 1-200 characters (with default value)
        - expires_at is automatically set to 30 days after creation
    """

    __tablename__ = "conversations"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the conversation"
    )

    title: str = Field(
        default="New Conversation",
        max_length=200,
        description="Auto-generated title based on first message or topic"
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Conversation creation timestamp (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Conversation last update timestamp (UTC)"
    )

    expires_at: datetime = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(days=30),
        nullable=False,
        description="Expiration timestamp for conversation retention (30 days)"
    )

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    user: "User" = Relationship(back_populates="conversations")

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Grocery Shopping Tasks",
                "created_at": "2026-01-20T10:35:00Z",
                "updated_at": "2026-01-20T10:35:00Z",
                "expires_at": "2026-02-19T10:35:00Z"
            }
        }

    def __repr__(self) -> str:
        """String representation of Conversation for debugging."""
        return f"<Conversation(id={self.id}, user_id='{self.user_id}', title='{self.title[:30]}...')>"


class ConversationCreate(ConversationBase):
    """Model for creating new conversations."""
    pass


class ConversationRead(ConversationBase):
    """Model for reading conversation data without sensitive internal fields."""

    id: UUID
    created_at: datetime
    updated_at: datetime
    expires_at: datetime