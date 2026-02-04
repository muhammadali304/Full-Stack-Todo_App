"""
Utility Functions for MCP Task Tools

This module provides utility functions for MCP task tools, including user isolation,
validation, and common operations.
"""

from typing import Dict, Any, Optional, Union
from uuid import UUID, uuid4
import re
from datetime import datetime
from enum import Enum


class TaskStatus(Enum):
    """
    Task status enumeration.
    """
    PENDING = "pending"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class TaskUtils:
    """
    Utility functions for task operations.
    """

    @staticmethod
    def generate_task_id() -> str:
        """
        Generate a unique task ID.

        Returns:
            String representation of a UUID
        """
        return str(uuid4())

    @staticmethod
    def validate_task_title(title: str) -> tuple[bool, Optional[str]]:
        """
        Validate a task title according to business rules.

        Args:
            title: Task title to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not title:
            return False, "Task title cannot be empty"

        if not isinstance(title, str):
            return False, "Task title must be a string"

        title_stripped = title.strip()
        if len(title_stripped) < 1:
            return False, "Task title cannot be empty or whitespace only"

        if len(title) > 200:
            return False, "Task title must be 200 characters or less"

        return True, None

    @staticmethod
    def validate_task_description(description: Optional[str]) -> tuple[bool, Optional[str]]:
        """
        Validate a task description according to business rules.

        Args:
            description: Task description to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if description is None:
            return True, None

        if not isinstance(description, str):
            return False, "Task description must be a string"

        if len(description) > 2000:
            return False, "Task description must be 2000 characters or less"

        return True, None

    @staticmethod
    def validate_task_status(status: str) -> tuple[bool, Optional[str]]:
        """
        Validate a task status.

        Args:
            status: Task status to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            TaskStatus(status.lower())
            return True, None
        except ValueError:
            return False, f"Invalid task status: {status}. Must be one of: {', '.join([s.value for s in TaskStatus])}"

    @staticmethod
    def sanitize_input(text: str) -> str:
        """
        Sanitize input text by removing potentially harmful content.

        Args:
            text: Text to sanitize

        Returns:
            Sanitized text
        """
        if not isinstance(text, str):
            return ""

        # Remove null bytes and other potentially harmful characters
        sanitized = text.replace('\x00', '').strip()

        return sanitized

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text by applying consistent formatting.

        Args:
            text: Text to normalize

        Returns:
            Normalized text
        """
        if not isinstance(text, str):
            return ""

        # Strip leading/trailing whitespace and normalize internal whitespace
        normalized = ' '.join(text.split())
        return normalized

    @staticmethod
    def extract_user_id_from_context(context: Dict[str, Any]) -> Optional[str]:
        """
        Extract user ID from request context.

        Args:
            context: Request context containing user information

        Returns:
            User ID string or None if not found
        """
        # This is a placeholder implementation
        # In a real MCP context, this would extract user info from the context
        user_id = context.get('user_id')
        if user_id:
            return str(user_id)
        return None

    @staticmethod
    def is_valid_uuid(uuid_string: str) -> bool:
        """
        Check if a string is a valid UUID.

        Args:
            uuid_string: String to validate

        Returns:
            True if valid UUID, False otherwise
        """
        try:
            UUID(uuid_string)
            return True
        except (TypeError, ValueError):
            return False

    @staticmethod
    def format_timestamp(timestamp: datetime) -> str:
        """
        Format a datetime object as an ISO string.

        Args:
            timestamp: Datetime object to format

        Returns:
            ISO formatted timestamp string
        """
        return timestamp.isoformat()

    @staticmethod
    def convert_to_bool(value: Union[str, bool, int, None]) -> Optional[bool]:
        """
        Convert a value to boolean.

        Args:
            value: Value to convert

        Returns:
            Boolean value or None if conversion not possible
        """
        if value is None:
            return None

        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            value_lower = value.lower().strip()
            if value_lower in ['true', '1', 'yes', 'on']:
                return True
            elif value_lower in ['false', '0', 'no', 'off', '']:
                return False
            else:
                raise ValueError(f"Cannot convert '{value}' to boolean")

        if isinstance(value, (int, float)):
            return bool(value)

        raise ValueError(f"Cannot convert {type(value)} to boolean")


class UserIsolationUtils:
    """
    Utility functions for ensuring user isolation.
    """

    @staticmethod
    def verify_user_owns_resource(user_id: str, resource_owner_id: str) -> bool:
        """
        Verify that a user owns a specific resource.

        Args:
            user_id: ID of the user making the request
            resource_owner_id: ID of the resource owner

        Returns:
            True if user owns the resource, False otherwise
        """
        return str(user_id) == str(resource_owner_id)

    @staticmethod
    def filter_resources_by_user(resources: list, user_id: str, owner_field: str = 'user_id') -> list:
        """
        Filter a list of resources to only include those owned by the specified user.

        Args:
            resources: List of resource objects/dictionaries
            user_id: ID of the user whose resources to return
            owner_field: Name of the field containing the owner ID

        Returns:
            Filtered list of resources belonging to the user
        """
        return [
            resource for resource in resources
            if str(resource.get(owner_field) if isinstance(resource, dict) else getattr(resource, owner_field, None)) == str(user_id)
        ]

    @staticmethod
    def mask_sensitive_fields(resource: Dict[str, Any], user_id: str, owner_field: str = 'user_id') -> Dict[str, Any]:
        """
        Mask sensitive fields in a resource if the user doesn't own it.

        Args:
            resource: Resource object to potentially mask
            user_id: ID of the requesting user
            owner_field: Name of the field containing the owner ID

        Returns:
            Resource with sensitive fields masked if necessary
        """
        owner_id = resource.get(owner_field) if isinstance(resource, dict) else getattr(resource, owner_field, None)
        is_owner = str(owner_id) == str(user_id)

        if not is_owner:
            # Mask sensitive fields for non-owners
            masked_resource = resource.copy()
            # Add any sensitive fields that should be masked here
            return masked_resource

        return resource


class ValidationError(Exception):
    """
    Custom exception for validation errors.
    """
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(self.message)

    def __str__(self):
        if self.field:
            return f"Validation error in field '{self.field}': {self.message}"
        return f"Validation error: {self.message}"


class ValidationUtils:
    """
    Utility functions for validation operations.
    """

    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: list) -> list:
        """
        Validate that required fields are present in the data.

        Args:
            data: Data dictionary to validate
            required_fields: List of required field names

        Returns:
            List of missing field names
        """
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None:
                missing_fields.append(field)
        return missing_fields

    @staticmethod
    def validate_data_types(data: Dict[str, Any], type_map: Dict[str, type]) -> Dict[str, str]:
        """
        Validate that data fields match expected types.

        Args:
            data: Data dictionary to validate
            type_map: Dictionary mapping field names to expected types

        Returns:
            Dictionary of field names to error messages for invalid types
        """
        type_errors = {}
        for field, expected_type in type_map.items():
            if field in data:
                value = data[field]
                if value is not None and not isinstance(value, expected_type):
                    type_errors[field] = f"Expected {expected_type.__name__}, got {type(value).__name__}"
        return type_errors


# Export commonly used utilities
__all__ = [
    "TaskStatus",
    "TaskUtils",
    "UserIsolationUtils",
    "ValidationError",
    "ValidationUtils"
]