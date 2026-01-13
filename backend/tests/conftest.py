"""
Pytest configuration for backend API tests.

This module provides fixtures and configuration for testing the FastAPI application
with an async test database.
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from src.core.config import settings
from src.core.database import get_db
from src.main import app
from src.models.task import Task


# Test database URL (use separate test database)
TEST_DATABASE_URL = settings.DATABASE_URL.replace("/neondb", "/neondb_test")


# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.

    This fixture:
    1. Creates all tables before the test
    2. Yields a database session
    3. Rolls back any changes after the test
    4. Drops all tables after the test

    This ensures test isolation - each test starts with a clean database.
    """
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create session
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

    # Drop tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async HTTP client for testing FastAPI endpoints.

    This fixture:
    1. Overrides the get_db dependency to use the test database
    2. Creates an AsyncClient for making HTTP requests
    3. Yields the client for use in tests
    4. Cleans up after the test
    """
    # Override get_db dependency to use test database
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Create async client
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # Clear dependency overrides
    app.dependency_overrides.clear()


@pytest.fixture
def sample_task_data() -> dict:
    """Sample task data for testing."""
    return {
        "title": "Test Task",
        "description": "This is a test task description",
    }


@pytest.fixture
def sample_task_data_minimal() -> dict:
    """Minimal task data (title only) for testing."""
    return {
        "title": "Minimal Test Task",
    }


@pytest.fixture
def sample_task_data_long() -> dict:
    """Task data with maximum length fields for testing."""
    return {
        "title": "A" * 200,  # Maximum title length
        "description": "B" * 2000,  # Maximum description length
    }
