# Implementation Plan: Backend API & Database Foundation

**Branch**: `001-backend-api-foundation` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-api-foundation/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a RESTful backend API with persistent storage for todo task management. The system provides complete CRUD operations (create, read, update, delete) for tasks with validation, error handling, and database persistence. This foundation enables task creation, retrieval, modification, and completion status management through well-defined API endpoints following REST conventions. Authentication is stubbed for this phase, focusing on core data operations and API correctness.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.14+, Pydantic 2.0+, asyncpg (PostgreSQL driver)
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest with pytest-asyncio for async endpoint testing
**Target Platform**: Linux/Windows server (containerizable)
**Project Type**: Web application (backend-only for this feature)
**Performance Goals**:
- Task retrieval: <500ms for databases with up to 10,000 tasks
- Error responses: <1 second
- Concurrent operations: 100+ without data corruption
**Constraints**:
- Backend-only (no frontend implementation)
- Authentication stubbed (no JWT validation in this phase)
- Single-user context (multi-user isolation deferred)
- Fixed tech stack per constitution (FastAPI, SQLModel, Neon PostgreSQL)
**Scale/Scope**:
- Initial target: 10,000 tasks
- Single backend service
- RESTful API with 6 endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Architecture
**Status**: ⚠️ DEFERRED (Documented Exception)
- JWT authentication is stubbed for this phase per spec requirements
- Authentication enforcement will be added in subsequent feature
- Current phase focuses on API correctness and data operations
- **Justification**: Spec explicitly states "authentication logic is stubbed or mocked" and "Not building: Authentication and authorization logic"

### Principle II: Strict User Isolation
**Status**: ⚠️ DEFERRED (Documented Exception)
- User isolation not enforced in this phase (single-user context)
- Database schema includes user_id field for future multi-user support
- **Justification**: Spec states "Single-user context for this phase (multi-user isolation will be added later)"

### Principle III: Spec-Driven Development
**Status**: ✅ PASS
- Complete specification exists with user stories, requirements, and success criteria
- Clarifications completed (5 questions resolved)
- This plan follows approved spec

### Principle IV: Agent-Generated Code Only
**Status**: ✅ PASS
- Implementation will use `fastapi-backend-dev` agent for API endpoints
- Implementation will use `neon-db-architect` agent for database schema
- No manual coding planned

### Principle V: Clear Layer Separation
**Status**: ✅ PASS
- Backend-only feature maintains clear separation
- Database layer (SQLModel) separate from API layer (FastAPI)
- Business logic in service layer, data access in models

### Technology Stack Compliance
**Status**: ✅ PASS
- Backend: Python FastAPI ✓
- ORM: SQLModel ✓
- Database: Neon Serverless PostgreSQL ✓
- No frontend work (deferred) ✓

**Gate Decision**: PROCEED with documented exceptions for Principles I & II (authentication and user isolation deferred per spec requirements)

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-api-foundation/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── openapi.yaml     # OpenAPI 3.0 specification
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # SQLModel Task model
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── tasks.py     # Task CRUD endpoints
│   │   └── dependencies.py  # Dependency injection (DB session)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings and environment variables
│   │   └── database.py      # Database connection and session management
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   └── main.py              # FastAPI application entry point
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_task_api.py     # API endpoint tests
│   └── test_task_model.py   # Model validation tests
├── alembic/                 # Database migrations (SQLModel/Alembic)
│   ├── versions/
│   └── env.py
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
└── README.md                # Backend setup instructions
```

**Structure Decision**: Web application structure (Option 2) selected with backend-only implementation. Frontend directory omitted as this feature focuses solely on backend API and database foundation. The backend/ directory contains all API, model, and database code with clear separation between layers (models, api, core, schemas).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle I (Security-First) deferred | Spec explicitly scopes this feature to backend foundation without auth enforcement | Cannot implement JWT validation without Better Auth integration, which is a separate feature |
| Principle II (User Isolation) deferred | Spec defines single-user context for this phase | Multi-user isolation requires authentication system to identify users |

**Note**: These are not violations but documented deferrals per spec requirements. The database schema includes user_id field to support future multi-user implementation.

## Phase 0: Research & Technical Decisions

### Decision 1: Database Connection Management

**Decision**: Use SQLModel's async engine with connection pooling via asyncpg driver

**Rationale**:
- SQLModel provides async support for FastAPI's async endpoints
- Connection pooling improves performance for concurrent requests
- asyncpg is the fastest PostgreSQL driver for Python
- Neon PostgreSQL supports standard PostgreSQL protocol

**Alternatives Considered**:
- Synchronous SQLAlchemy: Rejected due to blocking I/O limiting concurrency
- Raw asyncpg: Rejected due to lack of ORM features and increased complexity

**Implementation Notes**:
- Configure pool size based on expected concurrent connections (default: 10-20)
- Use dependency injection for database sessions
- Implement proper session cleanup with FastAPI dependencies

### Decision 2: Error Response Format

**Decision**: RFC 7807 Problem Details for HTTP APIs

**Rationale**:
- Industry standard for structured error responses
- Machine-readable with consistent schema
- Extensible for additional context
- Clarified in spec session 2026-01-11

**Structure**:
```json
{
  "type": "validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Title exceeds maximum length of 200 characters",
  "instance": "/api/tasks"
}
```

**Implementation Notes**:
- Create custom exception handler in FastAPI
- Map validation errors to RFC 7807 format
- Include instance field with request path

### Decision 3: API Endpoint Design

**Decision**: RESTful resource-based URLs with dedicated toggle endpoint

**Endpoints**:
- `GET /api/tasks` - List all tasks (newest first)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{task_id}` - Get specific task
- `PATCH /api/tasks/{task_id}` - Update task (partial)
- `DELETE /api/tasks/{task_id}` - Delete task
- `POST /api/tasks/{task_id}/toggle` - Toggle completion status

**Rationale**:
- Standard REST conventions for CRUD operations
- Dedicated toggle endpoint provides clear semantics (clarified in spec)
- PATCH for partial updates reduces payload size
- Predictable URL patterns improve API usability

**Alternatives Considered**:
- PUT for updates: Rejected in favor of PATCH for partial updates
- Toggle via PATCH: Rejected in favor of dedicated endpoint for better semantics

### Decision 4: Validation Strategy

**Decision**: Pydantic models for request validation with custom validators

**Validation Rules**:
- Title: Required, 1-200 characters
- Description: Optional, 0-2000 characters
- Completion status: Boolean, defaults to false

**Rationale**:
- Pydantic integrates natively with FastAPI
- Automatic validation with clear error messages
- Type safety and IDE support
- Clarified length limits in spec session 2026-01-11

**Implementation Notes**:
- Use Pydantic Field with min_length/max_length constraints
- Custom validator for title non-empty check
- Separate request/response schemas for flexibility

### Decision 5: Timestamp Management

**Decision**: Automatic timestamp generation using SQLModel with application-level updates

**Fields**:
- `created_at`: Set on insert using SQLModel's `default_factory=datetime.utcnow`
- `updated_at`: Set on insert using `default_factory=datetime.utcnow`, updated in application code before commit on PATCH/DELETE/toggle operations

**Rationale**:
- Ensures consistent timestamp handling across all operations
- Application-level control is simpler than database triggers
- SQLModel's default_factory prevents missing timestamps on creation
- Explicit updates in endpoint logic provide clear audit trail

**Implementation Notes**:
- Use SQLModel's `default_factory=datetime.utcnow` for both created_at and updated_at
- In PATCH/DELETE/toggle endpoints: `task.updated_at = datetime.utcnow()` before `session.commit()`
- Return timestamps in ISO 8601 format in API responses
- No database triggers needed (simpler migration and rollback)

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions, relationships, and validation rules.

**Summary**:
- **Task Entity**: Core entity with id, title, description, completed, user_id, created_at, updated_at
- **Validation**: Title 1-200 chars, description 0-2000 chars, completed boolean
- **Indexes**: Primary key on id, index on user_id (for future multi-user), index on created_at (for ordering)

### API Contracts

See [contracts/openapi.yaml](./contracts/openapi.yaml) for complete OpenAPI 3.0 specification.

**Summary**:
- 6 RESTful endpoints with request/response schemas
- RFC 7807 error responses for all error cases
- Consistent JSON structure across all operations
- HTTP status codes: 200 (OK), 201 (Created), 404 (Not Found), 400 (Bad Request), 500 (Internal Server Error)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for setup instructions and usage examples.

**Summary**:
- Environment setup (Python, dependencies, Neon PostgreSQL)
- Database initialization and migrations
- Running the FastAPI server
- Example API calls with curl/httpie
- Testing instructions

## Implementation Phases

### Phase 1: Database Schema & Models (Priority: P1)
**Goal**: Establish data persistence layer

**Tasks**:
1. Create SQLModel Task model with all fields and validation
2. Configure Neon PostgreSQL connection with asyncpg
3. Set up Alembic for database migrations
4. Create initial migration for tasks table
5. Implement database session management with dependency injection

**Acceptance**: Task model can be created, persisted, and retrieved from database

### Phase 2: Core CRUD Endpoints (Priority: P1)
**Goal**: Implement basic task operations

**Tasks**:
1. Create POST /api/tasks endpoint (create task)
2. Create GET /api/tasks endpoint (list all tasks, newest first)
3. Create GET /api/tasks/{task_id} endpoint (get single task)
4. Implement Pydantic request/response schemas
5. Add RFC 7807 error handling

**Acceptance**: Can create, list, and retrieve tasks via API

### Phase 3: Update & Delete Operations (Priority: P2)
**Goal**: Complete CRUD functionality

**Tasks**:
1. Create PATCH /api/tasks/{task_id} endpoint (partial update)
2. Create DELETE /api/tasks/{task_id} endpoint
3. Implement validation for update operations
4. Add 404 handling for non-existent tasks

