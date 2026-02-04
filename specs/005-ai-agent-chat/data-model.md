# Data Model: AI Agent Chat Endpoint

**Feature**: 005-ai-agent-chat
**Date**: 2026-01-20

## Overview

This document defines the data models for the AI Agent Chat Endpoint feature, focusing on the entities required to support conversation persistence, message history, and integration with existing task management functionality.

## Entity Definitions

### Conversation Entity

**Purpose**: Represents a user's chat session with the AI agent, tracking the conversation context and metadata.

**Fields**:
- `id` (UUID/Integer): Primary key, unique identifier for the conversation
- `user_id` (String/UUID): Foreign key linking to the user who owns this conversation
- `title` (String): Auto-generated title based on the first message or topic (max 200 chars)
- `created_at` (DateTime): Timestamp when the conversation was created (auto-populated)
- `updated_at` (DateTime): Timestamp when the conversation was last updated (auto-populated)
- `expires_at` (DateTime): Timestamp when the conversation should be archived/purged (30-day retention)

**Validation Rules**:
- `user_id` must reference a valid user in the system
- `title` must be provided and not empty
- `expires_at` must be set to 30 days after creation

**Relationships**:
- Belongs to one User (via `user_id` foreign key)
- Has many Messages (via `conversation_id` foreign key in Message entity)
- Each user can have multiple conversations

### Message Entity

**Purpose**: Represents a single message in a conversation, capturing both user input and agent responses, including tool invocations.

**Fields**:
- `id` (UUID/Integer): Primary key, unique identifier for the message
- `conversation_id` (String/UUID): Foreign key linking to the conversation this message belongs to
- `role` (String): Role of the message sender (user or assistant)
- `content` (Text): The content of the message (text from user or agent response)
- `created_at` (DateTime): Timestamp when the message was created (auto-populated)
- `tool_calls` (JSON): Optional JSON array of tool calls made during this message interaction
- `tool_call_results` (JSON): Optional JSON array of results from the tool calls

**Validation Rules**:
- `conversation_id` must reference a valid conversation in the system
- `role` must be either "user" or "assistant"
- `content` must be provided and not empty
- `tool_calls` must be a valid JSON array if provided
- `tool_call_results` must be a valid JSON array if provided

**Relationships**:
- Belongs to one Conversation (via `conversation_id` foreign key)
- Each conversation can have multiple messages

## Integration with Existing Models

### Relationship with User Entity

The Conversation entity maintains a foreign key relationship with the existing User entity:

- `Conversation.user_id` → `User.id`
- This ensures user isolation and proper access controls
- Users can only access conversations where `user_id` matches their authenticated user ID

### Relationship with Task Entity

Messages may contain references to tasks through tool call parameters:

- Tool calls in `Message.tool_calls` may reference tasks from the existing Task entity
- The system ensures that tool calls only operate on tasks belonging to the conversation's owner

## State Transitions

### Conversation State Transitions

**Initial State**: New conversation is created when user initiates chat

**Transitions**:
1. **Active**: Conversation receives first message and becomes active
2. **Inactive**: Conversation has no activity for a period but still within retention window
3. **Expired**: Conversation reaches retention limit (30 days) and is marked for cleanup

## Indexes

**Required Indexes**:
- Index on `user_id` for efficient querying of user-specific conversations
- Index on `conversation_id` for efficient querying of messages within a conversation
- Composite index on `(user_id, created_at)` for chronological ordering of user's conversations
- Index on `expires_at` for efficient cleanup of expired conversations

## Constraints

**Data Integrity**:
- Foreign key constraint on `user_id` to ensure referential integrity with User entity
- Foreign key constraint on `conversation_id` to ensure referential integrity with Conversation entity
- Non-null constraints on required fields (`user_id`, `conversation_id`, `role`, `content`)
- Check constraint to ensure `role` is either "user" or "assistant"
- Check constraint to ensure `expires_at` is 30 days after `created_at`

**Business Logic**:
- Users can only access conversations where `user_id` matches their authenticated user ID
- Messages can only be added to conversations owned by the authenticated user
- Conversation history is limited to 1000 messages per conversation
- Conversations are automatically purged after 30 days of inactivity

## SQLModel Implementation

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
from pydantic import Json

class ConversationBase(SQLModel):
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=200)

class Conversation(ConversationBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=30))

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")

class ConversationRead(ConversationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    expires_at: datetime

class MessageBase(SQLModel):
    conversation_id: uuid.UUID = Field(foreign_key="conversation.id", index=True)
    role: str = Field(regex=r"^(user|assistant)$")
    content: str
    tool_calls: Optional[Json] = Field(default=None)
    tool_call_results: Optional[Json] = Field(default=None)

class Message(MessageBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Conversation = Relationship(back_populates="messages")

class MessageRead(MessageBase):
    id: uuid.UUID
    created_at: datetime
```

## Access Control Patterns

**Query Patterns**:
- Always filter conversations by `user_id` to enforce data isolation
- Always filter messages by joining with conversations and verifying user ownership
- Use parameterized queries to prevent injection attacks
- Validate user_id matches authenticated user before any operations

**Authorization Checks**:
- Before reading conversation: Verify conversation.user_id == authenticated_user_id
- Before adding message: Verify conversation.user_id == authenticated_user_id
- Before updating/deleting: Verify ownership constraints