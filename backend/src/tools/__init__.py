"""
MCP Tools Package Initialization

This module provides base classes and utilities for MCP task tools.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Protocol
from uuid import UUID
import asyncio

from ..models.task import Task
from ..models.user import User


class BaseMCPTaskTool(ABC):
    """
    Abstract base class for all MCP task tools.

    Provides common functionality and interfaces for task management tools.
    """

    @abstractmethod
    async def execute(self, arguments: Dict[str, Any], user: User) -> Dict[str, Any]:
        """
        Execute the tool with the provided arguments for the authenticated user.

        Args:
            arguments: Tool-specific arguments
            user: Authenticated user

        Returns:
            Tool execution result
        """
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Get the tool name."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Get the tool description."""
        pass

    @property
    @abstractmethod
    def input_schema(self) -> Dict[str, Any]:
        """Get the tool's input schema."""
        pass


class TaskValidationMixin:
    """
    Mixin class providing common task validation methods.
    """

    @staticmethod
    def validate_task_title(title: str) -> bool:
        """
        Validate a task title according to business rules.

        Args:
            title: Task title to validate

        Returns:
            True if valid, False otherwise
        """
        if not title or not isinstance(title, str):
            return False

        # Check length constraints (following existing model constraints)
        if len(title.strip()) < 1 or len(title) > 200:
            return False

        return True

    @staticmethod
    def validate_task_description(description: str) -> bool:
        """
        Validate a task description according to business rules.

        Args:
            description: Task description to validate

        Returns:
            True if valid, False otherwise
        """
        if description is None:
            return True  # Description is optional

        if not isinstance(description, str):
            return False

        # Check length constraints (following existing model constraints)
        if len(description) > 2000:
            return False

        return True


# Common constants for MCP tools
TASK_STATUS_PENDING = "pending"
TASK_STATUS_COMPLETED = "completed"

# Export commonly used classes/functions
__all__ = [
    "BaseMCPTaskTool",
    "TaskValidationMixin",
    "TASK_STATUS_PENDING",
    "TASK_STATUS_COMPLETED"
]