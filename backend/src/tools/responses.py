"""
Response Structures for MCP Task Tools

This module defines common response structures and formatting for MCP task tools.
"""

from typing import Dict, Any, List, Union, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum


class MCPResponseCode(Enum):
    """
    Standard response codes for MCP task tool operations.
    """
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    NOT_FOUND = "NOT_FOUND"


class MCPResponse:
    """
    Standard response structure for MCP task tool operations.
    """

    def __init__(
        self,
        code: MCPResponseCode,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        errors: Optional[List[str]] = None
    ):
        """
        Initialize an MCP response.

        Args:
            code: Response code indicating the operation result
            message: Human-readable message about the result
            data: Optional data payload
            errors: Optional list of error messages
        """
        self.code = code
        self.message = message
        self.data = data or {}
        self.errors = errors or []

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the response to a dictionary.

        Returns:
            Dictionary representation of the response
        """
        return {
            "code": self.code.value,
            "message": self.message,
            "data": self.data,
            "errors": self.errors,
            "timestamp": datetime.utcnow().isoformat()
        }

    @classmethod
    def success(cls, message: str = "Operation successful", data: Optional[Dict[str, Any]] = None) -> 'MCPResponse':
        """
        Create a success response.

        Args:
            message: Success message
            data: Optional data to include

        Returns:
            Success response instance
        """
        return cls(
            code=MCPResponseCode.SUCCESS,
            message=message,
            data=data
        )

    @classmethod
    def error(cls, message: str, errors: Optional[List[str]] = None) -> 'MCPResponse':
        """
        Create an error response.

        Args:
            message: Error message
            errors: Optional detailed error messages

        Returns:
            Error response instance
        """
        return cls(
            code=MCPResponseCode.ERROR,
            message=message,
            errors=errors or []
        )

    @classmethod
    def validation_error(cls, message: str = "Validation failed", errors: Optional[List[str]] = None) -> 'MCPResponse':
        """
        Create a validation error response.

        Args:
            message: Validation error message
            errors: Optional detailed validation error messages

        Returns:
            Validation error response instance
        """
        return cls(
            code=MCPResponseCode.VALIDATION_ERROR,
            message=message,
            errors=errors or []
        )

    @classmethod
    def not_found(cls, message: str = "Resource not found") -> 'MCPResponse':
        """
        Create a not found response.

        Args:
            message: Not found message

        Returns:
            Not found response instance
        """
        return cls(
            code=MCPResponseCode.NOT_FOUND,
            message=message
        )


class TaskResponseFormatter:
    """
    Formatter for task-related responses.
    """

    @staticmethod
    def format_task(task) -> Dict[str, Any]:
        """
        Format a task object for response.

        Args:
            task: Task object to format

        Returns:
            Formatted task data
        """
        return {
            "id": str(task.id) if hasattr(task, 'id') else None,
            "user_id": str(task.user_id) if hasattr(task, 'user_id') else None,
            "title": getattr(task, 'title', ''),
            "description": getattr(task, 'description', None),
            "completed": getattr(task, 'completed', False),
            "created_at": getattr(task, 'created_at', None),
            "updated_at": getattr(task, 'updated_at', None),
        }

    @staticmethod
    def format_tasks(tasks) -> List[Dict[str, Any]]:
        """
        Format multiple task objects for response.

        Args:
            tasks: List of task objects to format

        Returns:
            List of formatted task data
        """
        return [TaskResponseFormatter.format_task(task) for task in tasks]

    @staticmethod
    def format_paginated_tasks(tasks, total_count: int, page: int = 1, page_size: int = 10) -> Dict[str, Any]:
        """
        Format tasks with pagination information.

        Args:
            tasks: List of task objects to format
            total_count: Total number of tasks available
            page: Current page number
            page_size: Number of tasks per page

        Returns:
            Formatted paginated task data
        """
        return {
            "tasks": TaskResponseFormatter.format_tasks(tasks),
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": (total_count + page_size - 1) // page_size,
            }
        }


class ErrorResponseFormatter:
    """
    Formatter for error responses.
    """

    @staticmethod
    def format_validation_errors(errors: Union[str, List[str]]) -> List[str]:
        """
        Format validation errors for response.

        Args:
            errors: Validation error(s) to format

        Returns:
            List of formatted error strings
        """
        if isinstance(errors, str):
            return [errors]
        return errors

    @staticmethod
    def format_generic_error(error: Exception) -> str:
        """
        Format a generic error for response.

        Args:
            error: Exception to format

        Returns:
            Formatted error string
        """
        return f"{type(error).__name__}: {str(error)}"


# Common response builders for specific operations
class TaskOperationResponses:
    """
    Predefined response builders for common task operations.
    """

    @staticmethod
    def task_created(task) -> MCPResponse:
        """Response for successful task creation."""
        return MCPResponse.success(
            message="Task created successfully",
            data={"task": TaskResponseFormatter.format_task(task)}
        )

    @staticmethod
    def task_updated(task) -> MCPResponse:
        """Response for successful task update."""
        return MCPResponse.success(
            message="Task updated successfully",
            data={"task": TaskResponseFormatter.format_task(task)}
        )

    @staticmethod
    def task_deleted(task_id: str) -> MCPResponse:
        """Response for successful task deletion."""
        return MCPResponse.success(
            message=f"Task {task_id} deleted successfully",
            data={"task_id": task_id}
        )

    @staticmethod
    def task_completed(task) -> MCPResponse:
        """Response for successful task completion."""
        return MCPResponse.success(
            message="Task completed successfully",
            data={"task": TaskResponseFormatter.format_task(task)}
        )

    @staticmethod
    def task_listed(tasks, total_count: int = None) -> MCPResponse:
        """Response for successful task listing."""
        data = {"tasks": TaskResponseFormatter.format_tasks(tasks)}
        if total_count is not None:
            data["total_count"] = total_count

        return MCPResponse.success(
            message="Tasks retrieved successfully",
            data=data
        )

    @staticmethod
    def task_not_found(task_id: str) -> MCPResponse:
        """Response for task not found error."""
        return MCPResponse.not_found(
            message=f"Task with ID {task_id} not found"
        )

    @staticmethod
    def user_not_authorized(task_id: str) -> MCPResponse:
        """Response for user not authorized to access task."""
        return MCPResponse.error(
            message=f"You are not authorized to access task {task_id}",
            errors=["UNAUTHORIZED_ACCESS"]
        )


__all__ = [
    "MCPResponseCode",
    "MCPResponse",
    "TaskResponseFormatter",
    "ErrorResponseFormatter",
    "TaskOperationResponses"
]