"""
Chat API Routes

This module defines the API endpoints for the AI agent chat functionality,
enabling users to manage their todos through natural language processing.
"""

from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from ...models.message import Message
from ...models.conversation import Conversation
from ...services.openai_agent import OpenAIAgentService
from ...services.conversation_service import ConversationService
from ...api.dependencies import get_db, get_current_user
from ...models.user import User


# Initialize router for chat endpoints
router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    responses={401: {"description": "Unauthorized"}}
)


@router.post(
    "/{user_id}",
    summary="Process natural language chat request",
    description="Process a natural language request from a user to manage their todos via the AI agent",
    response_description="Response from the AI agent with tool call results if applicable"
)
async def process_chat_request(
    user_id: str,
    message: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Process a natural language chat request from a user.

    This endpoint allows authenticated users to interact with the AI agent using
    natural language to manage their todo tasks. The AI agent processes the request
    and may invoke MCP tools as needed to perform task operations.

    Args:
        user_id: The ID of the user making the request (must match authenticated user)
        message: Dictionary containing the user's message with 'content' field
        current_user: The authenticated user (from JWT token via dependencies)
        db: Async database session

    Returns:
        Dictionary containing:
        - response: The AI agent's response to the user
        - conversation_id: ID of the conversation for context tracking
        - tool_calls: List of tools called during processing (if any)
        - tool_call_results: Results from the tool calls (if any)

    Raises:
        HTTPException 401: If user is not authenticated
        HTTPException 403: If user tries to access another user's chat endpoint
        HTTPException 400: If request is malformed
        HTTPException 500: If there's an internal server error during processing
    """
    # Verify that the user_id in the path matches the authenticated user
    # Convert the path parameter to UUID for comparison
    try:
        from uuid import UUID
        path_user_id = UUID(user_id)

        # Debug logging to help troubleshoot mismatches
        print(f"[DEBUG] Comparing user IDs - Path: {path_user_id} (type: {type(path_user_id)}), Authenticated: {current_user.id} (type: {type(current_user.id)})")

        if current_user.id != path_user_id:
            print(f"[AUTH] User ID mismatch - Path: {path_user_id}, Authenticated: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own chat endpoint"
            )
        else:
            print(f"[AUTH] User ID match - Both are: {current_user.id}")
    except ValueError:
        # If user_id is not a valid UUID format
        print(f"[AUTH] Invalid UUID format in path: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    # Extract message content from request
    message_content = message.get("content")
    if not message_content or not isinstance(message_content, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content is required and must be a string"
        )

    # Extract optional conversation_id from request
    conversation_id_str = message.get("conversation_id")
    conversation_id = None
    if conversation_id_str:
        try:
            conversation_id = UUID(conversation_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation_id format"
            )

    try:
        # Initialize the OpenAI agent service
        agent_service = OpenAIAgentService(db)

        # Process the chat request with the agent
        result = await agent_service.process_chat_request(
            user_id=str(current_user.id),  # Convert to string for service method
            conversation_id=conversation_id,
            message_content=message_content
        )

        return result

    except ValueError as e:
        # Handle value errors (e.g., invalid input)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handle any other errors during processing
        print(f"Error processing chat request: {str(e)}")  # Log error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )


@router.get(
    "/{user_id}/conversations",
    summary="List user's conversations",
    description="Retrieve a list of the authenticated user's chat conversations",
    response_description="List of user's conversations with metadata"
)
async def list_user_conversations(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List all conversations for the authenticated user.

    This endpoint returns a paginated list of conversations belonging to the user,
    allowing them to resume previous chats or browse their conversation history.

    Args:
        user_id: The ID of the user requesting conversations (must match authenticated user)
        current_user: The authenticated user (from JWT token via dependencies)
        db: Async database session
        limit: Maximum number of conversations to return (default: 10, max: 100)
        offset: Number of conversations to skip (for pagination)

    Returns:
        Dictionary containing:
        - conversations: List of conversation objects with id, title, timestamps
        - total_count: Total number of conversations for the user
        - limit: Number of conversations returned
        - offset: Number of conversations skipped

    Raises:
        HTTPException 401: If user is not authenticated
        HTTPException 403: If user tries to access another user's conversations
        HTTPException 400: If limit or offset parameters are invalid
    """
    # Verify that the user_id in the path matches the authenticated user
    # Convert the path parameter to UUID for comparison
    try:
        from uuid import UUID
        path_user_id = UUID(user_id)

        # Debug logging to help troubleshoot mismatches
        print(f"[DEBUG] Comparing user IDs - Path: {path_user_id} (type: {type(path_user_id)}), Authenticated: {current_user.id} (type: {type(current_user.id)})")

        if current_user.id != path_user_id:
            print(f"[AUTH] User ID mismatch - Path: {path_user_id}, Authenticated: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own conversations"
            )
        else:
            print(f"[AUTH] User ID match - Both are: {current_user.id}")
    except ValueError:
        # If user_id is not a valid UUID format
        print(f"[AUTH] Invalid UUID format in path: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    # Validate parameters
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100"
        )

    if offset < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offset must be non-negative"
        )

    try:
        # Initialize conversation service
        conversation_service = ConversationService(db)

        # Get user's conversations with pagination
        conversations = await conversation_service.get_user_conversations(
            user_id=str(current_user.id),  # Convert to string for service method
            limit=limit,
            offset=offset
        )

        # Count total conversations for pagination info
        total_count = await conversation_service.count_user_conversations(str(current_user.id))  # Convert to string for service method

        return {
            "conversations": [
                {
                    "id": str(conv.id),
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "expires_at": conv.expires_at.isoformat()
                } for conv in conversations
            ],
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        # Handle any errors during retrieval
        print(f"Error retrieving conversations: {str(e)}")  # Log error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving conversations"
        )


