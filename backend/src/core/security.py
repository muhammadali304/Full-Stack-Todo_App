"""
Security utilities for authentication and authorization.

This module provides functions for password hashing, validation, JWT token
generation and verification, and input validation for user credentials.
"""

import re
from datetime import datetime, timedelta
from typing import Optional, Tuple, List
from uuid import UUID

import bcrypt
import jwt
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from .config import settings


# Validation Regex Patterns
EMAIL_REGEX = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,30}$')


# ============================================================================
# Password Hashing and Verification
# ============================================================================

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt with 12 salt rounds.

    Args:
        password: Plain text password to hash

    Returns:
        str: bcrypt hashed password in format $2b$12$...

    Example:
        >>> hashed = hash_password("MyPassword123")
        >>> hashed.startswith("$2b$12$")
        True
    """
    salt = bcrypt.gensalt(rounds=12)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_hash.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify password against bcrypt hash.

    Args:
        password: Plain text password to verify
        password_hash: bcrypt hash to verify against

    Returns:
        bool: True if password matches hash, False otherwise

    Example:
        >>> hashed = hash_password("MyPassword123")
        >>> verify_password("MyPassword123", hashed)
        True
        >>> verify_password("WrongPassword", hashed)
        False
    """
    try:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            password_hash.encode('utf-8')
        )
    except Exception:
        return False


# ============================================================================
# Password Validation
# ============================================================================

def validate_password(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password strength.

    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number

    Args:
        password: Plain text password to validate

    Returns:
        Tuple[bool, List[str]]: (is_valid, error_messages)

    Example:
        >>> validate_password("MyPass123")
        (True, [])
        >>> validate_password("weak")
        (False, ['Password must be at least 8 characters long', ...])
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r'[0-9]', password):
        errors.append("Password must contain at least one number")

    return (len(errors) == 0, errors)


# ============================================================================
# Email Validation
# ============================================================================

def validate_email(email: str) -> bool:
    """
    Validate email format using regex.

    Args:
        email: Email address to validate

    Returns:
        bool: True if email format is valid, False otherwise

    Example:
        >>> validate_email("alice@example.com")
        True
        >>> validate_email("invalid-email")
        False
    """
    return bool(EMAIL_REGEX.match(email))


async def check_email_unique(email: str, db: AsyncSession) -> bool:
    """
    Check if email is unique (case-insensitive).

    Args:
        email: Email address to check
        db: Database session

    Returns:
        bool: True if email is unique, False if already exists

    Example:
        >>> await check_email_unique("alice@example.com", db)
        True
        >>> await check_email_unique("ALICE@example.com", db)  # Same as above
        False
    """
    from ..models.user import User

    result = await db.execute(
        select(User).where(func.lower(User.email) == email.lower())
    )
    return result.scalar_one_or_none() is None


# ============================================================================
# Username Validation
# ============================================================================

def validate_username(username: str) -> bool:
    """
    Validate username format (3-30 chars, alphanumeric + underscores).

    Args:
        username: Username to validate

    Returns:
        bool: True if username format is valid, False otherwise

    Example:
        >>> validate_username("alice_dev")
        True
        >>> validate_username("ab")  # Too short
        False
        >>> validate_username("alice-dev")  # Invalid character
        False
    """
    return bool(USERNAME_REGEX.match(username))


async def check_username_unique(username: str, db: AsyncSession) -> bool:
    """
    Check if username is unique (case-sensitive).

    Args:
        username: Username to check
        db: Database session

    Returns:
        bool: True if username is unique, False if already exists

    Example:
        >>> await check_username_unique("alice_dev", db)
        True
        >>> await check_username_unique("alice_dev", db)  # Same username
        False
        >>> await check_username_unique("Alice_Dev", db)  # Different case
        True
    """
    from ..models.user import User

    result = await db.execute(
        select(User).where(User.username == username)
    )
    return result.scalar_one_or_none() is None


# ============================================================================
# JWT Token Generation and Verification
# ============================================================================

def create_access_token(user_id: UUID, email: str) -> str:
    """
    Create JWT access token for authenticated user.

    Token contains:
    - sub: user_id (UUID as string)
    - email: user's email address
    - exp: expiration timestamp (24 hours from now)
    - iat: issued at timestamp

    Args:
        user_id: User's unique identifier
        email: User's email address

    Returns:
        str: JWT token string

    Example:
        >>> token = create_access_token(
        ...     UUID("550e8400-e29b-41d4-a716-446655440000"),
        ...     "alice@example.com"
        ... )
        >>> isinstance(token, str)
        True
    """
    now = datetime.utcnow()
    expires_delta = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    expire = now + expires_delta

    payload = {
        "sub": str(user_id),  # Subject: user ID
        "email": email,
        "exp": expire,  # Expiration time
        "iat": now  # Issued at time
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return token


def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify JWT access token and extract payload.

    Args:
        token: JWT token string to verify

    Returns:
        Optional[dict]: Token payload if valid, None if invalid/expired

    Payload contains:
        - sub: user_id (UUID as string)
        - email: user's email address
        - exp: expiration timestamp
        - iat: issued at timestamp

    Example:
        >>> token = create_access_token(
        ...     UUID("550e8400-e29b-41d4-a716-446655440000"),
        ...     "alice@example.com"
        ... )
        >>> payload = verify_access_token(token)
        >>> payload["email"]
        'alice@example.com'
        >>> verify_access_token("invalid-token")
        None
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid (malformed, wrong signature, etc.)
        return None


def extract_user_id_from_token(token: str) -> Optional[UUID]:
    """
    Extract user ID from JWT token.

    Args:
        token: JWT token string

    Returns:
        Optional[UUID]: User ID if token is valid, None otherwise

    Example:
        >>> user_id = UUID("550e8400-e29b-41d4-a716-446655440000")
        >>> token = create_access_token(user_id, "alice@example.com")
        >>> extracted_id = extract_user_id_from_token(token)
        >>> extracted_id == user_id
        True
    """
    payload = verify_access_token(token)
    if payload is None:
        return None

    try:
        user_id = UUID(payload["sub"])
        return user_id
    except (KeyError, ValueError):
        return None
