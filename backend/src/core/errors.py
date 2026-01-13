"""
RFC 7807 Problem Details error handling for FastAPI.

This module provides:
- ProblemDetails Pydantic model for RFC 7807 error responses
- Custom exception classes for domain-specific errors
- Exception handlers for FastAPI application
- Consistent error response format across all endpoints

RFC 7807 Reference: https://tools.ietf.org/html/rfc7807
"""

from typing import Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError


class ProblemDetails(BaseModel):
    """
    RFC 7807 Problem Details model for HTTP API error responses.

    Attributes:
        type: URI reference identifying the problem type (default: about:blank)
        title: Short, human-readable summary of the problem type
        status: HTTP status code
        detail: Human-readable explanation specific to this occurrence
        instance: URI reference identifying the specific occurrence

    Example:
        {
            "type": "validation_error",
            "title": "Validation Error",
            "status": 400,
            "detail": "Title cannot be empty or whitespace-only",
            "instance": "/api/tasks"
        }
    """

    type: str = Field(
        default="about:blank",
        description="URI reference identifying the problem type"
    )
    title: str = Field(description="Short, human-readable summary")
    status: int = Field(description="HTTP status code")
    detail: str = Field(description="Human-readable explanation")
    instance: str = Field(description="URI reference to the specific occurrence")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "type": "validation_error",
                "title": "Validation Error",
                "status": 400,
                "detail": "Title cannot be empty or whitespace-only",
                "instance": "/api/tasks"
            }
        }


# Custom Exception Classes

class TaskNotFoundError(Exception):
    """
    Exception raised when a task is not found in the database.

    This exception should be raised when attempting to retrieve, update,
    or delete a task that doesn't exist.

    Attributes:
        task_id: The UUID of the task that was not found
        message: Human-readable error message
    """

    def __init__(self, task_id: str, message: Optional[str] = None):
        self.task_id = task_id
        self.message = message or f"Task with id '{task_id}' not found"
        super().__init__(self.message)


class TaskValidationError(Exception):
    """
    Exception raised when task validation fails.

    This exception should be raised when task data fails business logic
    validation beyond Pydantic schema validation.

    Attributes:
        message: Human-readable error message describing the validation failure
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class DatabaseError(Exception):
    """
    Exception raised when a database operation fails.

    This exception should be raised when database connection or query
    execution fails.

    Attributes:
        message: Human-readable error message
        original_error: The original exception that caused the database error
    """

    def __init__(self, message: str, original_error: Optional[Exception] = None):
        self.message = message
        self.original_error = original_error
        super().__init__(self.message)


# Exception Handlers

async def validation_error_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: Pydantic validation error

    Returns:
        JSONResponse: RFC 7807 formatted error response with 400 status

    Example Response:
        {
            "type": "validation_error",
            "title": "Validation Error",
            "status": 400,
            "detail": "Title cannot be empty or whitespace-only",
            "instance": "/api/tasks"
        }
    """
    # Extract first validation error for detail message
    errors = exc.errors()
    first_error = errors[0] if errors else {}

    # Build detailed error message
    field = " -> ".join(str(loc) for loc in first_error.get("loc", []))
    msg = first_error.get("msg", "Validation error")
    detail = f"{field}: {msg}" if field else msg

    problem = ProblemDetails(
        type="validation_error",
        title="Validation Error",
        status=status.HTTP_400_BAD_REQUEST,
        detail=detail,
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=problem.model_dump()
    )


async def task_validation_error_handler(
    request: Request,
    exc: TaskValidationError
) -> JSONResponse:
    """
    Handle custom task validation errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: Task validation error

    Returns:
        JSONResponse: RFC 7807 formatted error response with 400 status
    """
    problem = ProblemDetails(
        type="validation_error",
        title="Validation Error",
        status=status.HTTP_400_BAD_REQUEST,
        detail=exc.message,
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=problem.model_dump()
    )


async def task_not_found_error_handler(
    request: Request,
    exc: TaskNotFoundError
) -> JSONResponse:
    """
    Handle task not found errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: Task not found error

    Returns:
        JSONResponse: RFC 7807 formatted error response with 404 status

    Example Response:
        {
            "type": "not_found",
            "title": "Not Found",
            "status": 404,
            "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
            "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
        }
    """
    problem = ProblemDetails(
        type="not_found",
        title="Not Found",
        status=status.HTTP_404_NOT_FOUND,
        detail=exc.message,
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=problem.model_dump()
    )


async def database_error_handler(
    request: Request,
    exc: DatabaseError
) -> JSONResponse:
    """
    Handle database errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: Database error

    Returns:
        JSONResponse: RFC 7807 formatted error response with 500 status

    Example Response:
        {
            "type": "database_error",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "Database connection failed",
            "instance": "/api/tasks"
        }
    """
    problem = ProblemDetails(
        type="database_error",
        title="Internal Server Error",
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=exc.message,
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=problem.model_dump()
    )


async def sqlalchemy_error_handler(
    request: Request,
    exc: SQLAlchemyError
) -> JSONResponse:
    """
    Handle SQLAlchemy database errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: SQLAlchemy error

    Returns:
        JSONResponse: RFC 7807 formatted error response with 500 status
    """
    problem = ProblemDetails(
        type="database_error",
        title="Internal Server Error",
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="A database error occurred. Please try again later.",
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=problem.model_dump()
    )


async def generic_error_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Handle unexpected errors and return RFC 7807 response.

    Args:
        request: FastAPI request object
        exc: Generic exception

    Returns:
        JSONResponse: RFC 7807 formatted error response with 500 status
    """
    problem = ProblemDetails(
        type="internal_error",
        title="Internal Server Error",
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred. Please try again later.",
        instance=request.url.path
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=problem.model_dump()
    )