**Acceptance**: Can update and delete tasks via API

### Phase 4: Completion Toggle (Priority: P3)
**Goal**: Add task status management

**Tasks**:
1. Create POST /api/tasks/{task_id}/toggle endpoint
2. Implement toggle logic (flip boolean state)
3. Add validation and error handling

**Acceptance**: Can toggle task completion status via dedicated endpoint

### Phase 5: Testing & Validation (Future Work)
**Goal**: Ensure API correctness and reliability

**Note**: Automated tests are not included in this phase per spec requirements ("Tests: Not requested in specification"). Manual validation is performed via tasks T035-T036 in tasks.md instead. This phase documents the testing strategy for future iterations.

**Future Testing Tasks** (if automated tests are added later):
1. Write pytest tests for all endpoints
2. Test error cases and validation
3. Test concurrent operations
4. Verify performance targets (500ms retrieval, 100 concurrent ops)
5. Validate RFC 7807 error format

**Current Acceptance**: Manual validation via quickstart.md examples and performance verification (T035-T036)

## Architectural Decisions

### ADR-001: SQLModel for ORM
**Context**: Need ORM for database operations with type safety
**Decision**: Use SQLModel (combines SQLAlchemy + Pydantic)
**Consequences**:
- ✅ Type safety with Python type hints
- ✅ Automatic Pydantic validation
- ✅ Native FastAPI integration
- ⚠️ Newer library with smaller ecosystem than pure SQLAlchemy

### ADR-002: Async FastAPI with asyncpg
**Context**: Need to handle concurrent requests efficiently
**Decision**: Use async FastAPI endpoints with asyncpg driver
**Consequences**:
- ✅ Non-blocking I/O for better concurrency
- ✅ Meets performance target of 100 concurrent operations
- ⚠️ Requires async/await throughout codebase
- ⚠️ More complex error handling with async

### ADR-003: Dedicated Toggle Endpoint
**Context**: Task completion toggling is a frequent operation
**Decision**: Provide POST /api/tasks/{task_id}/toggle endpoint
**Consequences**:
- ✅ Clear semantics for state transition
- ✅ Client doesn't need to know current state
- ✅ Reduces payload size (no body required)
- ⚠️ Additional endpoint to maintain

### ADR-004: RFC 7807 Error Format
**Context**: Need consistent, machine-readable error responses
**Decision**: Adopt RFC 7807 Problem Details standard
**Consequences**:
- ✅ Industry standard format
- ✅ Structured, parseable errors
- ✅ Extensible for additional context
- ⚠️ Requires custom FastAPI exception handlers

## Risk Analysis

### Risk 1: Database Connection Pool Exhaustion
**Likelihood**: Medium | **Impact**: High
**Mitigation**:
- Configure appropriate pool size (10-20 connections)
- Implement connection timeout and retry logic
- Monitor connection pool metrics
- Use FastAPI dependency injection for proper session cleanup

### Risk 2: Performance Degradation with Large Datasets
**Likelihood**: Low (initial scope: 10K tasks) | **Impact**: Medium
**Mitigation**:
- Index on created_at for efficient ordering
- Pagination support in future iteration (out of scope for this phase)
- Query optimization with SQLModel select statements

### Risk 3: Concurrent Update Conflicts
**Likelihood**: Low | **Impact**: Low
**Mitigation**:
- Last-write-wins strategy (acceptable for this phase)
- updated_at timestamp tracks latest modification
- Optimistic locking can be added in future if needed

## Next Steps

1. ✅ Complete Phase 0 (Research) - Documented above
2. ✅ Complete Phase 1 (Design) - data-model.md, contracts/, quickstart.md
3. ⏭️ Run `/sp.tasks` to generate implementation task breakdown
4. ⏭️ Execute tasks using `fastapi-backend-dev` and `neon-db-architect` agents
5. ⏭️ Validate against success criteria from spec

## Success Criteria Mapping

| Spec Criterion | Implementation Approach |
|----------------|------------------------|
| SC-001: All CRUD operations complete successfully | 6 endpoints implemented with proper HTTP methods |
| SC-002: Tasks persist across restarts | Neon PostgreSQL with proper schema and migrations |
| SC-003: Consistent JSON structure | Pydantic schemas for all requests/responses |
| SC-004: Error responses <1 second | FastAPI async with RFC 7807 format |
| SC-005: 100 concurrent operations | Async FastAPI with connection pooling |
| SC-006: Retrieval <500ms for 10K tasks | Database indexes on created_at, efficient queries |
| SC-007: RESTful conventions | Standard HTTP methods, resource-based URLs |
| SC-008: Efficient database schema | Proper indexes, constraints, and field types |
| SC-009: Graceful connection failures | Try-catch with RFC 7807 error responses |
| SC-010: Validation prevents invalid tasks | Pydantic validators with length constraints |
