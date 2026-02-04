"""
Error Handling for MCP Task Tools

This module defines custom exceptions and error handling utilities for MCP task tools.
"""

from typing import Optional, Dict, Any, List
from enum import Enum
import traceback
import logging


class MCPTaskErrorCode(Enum):
    """
    Error codes for MCP task tool operations.
    """
    # General errors
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR"
    PERMISSION_DENIED = "PERMISSION_DENIED"

    # Task-specific errors
    TASK_CREATION_FAILED = "TASK_CREATION_FAILED"
    TASK_UPDATE_FAILED = "TASK_UPDATE_FAILED"
    TASK_DELETION_FAILED = "TASK_DELETION_FAILED"
    INVALID_TASK_ID = "INVALID_TASK_ID"
    TASK_ALREADY_EXISTS = "TASK_ALREADY_EXISTS"

    # User-related errors
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USER_NOT_AUTHENTICATED = "USER_NOT_AUTHENTICATED"
    USER_NOT_AUTHORIZED = "USER_NOT_AUTHORIZED"

    # System errors
    SYSTEM_UNAVAILABLE = "SYSTEM_UNAVAILABLE"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"


class MCPTaskError(Exception):
    """
    Base exception class for MCP task tool errors.
    """
    def __init__(
        self,
        message: str,
        error_code: MCPTaskErrorCode,
        details: Optional[Dict[str, Any]] = None,
        original_error: Optional[Exception] = None
    ):
        """
        Initialize an MCP task error.

        Args:
            message: Human-readable error message
            error_code: Specific error code
            details: Additional error details
            original_error: Original error that caused this exception
        """
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.original_error = original_error
        self.traceback_str = traceback.format_exc() if original_error else None

        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the error to a dictionary representation.

        Returns:
            Dictionary representation of the error
        """
        result = {
            "error_code": self.error_code.value,
            "message": self.message,
            "details": self.details,
        }

        if self.original_error:
            result["original_error"] = {
                "type": type(self.original_error).__name__,
                "message": str(self.original_error)
            }

        return result

    def __str__(self):
        return f"[{self.error_code.value}] {self.message}"


class ValidationError(MCPTaskError):
    """
    Exception raised for validation errors.
    """
    def __init__(
        self,
        message: str = "Validation failed",
        field_errors: Optional[Dict[str, List[str]]] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a validation error.

        Args:
            message: Validation error message
            field_errors: Dictionary of field names to lists of error messages
            details: Additional error details
        """
        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.VALIDATION_ERROR,
            details={
                **(details or {}),
                "field_errors": field_errors or {}
            }
        )


class AuthenticationError(MCPTaskError):
    """
    Exception raised for authentication errors.
    """
    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize an authentication error.

        Args:
            message: Authentication error message
            details: Additional error details
        """
        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.AUTHENTICATION_ERROR,
            details=details or {}
        )


class AuthorizationError(MCPTaskError):
    """
    Exception raised for authorization errors.
    """
    def __init__(
        self,
        message: str = "Authorization failed",
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize an authorization error.

        Args:
            message: Authorization error message
            details: Additional error details
        """
        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.AUTHORIZATION_ERROR,
            details=details or {}
        )


class TaskNotFoundError(MCPTaskError):
    """
    Exception raised when a task is not found.
    """
    def __init__(
        self,
        task_id: str,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a task not found error.

        Args:
            task_id: ID of the task that wasn't found
            message: Optional custom message
            details: Additional error details
        """
        if message is None:
            message = f"Task with ID {task_id} not found"

        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.NOT_FOUND_ERROR,
            details={
                **(details or {}),
                "task_id": task_id
            }
        )


class DatabaseError(MCPTaskError):
    """
    Exception raised for database-related errors.
    """
    def __init__(
        self,
        message: str = "Database operation failed",
        original_error: Optional[Exception] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a database error.

        Args:
            message: Database error message
            original_error: Original database error
            details: Additional error details
        """
        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.DATABASE_ERROR,
            details=details or {},
            original_error=original_error
        )


