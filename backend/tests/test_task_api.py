"""
Test suite for Task API endpoints.

This module tests all CRUD operations and error handling for the Task API.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.task import Task


class TestCreateTask:
    """Tests for POST /api/tasks endpoint."""

    @pytest.mark.asyncio
    async def test_create_task_success(self, client: AsyncClient, sample_task_data: dict):
        """Test successful task creation."""
        response = await client.post("/api/tasks", json=sample_task_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task_data["title"]
        assert data["description"] == sample_task_data["description"]
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_task_minimal(self, client: AsyncClient, sample_task_data_minimal: dict):
        """Test task creation with only required fields."""
        response = await client.post("/api/tasks", json=sample_task_data_minimal)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task_data_minimal["title"]
        assert data["description"] is None

    @pytest.mark.asyncio
    async def test_create_task_empty_title(self, client: AsyncClient):
        """Test task creation with empty title returns 400."""
        response = await client.post("/api/tasks", json={"title": "   "})

        assert response.status_code == 400
        data = response.json()
        assert data["type"] == "validation_error"
        assert data["status"] == 400

    @pytest.mark.asyncio
    async def test_create_task_title_too_long(self, client: AsyncClient):
        """Test task creation with title exceeding 200 characters."""
        response = await client.post("/api/tasks", json={"title": "A" * 201})

        assert response.status_code == 400


class TestListTasks:
    """Tests for GET /api/tasks endpoint."""

    @pytest.mark.asyncio
    async def test_list_tasks_empty(self, client: AsyncClient):
        """Test listing tasks when database is empty."""
        response = await client.get("/api/tasks")

        assert response.status_code == 200
        data = response.json()
        assert data == []

    @pytest.mark.asyncio
    async def test_list_tasks_ordered_newest_first(self, client: AsyncClient):
        """Test tasks are ordered by created_at DESC (newest first)."""
        # Create multiple tasks
        task1 = await client.post("/api/tasks", json={"title": "First Task"})
        task2 = await client.post("/api/tasks", json={"title": "Second Task"})
        task3 = await client.post("/api/tasks", json={"title": "Third Task"})

        # List tasks
        response = await client.get("/api/tasks")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Newest first
        assert data[0]["title"] == "Third Task"
        assert data[1]["title"] == "Second Task"
        assert data[2]["title"] == "First Task"


class TestGetTask:
    """Tests for GET /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_task_success(self, client: AsyncClient, sample_task_data: dict):
        """Test retrieving a specific task by ID."""
        # Create task
        create_response = await client.post("/api/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Get task
        response = await client.get(f"/api/tasks/{task_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == sample_task_data["title"]

    @pytest.mark.asyncio
    async def test_get_task_not_found(self, client: AsyncClient):
        """Test retrieving non-existent task returns 404."""
        response = await client.get("/api/tasks/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404
        data = response.json()
        assert data["type"] == "not_found"
        assert data["status"] == 404


class TestUpdateTask:
    """Tests for PATCH /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_task_title_only(self, client: AsyncClient, sample_task_data: dict):
        """Test partial update - title only."""
        # Create task
        create_response = await client.post("/api/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Update title only
        response = await client.patch(
            f"/api/tasks/{task_id}",
            json={"title": "Updated Title"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == sample_task_data["description"]  # Unchanged

    @pytest.mark.asyncio
    async def test_update_task_not_found(self, client: AsyncClient):
        """Test updating non-existent task returns 404."""
        response = await client.patch(
            "/api/tasks/550e8400-e29b-41d4-a716-446655440000",
            json={"title": "Test"}
        )

        assert response.status_code == 404


class TestDeleteTask:
    """Tests for DELETE /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_delete_task_success(self, client: AsyncClient, sample_task_data: dict):
        """Test successful task deletion."""
        # Create task
        create_response = await client.post("/api/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Delete task
        response = await client.delete(f"/api/tasks/{task_id}")

        assert response.status_code == 204

        # Verify task is deleted
        get_response = await client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, client: AsyncClient):
        """Test deleting non-existent task returns 404."""
        response = await client.delete("/api/tasks/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404


class TestToggleTask:
    """Tests for POST /api/tasks/{task_id}/toggle endpoint."""

    @pytest.mark.asyncio
    async def test_toggle_task_to_completed(self, client: AsyncClient, sample_task_data: dict):
        """Test toggling task from incomplete to completed."""
        # Create task (defaults to completed=false)
        create_response = await client.post("/api/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Toggle to completed
        response = await client.post(f"/api/tasks/{task_id}/toggle")

        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_toggle_task_multiple_times(self, client: AsyncClient, sample_task_data: dict):
        """Test toggling task multiple times flips state correctly."""
        # Create task
        create_response = await client.post("/api/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Toggle 1: false -> true
        response1 = await client.post(f"/api/tasks/{task_id}/toggle")
        assert response1.json()["completed"] is True

        # Toggle 2: true -> false
        response2 = await client.post(f"/api/tasks/{task_id}/toggle")
        assert response2.json()["completed"] is False

        # Toggle 3: false -> true
        response3 = await client.post(f"/api/tasks/{task_id}/toggle")
        assert response3.json()["completed"] is True

    @pytest.mark.asyncio
    async def test_toggle_task_not_found(self, client: AsyncClient):
        """Test toggling non-existent task returns 404."""
        response = await client.post("/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle")

        assert response.status_code == 404
