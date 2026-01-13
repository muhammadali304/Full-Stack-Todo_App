# Tasks: Authentication & API Security

**Input**: Design documents from `/specs/002-auth-api-security/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks included - tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`, `backend/alembic/`
- **Frontend**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Add authentication dependencies to backend/requirements.txt (PyJWT==2.8.0, bcrypt==4.1.2, python-multipart==0.0.6)
- [x] T002 [P] Add JWT_SECRET to backend/.env with secure 256-bit key (use secrets.token_urlsafe(32))
- [x] T003 [P] Install Better Auth in frontend (npm install better-auth) **[COMPLETED via 003-frontend-ui-integration]**
- [x] T004 Install backend dependencies (pip install -r backend/requirements.txt)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create User model in backend/src/models/user.py with id, email, username, password_hash, created_at, updated_at fields
- [x] T006 [P] Update Task model in backend/src/models/task.py to add user_id foreign key and relationship
- [x] T007 [P] Create security utilities in backend/src/core/security.py (hash_password, verify_password, create_access_token, decode_access_token functions)
- [x] T008 Update config in backend/src/core/config.py to add JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS settings
- [x] T009 Create get_current_user authentication dependency in backend/src/api/dependencies.py using HTTPBearer and JWT validation
- [x] T010 Create Alembic migration 002_create_users_table.py in backend/alembic/versions/ for users table with indexes
- [x] T011 Run database migration (alembic upgrade head) to create users table and add user_id to tasks

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts with username, email, and password validation

**Independent Test**: Submit registration form with valid credentials and verify user account is created in database. Test duplicate email/username rejection and password validation.

### Implementation for User Story 1