class PermissionDeniedError(MCPTaskError):
    """
    Exception raised when a user doesn't have permission for an action.
    """
    def __init__(
        self,
        message: str = "Permission denied",
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a permission denied error.

        Args:
            message: Permission denied message
            resource_type: Type of resource
            resource_id: ID of the resource
            details: Additional error details
        """
        super().__init__(
            message=message,
            error_code=MCPTaskErrorCode.PERMISSION_DENIED,
            details={
                **(details or {}),
                "resource_type": resource_type,
                "resource_id": resource_id
            }
        )


class ErrorHandler:
    """
    Centralized error handler for MCP task tools.
    """

    @staticmethod
    def handle_error(error: Exception, context: Optional[str] = None) -> MCPTaskError:
        """
        Handle an error and return an appropriate MCPTaskError.

        Args:
            error: Original error to handle
            context: Context information about where the error occurred

        Returns:
            MCPTaskError instance
        """
        # Log the error for debugging purposes
        logging.error(f"Error in {context or 'unknown context'}: {str(error)}", exc_info=True)

        # If it's already an MCPTaskError, return as is
        if isinstance(error, MCPTaskError):
            return error

        # Map common Python exceptions to MCPTaskErrors
        if isinstance(error, ValueError):
            return ValidationError(str(error))
        elif isinstance(error, PermissionError):
            return PermissionDeniedError(str(error))
        elif isinstance(error, FileNotFoundError):
            return MCPTaskError(
                message="Resource not found",
                error_code=MCPTaskErrorCode.NOT_FOUND_ERROR,
                details={"original_error": str(error)},
                original_error=error
            )
        else:
            # For unknown errors, wrap in a generic MCPTaskError
            return MCPTaskError(
                message=f"An unexpected error occurred: {str(error)}",
                error_code=MCPTaskErrorCode.UNKNOWN_ERROR,
                details={
                    "original_error_type": type(error).__name__,
                    "context": context
                },
                original_error=error
            )

    @staticmethod
    def log_error(error: MCPTaskError, logger: Optional[logging.Logger] = None) -> None:
        """
        Log an error using the appropriate logging level.

        Args:
            error: MCPTaskError to log
            logger: Optional logger instance to use
        """
        if logger is None:
            logger = logging.getLogger(__name__)

        # Determine log level based on error type
        if error.error_code in [
            MCPTaskErrorCode.AUTHENTICATION_ERROR,
            MCPTaskErrorCode.AUTHORIZATION_ERROR,
            MCPTaskErrorCode.PERMISSION_DENIED
        ]:
            logger.warning(f"{error.error_code.value}: {error.message}")
        elif error.error_code in [
            MCPTaskErrorCode.VALIDATION_ERROR,
            MCPTaskErrorCode.INVALID_TASK_ID
        ]:
            logger.info(f"{error.error_code.value}: {error.message}")
        else:
            logger.error(f"{error.error_code.value}: {error.message}", exc_info=True)


class ErrorContextManager:
    """
    Context manager for handling errors in MCP task operations.
    """

    def __init__(self, operation_name: str, logger: Optional[logging.Logger] = None):
        """
        Initialize the error context manager.

        Args:
            operation_name: Name of the operation being performed
            logger: Optional logger instance to use
        """
        self.operation_name = operation_name
        self.logger = logger or logging.getLogger(__name__)

    def __enter__(self):
        self.logger.debug(f"Starting operation: {self.operation_name}")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            error = ErrorHandler.handle_error(exc_value, self.operation_name)
            ErrorHandler.log_error(error, self.logger)
            # Re-raise the MCPTaskError
            raise error
        else:
            self.logger.debug(f"Completed operation: {self.operation_name}")


# Common error responses for different scenarios
class ErrorResponses:
    """
    Predefined error responses for common scenarios.
    """

    @staticmethod
    def invalid_task_id(task_id: str) -> MCPTaskError:
        """Error response for invalid task ID."""
        return ValidationError(
            message=f"Invalid task ID format: {task_id}",
            field_errors={"task_id": [f"'{task_id}' is not a valid task ID"]}
        )

    @staticmethod
    def user_not_authorized_for_task(user_id: str, task_id: str) -> MCPTaskError:
        """Error response for user not authorized to access a task."""
        return AuthorizationError(
            message=f"User {user_id} is not authorized to access task {task_id}",
            details={
                "user_id": user_id,
                "task_id": task_id
            }
        )

    @staticmethod
    def task_already_exists(title: str) -> MCPTaskError:
        """Error response for attempting to create a duplicate task."""
        return MCPTaskError(
            message=f"A task with title '{title}' already exists",
            error_code=MCPTaskErrorCode.TASK_ALREADY_EXISTS,
            details={"title": title}
        )

    @staticmethod
    def system_unavailable() -> MCPTaskError:
        """Error response for system unavailability."""
        return MCPTaskError(
            message="The system is currently unavailable. Please try again later.",
            error_code=MCPTaskErrorCode.SYSTEM_UNAVAILABLE
        )


__all__ = [
    "MCPTaskErrorCode",
    "MCPTaskError",
    "ValidationError",
    "AuthenticationError",
    "AuthorizationError",
    "TaskNotFoundError",
    "DatabaseError",
    "PermissionDeniedError",
    "ErrorHandler",
    "ErrorContextManager",
    "ErrorResponses"
]