"""
Message model definition using SQLModel.

This module defines the Message entity for the AI agent chat feature with
proper validation rules, database constraints, and relationships to ensure
data integrity and proper conversation tracking.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .conversation import Conversation


class MessageBase(SQLModel):
    """Base model for Message with common fields."""

    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True,
        description="Foreign key linking to the conversation this message belongs to"
    )

    role: str = Field(
        regex=r"^(user|assistant)$",
        max_length=10,
        description="Role of the message sender (user or assistant)"
    )

    content: str = Field(
        nullable=False,
        description="The content of the message (text from user or agent response)"
    )


class Message(SQLModel, table=True):
    """
    Message entity representing a single message in a conversation.

    Attributes:
        id: Unique identifier for the message (UUID, auto-generated)
        conversation_id: Foreign key linking to the conversation this message belongs to
        role: Role of the message sender (user or assistant)
        content: The content of the message (text from user or agent response)
        created_at: Timestamp when the message was created (auto-populated)
        tool_calls: Optional JSON array of tool calls made during this message interaction
        tool_call_results: Optional JSON array of results from the tool calls

    Database Table: messages
    Indexes:
        - Primary key on id (automatic)
        - Index on conversation_id (for filtering messages by conversation)
        - Composite index on (conversation_id, created_at) for chronological ordering

    Validation Rules:
        - conversation_id must reference a valid conversation in the system (foreign key constraint)
        - role must be either 'user' or 'assistant'
        - content must be provided and not empty
        - tool_calls must be a valid JSON object/array if provided
        - tool_call_results must be a valid JSON object/array if provided
    """

    __tablename__ = "messages"

    # Primary Key
    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the message"
    )

    # Foreign Key
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True,
        description="Foreign key linking to the conversation this message belongs to"
    )

    # Optional JSON fields (FIXED)
    tool_calls: Optional[dict] = Field(
        default=None,
        description="JSON array of tool calls made during this message interaction",
        sa_type=JSON
    )

    tool_call_results: Optional[dict] = Field(
        default=None,
        description="JSON array of results from the tool calls",
        sa_type=JSON
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Message creation timestamp (UTC)"
    )

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    def __repr__(self) -> str:
        role_preview = self.role[:1].upper()
        content_preview = self.content[:30] + "..." if len(self.content) > 30 else self.content
        return f"<Message(id={self.id}, role={role_preview}, content='{content_preview}')>"


class MessageCreate(MessageBase):
    """Model for creating new messages."""
    pass


class MessageRead(MessageBase):
    """Model for reading message data without sensitive internal fields."""

    id: UUID
    created_at: datetime