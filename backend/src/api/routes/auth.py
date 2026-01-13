"""
Authentication API routes.

This module provides RESTful endpoints for user authentication:
- POST /api/auth/register: Register a new user account
- POST /api/auth/login: Login and receive JWT token
- POST /api/auth/logout: Logout (security logging only, stateless JWT)
- GET /api/auth/me: Get current authenticated user profile

All endpoints follow RFC 7807 Problem Details for error responses.
"""

import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import (
    hash_password,
    verify_password,
    create_access_token,
    validate_email,
    validate_username,
    check_email_unique,
    check_username_unique,
)
from ...models.user import User
from ...schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    UserProfile,
)
from ..dependencies import get_db, get_current_user


# Initialize logger for security events
logger = logging.getLogger(__name__)

# Initialize router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================================
# Registration Endpoint
# ============================================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Create a new user account with email, username, and password. "
        "Email and username must be unique. Password must meet strength requirements: "
        "minimum 8 characters, at least 1 uppercase, 1 lowercase, and 1 number."
    ),
    responses={
        201: {
            "description": "User registered successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "email": "alice@example.com",
                        "username": "alice_dev",
                        "created_at": "2026-01-11T10:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error (invalid format, duplicate email/username)",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Email already registered"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Failed to create user account"
                    }
                }
            }
        }
    }
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
) -> RegisterResponse:
    """
    Register a new user account.

    Validates:
    - Email format and uniqueness (case-insensitive)
    - Username format and uniqueness (case-sensitive)
    - Password strength requirements

    Returns user profile without password_hash.
    """
    try:
        # Validate email format
        if not validate_email(request.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Check email uniqueness (case-insensitive)
        if not await check_email_unique(request.email, db):
            logger.warning(f"Registration attempt with duplicate email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Validate username format
        if not validate_username(request.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be 3-30 characters and contain only letters, numbers, and underscores"
            )

        # Check username uniqueness (case-sensitive)
        if not await check_username_unique(request.username, db):
            logger.warning(f"Registration attempt with duplicate username: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password using bcrypt with 12 salt rounds
        password_hash = hash_password(request.password)

        # Create new user
        new_user = User(
            email=request.email,
            username=request.username,
            password_hash=password_hash,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Log successful registration
        logger.info(f"New user registered: {new_user.id} ({new_user.email})")

        # Return user profile (without password_hash)
        return RegisterResponse(
            id=new_user.id,
            email=new_user.email,
            username=new_user.username,
            created_at=new_user.created_at
        )

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except SQLAlchemyError as e:
        # Database error
        logger.error(f"Database error during registration: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )
    except Exception as e:
        # Unexpected error
        logger.error(f"Unexpected error during registration: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# ============================================================================
# Login Endpoint
# ============================================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and receive JWT token",
    description=(
        "Authenticate with email and password. Returns JWT access token "
        "valid for 24 hours and user profile."
    ),
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "user": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "alice@example.com",
                            "username": "alice_dev",
                            "created_at": "2026-01-11T10:30:00Z"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid email or password"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Login failed"
                    }
                }
            }
        }
    }
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> LoginResponse:
    """
    Authenticate user and generate JWT token.

    Validates:
    - Email exists in database (case-insensitive)
    - Password matches stored bcrypt hash

    Returns JWT token and user profile.
    """
    try:
        # Query user by email (case-insensitive)
        result = await db.execute(
            select(User).where(func.lower(User.email) == request.email.lower())
        )
        user = result.scalar_one_or_none()

        # Check if user exists
        if user is None:
            logger.warning(f"Login attempt with non-existent email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Failed login attempt for user: {user.id} ({user.email})")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate JWT access token
        access_token = create_access_token(
            user_id=user.id,
            email=user.email
        )

        # Log successful login
        logger.info(f"User logged in: {user.id} ({user.email})")

        # Return token and user profile
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserProfile(
                id=user.id,
                email=user.email,
                username=user.username,
                created_at=user.created_at
            )
        )

    except HTTPException:
        # Re-raise HTTP exceptions (authentication errors)
        raise
    except SQLAlchemyError as e:
        # Database error
        logger.error(f"Database error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
    except Exception as e:
        # Unexpected error
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


# ============================================================================
# Logout Endpoint
# ============================================================================

@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout (security logging only)",
    description=(
        "Logout endpoint for security logging. Since JWT tokens are stateless, "
        "the client must discard the token. This endpoint logs the logout event "
        "for security auditing purposes."
    ),
    responses={
        200: {
            "description": "Logout successful",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Successfully logged out"
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized (invalid or missing token)",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid or expired authentication token"
                    }
                }
            }
        }
    }
)
async def logout(
    current_user: User = Depends(get_current_user)
) -> LogoutResponse:
    """
    Logout endpoint with security logging.

    Note: JWT tokens are stateless and cannot be invalidated server-side.
    The client must discard the token. This endpoint exists for:
    1. Security logging (audit trail)
    2. Future token blacklisting implementation (if needed)

    Requires valid JWT token in Authorization header.
    """
    # Log logout event for security auditing
    logger.info(f"User logged out: {current_user.id} ({current_user.email})")

    return LogoutResponse(
        message="Successfully logged out"
    )


# ============================================================================
# Get Current User Profile Endpoint
# ============================================================================

@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description=(
        "Retrieve the profile of the currently authenticated user. "
        "Requires valid JWT token in Authorization header."
    ),
    responses={
        200: {
            "description": "User profile retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "email": "alice@example.com",
                        "username": "alice_dev",
                        "created_at": "2026-01-11T10:30:00Z"
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized (invalid or missing token)",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid or expired authentication token"
                    }
                }
            }
        }
    }
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> UserProfile:
    """
    Get current authenticated user's profile.

    Returns user profile without password_hash.
    Requires valid JWT token in Authorization header.
    """
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        created_at=current_user.created_at
    )
