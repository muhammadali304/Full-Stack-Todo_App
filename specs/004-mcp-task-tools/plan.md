# Implementation Plan: mcp-task-tools

**Branch**: `004-mcp-task-tools` | **Date**: 2026-01-20 | **Spec**: [specs/004-mcp-task-tools/spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-mcp-task-tools/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an MCP server that exposes stateless task management tools (add, list, complete, delete, update) for the Todo application. The solution leverages existing frontend infrastructure (Next.js 16+ with App Router, task components, auth components, hooks, and API integration) and backend infrastructure (SQLModel models, authentication dependencies, database connection management). The implementation extends the existing foundation with MCP-specific tools while maintaining compatibility with current web application functionality.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript/JavaScript (Frontend)
**Primary Dependencies**: FastAPI, Official MCP SDK, SQLModel, Better Auth, PyJWT, Next.js 16+, React 18+
**Storage**: Neon PostgreSQL via SQLModel ORM
**Testing**: pytest (Backend), Jest/RTL (Frontend) with integration and unit test frameworks
**Target Platform**: Linux server (containerized backend), Web browsers (frontend)
**Project Type**: Full-stack web application with MCP tools extension
**Performance Goals**: <200ms response time for all MCP tool calls, support 100 concurrent users
**Constraints**: Must use Official MCP SDK only, SQLModel ORM only, Better Auth JWT, no in-memory state, Next.js App Router
**Scale/Scope**: Support 10k users with individual task data, ~100k tasks in system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on constitution file requirements:
- ✅ MCP Protocol-First Development (Phase-III): All todo operations performed through MCP tools only
- ✅ Stateless Backend Architecture (Phase-III): No in-memory state storage, all data persisted to database
- ✅ JWT-Secured User Isolation: JWT authentication enforced for all operations with user data isolation
- ✅ Agent-Generated Code Only: All code will be generated through Claude Code specialized agents
- ✅ Spec-Driven Development: Following proper spec → plan → tasks → implementation workflow
- ✅ Clear Layer Separation: Maintaining separation between MCP tools, authentication, and database layers

## Stateless Architecture Considerations

As required by the constitution's "Stateless Backend Architecture (Phase-III)" principle, this implementation will ensure:

- No in-memory state storage: All conversation state, user data, and tool call history will be persisted to the database
- No server memory or Redis for state management: All data will be stored in Neon PostgreSQL
- Crash recovery capability: The system will be able to restart without losing conversation context or tool call information
- Persistent storage for all operations: Every MCP tool call will be logged and persisted to the database
- Session-less operation: No server-side session storage between requests

This stateless design ensures horizontal scalability and fault tolerance, with persistent storage enabling reliability and crash recovery without data loss.

## Project Structure

### Documentation (this feature)

```text
specs/004-mcp-task-tools/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py          # Task entity model (EXISTS)
│   │   └── user.py          # User entity model (EXISTS - from Better Auth integration)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # JWT validation service (PARTIAL - in dependencies.py)
│   │   ├── task_service.py  # Business logic for task operations (EXISTS as routes in tasks.py)
│   │   └── mcp_server.py    # MCP server implementation (NEW)
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── add_task.py      # MCP tool for adding tasks (NEW)
│   │   ├── list_tasks.py    # MCP tool for listing tasks (NEW)
│   │   ├── complete_task.py # MCP tool for completing tasks (NEW)
│   │   ├── delete_task.py   # MCP tool for deleting tasks (NEW)
│   │   └── update_task.py   # MCP tool for updating tasks (NEW)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py  # JWT auth dependencies (EXISTS)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py      # Auth routes (EXISTS)
│   │       └── tasks.py     # Task CRUD routes (EXISTS)
│   └── main.py              # Application entry point (EXISTS)
└── tests/
    ├── unit/
    │   ├── test_models/
    │   ├── test_services/
    │   └── test_tools/
    ├── integration/
    │   └── test_mcp_integration.py
    └── contract/
        └── test_api_contracts.py
```

**Structure Decision**: Leveraging existing backend structure with the following observations:
- Task model already exists in src/models/task.py with proper SQLModel structure and user relationship
- Task CRUD operations already exist in src/api/routes/tasks.py with proper authentication and user isolation
- User model exists in src/models/user.py with proper relationships
- Authentication dependencies exist in src/api/dependencies.py
- Main application structure exists in src/main.py with proper lifecycle management

The MCP tools will be implemented as new modules in src/tools/ that reuse existing models and authentication infrastructure. The MCP server will be implemented in src/services/mcp_server.py to coordinate the tools.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [None] | [No violations identified] | [All constitution requirements satisfied] |