@router.get(
    "/{user_id}/conversations/{conversation_id}",
    summary="Get conversation messages",
    description="Retrieve all messages in a specific conversation",
    response_description="List of messages in the conversation"
)
async def get_conversation_messages(
    user_id: str,
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Get all messages in a specific conversation.

    This endpoint returns the message history for a particular conversation,
    allowing users to review the chat history or resume where they left off.

    Args:
        user_id: The ID of the user requesting messages (must match authenticated user)
        conversation_id: The ID of the conversation to retrieve messages from
        current_user: The authenticated user (from JWT token via dependencies)
        db: Async database session
        limit: Maximum number of messages to return (default: 50, max: 100)
        offset: Number of messages to skip (for pagination)

    Returns:
        Dictionary containing:
        - messages: List of message objects with role, content, timestamps, tool calls
        - total_count: Total number of messages in the conversation
        - limit: Number of messages returned
        - offset: Number of messages skipped

    Raises:
        HTTPException 401: If user is not authenticated
        HTTPException 403: If user tries to access another user's conversation
        HTTPException 404: If conversation doesn't exist
        HTTPException 400: If parameters are invalid
    """
    # Verify that the user_id in the path matches the authenticated user
    # Convert the path parameter to UUID for comparison
    try:
        from uuid import UUID
        path_user_id = UUID(user_id)

        # Debug logging to help troubleshoot mismatches
        print(f"[DEBUG] Comparing user IDs - Path: {path_user_id} (type: {type(path_user_id)}), Authenticated: {current_user.id} (type: {type(current_user.id)})")

        if current_user.id != path_user_id:
            print(f"[AUTH] User ID mismatch - Path: {path_user_id}, Authenticated: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own conversations"
            )
        else:
            print(f"[AUTH] User ID match - Both are: {current_user.id}")
    except ValueError:
        # If user_id is not a valid UUID format
        print(f"[AUTH] Invalid UUID format in path: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    # Validate parameters
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100"
        )

    if offset < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offset must be non-negative"
        )

    try:
        # Initialize conversation service
        conversation_service = ConversationService(db)

        # Verify user has access to this conversation
        conversation = await conversation_service.get_conversation_by_id(conversation_id, current_user.id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found"
            )

        # Get messages for this conversation
        messages = await conversation_service.get_conversation_messages(
            conversation_id=conversation_id,
            user_id=str(current_user.id),  # Convert to string for service method
            limit=limit,
            offset=offset
        )

        # Count total messages for pagination info
        total_count = await conversation_service.count_messages_for_conversation(conversation_id, str(current_user.id))  # Convert to string for service method

        return {
            "messages": [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                    "tool_calls": msg.tool_calls,
                    "tool_call_results": msg.tool_call_results
                } for msg in messages
            ],
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors during retrieval
        print(f"Error retrieving conversation messages: {str(e)}")  # Log error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving conversation messages"
        )


@router.delete(
    "/{user_id}/conversations/{conversation_id}",
    summary="Delete a conversation",
    description="Remove a conversation and all its messages",
    response_description="Confirmation of deletion"
)
async def delete_conversation(
    user_id: str,
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete a conversation and all its messages.

    This endpoint allows users to permanently delete a conversation and its
    associated message history.

    Args:
        user_id: The ID of the user requesting deletion (must match authenticated user)
        conversation_id: The ID of the conversation to delete
        current_user: The authenticated user (from JWT token via dependencies)
        db: Async database session

    Returns:
        Dictionary with confirmation message

    Raises:
        HTTPException 401: If user is not authenticated
        HTTPException 403: If user tries to delete another user's conversation
        HTTPException 404: If conversation doesn't exist
    """
    # Verify that the user_id in the path matches the authenticated user
    # Convert the path parameter to UUID for comparison
    try:
        from uuid import UUID
        path_user_id = UUID(user_id)

        # Debug logging to help troubleshoot mismatches
        print(f"[DEBUG] Comparing user IDs - Path: {path_user_id} (type: {type(path_user_id)}), Authenticated: {current_user.id} (type: {type(current_user.id)})")

        if current_user.id != path_user_id:
            print(f"[AUTH] User ID mismatch - Path: {path_user_id}, Authenticated: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own conversations"
            )
        else:
            print(f"[AUTH] User ID match - Both are: {current_user.id}")
    except ValueError:
        # If user_id is not a valid UUID format
        print(f"[AUTH] Invalid UUID format in path: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    try:
        # Initialize conversation service
        conversation_service = ConversationService(db)

        # Attempt to delete the conversation
        success = await conversation_service.delete_conversation(conversation_id, str(current_user.id))  # Convert to string for service method

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found or does not belong to user"
            )

        return {
            "message": f"Conversation {conversation_id} deleted successfully"
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors during deletion
        print(f"Error deleting conversation: {str(e)}")  # Log error for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the conversation"
        )


# Health check endpoint for the chat functionality
@router.get(
    "/health",
    summary="Chat service health check",
    description="Check the health status of the chat service",
    response_description="Health status of the chat service"
)
async def chat_health_check() -> Dict[str, Any]:
    """
    Health check endpoint for the chat service.

    This endpoint allows monitoring systems to verify that the chat service
    is operational and able to process requests.

    Returns:
        Dictionary with health status information
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-agent-chat",
        "version": "1.0.0"
    }