# Tasks: ai-agent-chat

**Input**: Feature specification from `/specs/005-ai-agent-chat/spec.md`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Note**: This feature extends existing backend infrastructure (FastAPI, SQLModel, Better Auth, MCP tools) to add AI agent chat capability while maintaining compatibility with existing web application functionality.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` at repository root
- Paths shown below assume backend structure - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /sp.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create conversation and message model files at `backend/src/models/conversation.py` and `backend/src/models/message.py`
- [X] T002 [P] Install OpenAI SDK dependencies in backend requirements.txt
- [X] T003 [P] Set up OpenAI agent service module at `backend/src/services/openai_agent.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T004 Implement conversation entity model at `backend/src/models/conversation.py`
- [X] T005 [P] Implement message entity model at `backend/src/models/message.py`
- [X] T006 [P] Create conversation service at `backend/src/services/conversation_service.py`
- [X] T007 Set up OpenAI agent configuration in `backend/src/services/openai_agent.py`
- [X] T008 Implement authentication middleware for chat endpoints using existing dependencies
- [X] T009 [P] Create utility functions for user isolation in `backend/src/utils/chat_utils.py`
- [X] T010 [P] Set up error handling for chat operations in `backend/src/exceptions/chat_exceptions.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: Natural Language Todo Management Implementation (Priority: P1) 🎯 MVP

**Goal**: Implement the AI agent functionality that allows users to manage todos through natural language processing

**Independent Test**: Can successfully add, list, complete, update, or delete a task via natural language chat with proper authentication and user isolation

### Implementation for Natural Language Todo Management

- [X] T011 [US1] Create OpenAI agent integration at `backend/src/services/openai_agent.py`
- [X] T012 [US1] Implement chat endpoint at `backend/src/api/routes/chat.py`
- [X] T013 [US1] Configure MCP tools for OpenAI agent at `backend/src/services/openai_agent.py`
- [X] T014 [US1] Implement JWT validation for chat endpoint using existing middleware
- [X] T015 [US1] Add conversation persistence to chat endpoint
- [X] T016 [US1] Implement tool call result formatting in responses
- [X] T017 [US1] Register chat endpoint with main application at `backend/src/main.py`

**Checkpoint**: At this point, users can manage todos via natural language chat with proper authentication and persistence

---

## Phase 4: Conversation Persistence Implementation (Priority: P2)

**Goal**: Implement conversation persistence and resumability functionality

**Independent Test**: Conversations persist across server restarts and can be resumed with context maintained

### Implementation for Conversation Persistence

- [X] T018 [US2] Implement conversation creation and retrieval in `backend/src/services/conversation_service.py`
- [X] T019 [US2] Add message persistence to conversation flow
- [X] T020 [US2] Implement conversation listing by user
- [X] T021 [US2] Add conversation expiration logic (30-day retention)
- [X] T022 [US2] Implement message history limiting (1000 messages per conversation)
- [X] T023 [US2] Add conversation context to AI agent responses
- [X] T024 [US2] Update chat endpoint to use conversation service

**Checkpoint**: At this point, conversations persist and can be resumed after interruptions

---

## Phase 5: Secure Task Management Implementation (Priority: P3)

**Goal**: Implement proper authentication and user isolation for task management operations

**Independent Test**: Users can only access and modify their own tasks through the AI agent with proper authentication enforcement

### Implementation for Secure Task Management

- [X] T025 [US3] Implement user isolation checks in conversation service
- [X] T026 [US3] Add user ownership validation to MCP tool calls
- [X] T027 [US3] Implement JWT token validation for all chat operations
- [X] T028 [US3] Add 401 Unauthorized responses for unauthenticated requests
- [X] T029 [US3] Implement proper error handling for unauthorized access attempts
- [X] T030 [US3] Add user ID validation in URL path matches authenticated user
- [X] T031 [US3] Update all endpoints to enforce user isolation

**Checkpoint**: At this point, user data is properly isolated and secured with authentication

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Add performance monitoring to chat endpoint (response times under 5 seconds)
- [X] T033 Add comprehensive error handling with user-friendly messages
- [X] T034 [P] Update documentation for AI agent chat functionality
- [X] T035 Add tool invocation timeout handling (30 seconds)
- [X] T036 Implement stateless server behavior (no in-memory conversation storage)
- [X] T037 Run integration tests for full AI agent workflow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core functionality before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel by different team members
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: Natural Language Todo Management
4. **STOP and VALIDATE**: Test natural language todo management independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add Natural Language Management → Test independently → Deploy/Demo (MVP!)
3. Add Conversation Persistence → Test independently → Deploy/Demo
4. Add Secure Management → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Natural Language Management)
   - Developer B: User Story 2 (Conversation Persistence)
   - Developer C: User Story 3 (Secure Management)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests included)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence