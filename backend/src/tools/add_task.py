"""
Add Task MCP Tool

This module implements the add_task MCP tool for creating new tasks.
"""

from typing import Dict, Any
from uuid import UUID
from datetime import datetime

from sqlmodel import select, Session
from sqlalchemy.exc import SQLAlchemyError

from . import BaseMCPTaskTool, TaskValidationMixin
from ..models.task import Task
from ..models.user import User
from .responses import TaskOperationResponses, MCPResponse
from .utils import TaskUtils, UserIsolationUtils, ValidationUtils
from .errors import ValidationError, DatabaseError


class AddTaskTool(BaseMCPTaskTool, TaskValidationMixin):
    """
    MCP Tool for adding a new task for the authenticated user.
    """

    def __init__(self):
        """Initialize the add_task tool."""
        self._name = "add_task"
        self._description = "Create a new task for the authenticated user"
        self._input_schema = {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title of the task (required, 1-200 characters)"
                },
                "description": {
                    "type": "string",
                    "description": "Optional description of the task (up to 2000 characters)"
                },
            },
            "required": ["title"],
            "additionalProperties": False,
        }

    @property
    def name(self) -> str:
        """Get the tool name."""
        return self._name

    @property
    def description(self) -> str:
        """Get the tool description."""
        return self._description

    @property
    def input_schema(self) -> Dict[str, Any]:
        """Get the tool's input schema."""
        return self._input_schema

    async def execute(self, arguments: Dict[str, Any], user: User) -> Dict[str, Any]:
        """
        Execute the add_task tool with the provided arguments for the authenticated user.

        Args:
            arguments: Tool-specific arguments containing title and optional description
            user: Authenticated user

        Returns:
            Tool execution result with created task data
        """
        try:
            # Validate input arguments
            title = arguments.get("title")
            description = arguments.get("description")

            # Validate required fields
            missing_fields = ValidationUtils.validate_required_fields(arguments, ["title"])
            if missing_fields:
                raise ValidationError(
                    f"Missing required fields: {', '.join(missing_fields)}",
                    field_errors={field: ["This field is required"] for field in missing_fields}
                )

            # Validate title
            is_valid, error_msg = TaskUtils.validate_task_title(title)
            if not is_valid:
                raise ValidationError(
                    error_msg,
                    field_errors={"title": [error_msg]}
                )

            # Validate description if provided
            if description is not None:
                is_valid, error_msg = TaskUtils.validate_task_description(description)
                if not is_valid:
                    raise ValidationError(
                        error_msg,
                        field_errors={"description": [error_msg]}
                    )

            # Sanitize inputs
            title = TaskUtils.sanitize_input(title)
            description = TaskUtils.sanitize_input(description) if description else None

            # Create new task instance using existing Task model
            new_task = Task(
                title=title,
                description=description,
                completed=False,  # New tasks start as incomplete
                user_id=user.id,  # Associate with authenticated user
                # id will be auto-generated, timestamps will be auto-populated
            )

            # Save to database using existing infrastructure
            from ..core.database import get_db

            async with get_db() as session:
                # Add the new task to the session
                session.add(new_task)

                # Commit the transaction
                await session.commit()

                # Refresh to get auto-generated fields (id, timestamps)
                await session.refresh(new_task)

            # Return success response with created task data
            return TaskOperationResponses.task_created(new_task).to_dict()

        except ValidationError as e:
            # Return validation error response
            return e.to_dict()

        except SQLAlchemyError as e:
            # Handle database errors
            raise DatabaseError(
                message="Failed to create task in database",
                original_error=e,
                details={"operation": "add_task", "user_id": str(user.id)}
            ).to_dict()

        except Exception as e:
            # Handle any other errors
            raise DatabaseError(
                message=f"Unexpected error during task creation: {str(e)}",
                original_error=e,
                details={"operation": "add_task", "user_id": str(user.id)}
            ).to_dict()


# Global instance of the tool
add_task_tool = AddTaskTool()


__all__ = ["AddTaskTool", "add_task_tool"]