"""
Database connection and session management module.

This module provides:
- Async SQLAlchemy engine with asyncpg driver for Neon PostgreSQL
- Connection pooling configuration for optimal performance
- Session factory for database operations
- FastAPI dependency injection for automatic session management
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlmodel import SQLModel

from .config import settings


# Create async engine with connection pooling
# Pool configuration:
# - pool_size: Minimum number of connections to maintain (5)
# - max_overflow: Additional connections beyond pool_size (15)
# - Total max connections: pool_size + max_overflow = 20
engine = create_async_engine(
    settings.get_database_url(),
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    future=True,
    pool_size=5,  # Minimum connections in pool
    max_overflow=15,  # Additional connections when pool is exhausted
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={"ssl": True},  # Enable SSL for Neon PostgreSQL
)


# Session factory for creating database sessions
# expire_on_commit=False prevents lazy-loading issues after commit
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database session management.

    Provides an async database session with automatic cleanup.
    Use this as a dependency in FastAPI route handlers.

    Usage:
        @app.get("/tasks")
        async def get_tasks(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass

    Yields:
        AsyncSession: Database session for the request

    Note:
        - Session is automatically closed after request completes
        - Exceptions are propagated to FastAPI error handlers
        - Connection is returned to pool after session closes
    """
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            # Rollback on any exception
            await session.rollback()
            raise
        finally:
            # Ensure session is closed (returns connection to pool)
            await session.close()


async def create_db_and_tables():
    """
    Create all database tables defined in SQLModel models.

    This function should be called during application startup
    for development/testing environments. In production, use
    Alembic migrations instead.

    Note:
        - Only creates tables that don't exist
        - Does not modify existing tables
        - Use Alembic for schema migrations in production
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db_connection():
    """
    Close all database connections and dispose of the engine.

    This function should be called during application shutdown
    to ensure graceful cleanup of database resources.

    Note:
        - Closes all connections in the pool
        - Waits for active connections to complete
        - Should be registered as a shutdown event handler
    """
    await engine.dispose()
