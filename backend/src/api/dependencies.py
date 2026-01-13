"""
API dependency injection module.

This module provides FastAPI dependencies for API routes:
- Database session management
- Authentication and authorization
- Future: Rate limiting, pagination, etc.

All API routes should import dependencies from this module rather than
directly from core modules to maintain proper layer separation.
"""

from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..core.database import get_db as _get_db
from ..core.security import extract_user_id_from_token
from ..models.user import User


# HTTP Bearer token scheme for JWT authentication
security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database session management.

    Provides an async database session with automatic cleanup.
    Use this as a dependency in FastAPI route handlers.

    Usage:
        @router.get("/tasks")
        async def get_tasks(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass

    Yields:
        AsyncSession: Database session for the request

    Note:
        - Session is automatically closed after request completes
        - Exceptions are propagated to FastAPI error handlers
        - Connection is returned to pool after session closes
        - Rollback is performed automatically on exceptions
    """
    async for session in _get_db():
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency for authentication and user extraction.

    Extracts JWT token from Authorization header, verifies it, and returns
    the authenticated user. Raises HTTPException if authentication fails.

    Usage:
        @router.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            # current_user is the authenticated User object
            return {"user_id": current_user.id}

    Args:
        credentials: HTTP Bearer token credentials from Authorization header
        db: Database session dependency

    Returns:
        User: Authenticated user object

    Raises:
        HTTPException 401: If token is missing, invalid, expired, or user not found

    Note:
        - Token must be provided in Authorization header as "Bearer <token>"
        - Token is verified using JWT_SECRET from environment
        - User must exist in database (not deleted)
    """
    # Extract token from credentials
    token = credentials.credentials

    # Verify token and extract user_id
    user_id = extract_user_id_from_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query database for user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Future dependencies can be added here:
# - require_admin: Authorization dependency
# - rate_limiter: Rate limiting dependency
# - pagination: Pagination parameters dependency
