"""
FastAPI application entry point.

This module initializes the FastAPI application with:
- CORS middleware for cross-origin requests
- RFC 7807 error handlers for consistent error responses
- Database lifecycle management (startup/shutdown)
- Health check endpoint
- API routes (task routes will be added in Phase 3)

To run the application:
    uvicorn src.main:app --reload
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from .core.config import settings
from .core.database import create_db_and_tables, close_db_connection
from .core.errors import (
    ProblemDetails,
    TaskNotFoundError,
    TaskValidationError,
    DatabaseError,
    validation_error_handler,
    task_validation_error_handler,
    task_not_found_error_handler,
    database_error_handler,
    sqlalchemy_error_handler,
    generic_error_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan context manager for startup and shutdown events.

    Startup:
        - Create database tables (development only)
        - Initialize connection pool

    Shutdown:
        - Close database connections
        - Cleanup resources

    Args:
        app: FastAPI application instance

    Yields:
        None: Control to the application
    """
    # Startup: Initialize database
    print("[STARTUP] Starting up application...")
    print(f"[STARTUP] Environment: {settings.APP_ENV}")
    print(f"[STARTUP] Debug mode: {settings.DEBUG}")

    # Create tables in development (use Alembic migrations in production)
    if settings.is_development:
        print("[STARTUP] Creating database tables (development mode)...")
        await create_db_and_tables()
        print("[STARTUP] Database tables created")

    print("[STARTUP] Application startup complete")

    yield

    # Shutdown: Cleanup resources
    print("[SHUTDOWN] Shutting down application...")
    await close_db_connection()
    print("[SHUTDOWN] Database connections closed")
    print("[SHUTDOWN] Application shutdown complete")


# Initialize FastAPI application
app = FastAPI(
    title="Todo Task Management API",
    description=(
        "RESTful backend API for todo task management with complete CRUD operations. "
        "This API provides endpoints for creating, retrieving, updating, and deleting tasks, "
        "as well as managing task completion status. All error responses follow RFC 7807 "
        "Problem Details standard for consistent error handling."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# Configure CORS middleware for frontend communication
# Allows requests from Next.js frontend (Vercel production + local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://full-stack-todo-app-snowy.vercel.app",  # Vercel production deployment
        "http://localhost:3000",  # Local development
    ],
    allow_credentials=True,  # Allow cookies and authentication headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Register RFC 7807 error handlers
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(TaskValidationError, task_validation_error_handler)
app.add_exception_handler(TaskNotFoundError, task_not_found_error_handler)
app.add_exception_handler(DatabaseError, database_error_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(Exception, generic_error_handler)


# Health check endpoint
@app.get(
    "/api/health",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    tags=["Health"],
    summary="Health check endpoint",
    description="Verify that the API is running and responsive",
)
async def health_check() -> dict:
    """
    Health check endpoint to verify API availability.

    Returns:
        dict: Health status response

    Example Response:
        {
            "status": "healthy"
        }
    """
    return {"status": "healthy"}


# Root endpoint
@app.get(
    "/",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    tags=["Root"],
    summary="API root endpoint",
    description="Get API information and available endpoints",
)
async def root() -> dict:
    """
    Root endpoint providing API information.

    Returns:
        dict: API information

    Example Response:
        {
            "message": "Todo Task Management API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/health"
        }
    """
    return {
        "message": "Todo Task Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


# Register API routes
from .api.routes import tasks, auth

# Authentication routes
app.include_router(auth.router, prefix="/api")

# Task routes
app.include_router(tasks.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
