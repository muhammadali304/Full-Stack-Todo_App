"""
Authentication Utilities for MCP Task Tools

This module provides authentication and authorization utilities for MCP task tools,
leveraging the existing authentication infrastructure.
"""

from typing import Optional
from functools import wraps
from fastapi import HTTPException, status
from fastapi.security.http import HTTPBearer
import jwt
from jwt import InvalidTokenError

from ..models.user import User
from ..api.dependencies import get_current_user_from_token
from ..core.config import settings


class MCPAuthenticationManager:
    """
    Authentication manager for MCP tools that leverages existing authentication infrastructure.
    """

    def __init__(self):
        """Initialize the authentication manager."""
        self.security = HTTPBearer(auto_error=True)

    async def verify_user_from_token(self, token: str) -> User:
        """
        Verify a user from a JWT token using existing authentication infrastructure.

        Args:
            token: JWT token to verify

        Returns:
            Authenticated user

        Raises:
            HTTPException: If token is invalid or user not found
        """
        try:
            # Use the existing dependency function to verify the token
            user = await get_current_user_from_token(token.credentials)
            return user
        except InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    async def validate_user_owns_task(self, user: User, task_id: str) -> bool:
        """
        Validate that the user owns a specific task.

        Args:
            user: Authenticated user
            task_id: ID of the task to check

        Returns:
            True if user owns the task, False otherwise
        """
        from sqlmodel import select
        from ..models.task import Task
        from ..core.database import get_db

        # Get database session
        async with get_db() as session:
            # Query for the task with the given ID that belongs to the user
            statement = select(Task).where(Task.id == task_id, Task.user_id == user.id)
            result = await session.execute(statement)
            task = result.scalar_one_or_none()

            return task is not None


# Decorator for authenticating MCP tool calls
def require_authentication(func):
    """
    Decorator to require authentication for MCP tool functions.

    This decorator ensures that the calling function has a valid user context.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # In the MCP context, we'd extract the token from the request context
        # For now, this serves as a placeholder for the actual implementation
        # that would extract the token and validate the user

        # Placeholder: Add authentication logic here
        # This would normally extract the token from the MCP request context
        # and validate it using the authentication manager

        return await func(*args, **kwargs)
    return wrapper


# Utility function to extract user from request context
async def get_authenticated_user_from_context(context) -> Optional[User]:
    """
    Extract the authenticated user from the MCP request context.

    Args:
        context: MCP request context containing authentication info

    Returns:
        Authenticated user or None if not authenticated
    """
    # In a real MCP implementation, this would extract the token from the context
    # and use the authentication manager to validate it
    # This is a placeholder implementation

    # Placeholder: Extract token from context and validate
    # token = context.get_auth_token()
    # auth_manager = MCPAuthenticationManager()
    # return await auth_manager.verify_user_from_token(token)

    # For now, returning None as a placeholder
    return None


# Singleton instance for use across tools
auth_manager = MCPAuthenticationManager()


__all__ = [
    "MCPAuthenticationManager",
    "require_authentication",
    "get_authenticated_user_from_context",
    "auth_manager"
]