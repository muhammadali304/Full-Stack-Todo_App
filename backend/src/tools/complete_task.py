"""
Complete Task MCP Tool

This module implements the complete_task MCP tool for marking tasks as completed.
"""

from typing import Dict, Any
from uuid import UUID
from datetime import datetime

from sqlmodel import select
from sqlalchemy.exc import SQLAlchemyError

from . import BaseMCPTaskTool, TaskValidationMixin
from ..models.task import Task
from ..models.user import User
from .responses import TaskOperationResponses, MCPResponse
from .utils import TaskUtils, UserIsolationUtils, ValidationUtils
from .errors import ValidationError, DatabaseError, TaskNotFoundError


class CompleteTaskTool(BaseMCPTaskTool, TaskValidationMixin):
    """
    MCP Tool for marking a task as completed for the authenticated user.
    """

    def __init__(self):
        """Initialize the complete_task tool."""
        self._name = "complete_task"
        self._description = "Mark a task as completed"
        self._input_schema = {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "The ID of the task to complete"
                },
            },
            "required": ["task_id"],
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
        Execute the complete_task tool with the provided arguments for the authenticated user.

        Args:
            arguments: Tool-specific arguments containing the task_id
            user: Authenticated user

        Returns:
            Tool execution result with updated task data
        """
        try:
            # Validate input arguments
            task_id = arguments.get("task_id")

            # Validate required fields
            missing_fields = ValidationUtils.validate_required_fields(arguments, ["task_id"])
            if missing_fields:
                raise ValidationError(
                    f"Missing required fields: {', '.join(missing_fields)}",
                    field_errors={field: ["This field is required"] for field in missing_fields}
                )

            # Validate task_id format
            if not TaskUtils.is_valid_uuid(task_id):
                raise ValidationError(
                    f"Invalid task ID format: {task_id}",
                    field_errors={"task_id": [f"'{task_id}' is not a valid UUID"]}
                )

            # Verify user owns the task
            from ..core.database import get_db

            async with get_db() as session:
                # Get the task that belongs to the authenticated user
                query = select(Task).where(Task.id == task_id, Task.user_id == user.id)
                result = await session.execute(query)
                task = result.scalar_one_or_none()

                if not task:
                    raise TaskNotFoundError(
                        task_id=task_id,
                        message=f"Task with ID {task_id} not found or does not belong to user"
                    )

                # Update the task's completion status
                task.completed = True
                task.updated_at = datetime.utcnow()

                # Commit the changes
                await session.commit()
                await session.refresh(task)

            # Return success response with updated task
            return TaskOperationResponses.task_completed(task).to_dict()

        except ValidationError as e:
            # Return validation error response
            return e.to_dict()

        except TaskNotFoundError as e:
            # Return not found error response
            return e.to_dict()

        except SQLAlchemyError as e:
            # Handle database errors
            raise DatabaseError(
                message="Failed to update task in database",
                original_error=e,
                details={"operation": "complete_task", "user_id": str(user.id), "task_id": task_id}
            ).to_dict()

        except Exception as e:
            # Handle any other errors
            raise DatabaseError(
                message=f"Unexpected error during task completion: {str(e)}",
                original_error=e,
                details={"operation": "complete_task", "user_id": str(user.id), "task_id": task_id}
            ).to_dict()


# Global instance of the tool
complete_task_tool = CompleteTaskTool()


__all__ = ["CompleteTaskTool", "complete_task_tool"]