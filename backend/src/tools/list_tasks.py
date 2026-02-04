"""
List Tasks MCP Tool

This module implements the list_tasks MCP tool for retrieving tasks.
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
from .errors import ValidationError, DatabaseError


class ListTasksTool(BaseMCPTaskTool, TaskValidationMixin):
    """
    MCP Tool for listing tasks for the authenticated user.
    """

    def __init__(self):
        """Initialize the list_tasks tool."""
        self._name = "list_tasks"
        self._description = "Retrieve all tasks for the authenticated user"
        self._input_schema = {
            "type": "object",
            "properties": {
                "completed": {
                    "type": "boolean",
                    "description": "Filter by completion status if provided"
                },
            },
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
        Execute the list_tasks tool with the provided arguments for the authenticated user.

        Args:
            arguments: Tool-specific arguments containing optional filters
            user: Authenticated user

        Returns:
            Tool execution result with list of tasks
        """
        try:
            # Validate input arguments
            completed_filter = arguments.get("completed")

            # Validate data types if provided
            if completed_filter is not None and not isinstance(completed_filter, bool):
                raise ValidationError(
                    "completed parameter must be a boolean",
                    field_errors={"completed": ["Must be a boolean value"]}
                )

            # Build query to retrieve user's tasks
            from ..core.database import get_db

            async with get_db() as session:
                # Create base query for tasks belonging to the authenticated user
                query = select(Task).where(Task.user_id == user.id)

                # Apply completion status filter if provided
                if completed_filter is not None:
                    query = query.where(Task.completed == completed_filter)

                # Execute query and fetch results
                result = await session.execute(query)
                tasks = result.scalars().all()

            # Return success response with tasks
            return TaskOperationResponses.task_listed(tasks).to_dict()

        except ValidationError as e:
            # Return validation error response
            return e.to_dict()

        except SQLAlchemyError as e:
            # Handle database errors
            raise DatabaseError(
                message="Failed to retrieve tasks from database",
                original_error=e,
                details={"operation": "list_tasks", "user_id": str(user.id)}
            ).to_dict()

        except Exception as e:
            # Handle any other errors
            raise DatabaseError(
                message=f"Unexpected error during task retrieval: {str(e)}",
                original_error=e,
                details={"operation": "list_tasks", "user_id": str(user.id)}
            ).to_dict()


# Global instance of the tool
list_tasks_tool = ListTasksTool()


__all__ = ["ListTasksTool", "list_tasks_tool"]