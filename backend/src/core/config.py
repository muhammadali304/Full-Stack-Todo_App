"""
Core configuration module for the Backend API.

This module provides centralized configuration management using Pydantic Settings.
Environment variables are loaded from .env file and validated at startup.
"""

from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Environment variables can be provided via:
    - .env file in the backend/ directory
    - System environment variables
    - Docker/container environment

    Required variables:
    - DATABASE_URL: PostgreSQL connection string with asyncpg driver

    Optional variables:
    - APP_ENV: Application environment (development, staging, production)
    - DEBUG: Enable debug mode for development
    """

    # Database Configuration
    DATABASE_URL: str
    """
    PostgreSQL connection string for Neon Serverless PostgreSQL.
    Format: postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require

    Example: postgresql+asyncpg://myuser:mypass@ep-cool-name-123456.us-east-2.aws.neon.tech/mydb?sslmode=require
    """

    # Application Configuration
    APP_ENV: Literal["development", "staging", "production"] = "development"
    """Application environment. Defaults to 'development'."""

    DEBUG: bool = False
    """Enable debug mode. Defaults to False for security."""

    # JWT Authentication Configuration
    JWT_SECRET: str
    """
    Secret key for JWT token signing and verification.
    MUST be a strong random string (minimum 32 characters).
    Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    """

    JWT_ALGORITHM: str = "HS256"
    """JWT signing algorithm. Defaults to HS256 (HMAC with SHA-256)."""

    JWT_EXPIRATION_HOURS: int = 24
    """JWT token expiration time in hours. Defaults to 24 hours."""

    # Pydantic Settings Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # Ignore extra environment variables
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"

    def get_database_url(self) -> str:
        """
        Get the database URL for SQLModel/SQLAlchemy.

        Returns:
            str: Database connection string
        """
        return self.DATABASE_URL


# Global settings instance
# This is instantiated once at module import and reused throughout the application
settings = Settings()
