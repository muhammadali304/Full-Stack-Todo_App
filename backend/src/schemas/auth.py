"""
Authentication schemas for request/response validation.

This module defines Pydantic models for authentication endpoints:
- Registration (signup)
- Login (signin)
- Logout
- Current user profile (/me)
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ============================================================================
# Registration Schemas
# ============================================================================

class RegisterRequest(BaseModel):
    """
    Request schema for user registration.

    Validates:
    - Email format (using EmailStr)
    - Username format (3-30 chars, alphanumeric + underscores)
    - Password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    """

    email: EmailStr = Field(
        ...,
        description="User's email address (must be unique)",
        examples=["alice@example.com"]
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        description="Display name (3-30 chars, alphanumeric + underscores only)",
        examples=["alice_dev"]
    )

    password: str = Field(
        ...,
        min_length=8,
        description="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)",
        examples=["MyPassword123"]
    )

    @field_validator('username')
    @classmethod
    def validate_username_format(cls, v: str) -> str:
        """Validate username contains only alphanumeric characters and underscores."""
        if not re.match(r'^[a-zA-Z0-9_]{3,30}$', v):
            raise ValueError(
                "Username must be 3-30 characters and contain only letters, numbers, and underscores"
            )
        return v

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets strength requirements."""
        errors = []

        if len(v) < 8:
            errors.append("at least 8 characters")

        if not re.search(r'[A-Z]', v):
            errors.append("at least one uppercase letter")

        if not re.search(r'[a-z]', v):
            errors.append("at least one lowercase letter")

        if not re.search(r'[0-9]', v):
            errors.append("at least one number")

        if errors:
            raise ValueError(f"Password must contain {', '.join(errors)}")

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "alice@example.com",
                "username": "alice_dev",
                "password": "MyPassword123"
            }
        }


class RegisterResponse(BaseModel):
    """
    Response schema for successful user registration.

    Returns user profile without sensitive data (no password_hash).
    """

    id: UUID = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's display name")
    created_at: datetime = Field(..., description="Account creation timestamp (UTC)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "alice@example.com",
                "username": "alice_dev",
                "created_at": "2026-01-11T10:30:00Z"
            }
        }


# ============================================================================
# Login Schemas
# ============================================================================

class LoginRequest(BaseModel):
    """
    Request schema for user login.

    Accepts email and password for authentication.
    """

    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["alice@example.com"]
    )

    password: str = Field(
        ...,
        description="User's password",
        examples=["MyPassword123"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "alice@example.com",
                "password": "MyPassword123"
            }
        }


class LoginResponse(BaseModel):
    """
    Response schema for successful login.

    Returns JWT access token and user profile.
    """

    access_token: str = Field(
        ...,
        description="JWT access token (valid for 24 hours)"
    )

    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')"
    )

    user: "UserProfile" = Field(
        ...,
        description="Authenticated user's profile"
    )

    class Config:
        json_schema_extra = {
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


# ============================================================================
# User Profile Schema
# ============================================================================

class UserProfile(BaseModel):
    """
    User profile schema (public data only, no password_hash).

    Used in responses for /me endpoint and login response.
    """

    id: UUID = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    username: str = Field(..., description="User's display name")
    created_at: datetime = Field(..., description="Account creation timestamp (UTC)")

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "alice@example.com",
                "username": "alice_dev",
                "created_at": "2026-01-11T10:30:00Z"
            }
        }


# ============================================================================
# Logout Schema
# ============================================================================

class LogoutResponse(BaseModel):
    """
    Response schema for successful logout.

    Simple confirmation message.
    """

    message: str = Field(
        default="Successfully logged out",
        description="Logout confirmation message"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Successfully logged out"
            }
        }


# ============================================================================
# Error Response Schema
# ============================================================================

class AuthErrorResponse(BaseModel):
    """
    Error response schema for authentication failures.

    Follows RFC 7807 Problem Details format.
    """

    detail: str = Field(..., description="Human-readable error message")
    status_code: int = Field(..., description="HTTP status code")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid email or password",
                "status_code": 401,
                "error_code": "INVALID_CREDENTIALS"
            }
        }
