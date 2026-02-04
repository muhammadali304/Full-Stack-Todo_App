# Implementation Plan: ai-agent-chat

**Branch**: `005-ai-agent-chat` | **Date**: 2026-01-20 | **Spec**: [specs/005-ai-agent-chat/spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-ai-agent-chat/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an AI agent chat endpoint that enables users to manage their todos through natural language processing. The solution integrates with OpenAI Agents SDK to process user requests and connects to existing MCP tools for task management operations. The implementation follows a phased approach starting with OpenAI SDK setup, followed by agent configuration, chat endpoint development, conversation persistence, MCP tool integration, authentication, error handling, and testing.

## Technical Context

**Language/Version**: Python 3.11, TypeScript/JavaScript (for any frontend components)
**Primary Dependencies**: OpenAI Agents SDK, FastAPI, SQLModel, Better Auth, PyJWT, Official MCP SDK
**Storage**: Neon PostgreSQL via SQLModel ORM for conversation and message persistence
**Testing**: pytest with integration and unit test frameworks
**Target Platform**: Linux server (containerized)
**Project Type**: Web/server - backend service with API endpoints
**Performance Goals**: <5 seconds response time for all AI agent requests, support 100 concurrent users
**Constraints**: Must use OpenAI Agents SDK only, MCP tools only for DB writes, SQLModel ORM only, Better Auth JWT, no in-memory state
**Scale/Scope**: Support 10k users with individual conversation histories, ~100k conversations in system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on constitution file requirements:
- ✅ MCP Protocol-First Development (Phase-III): All todo operations performed through MCP tools only
- ✅ Stateless Backend Architecture (Phase-III): No in-memory state storage, all data persisted to database
- ✅ JWT-Secured User Isolation: JWT authentication enforced for all operations with user data isolation
- ✅ Agent-Generated Code Only: All code will be generated through Claude Code specialized agents
- ✅ Spec-Driven Development: Following proper spec → plan → tasks → implementation workflow
- ✅ Clear Layer Separation: Maintaining separation between AI agent, authentication, and database layers

## Stateless Architecture Considerations

As required by the constitution's "Stateless Backend Architecture (Phase-III)" principle, this implementation will ensure:

- No in-memory state storage: All conversation state, message history, and user data will be persisted to the database
- No server memory or Redis for state management: All data will be stored in Neon PostgreSQL
- Crash recovery capability: The system will be able to restart without losing conversation context or message history
- Persistent storage for all operations: Every conversation and message will be logged and persisted to the database
- Session-less operation: No server-side session storage between requests

This stateless design ensures horizontal scalability and fault tolerance, with persistent storage enabling reliability and crash recovery without data loss.

## Project Structure

### Documentation (this feature)

```text
specs/005-ai-agent-chat/
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
│   │   ├── task.py          # Task entity model (EXISTS - from Spec-4)
│   │   ├── user.py          # User entity model (EXISTS - from Spec-4)
│   │   ├── conversation.py  # Conversation entity model (NEW)
│   │   └── message.py       # Message entity model (NEW)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # JWT validation service (EXISTS - from Spec-4)
│   │   ├── task_service.py  # Business logic for task operations (EXISTS - from Spec-4)
│   │   ├── mcp_server.py    # MCP server implementation (EXISTS - from Spec-4)
│   │   ├── openai_agent.py  # OpenAI agent integration (NEW)
│   │   └── conversation_service.py # Conversation management service (NEW)
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── add_task.py      # MCP tool for adding tasks (EXISTS - from Spec-4)
│   │   ├── list_tasks.py    # MCP tool for listing tasks (EXISTS - from Spec-4)
│   │   ├── complete_task.py # MCP tool for completing tasks (EXISTS - from Spec-4)
│   │   ├── delete_task.py   # MCP tool for deleting tasks (EXISTS - from Spec-4)
│   │   └── update_task.py   # MCP tool for updating tasks (EXISTS - from Spec-4)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py  # JWT auth dependencies (EXISTS - from Spec-4)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py      # Auth routes (EXISTS - from Spec-4)
│   │   │   ├── tasks.py     # Task CRUD routes (EXISTS - from Spec-4)
│   │   │   └── chat.py      # Chat endpoint routes (NEW)
│   │   └── auth_middleware.py # JWT authentication middleware (EXISTS - from Spec-4)
│   └── main.py              # Application entry point (EXISTS - from Spec-4)
└── tests/
    ├── unit/
    │   ├── test_models/
    │   ├── test_services/
    │   └── test_tools/
    ├── integration/
    │   └── test_chat_integration.py
    └── contract/
        └── test_api_contracts.py
```

**Structure Decision**: Leveraging existing backend structure with the following observations:
- Task model already exists in src/models/task.py with proper SQLModel structure and user relationship
- User model exists in src/models/user.py with proper relationships
- Authentication dependencies exist in src/api/dependencies.py
- MCP tools exist in src/tools/ (add_task, list_tasks, complete_task, delete_task, update_task)
- Main application structure exists in src/main.py with proper lifecycle management

The AI agent chat endpoint will be implemented as new modules that reuse existing models and authentication infrastructure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |