"""
Conversation Service

This module provides business logic for conversation management operations including
creating, retrieving, updating, and deleting conversations with proper user isolation
and validation.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from ..models.conversation import Conversation, ConversationCreate
from ..models.message import Message


class ConversationService:
    """
    Service class for conversation management operations.

    Provides methods for creating, retrieving, updating, and deleting conversations
    with proper user isolation and validation.
    """

    def __init__(self, db_session: AsyncSession):
        """
        Initialize the conversation service.

        Args:
            db_session: Async database session for database operations
        """
        self.db_session = db_session

    async def create_conversation(self, user_id: str, title: Optional[str] = None) -> Conversation:
        """
        Create a new conversation for the specified user.

        Args:
            user_id: ID of the user creating the conversation
            title: Optional title for the conversation (auto-generated if not provided)

        Returns:
            Created Conversation object

        Raises:
            SQLAlchemyError: If database operation fails
        """
        try:
            # Convert user_id string to UUID for comparison
            from uuid import UUID as PyUUID
            from ..models.user import User
            user_uuid = PyUUID(user_id)

            # First, verify that the user exists before creating a conversation
            user_exists_statement = select(User).where(User.id == user_uuid)
            user_result = await self.db_session.execute(user_exists_statement)
            user = user_result.scalar_one_or_none()

            if not user:
                raise ValueError(f"User with ID {user_id} does not exist")

            # Generate default title if not provided
            if not title:
                title = f"Conversation {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"

            # Create new conversation instance
            conversation = Conversation(
                user_id=user_uuid,  # Use the UUID object
                title=title
            )

            # Add to database session
            self.db_session.add(conversation)

            # Commit transaction
            await self.db_session.commit()

            # Refresh to get auto-generated fields
            await self.db_session.refresh(conversation)

            return conversation
        except ValueError as ve:
            # Re-raise ValueError for invalid user_id
            if "does not exist" in str(ve):
                raise ve
            # Handle UUID conversion errors
            raise ValueError(f"Invalid UUID format for user_id: {user_id}")

    async def get_conversation_by_id(self, conversation_id: UUID, user_id: str) -> Optional[Conversation]:
        """
        Retrieve a conversation by its ID for the specified user.

        Args:
            conversation_id: ID of the conversation to retrieve
            user_id: ID of the user requesting the conversation (for isolation check)

        Returns:
            Conversation object if found and belongs to user, None otherwise
        """
        try:
            # Convert user_id string to UUID for comparison
            from uuid import UUID as PyUUID
            from ..models.user import User
            user_uuid = PyUUID(user_id)

            # First, verify that the user exists to prevent 500 errors
            user_exists_statement = select(User).where(User.id == user_uuid)
            user_result = await self.db_session.execute(user_exists_statement)
            user = user_result.scalar_one_or_none()

            if not user:
                print(f"User with ID {user_id} does not exist, returning None")
                return None

            # Query for conversation with matching ID and user ID
            statement = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_uuid
            )
            result = await self.db_session.execute(statement)
            return result.scalar_one_or_none()
        except ValueError:
            # Invalid UUID format
            print(f"Invalid UUID format for user_id: {user_id}")
            return None
        except SQLAlchemyError as e:
            # Log the error and return None if there's a database issue
            print(f"Database error when fetching conversation by ID: {str(e)}")
            return None

    async def get_user_conversations(
        self,
        user_id: str,
        completed: Optional[bool] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Conversation]:
        """
        Retrieve all conversations for the specified user.

        Args:
            user_id: ID of the user whose conversations to retrieve
            completed: Filter by completion status if provided (not applicable to conversations, kept for consistency)
            limit: Maximum number of conversations to return
            offset: Number of conversations to skip

        Returns:
            List of Conversation objects belonging to the user
        """
        try:
            # Convert user_id string to UUID for comparison
            from uuid import UUID as PyUUID
            from ..models.user import User
            user_uuid = PyUUID(user_id)

            # First, verify that the user exists to prevent 500 errors
            from sqlmodel import select
            user_exists_statement = select(User).where(User.id == user_uuid)
            user_result = await self.db_session.execute(user_exists_statement)
            user = user_result.scalar_one_or_none()

            if not user:
                print(f"User with ID {user_id} does not exist, returning empty conversation list")
                return []

            # Query for user's conversations with pagination
            result = await self.db_session.execute(
                select(Conversation)
                .where(Conversation.user_id == user_uuid)
                .order_by(Conversation.created_at.desc())
                .offset(offset)
                .limit(limit)
            )  # ✅ SAFE for empty results
            return result.scalars().all()
        except ValueError:
            # Invalid UUID format
            print(f"Invalid UUID format for user_id: {user_id}")
            return []
        except SQLAlchemyError as e:
            # Log the error and return an empty list if there's a database issue
            print(f"Database error when fetching user conversations: {str(e)}")
            return []

    async def update_conversation_title(self, conversation_id: UUID, user_id: str, new_title: str) -> Optional[Conversation]:
        """
        Update the title of a conversation.

        Args:
            conversation_id: ID of the conversation to update
            user_id: ID of the user requesting the update (for isolation check)
            new_title: New title for the conversation

        Returns:
            Updated Conversation object if successful, None if not found or unauthorized
        """
        try:
            # Convert user_id string to UUID for comparison
            from uuid import UUID as PyUUID
            user_uuid = PyUUID(user_id)

            # Get the conversation that belongs to the user
            conversation = await self.get_conversation_by_id(conversation_id, user_id)
            if not conversation:
                return None

            # Update the title
            conversation.title = new_title
            conversation.updated_at = datetime.utcnow()

            # Commit changes
            await self.db_session.commit()
            await self.db_session.refresh(conversation)

            return conversation
        except ValueError:
            # Invalid UUID format
            print(f"Invalid UUID format for user_id: {user_id}")
            return None
        except SQLAlchemyError as e:
            # Log the error and return None if there's a database issue
            print(f"Database error when updating conversation title: {str(e)}")
            return None

    async def delete_conversation(self, conversation_id: UUID, user_id: str) -> bool:
        """
        Delete a conversation.

        Args:
            conversation_id: ID of the conversation to delete
            user_id: ID of the user requesting the deletion (for isolation check)

        Returns:
            True if deletion was successful, False if conversation not found or unauthorized
        """
        try:
            # Get the conversation that belongs to the user
            conversation = await self.get_conversation_by_id(conversation_id, user_id)
            if not conversation:
                return False

            # Delete the conversation
            await self.db_session.delete(conversation)
            await self.db_session.commit()

            return True
        except SQLAlchemyError as e:
            # Log the error and return False if there's a database issue
            print(f"Database error when deleting conversation: {str(e)}")
            return False

    async def cleanup_expired_conversations(self) -> int:
        """
        Remove expired conversations (older than 30 days).

        Returns:
            Number of conversations deleted
        """
        # Find conversations that have expired
        statement = select(Conversation).where(Conversation.expires_at < datetime.utcnow())
        result = await self.db_session.execute(statement)
        expired_conversations = result.scalars().all()

        # Delete expired conversations
        deleted_count = 0
        for conversation in expired_conversations:
            await self.db_session.delete(conversation)
            deleted_count += 1

        # Commit the deletions
        await self.db_session.commit()

        return deleted_count

    async def get_conversation_messages(
        self,
        conversation_id: UUID,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        """
        Retrieve messages for a specific conversation.

        Args:
            conversation_id: ID of the conversation to get messages for
            user_id: ID of the user requesting messages (for isolation check)
            limit: Maximum number of messages to return
            offset: Number of messages to skip

        Returns:
            List of Message objects from the conversation if user has access
        """
        try:
            # Verify user has access to this conversation
            conversation = await self.get_conversation_by_id(conversation_id, user_id)
            if not conversation:
                return []

            # Query for messages in this conversation
            # Ensure we're using the UUID object directly for comparison
            statement = select(Message).where(Message.conversation_id == conversation_id)
            statement = statement.order_by(Message.created_at.desc())
            statement = statement.offset(offset).limit(limit)

            result = await self.db_session.execute(statement)
            return result.scalars().all()
        except SQLAlchemyError as e:
            # Log the error and return an empty list if there's a database issue
            print(f"Database error when fetching conversation messages: {str(e)}")
            return []

    async def count_messages_for_conversation(self, conversation_id: UUID, user_id: str) -> int:
        """
        Count the number of messages in a specific conversation.

        Args:
            conversation_id: ID of the conversation to count messages for
            user_id: ID of the user requesting the count (for isolation check)

        Returns:
            Number of messages in the conversation if user has access
        """
        try:
            # Verify user has access to this conversation
            conversation = await self.get_conversation_by_id(conversation_id, user_id)
            if not conversation:
                return 0

            # Count messages in this conversation
            statement = select(func.count(Message.id)).where(Message.conversation_id == conversation_id)
            result = await self.db_session.execute(statement)
            count = result.scalar_one()
            return count
        except SQLAlchemyError as e:
            # Log the error and return 0 if there's a database issue
            print(f"Database error when counting conversation messages: {str(e)}")
            return 0

    async def count_user_conversations(self, user_id: str) -> int:
        """
        Count the number of conversations for a user.

        Args:
            user_id: ID of the user to count conversations for

        Returns:
            Number of conversations belonging to the user
        """
        try:
            # Convert user_id string to UUID for comparison
            from uuid import UUID as PyUUID
            from ..models.user import User
            user_uuid = PyUUID(user_id)

            # First, verify that the user exists to prevent 500 errors
            user_exists_statement = select(User).where(User.id == user_uuid)
            user_result = await self.db_session.execute(user_exists_statement)
            user = user_result.scalar_one_or_none()

            if not user:
                print(f"User with ID {user_id} does not exist, returning count 0")
                return 0

            statement = select(func.count(Conversation.id)).where(Conversation.user_id == user_uuid)
            result = await self.db_session.execute(statement)
            count = result.scalar_one()
            return count
        except ValueError:
            # Invalid UUID format
            print(f"Invalid UUID format for user_id: {user_id}")
            return 0
        except SQLAlchemyError as e:
            # Log the error and return 0 if there's a database issue
            print(f"Database error when counting user conversations: {str(e)}")
            return 0