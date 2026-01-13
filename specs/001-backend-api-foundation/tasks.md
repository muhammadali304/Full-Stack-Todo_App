---

description: "Task list for Backend API & Database Foundation implementation"
---

# Tasks: Backend API & Database Foundation

**Input**: Design documents from `/specs/001-backend-api-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/openapi.yaml

**Tests**: Not requested in specification - test tasks omitted per spec requirements

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- Paths shown below follow backend-only structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per implementation plan (backend/src/, backend/tests/, backend/alembic/)
- [x] T002 Initialize Python project with requirements.txt (FastAPI 0.104+, SQLModel 0.14+, Pydantic 2.0+, asyncpg, uvicorn, alembic, python-dotenv, pytest, pytest-asyncio, httpx)
- [x] T003 [P] Create .env.example file with DATABASE_URL, APP_ENV, DEBUG placeholders in backend/
- [x] T004 [P] Create .gitignore file for Python (venv/, __pycache__/, .env, *.pyc, .pytest_cache/) in backend/
- [x] T005 [P] Create README.md with setup instructions in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create core configuration module in backend/src/core/config.py (Settings class with DATABASE_URL, APP_ENV, DEBUG from environment)
- [x] T007 Create database connection module in backend/src/core/database.py (async engine, SessionLocal, get_db dependency)
- [x] T008 Create SQLModel Task model in backend/src/models/task.py (id, title, description, completed, user_id, created_at, updated_at with validation)
- [x] T009 Initialize Alembic for migrations in backend/alembic/ (alembic init, configure env.py with SQLModel metadata)
- [x] T010 Create initial migration for tasks table in backend/alembic/versions/ (alembic revision --autogenerate -m "Create tasks table")
- [x] T010b Test migration rollback with alembic downgrade -1, verify schema reverts correctly, then re-apply with alembic upgrade head
- [x] T011 Create Pydantic schemas in backend/src/schemas/task.py (TaskCreate, TaskUpdate, TaskResponse with field validators)
- [x] T012 Create RFC 7807 error handler in backend/src/core/errors.py (ProblemDetails model, exception handlers for validation and not found)
- [x] T013 Create FastAPI application entry point in backend/src/main.py (app initialization, CORS, error handlers, health check)
- [x] T014 Create database dependency injection in backend/src/api/dependencies.py (get_db function for session management)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Creation and Retrieval (Priority: P1) 🎯 MVP

**Goal**: Enable creating new tasks and retrieving them from the system

**Independent Test**: Create tasks via POST /api/tasks, retrieve via GET /api/tasks and GET /api/tasks/{id}, verify persistence and data integrity

### Implementation for User Story 1

- [x] T015 [P] [US1] Create POST /api/tasks endpoint in backend/src/api/routes/tasks.py (create task, return 201 with TaskResponse, validate title/description lengths)
- [x] T016 [P] [US1] Create GET /api/tasks endpoint in backend/src/api/routes/tasks.py (list all tasks ordered by created_at DESC, return 200 with array of TaskResponse)
- [x] T017 [US1] Create GET /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (get single task by UUID, return 200 with TaskResponse or 404 with RFC 7807 error)
- [x] T018 [US1] Register task routes in backend/src/main.py (app.include_router with /api prefix)
- [x] T019 [US1] Add validation error handling for empty titles and length constraints in backend/src/api/routes/tasks.py (return 400 with RFC 7807 format)
- [x] T020 [US1] Add database error handling for connection failures in backend/src/api/routes/tasks.py (return 500 with RFC 7807 format)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (create, list, get tasks)

---

## Phase 4: User Story 2 - Task Modification (Priority: P2)

**Goal**: Enable updating and deleting existing tasks

**Independent Test**: Create a task, update its title/description via PATCH, verify changes persist, delete the task, verify it no longer exists

### Implementation for User Story 2

- [x] T021 [P] [US2] Create PATCH /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (partial update with TaskUpdate schema, return 200 with TaskResponse or 404)
- [x] T022 [P] [US2] Create DELETE /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py (delete task, return 204 No Content or 404 with RFC 7807 error)
- [x] T023 [US2] Add validation for PATCH requests in backend/src/api/routes/tasks.py (validate title not empty if provided, description length, ignore unknown fields)
- [x] T024 [US2] Add updated_at timestamp update logic in backend/src/api/routes/tasks.py (ensure updated_at changes on PATCH operations)
- [x] T025 [US2] Add 404 error handling for non-existent task IDs in backend/src/api/routes/tasks.py (consistent RFC 7807 format for PATCH and DELETE)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (full CRUD operations)

---

## Phase 5: User Story 3 - Task Status Management (Priority: P3)

**Goal**: Enable toggling task completion status

**Independent Test**: Create a task, toggle completion via POST /api/tasks/{id}/toggle multiple times, verify status flips correctly and persists

### Implementation for User Story 3

- [x] T026 [US3] Create POST /api/tasks/{task_id}/toggle endpoint in backend/src/api/routes/tasks.py (flip completed boolean, return 200 with TaskResponse or 404)
- [x] T027 [US3] Implement toggle logic in backend/src/api/routes/tasks.py (UPDATE tasks SET completed = NOT completed WHERE id = ?, update updated_at)
- [x] T028 [US3] Add error handling for toggle endpoint in backend/src/api/routes/tasks.py (404 for non-existent tasks with RFC 7807 format)

**Checkpoint**: All user stories should now be independently functional (create, retrieve, update, delete, toggle)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 [P] Create pytest configuration in backend/tests/conftest.py (test database fixtures, async test client, cleanup)
- [x] T030 [P] Add API documentation customization in backend/src/main.py (OpenAPI title, description, version, contact info)
- [x] T031 [P] Create backend/README.md with quickstart instructions (environment setup, database initialization, running server, API examples)
- [x] T032 Verify all endpoints return consistent JSON structure per spec (TaskResponse schema used everywhere)
- [x] T033 Verify RFC 7807 error format for all error cases (validation, not found, database errors)
- [x] T034 Verify database indexes exist (created_at DESC, user_id) per data-model.md
- [x] T035 Run manual API tests following quickstart.md examples (create, list, get, update, delete, toggle)
- [x] T036 Verify performance targets (task retrieval <500ms, error responses <1s, 100 concurrent operations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but builds on same endpoints file)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but builds on same endpoints file)

**Note**: While user stories are conceptually independent, they all modify backend/src/api/routes/tasks.py, so parallel development requires coordination or sequential execution.

### Within Each User Story

- **User Story 1**: T015, T016 can run in parallel (different endpoint functions), then T017, then T018-T020 sequentially
- **User Story 2**: T021, T022 can run in parallel (different endpoint functions), then T023-T025 sequentially
- **User Story 3**: T026-T028 must run sequentially (toggle logic, then error handling)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- Within Foundational phase: T006-T007 can run in parallel, T008-T011 can run in parallel after database setup
- Within User Story 1: T015, T016 can run in parallel (different functions in same file)
- Within User Story 2: T021, T022 can run in parallel (different functions in same file)
- Polish phase: T029, T030, T031 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch endpoint implementations in parallel (different functions):
Task T015: "Create POST /api/tasks endpoint in backend/src/api/routes/tasks.py"
Task T016: "Create GET /api/tasks endpoint in backend/src/api/routes/tasks.py"

# Then sequentially:
Task T017: "Create GET /api/tasks/{task_id} endpoint"
Task T018: "Register task routes in main.py"
Task T019: "Add validation error handling"
Task T020: "Add database error handling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T014) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T015-T020)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create tasks via POST /api/tasks
   - List tasks via GET /api/tasks (verify newest first ordering)
   - Get specific task via GET /api/tasks/{id}
   - Verify persistence across server restarts
   - Test validation errors (empty title, length limits)
   - Test 404 errors for non-existent tasks
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational (T001-T014) → Foundation ready
2. Add User Story 1 (T015-T020) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T021-T025) → Test independently → Deploy/Demo
4. Add User Story 3 (T026-T028) → Test independently → Deploy/Demo
5. Add Polish (T029-T036) → Final validation → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - Developer A: User Story 1 (T015-T020)
   - Developer B: User Story 2 (T021-T025) - coordinate on tasks.py file
   - Developer C: User Story 3 (T026-T028) - coordinate on tasks.py file
3. Stories complete and integrate independently

**Note**: Since all user stories modify the same file (backend/src/api/routes/tasks.py), parallel development requires careful coordination or sequential execution is recommended.

---

## Notes

- [P] tasks = different files or different functions, minimal dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks included (not requested in specification)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks reference exact file paths from plan.md structure
- Database migrations (T010) must be applied before any API endpoints work
- RFC 7807 error format must be consistent across all endpoints (T012, T019, T020, T025, T028)

---

## Task Count Summary

- **Total Tasks**: 37
- **Setup Phase**: 5 tasks (T001-T005)
- **Foundational Phase**: 10 tasks (T006-T014, including T010b) - BLOCKING
- **User Story 1 (P1)**: 6 tasks (T015-T020) - MVP
- **User Story 2 (P2)**: 5 tasks (T021-T025)
- **User Story 3 (P3)**: 3 tasks (T026-T028)
- **Polish Phase**: 8 tasks (T029-T036)

**Parallel Opportunities**: 8 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (T001-T020) = 21 tasks for minimum viable backend (includes T010b for migration safety)

---

## Validation Checklist

Before marking feature complete, verify:

- [x] All 37 tasks completed and checked off
- [x] All 6 API endpoints implemented (POST, GET, GET/{id}, PATCH, DELETE, POST/{id}/toggle)
- [x] Database schema matches data-model.md (tasks table with all fields and indexes)
- [x] RFC 7807 error format used for all error responses
- [x] Validation enforces title 1-200 chars, description 0-2000 chars
- [x] Tasks ordered by created_at DESC in list endpoint
- [x] PATCH supports partial updates (only provided fields updated)
- [x] Toggle endpoint flips completion status without requiring current state
- [x] All timestamps (created_at, updated_at) working correctly
- [x] Database connection pooling configured (10-20 connections)
- [x] Environment variables loaded from .env file
- [x] API documentation available at /docs endpoint
- [x] All success criteria from spec.md met (SC-001 through SC-010)

---

## Agent Delegation

**Database & Models** (T006-T011, T034):
- Use `neon-db-architect` agent for database schema, SQLModel models, migrations, and indexes

**API Endpoints** (T012-T028, T032-T033):
- Use `fastapi-backend-dev` agent for FastAPI routes, error handling, validation, and business logic

**Setup & Configuration** (T001-T005, T029-T031, T035-T036):
- Can be handled by either agent or general-purpose agent

**Recommended Execution**:
1. Run `neon-db-architect` agent for Phase 2 database tasks (T006-T011)
2. Run `fastapi-backend-dev` agent for Phase 2 API infrastructure (T012-T014)
3. Run `fastapi-backend-dev` agent for each user story phase (T015-T028)
4. Run validation tasks manually or with general-purpose agent (T029-T036)