- [x] T012 [P] [US1] Create auth schemas in backend/src/schemas/auth.py (RegisterRequest with username/email/password validation, RegisterResponse, UserProfile)
- [x] T013 [US1] Create auth routes file backend/src/api/routes/auth.py with register endpoint (POST /api/auth/register)
- [x] T014 [US1] Implement register endpoint logic: validate email uniqueness (case-insensitive), validate username uniqueness, hash password, create user, return UserProfile
- [x] T015 [US1] Add error handling for duplicate email ("Email already registered") and duplicate username ("Username already taken")
- [x] T016 [US1] Add password validation in register endpoint (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
- [x] T017 [US1] Update backend/src/main.py to include auth router with prefix /api
- [x] T018 [P] [US1] Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx with username, email, password fields and client-side validation **[COMPLETED via 003-frontend-ui-integration]**
- [x] T019 [P] [US1] Create registration page in frontend/src/app/register/page.tsx using RegisterForm component **[COMPLETED via 003-frontend-ui-integration]**
- [x] T020 [US1] Implement form submission in RegisterForm to call POST /api/auth/register and handle success/error responses **[COMPLETED via 003-frontend-ui-integration]**
- [x] T021 [US1] Add validation error display in RegisterForm for duplicate email, duplicate username, weak password, invalid format **[COMPLETED via 003-frontend-ui-integration]**

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register accounts with validation

---

## Phase 4: User Story 2 - User Login (Priority: P1)

**Goal**: Allow registered users to sign in with email/password and receive JWT token

**Independent Test**: Submit login form with valid credentials and verify JWT token is returned. Test invalid credentials rejection and token storage.

### Implementation for User Story 2

- [x] T022 [P] [US2] Add login schemas to backend/src/schemas/auth.py (LoginRequest with email/password, LoginResponse with access_token/token_type/expires_in/user)
- [x] T023 [US2] Add login endpoint to backend/src/api/routes/auth.py (POST /api/auth/login)
- [x] T024 [US2] Implement login endpoint logic: find user by email (case-insensitive), verify password with bcrypt, generate JWT token with user_id/email/username/iat/exp claims
- [x] T025 [US2] Add error handling for invalid credentials (return 401 "Invalid credentials" without revealing which field is wrong)
- [x] T026 [US2] Add security logging for login events (timestamp, email, IP address, user agent) in login endpoint
- [x] T027 [P] [US2] Create useAuth hook in frontend/src/hooks/useAuth.ts with login, logout, user state, token state, loading state **[COMPLETED via 003-frontend-ui-integration]**
- [x] T028 [P] [US2] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email and password fields **[COMPLETED via 003-frontend-ui-integration]**
- [x] T029 [P] [US2] Create login page in frontend/src/app/login/page.tsx using LoginForm component **[COMPLETED via 003-frontend-ui-integration]**
- [x] T030 [US2] Implement login function in useAuth hook to call POST /api/auth/login, store token in localStorage, store user in localStorage, update state **[COMPLETED via 003-frontend-ui-integration]**
- [x] T031 [US2] Implement form submission in LoginForm to call useAuth.login() and redirect to /todos on success **[COMPLETED via 003-frontend-ui-integration]**
- [x] T032 [US2] Add error handling in LoginForm for invalid credentials and display user-friendly error message **[COMPLETED via 003-frontend-ui-integration]**

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can register and login

---

## Phase 5: User Story 3 - Accessing Protected Resources (Priority: P1)

**Goal**: Enforce JWT authentication on all task endpoints and filter tasks by authenticated user

**Independent Test**: Make API requests with valid token and verify only user's own tasks are returned. Test invalid/missing token rejection and cross-user access prevention.

### Implementation for User Story 3

- [x] T033 [US3] Update create_task endpoint in backend/src/api/routes/tasks.py to require current_user dependency and set task.user_id from token
- [x] T034 [US3] Update list_tasks endpoint in backend/src/api/routes/tasks.py to require current_user dependency and filter by user_id
- [x] T035 [US3] Update get_task endpoint in backend/src/api/routes/tasks.py to require current_user dependency and filter by user_id (return 404 if not found)
- [x] T036 [US3] Update update_task endpoint in backend/src/api/routes/tasks.py to require current_user dependency and filter by user_id
- [x] T037 [US3] Update delete_task endpoint in backend/src/api/routes/tasks.py to require current_user dependency and filter by user_id
- [x] T038 [US3] Update toggle_task endpoint in backend/src/api/routes/tasks.py to require current_user dependency and filter by user_id
- [x] T039 [US3] Add error handling for missing/invalid/expired tokens (401 Unauthorized with appropriate messages)
- [x] T040 [P] [US3] Create AuthGuard component in frontend/src/components/layout/AuthGuard.tsx to check authentication and redirect to login if not authenticated **[COMPLETED via 003-frontend-ui-integration]**
- [x] T041 [P] [US3] Update todos page in frontend/src/app/todos/page.tsx to wrap content with AuthGuard component **[COMPLETED via 003-frontend-ui-integration]**
- [x] T042 [US3] Update all API calls in frontend to include Authorization: Bearer <token> header from localStorage **[COMPLETED via 003-frontend-ui-integration]**
- [x] T043 [US3] Add token validation in useAuth hook to check if token exists on component mount and load user from localStorage **[COMPLETED via 003-frontend-ui-integration]**
- [x] T044 [US3] Add automatic redirect to login page in AuthGuard if user is not authenticated **[COMPLETED via 003-frontend-ui-integration]**

**Checkpoint**: All P1 user stories should now be independently functional - complete authentication flow with user isolation

---

## Phase 6: User Story 4 - Session Persistence (Priority: P2)

**Goal**: Maintain authentication state across page refreshes and browser sessions until token expires

**Independent Test**: Login, refresh page, and verify user remains authenticated. Close and reopen browser (within 24 hours) and verify user remains authenticated.

### Implementation for User Story 4

- [x] T045 [US4] Update useAuth hook in frontend/src/hooks/useAuth.ts to load token and user from localStorage on mount **[COMPLETED via 003-frontend-ui-integration]**
- [x] T046 [US4] Add token expiration check in useAuth hook (decode JWT and check exp claim) **[COMPLETED via 003-frontend-ui-integration]**
- [x] T047 [US4] Implement automatic redirect to login page when token is expired (401 response from API) **[COMPLETED via 003-frontend-ui-integration]**
- [x] T048 [US4] Add error interceptor in frontend API calls to detect 401 responses and clear localStorage **[COMPLETED via 003-frontend-ui-integration]**
- [x] T049 [US4] Update AuthGuard to show loading state while checking authentication status **[COMPLETED via 003-frontend-ui-integration]**

**Checkpoint**: User Story 4 complete - session persistence working across refreshes

---

## Phase 7: User Story 5 - User Logout (Priority: P2)

**Goal**: Allow users to sign out and clear authentication state

**Independent Test**: Login, click logout, and verify token is cleared and subsequent API requests fail authentication.

### Implementation for User Story 5

- [x] T050 [P] [US5] Add logout endpoint to backend/src/api/routes/auth.py (POST /api/auth/logout) with current_user dependency
- [x] T051 [P] [US5] Add security logging for logout events (timestamp, email, IP address, user agent) in logout endpoint
- [x] T052 [US5] Implement logout function in useAuth hook to clear token from localStorage, clear user from localStorage, reset state, redirect to login **[COMPLETED via 003-frontend-ui-integration]**
- [x] T053 [US5] Add logout button to frontend UI (in header or navigation) that calls useAuth.logout() **[COMPLETED via 003-frontend-ui-integration]**
- [x] T054 [US5] Verify logout clears all authentication state and redirects to login page **[COMPLETED via 003-frontend-ui-integration]**

**Checkpoint**: All user stories should now be independently functional - complete authentication system

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T055 [P] Add security logging for registration events (timestamp, email, IP address, user agent) in register endpoint
- [x] T056 [P] Add security logging for token validation failures in get_current_user dependency
- [x] T057 [P] Add /api/auth/me endpoint in backend/src/api/routes/auth.py to get current user profile (requires authentication)
- [x] T058 [P] Update error messages across all endpoints to follow graceful failure strategy (user-friendly, actionable, no security leaks)
- [x] T059 [P] Add CORS configuration in backend/src/main.py to allow frontend origin (http://localhost:3000)
- [x] T060 [P] Create Better Auth configuration in frontend/src/lib/auth.ts with baseURL and endpoints **[COMPLETED via 003-frontend-ui-integration]**
- [x] T061 [P] Add password strength indicator to RegisterForm component **[COMPLETED via 003-frontend-ui-integration]**
- [x] T062 [P] Add "Remember me" checkbox explanation in LoginForm (token persists 24 hours) **[COMPLETED via 003-frontend-ui-integration]**
- [x] T063 Run quickstart.md validation: test complete auth flow (register → login → access protected resource → logout)
- [x] T064 Verify all 21 functional requirements are implemented and all 11 edge cases are handled
- [x] T065 Update backend/README.md with authentication setup instructions
- [x] T066 Update frontend/README.md with Better Auth configuration instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Registration - P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Login - P1): Can start after Foundational - No dependencies on other stories
  - User Story 3 (Protected Resources - P1): Can start after Foundational - No dependencies on other stories (but integrates with US1 and US2)
  - User Story 4 (Session Persistence - P2): Depends on US2 (Login) for token storage
  - User Story 5 (Logout - P2): Depends on US2 (Login) for logout functionality
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can be implemented and tested alone after Foundational
- **User Story 2 (P1)**: Independent - can be implemented and tested alone after Foundational
- **User Story 3 (P1)**: Independent - can be implemented and tested alone after Foundational (requires US1 and US2 for end-to-end flow but can be tested with manually created users/tokens)
- **User Story 4 (P2)**: Depends on US2 (Login) - requires token storage mechanism
- **User Story 5 (P2)**: Depends on US2 (Login) - requires logout functionality

### Within Each User Story

- Backend schemas before endpoints
- Backend endpoints before frontend components
- Frontend components before integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All 4 tasks can run in parallel (T001-T004)
- **Phase 2 (Foundational)**: T005, T006, T007 can run in parallel (different files)
- **Phase 3 (US1)**: T012 and T018, T019 can run in parallel (backend schemas vs frontend components)
- **Phase 4 (US2)**: T022, T027, T028, T029 can run in parallel (backend schemas vs frontend components)
- **Phase 5 (US3)**: T040, T041 can run in parallel with backend endpoint updates
- **Phase 8 (Polish)**: T055, T056, T057, T058, T059, T060, T061, T062 can all run in parallel (different files)
- **Cross-Story Parallelism**: After Foundational phase, US1, US2, and US3 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 (Registration)

```bash
# Launch backend and frontend tasks together:
Task T012: "Create auth schemas in backend/src/schemas/auth.py"
Task T018: "Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx"
Task T019: "Create registration page in frontend/src/app/register/page.tsx"

# These can run in parallel because they touch different files
```

---

## Parallel Example: User Story 2 (Login)

```bash
# Launch backend and frontend tasks together:
Task T022: "Add login schemas to backend/src/schemas/auth.py"
Task T027: "Create useAuth hook in frontend/src/hooks/useAuth.ts"
Task T028: "Create LoginForm component in frontend/src/components/auth/LoginForm.tsx"
Task T029: "Create login page in frontend/src/app/login/page.tsx"

# These can run in parallel because they touch different files
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - All P1)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 - Registration (T012-T021)
4. **VALIDATE**: Test registration independently
5. Complete Phase 4: User Story 2 - Login (T022-T032)
6. **VALIDATE**: Test login independently
7. Complete Phase 5: User Story 3 - Protected Resources (T033-T044)
8. **VALIDATE**: Test complete auth flow (register → login → access protected resource)
9. **STOP and DEMO**: MVP is complete with core authentication

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration) → Test independently → Deploy/Demo
3. Add User Story 2 (Login) → Test independently → Deploy/Demo
4. Add User Story 3 (Protected Resources) → Test independently → Deploy/Demo (MVP!)
5. Add User Story 4 (Session Persistence) → Test independently → Deploy/Demo
6. Add User Story 5 (Logout) → Test independently → Deploy/Demo
7. Add Polish tasks → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T011)
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration) - T012-T021
   - Developer B: User Story 2 (Login) - T022-T032
   - Developer C: User Story 3 (Protected Resources) - T033-T044
3. Stories complete and integrate independently
4. Team completes User Story 4 and 5 together (T045-T054)
5. Team completes Polish tasks in parallel (T055-T066)

---

## Task Summary

**Total Tasks**: 66
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 7 tasks (BLOCKING)
- Phase 3 (US1 - Registration): 10 tasks
- Phase 4 (US2 - Login): 11 tasks
- Phase 5 (US3 - Protected Resources): 12 tasks
- Phase 6 (US4 - Session Persistence): 5 tasks
- Phase 7 (US5 - Logout): 5 tasks
- Phase 8 (Polish): 12 tasks

**Parallel Opportunities**: 24 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-5 (T001-T044) = 44 tasks for complete core authentication

**Agent Delegation**:
- **auth-security agent**: T007 (security utilities), T009 (auth dependency), T023-T025 (login endpoint), T039 (error handling)
- **neon-db-architect agent**: T005 (User model), T006 (Task model update), T010-T011 (migration)
- **fastapi-backend-dev agent**: T012-T017 (register endpoint), T022-T026 (login endpoint), T033-T039 (protected endpoints), T050-T051 (logout endpoint), T057 (me endpoint)
- **nextjs-ui agent**: T018-T021 (registration UI), T027-T032 (login UI), T040-T044 (auth guard), T052-T054 (logout UI), T060-T062 (Better Auth config)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks included - tests were not explicitly requested in spec
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
