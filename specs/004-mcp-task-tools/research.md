# Research: MCP Server + Task Tools Implementation

**Feature**: 004-mcp-task-tools
**Date**: 2026-01-20

## Overview

This document outlines the research findings for implementing an MCP server with task management tools for the Todo application. The research covers technology choices, integration patterns, and best practices for the required components.

## MCP SDK Research

**Decision**: Use Official MCP SDK for Python
**Rationale**: The requirement specifically states "MCP SDK: Official only", so we must use the official SDK. The Python SDK provides the necessary tools to define and expose MCP tools for task management operations.
**Alternatives considered**: Custom protocol implementation was rejected due to complexity and non-compliance with requirements.

## Database Integration Research

**Decision**: Use SQLModel with Neon PostgreSQL
**Rationale**: The requirement specifically states "ORM: SQLModel only", so we must use SQLModel. SQLModel provides Pydantic-compatible models with SQLAlchemy under the hood, making it ideal for FastAPI integration.
**Alternatives considered**: Raw SQL queries, SQLAlchemy Core, and other ORMs were rejected due to constraints.

## Authentication Research

**Decision**: Use Better Auth with JWT verification
**Rationale**: The requirement specifies "Auth: Better Auth JWT", which means we need to implement JWT token verification in the MCP tools to ensure user authentication and authorization.
**Alternatives considered**: Session-based authentication was rejected due to the stateless requirement.

## Stateless Architecture Research

**Decision**: Implement stateless MCP tools with database persistence
**Rationale**: The requirement "Stateless execution (no in-memory state)" means all data must be persisted to the database, with no in-memory state maintained between requests. Each MCP tool call will be self-contained and rely on database storage.
**Alternatives considered**: In-memory caching was rejected due to the stateless constraint.

## FastAPI Integration Research

**Decision**: Use FastAPI as the web framework for MCP server
**Rationale**: FastAPI integrates well with Pydantic models (used by SQLModel) and provides excellent support for async operations, which is beneficial for MCP tool implementations.
**Alternatives considered**: Flask and other frameworks were rejected due to the preference for FastAPI in the existing codebase.

## Error Handling Patterns

**Decision**: Implement structured JSON error responses with appropriate HTTP status codes
**Rationale**: The requirement for "Structured JSON responses" and proper error handling necessitates consistent error response formats with appropriate HTTP status codes for different error conditions.
**Alternatives considered**: Plain text error messages were rejected for being less structured and harder to parse.

## Existing Backend Infrastructure Research

**Decision**: Leverage existing backend infrastructure for MCP tools implementation
**Rationale**: The existing backend already has a well-structured foundation with:
- SQLModel Task entity with proper user relationships
- User entity with authentication integration
- Authentication dependencies and middleware
- Database connection management
- Error handling following RFC 7807 standards
- Existing CRUD operations for tasks with user isolation

This allows us to focus on MCP-specific implementation while reusing proven components.

## Existing Frontend Infrastructure Research

**Decision**: Leverage existing frontend infrastructure for MCP tools integration
**Rationale**: The existing frontend already has a well-structured foundation with:
- Next.js 16+ with App Router
- Task management components (TaskList, TaskForm, TaskItem, TaskEditForm)
- Authentication components (LoginForm, RegisterForm)
- Authentication hooks (useAuth) and context (AuthContext)
- Task management hooks (useTasks) with full CRUD operations
- API client with JWT token handling and error management
- Protected routes and layout components
- Responsive UI with proper loading and error states

This allows for seamless integration of MCP tools with the existing UI patterns and authentication flow.

## Task Entity Analysis

**Decision**: Reuse existing Task entity from src/models/task.py
**Rationale**: The existing Task entity already includes all required fields:
- id (UUID): Primary key, unique identifier for the task
- user_id (UUID): Foreign key linking to the user who owns this task
- title (String): The title or subject of the task (required, 1-200 chars)
- description (Text): Optional detailed description of the task (nullable, 0-2000 chars)
- completed (Boolean): Flag indicating whether the task is completed (default: False)
- created_at (DateTime): Timestamp when the task was created (auto-populated)
- updated_at (DateTime): Timestamp when the task was last updated (auto-populated)

The entity already has proper validation rules and user relationships established.

## Authentication Infrastructure Analysis

**Decision**: Reuse existing authentication infrastructure from src/api/dependencies.py
**Rationale**: The existing authentication system already provides:
- JWT token validation using Better Auth
- User isolation with proper ownership checks
- Current user dependency injection
- Proper error handling for authentication failures

This eliminates the need to reimplement authentication logic.

## MCP Tool Patterns

**Decision**: Each MCP tool will follow a consistent pattern of: authenticate user (via existing deps) -> authorize operation -> perform database operation (via existing models) -> return structured response
**Rationale**: This pattern ensures consistent security enforcement and error handling across all tools while leveraging existing infrastructure.
**Patterns established**:
- add_task: Validate input -> Create task with authenticated user_id (from existing model) -> Return created task
- list_tasks: Authenticate user (via existing deps) -> Query tasks filtered by user_id (from existing model) -> Return task list
- complete_task: Authenticate user (via existing deps) -> Verify task belongs to user (from existing model) -> Update completion status -> Return updated task
- delete_task: Authenticate user (via existing deps) -> Verify task belongs to user (from existing model) -> Delete task -> Return success confirmation
- update_task: Authenticate user (via existing deps) -> Verify task belongs to user (from existing model) -> Update task -> Return updated task