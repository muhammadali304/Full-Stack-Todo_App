# Feature Specification: mcp-task-tools

**Feature Branch**: `004-mcp-task-tools`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "— Spec-4 (MCP Server + Task Tools)

## Goal
Build MCP server using Official MCP SDK that exposes stateless task tools for the Todo app.

---

## Scope
- MCP server setup (Python)
- Tool definitions:
  - add_task
  - list_tasks
  - complete_task
  - delete_task
  - update_task
- SQLModel integration with Task table
- Stateless execution (no in-memory state)
- JWT verification (Better Auth)
- User ownership enforcement
- Structured JSON responses
- Error handling (task not found, invalid input)
---

## Success Criteria
- All MCP tools callable independently
- All tools persist changes to Neon DB
- User can only access their own tasks
- Tools return structured JSON
- Unauthorized calls return 401
- All tools pass unit tests

---

## Constraints
- MCP SDK: Official only
- ORM: SQLModel only
- Auth: Better Auth JWT
- No direct DB writes outside tools
- No breaking Phase-II APIs
- No manual coding (Claude Code only)

---

## Not Building
- Chat endpoint
- AI agent logic
- Frontend UI
- Tool chaining logic
- Conversation persistence"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MCP Task Management (Priority: P1)

As a user of the AI chatbot, I want to interact with my todo tasks through natural language commands that are processed by MCP tools, so that I can manage my tasks without directly using the web interface.

**Why this priority**: This is the core functionality that enables the AI chatbot to interact with the task system using MCP tools, which is the primary goal of this feature.

**Independent Test**: The system can successfully process a user request to add a task via the add_task MCP tool and verify that the task is persisted in the database with the correct user ownership.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they request to add a task via the AI chatbot, **Then** the add_task MCP tool creates the task in the database and associates it with the authenticated user
2. **Given** a user is authenticated with a valid JWT token, **When** they request to list their tasks via the AI chatbot, **Then** the list_tasks MCP tool returns only tasks belonging to the authenticated user

---

### User Story 2 - Secure Task Operations (Priority: P2)

As a system administrator, I want to ensure that MCP tools enforce proper user authentication and ownership, so that users can only access and modify their own tasks.

**Why this priority**: Security and data isolation are critical for a multi-user system to prevent unauthorized access to other users' tasks.

**Independent Test**: An authenticated user attempts to access another user's tasks through the list_tasks tool and is only returned their own tasks.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token for their account, **When** they request to list tasks using the list_tasks MCP tool, **Then** only tasks associated with their user ID are returned
2. **Given** a user attempts to update another user's task, **When** the update_task MCP tool is called, **Then** the operation fails with appropriate error handling

---

### User Story 3 - Error Handling and Validation (Priority: P3)

As a user, I want the system to provide clear error messages when invalid requests are made to MCP tools, so that I can understand what went wrong.

**Why this priority**: Proper error handling improves user experience and helps with debugging and system maintenance.

**Independent Test**: When an invalid task ID is provided to the complete_task tool, the system returns a structured error response indicating the task was not found.

**Acceptance Scenarios**:

1. **Given** a user provides an invalid task ID, **When** they call the complete_task MCP tool, **Then** the system returns a structured error response with appropriate HTTP status code
2. **Given** an unauthenticated user attempts to call any MCP tool, **When** the request is processed, **Then** the system returns a 401 Unauthorized response

---

### Edge Cases

- What happens when a user tries to delete a task that doesn't exist?
- How does the system handle malformed JWT tokens?
- What occurs when the database is temporarily unavailable during an MCP tool operation?
- How does the system behave when a user attempts to update a task they don't own?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement an MCP server using the Official MCP SDK
- **FR-002**: System MUST expose an add_task MCP tool that creates new tasks in the database
- **FR-003**: System MUST expose a list_tasks MCP tool that retrieves tasks for the authenticated user
- **FR-004**: System MUST expose a complete_task MCP tool that marks tasks as completed
- **FR-005**: System MUST expose a delete_task MCP tool that removes tasks from the database
- **FR-006**: System MUST expose an update_task MCP tool that modifies existing tasks
- **FR-007**: System MUST integrate with SQLModel for database operations
- **FR-008**: System MUST verify JWT tokens from Better Auth before executing any MCP tool
- **FR-009**: System MUST enforce user ownership by checking that operations only affect the authenticated user's tasks
- **FR-010**: System MUST return structured JSON responses from all MCP tools
- **FR-011**: System MUST handle errors appropriately with proper error messages and HTTP status codes
- **FR-012**: System MUST execute tools in a stateless manner with no in-memory state

### Key Entities *(include if feature involves data)*

- **Task**: Represents a user's todo item with properties: id, user_id (foreign key to User), title, description, completed status, created_at, updated_at
- **User**: Represents a system user with properties: id, email, name, created_at (from Better Auth integration)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) are callable independently and return successful responses
- **SC-002**: All tool operations persist changes to the Neon PostgreSQL database successfully
- **SC-003**: Users can only access and modify their own tasks, with 100% enforcement of user ownership
- **SC-004**: All MCP tools return structured JSON responses that conform to defined schemas
- **SC-005**: Unauthorized calls to MCP tools return 401 Unauthorized status codes consistently
- **SC-006**: All MCP tools pass unit tests with 100% success rate