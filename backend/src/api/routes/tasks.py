"""
Task API routes for CRUD operations.

This module provides RESTful endpoints for task management:
- POST /api/tasks: Create a new task
- GET /api/tasks: List all tasks (ordered by newest first)
- GET /api/tasks/{task_id}: Get a specific task by ID
- PATCH /api/tasks/{task_id}: Update a task
- DELETE /api/tasks/{task_id}: Delete a task
- POST /api/tasks/{task_id}/toggle: Toggle task completion status

All endpoints follow RFC 7807 Problem Details for error responses.
"""

from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.errors import TaskNotFoundError, DatabaseError
from ...models.task import Task
from ...models.user import User
from ...schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..dependencies import get_db, get_current_user


# Initialize router with prefix and tags for OpenAPI documentation
router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description=(
        "Create a new task with title and optional description. "
        "The task will be created with completed=false by default. "
        "Timestamps (created_at, updated_at) are set automatically."
    ),
    responses={
        201: {
            "description": "Task created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "title": "Complete project documentation",
                        "description": "Write comprehensive documentation for the API endpoints",
                        "completed": False,
                        "user_id": None,
                        "created_at": "2026-01-11T10:30:00Z",
                        "updated_at": "2026-01-11T10:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error (empty title, length constraints violated)",
            "content": {
                "application/json": {
                    "example": {
                        "type": "validation_error",
                        "title": "Validation Error",
                        "status": 400,
                        "detail": "title: Value error, Title cannot be empty or whitespace-only",
                        "instance": "/api/tasks"
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to create task in database",
                        "instance": "/api/tasks"
                    }
                }
            }
        }
    }
)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Task:
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description)
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        Task: Created task with all fields including auto-generated id and timestamps

    Raises:
        DatabaseError: If database operation fails
        RequestValidationError: If validation fails (handled by FastAPI)
        HTTPException 401: If authentication fails

    Example Request:
        POST /api/tasks
        Authorization: Bearer <jwt_token>
        {
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation for the API endpoints"
        }

    Example Response (201 Created):
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation for the API endpoints",
            "completed": false,
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "created_at": "2026-01-11T10:30:00Z",
            "updated_at": "2026-01-11T10:30:00Z"
        }
    """
    try:
        # Create new task instance with user_id from authenticated user
        # Note: id, created_at, updated_at are set automatically by model defaults
        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            completed=task_data.completed if task_data.completed is not None else False,
            user_id=current_user.id,
        )

        # Add to database session
        db.add(new_task)

        # Commit transaction
        await db.commit()

        # Refresh to get auto-generated fields (id, timestamps)
        await db.refresh(new_task)

        return new_task

    except SQLAlchemyError as e:
        # Rollback transaction on error
        await db.rollback()
        raise DatabaseError(
            message="Failed to create task in database",
            original_error=e
        )


@router.get(
    "/",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List all tasks",
    description=(
        "Retrieve all tasks ordered by creation date (newest first). "
        "Returns an empty array if no tasks exist."
    ),
    responses={
        200: {
            "description": "List of tasks (may be empty)",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "title": "Complete project documentation",
                            "description": "Write comprehensive documentation for the API endpoints",
                            "completed": False,
                            "user_id": None,
                            "created_at": "2026-01-11T10:30:00Z",
                            "updated_at": "2026-01-11T10:30:00Z"
                        },
                        {
                            "id": "660e8400-e29b-41d4-a716-446655440001",
                            "title": "Review pull requests",
                            "description": None,
                            "completed": True,
                            "user_id": None,
                            "created_at": "2026-01-11T09:15:00Z",
                            "updated_at": "2026-01-11T09:45:00Z"
                        }
                    ]
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to retrieve tasks from database",
                        "instance": "/api/tasks"
                    }
                }
            }
        }
    }
)
async def list_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Task]:
    """
    List all tasks for the authenticated user ordered by creation date (newest first).

    Args:
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        List[Task]: List of user's tasks (empty list if no tasks exist)

    Raises:
        DatabaseError: If database operation fails
        HTTPException 401: If authentication fails

    Example Response (200 OK):
        [
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation",
                "completed": false,
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2026-01-11T10:30:00Z",
                "updated_at": "2026-01-11T10:30:00Z"
            }
        ]
    """
    try:
        # Query all tasks for authenticated user ordered by created_at DESC (newest first)
        statement = select(Task).where(Task.user_id == current_user.id).order_by(Task.created_at.desc())
        result = await db.execute(statement)
        tasks = result.scalars().all()

        return list(tasks)

    except SQLAlchemyError as e:
        raise DatabaseError(
            message="Failed to retrieve tasks from database",
            original_error=e
        )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific task",
    description="Retrieve a single task by its unique identifier (UUID).",
    responses={
        200: {
            "description": "Task found and returned",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "title": "Complete project documentation",
                        "description": "Write comprehensive documentation for the API endpoints",
                        "completed": False,
                        "user_id": None,
                        "created_at": "2026-01-11T10:30:00Z",
                        "updated_at": "2026-01-11T10:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Task not found",
            "content": {
                "application/json": {
                    "example": {
                        "type": "not_found",
                        "title": "Not Found",
                        "status": 404,
                        "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to retrieve task from database",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        }
    }
)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Task:
    """
    Get a specific task by ID for the authenticated user.

    Args:
        task_id: UUID of the task to retrieve
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        Task: The requested task

    Raises:
        TaskNotFoundError: If task with given ID doesn't exist or doesn't belong to user (404)
        DatabaseError: If database operation fails (500)
        HTTPException 401: If authentication fails

    Example Response (200 OK):
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation",
            "completed": false,
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "created_at": "2026-01-11T10:30:00Z",
            "updated_at": "2026-01-11T10:30:00Z"
        }

    Example Error Response (404 Not Found):
        {
            "type": "not_found",
            "title": "Not Found",
            "status": 404,
            "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
            "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
        }
    """
    try:
        # Query task by ID and user_id to enforce user isolation
        statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        result = await db.execute(statement)
        task = result.scalar_one_or_none()

        # Raise 404 if task not found or doesn't belong to user
        if task is None:
            raise TaskNotFoundError(task_id=str(task_id))

        return task

    except TaskNotFoundError:
        # Re-raise TaskNotFoundError to be handled by exception handler
        raise

    except SQLAlchemyError as e:
        raise DatabaseError(
            message="Failed to retrieve task from database",
            original_error=e
        )


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a task",
    description=(
        "Update an existing task with partial data (PATCH semantics). "
        "Only provided fields will be updated. Omitted fields remain unchanged. "
        "The updated_at timestamp is automatically updated on every modification."
    ),
    responses={
        200: {
            "description": "Task updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "title": "Updated task title",
                        "description": "Write comprehensive documentation for the API endpoints",
                        "completed": False,
                        "user_id": None,
                        "created_at": "2026-01-11T10:30:00Z",
                        "updated_at": "2026-01-11T11:45:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error (empty title, length constraints violated)",
            "content": {
                "application/json": {
                    "example": {
                        "type": "validation_error",
                        "title": "Validation Error",
                        "status": 400,
                        "detail": "title: Value error, Title cannot be empty or whitespace-only",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        },
        404: {
            "description": "Task not found",
            "content": {
                "application/json": {
                    "example": {
                        "type": "not_found",
                        "title": "Not Found",
                        "status": 404,
                        "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to update task in database",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        }
    }
)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Task:
    """
    Update an existing task with partial data (PATCH semantics) for the authenticated user.

    This endpoint supports partial updates - only the fields provided in the
    request body will be updated. Omitted fields will remain unchanged.

    Args:
        task_id: UUID of the task to update
        task_data: Task update data (all fields optional)
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        Task: Updated task with all fields including updated timestamp

    Raises:
        TaskNotFoundError: If task with given ID doesn't exist or doesn't belong to user (404)
        RequestValidationError: If validation fails (handled by FastAPI, returns 400)
        DatabaseError: If database operation fails (500)
        HTTPException 401: If authentication fails

    Example Request:
        PATCH /api/tasks/550e8400-e29b-41d4-a716-446655440000
        Authorization: Bearer <jwt_token>
        {
            "title": "Updated task title"
        }

    Example Response (200 OK):
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Updated task title",
            "description": "Original description remains unchanged",
            "completed": false,
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "created_at": "2026-01-11T10:30:00Z",
            "updated_at": "2026-01-11T11:45:00Z"
        }

    Example Error Response (404 Not Found):
        {
            "type": "not_found",
            "title": "Not Found",
            "status": 404,
            "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
            "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
        }
    """
    try:
        # Query task by ID and user_id to enforce user isolation
        statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        result = await db.execute(statement)
        task = result.scalar_one_or_none()

        # Raise 404 if task not found or doesn't belong to user
        if task is None:
            raise TaskNotFoundError(task_id=str(task_id))

        # Update only provided fields (partial update)
        update_data = task_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(task, field, value)

        # Update the updated_at timestamp (T024)
        task.updated_at = datetime.utcnow()

        # Commit transaction
        await db.commit()

        # Refresh to get updated data
        await db.refresh(task)

        return task

    except TaskNotFoundError:
        # Re-raise TaskNotFoundError to be handled by exception handler
        raise

    except SQLAlchemyError as e:
        # Rollback transaction on error
        await db.rollback()
        raise DatabaseError(
            message="Failed to update task in database",
            original_error=e
        )


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Delete an existing task by its unique identifier (UUID).",
    responses={
        204: {
            "description": "Task deleted successfully (no content returned)"
        },
        404: {
            "description": "Task not found",
            "content": {
                "application/json": {
                    "example": {
                        "type": "not_found",
                        "title": "Not Found",
                        "status": 404,
                        "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to delete task from database",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
                    }
                }
            }
        }
    }
)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Response:
    """
    Delete an existing task by ID for the authenticated user.

    Args:
        task_id: UUID of the task to delete
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        Response: 204 No Content (empty response body)

    Raises:
        TaskNotFoundError: If task with given ID doesn't exist or doesn't belong to user (404)
        DatabaseError: If database operation fails (500)
        HTTPException 401: If authentication fails

    Example Request:
        DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440000
        Authorization: Bearer <jwt_token>

    Example Response (204 No Content):
        (empty response body)

    Example Error Response (404 Not Found):
        {
            "type": "not_found",
            "title": "Not Found",
            "status": 404,
            "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
            "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
        }
    """
    try:
        # Query task by ID and user_id to enforce user isolation
        statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        result = await db.execute(statement)
        task = result.scalar_one_or_none()

        # Raise 404 if task not found or doesn't belong to user
        if task is None:
            raise TaskNotFoundError(task_id=str(task_id))

        # Delete task
        await db.delete(task)

        # Commit transaction
        await db.commit()

        # Return 204 No Content
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except TaskNotFoundError:
        # Re-raise TaskNotFoundError to be handled by exception handler (T025)
        raise

    except SQLAlchemyError as e:
        # Rollback transaction on error
        await db.rollback()
        raise DatabaseError(
            message="Failed to delete task from database",
            original_error=e
        )


@router.post(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle task completion status",
    description=(
        "Toggle the completion status of a task without requiring the client "
        "to know the current state. If the task is completed, it becomes incomplete. "
        "If the task is incomplete, it becomes completed. "
        "The updated_at timestamp is automatically updated."
    ),
    responses={
        200: {
            "description": "Task completion status toggled successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "title": "Complete project documentation",
                        "description": "Write comprehensive documentation for the API endpoints",
                        "completed": True,
                        "user_id": None,
                        "created_at": "2026-01-11T10:30:00Z",
                        "updated_at": "2026-01-11T11:45:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Task not found",
            "content": {
                "application/json": {
                    "example": {
                        "type": "not_found",
                        "title": "Not Found",
                        "status": 404,
                        "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle"
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "type": "database_error",
                        "title": "Internal Server Error",
                        "status": 500,
                        "detail": "Failed to toggle task completion status in database",
                        "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle"
                    }
                }
            }
        }
    }
)
async def toggle_task_completion(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Task:
    """
    Toggle task completion status for the authenticated user.

    This endpoint flips the completion status of a task without requiring
    the client to know the current state. This provides a cleaner API for
    todo applications where users simply want to toggle a task's status.

    Args:
        task_id: UUID of the task to toggle
        current_user: Authenticated user (injected)
        db: Database session (injected)

    Returns:
        Task: Updated task with toggled completion status and updated timestamp

    Raises:
        TaskNotFoundError: If task with given ID doesn't exist or doesn't belong to user (404)
        DatabaseError: If database operation fails (500)
        HTTPException 401: If authentication fails

    Example Request:
        POST /api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle
        Authorization: Bearer <jwt_token>

    Example Response (200 OK) - Task toggled from incomplete to complete:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Complete project documentation",
            "description": "Write comprehensive documentation",
            "completed": true,
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "created_at": "2026-01-11T10:30:00Z",
            "updated_at": "2026-01-11T11:45:00Z"
        }

    Example Error Response (404 Not Found):
        {
            "type": "not_found",
            "title": "Not Found",
            "status": 404,
            "detail": "Task with id '550e8400-e29b-41d4-a716-446655440000' not found",
            "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle"
        }
    """
    try:
        # Query task by ID and user_id to enforce user isolation
        statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        result = await db.execute(statement)
        task = result.scalar_one_or_none()

        # Raise 404 if task not found or doesn't belong to user
        if task is None:
            raise TaskNotFoundError(task_id=str(task_id))

        # Toggle completion status (T027)
        task.completed = not task.completed

        # Update the updated_at timestamp (T026)
        task.updated_at = datetime.utcnow()

        # Commit transaction
        await db.commit()

        # Refresh to get updated data
        await db.refresh(task)

        return task

    except TaskNotFoundError:
        # Re-raise TaskNotFoundError to be handled by exception handler (T028)
        raise

    except SQLAlchemyError as e:
        # Rollback transaction on error (T028)
        await db.rollback()
        raise DatabaseError(
            message="Failed to toggle task completion status in database",
            original_error=e
        )
