# Tasks: Frontend UI & End-to-End Integration

**Input**: Design documents from `/specs/003-frontend-ui-integration/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: No test tasks included - tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/public/`, `frontend/tests/`
- **Backend**: Already implemented in `backend/` (002-auth-api-security)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project and install dependencies

- [x] T001 Create Next.js 16+ project in frontend/ directory using create-next-app with TypeScript and App Router
- [x] T002 [P] Install Better Auth dependency (npm install better-auth)
- [x] T003 [P] Configure environment variables in frontend/.env.local (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET)
- [x] T004 [P] Create TypeScript types file in frontend/src/lib/types.ts with User, Task, Auth, Form, and Error interfaces from data-model.md
- [x] T005 Update frontend/next.config.js to configure API proxy and CORS settings if needed
- [x] T006 Create global styles in frontend/src/styles/globals.css with base styles and CSS variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create API client utility in frontend/src/lib/api.ts with apiRequest function, JWT token injection, 401 handling, and 5-second timeout
- [x] T008 [P] Create Better Auth configuration in frontend/src/lib/auth.ts with baseURL, endpoints, and localStorage storage
- [x] T009 [P] Create AuthContext in frontend/src/contexts/AuthContext.tsx with user state, token state, loading state, and auth methods
- [x] T010 [P] Create useAuth custom hook in frontend/src/hooks/useAuth.ts that consumes AuthContext
- [x] T011 [P] Create AuthGuard component in frontend/src/components/layout/AuthGuard.tsx to protect routes and redirect unauthenticated users
- [x] T012 [P] Create root layout in frontend/src/app/layout.tsx with AuthContext provider and global styles
- [x] T013 [P] Create home page in frontend/src/app/page.tsx with redirect logic (authenticated → /todos, unauthenticated → /login)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts and existing users to sign in with JWT authentication

**Independent Test**: Navigate to /register, create account with valid credentials, then login at /login and verify redirect to /todos with authenticated session.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create auth route group directory structure frontend/src/app/(auth)/ for authentication pages
- [x] T015 [P] [US1] Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx with email, username, password fields and HTML5 validation
- [x] T016 [P] [US1] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email and password fields
- [x] T017 [US1] Implement client-side password validation in RegisterForm (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
- [x] T018 [US1] Implement form submission in RegisterForm to call POST /api/auth/register via apiRequest
- [x] T019 [US1] Add error handling in RegisterForm for duplicate email (409), duplicate username (409), and validation errors (422)
- [x] T020 [US1] Implement form submission in LoginForm to call POST /api/auth/login via apiRequest
- [x] T021 [US1] Add error handling in LoginForm for invalid credentials (401) and display user-friendly error message
- [x] T022 [US1] Implement login function in useAuth hook to store token in localStorage, store user in state, and redirect to /todos
- [x] T023 [US1] Implement register function in useAuth hook to call register endpoint and redirect to /login on success
- [x] T024 [P] [US1] Create registration page in frontend/src/app/(auth)/register/page.tsx using RegisterForm component
- [x] T025 [P] [US1] Create login page in frontend/src/app/(auth)/login/page.tsx using LoginForm component
- [x] T026 [US1] Add loading states to RegisterForm and LoginForm (disable submit button, show loading text)
- [x] T027 [US1] Add success message display in RegisterForm after successful registration before redirect

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register accounts and login

---

## Phase 4: User Story 2 - View and Manage Personal Task List (Priority: P1)

**Goal**: Display authenticated user's tasks in an organized list with real-time updates

**Independent Test**: Login as a user, view task list (may be empty), verify only user's own tasks are displayed. Test with multiple users to confirm isolation.

### Implementation for User Story 2

- [x] T028 [P] [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx to display array of tasks
- [x] T029 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display individual task with title, description, completion status
- [x] T030 [P] [US2] Create useTasks custom hook in frontend/src/hooks/useTasks.ts with fetchTasks, tasks state, loading state, error state
- [x] T031 [US2] Implement fetchTasks function in useTasks hook to call GET /api/tasks/ via apiRequest
- [x] T032 [US2] Add automatic token inclusion in fetchTasks API call using Authorization header from localStorage
- [x] T033 [US2] Implement loading state display in TaskList component (show spinner or loading text)
- [x] T034 [US2] Implement empty state display in TaskList component when tasks array is empty
- [x] T035 [US2] Implement error handling in TaskList component for API errors and display user-friendly message
- [x] T036 [P] [US2] Create todos page in frontend/src/app/todos/page.tsx wrapped with AuthGuard component
- [x] T037 [US2] Integrate TaskList component in todos page and fetch tasks on component mount
- [x] T038 [US2] Implement task ordering by created_at DESC (newest first) in TaskList component
- [x] T039 [US2] Add responsive styling to TaskList and TaskItem components for mobile, tablet, desktop (320px-1920px)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can register, login, and view their task list

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P1)

**Goal**: Allow authenticated users to quickly add new tasks with title and optional description

**Independent Test**: Login, click create task button/form, enter title and optional description, submit, verify new task appears at top of list immediately.

### Implementation for User Story 3

- [x] T040 [P] [US3] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx with title and description fields
- [x] T041 [US3] Implement HTML5 validation in TaskForm (title required, max 200 chars; description optional, max 1000 chars)
- [x] T042 [US3] Implement createTask function in useTasks hook to call POST /api/tasks/ via apiRequest
- [x] T043 [US3] Implement form submission in TaskForm to call createTask and clear form on success
- [x] T044 [US3] Add error handling in TaskForm for validation errors (400) and display inline error messages
- [x] T045 [US3] Update tasks state in useTasks hook after successful task creation (add new task to top of array)
- [x] T046 [US3] Add loading state to TaskForm (disable submit button during API call)
- [x] T047 [US3] Integrate TaskForm component in todos page above TaskList component
- [x] T048 [US3] Add success toast notification after successful task creation
- [x] T049 [US3] Implement automatic focus on title field after successful task creation

**Checkpoint**: All P1 user stories should now be independently functional - complete core task management flow

---

## Phase 6: User Story 4 - Mark Tasks as Complete/Incomplete (Priority: P2)

**Goal**: Allow users to toggle task completion status with single click and visual feedback

**Independent Test**: Create a task, click checkbox/toggle to mark complete, verify visual change (strikethrough/checkmark), click again to mark incomplete.

### Implementation for User Story 4

- [x] T050 [US4] Add completion checkbox to TaskItem component with checked state bound to task.completed
- [x] T051 [US4] Implement toggleTask function in useTasks hook to call PATCH /api/tasks/{id}/toggle via apiRequest
- [x] T052 [US4] Implement checkbox onChange handler in TaskItem to call toggleTask
- [x] T053 [US4] Update tasks state in useTasks hook after successful toggle (update task.completed in array)
- [x] T054 [US4] Add visual styling to TaskItem for completed tasks (strikethrough text, checkmark icon, or different background)
- [x] T055 [US4] Add optimistic UI update in TaskItem (toggle immediately, revert on error)
- [x] T056 [US4] Add error handling for toggle operation and display error toast on failure
- [x] T057 [US4] Ensure completion status persists across page refreshes (verify backend stores state)

**Checkpoint**: User Story 4 complete - task completion tracking working

---

## Phase 7: User Story 5 - Edit Existing Tasks (Priority: P2)

**Goal**: Allow users to update task titles and descriptions with intuitive editing interface

**Independent Test**: Create a task, click edit button, modify title or description, save changes, verify updated content is displayed and persisted.

### Implementation for User Story 5

- [x] T058 [P] [US5] Create TaskEditForm component in frontend/src/components/tasks/TaskEditForm.tsx with title and description fields pre-filled
- [x] T059 [US5] Add edit button to TaskItem component that toggles edit mode
- [x] T060 [US5] Implement edit mode state in TaskItem (show TaskEditForm when editing, show normal view otherwise)
- [x] T061 [US5] Implement updateTask function in useTasks hook to call PUT /api/tasks/{id} via apiRequest
- [x] T062 [US5] Implement form submission in TaskEditForm to call updateTask with modified data
- [x] T063 [US5] Add validation in TaskEditForm (title required, max 200 chars; description optional, max 1000 chars)
- [x] T064 [US5] Update tasks state in useTasks hook after successful update (replace task in array)
- [x] T065 [US5] Implement cancel button in TaskEditForm that reverts to view mode without saving
- [x] T066 [US5] Add error handling in TaskEditForm for validation errors (400) and display inline messages
- [x] T067 [US5] Add loading state to TaskEditForm (disable buttons during API call)
- [x] T068 [US5] Add success toast notification after successful task update

**Checkpoint**: User Story 5 complete - task editing working

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P2)

**Goal**: Allow users to permanently remove tasks with confirmation to prevent accidental deletion

**Independent Test**: Create a task, click delete button, confirm deletion, verify task is removed from list and does not reappear on refresh.

### Implementation for User Story 6

- [x] T069 [US6] Add delete button to TaskItem component
- [x] T070 [US6] Implement deleteTask function in useTasks hook to call DELETE /api/tasks/{id} via apiRequest
- [x] T071 [US6] Create confirmation dialog component or use browser confirm() for delete confirmation
- [x] T072 [US6] Implement delete button onClick handler in TaskItem to show confirmation dialog
- [x] T073 [US6] Call deleteTask only after user confirms deletion
- [x] T074 [US6] Update tasks state in useTasks hook after successful deletion (remove task from array)
- [x] T075 [US6] Add error handling for delete operation and display error toast on failure
- [x] T076 [US6] Add success toast notification after successful task deletion
- [x] T077 [US6] Implement optimistic UI update (remove task immediately, restore on error)

**Checkpoint**: User Story 6 complete - task deletion working

---

## Phase 9: User Story 7 - User Logout (Priority: P3)

**Goal**: Allow users to securely sign out and clear authentication state

**Independent Test**: Login, click logout button, verify redirect to login page and cannot access /todos without logging in again.

### Implementation for User Story 7

- [x] T078 [P] [US7] Create Header component in frontend/src/components/layout/Header.tsx with navigation and logout button
- [x] T079 [P] [US7] Create Navigation component in frontend/src/components/layout/Navigation.tsx with links and user info display
- [x] T080 [US7] Implement logout function in useAuth hook to call POST /api/auth/logout via apiRequest
- [x] T081 [US7] Clear token from localStorage in logout function
- [x] T082 [US7] Clear user from state in logout function
- [x] T083 [US7] Redirect to /login after successful logout
- [x] T084 [US7] Add logout button to Header component that calls useAuth.logout()
- [x] T085 [US7] Display current user's username in Header component
- [x] T086 [US7] Integrate Header component in root layout (frontend/src/app/layout.tsx)
- [x] T087 [US7] Verify AuthGuard redirects to /login after logout when accessing protected pages
- [x] T088 [US7] Verify browser back button does not allow access to protected pages after logout

**Checkpoint**: All user stories should now be independently functional - complete authentication and task management system

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T089 [P] Add toast notification system in frontend/src/components/layout/Toast.tsx for success and error messages
- [x] T090 [P] Implement automatic token expiration check in useAuth hook (decode JWT and check exp claim)
- [x] T091 [P] Add global error boundary in frontend/src/app/error.tsx to catch and display unhandled errors
- [x] T092 [P] Add loading.tsx files for each route to show loading states during navigation
- [x] T093 [P] Implement responsive navigation menu for mobile devices (hamburger menu)
- [x] T094 [P] Add favicon and metadata in frontend/src/app/layout.tsx for SEO
- [x] T095 [P] Implement keyboard shortcuts for common actions (Ctrl+N for new task, Escape to cancel)
- [x] T096 [P] Add accessibility attributes (aria-labels, roles) to interactive elements
- [x] T097 [P] Optimize images and assets in frontend/public/ directory
- [x] T098 [P] Add form field focus management (auto-focus first field, focus errors)
- [x] T099 Run quickstart.md validation: test complete auth flow (register → login → create task → toggle → edit → delete → logout)
- [x] T100 Verify all 24 functional requirements from spec.md are implemented
- [x] T101 Verify all 10 success criteria from spec.md are met
- [x] T102 Test responsive design on mobile (320px), tablet (768px), and desktop (1920px) screen sizes
- [x] T103 Test user isolation with multiple users (verify User A cannot see User B's tasks)
- [x] T104 Test session persistence across page refreshes (verify token and user remain in localStorage)
- [x] T105 Test all edge cases from spec.md (session expiration, network errors, long content, etc.)
- [x] T106 Update frontend/README.md with setup instructions, environment variables, and development workflow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User Story 1 (Registration/Login - P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (View Tasks - P1): Can start after Foundational - No dependencies on other stories (but requires US1 for end-to-end flow)
  - User Story 3 (Create Tasks - P1): Can start after Foundational - No dependencies on other stories (but requires US1 and US2 for end-to-end flow)
  - User Story 4 (Toggle Completion - P2): Depends on US2 (TaskItem component) and US3 (need tasks to toggle)
  - User Story 5 (Edit Tasks - P2): Depends on US2 (TaskItem component) and US3 (need tasks to edit)
  - User Story 6 (Delete Tasks - P2): Depends on US2 (TaskItem component) and US3 (need tasks to delete)
  - User Story 7 (Logout - P3): Depends on US1 (authentication) for logout functionality
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can be implemented and tested alone after Foundational
- **User Story 2 (P1)**: Independent - can be implemented and tested alone after Foundational (requires US1 for end-to-end flow but can test with manually created token)
- **User Story 3 (P1)**: Independent - can be implemented and tested alone after Foundational (requires US1 and US2 for end-to-end flow but can test with manually created token)
- **User Story 4 (P2)**: Depends on US2 (TaskItem component) - requires task display to add toggle functionality
- **User Story 5 (P2)**: Depends on US2 (TaskItem component) - requires task display to add edit functionality
- **User Story 6 (P2)**: Depends on US2 (TaskItem component) - requires task display to add delete functionality
- **User Story 7 (P3)**: Depends on US1 (authentication) - requires login to implement logout

### Within Each User Story

- TypeScript types before components
- Hooks before components that use them
- Components before pages that use them
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004 can run in parallel (different files)
- **Phase 2 (Foundational)**: T007, T008, T009, T010, T011, T012, T013 can run in parallel (different files)
- **Phase 3 (US1)**: T014, T015, T016, T024, T025 can run in parallel (different files)
- **Phase 4 (US2)**: T028, T029, T030, T036 can run in parallel (different files)
- **Phase 5 (US3)**: T040 can run in parallel with other US3 tasks if needed
- **Phase 6 (US4)**: Most tasks sequential (modify existing TaskItem component)
- **Phase 7 (US5)**: T058 can run in parallel with other US5 tasks
- **Phase 8 (US6)**: Most tasks sequential (modify existing TaskItem component)
- **Phase 9 (US7)**: T078, T079 can run in parallel (different files)
- **Phase 10 (Polish)**: T089, T090, T091, T092, T093, T094, T095, T096, T097, T098 can all run in parallel (different files or independent concerns)
- **Cross-Story Parallelism**: After Foundational phase, US1, US2, and US3 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 (Registration/Login)

```bash
# Launch frontend tasks together:
Task T014: "Create auth route group directory"
Task T015: "Create RegisterForm component"
Task T016: "Create LoginForm component"
Task T024: "Create registration page"
Task T025: "Create login page"

# These can run in parallel because they touch different files
```

---

## Parallel Example: User Story 2 (View Tasks)

```bash
# Launch frontend tasks together:
Task T028: "Create TaskList component"
Task T029: "Create TaskItem component"
Task T030: "Create useTasks hook"
Task T036: "Create todos page"

# These can run in parallel because they touch different files
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - All P1)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 - Registration/Login (T014-T027)
4. **VALIDATE**: Test registration and login independently
5. Complete Phase 4: User Story 2 - View Tasks (T028-T039)
6. **VALIDATE**: Test task list display independently
7. Complete Phase 5: User Story 3 - Create Tasks (T040-T049)
8. **VALIDATE**: Test complete flow (register → login → view tasks → create task)
9. **STOP and DEMO**: MVP is complete with core authentication and task creation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Registration/Login) → Test independently → Deploy/Demo
3. Add User Story 2 (View Tasks) → Test independently → Deploy/Demo
4. Add User Story 3 (Create Tasks) → Test independently → Deploy/Demo (MVP!)
5. Add User Story 4 (Toggle Completion) → Test independently → Deploy/Demo
6. Add User Story 5 (Edit Tasks) → Test independently → Deploy/Demo
7. Add User Story 6 (Delete Tasks) → Test independently → Deploy/Demo
8. Add User Story 7 (Logout) → Test independently → Deploy/Demo
9. Add Polish tasks → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration/Login) - T014-T027
   - Developer B: User Story 2 (View Tasks) - T028-T039
   - Developer C: User Story 3 (Create Tasks) - T040-T049
3. Stories complete and integrate independently
4. Team completes User Story 4, 5, 6 sequentially (T050-T077) - these modify shared TaskItem component
5. Team completes User Story 7 together (T078-T088)
6. Team completes Polish tasks in parallel (T089-T106)

---

## Task Summary

**Total Tasks**: 106
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 7 tasks (BLOCKING)
- Phase 3 (US1 - Registration/Login): 14 tasks
- Phase 4 (US2 - View Tasks): 12 tasks
- Phase 5 (US3 - Create Tasks): 10 tasks
- Phase 6 (US4 - Toggle Completion): 8 tasks
- Phase 7 (US5 - Edit Tasks): 11 tasks
- Phase 8 (US6 - Delete Tasks): 9 tasks
- Phase 9 (US7 - Logout): 11 tasks
- Phase 10 (Polish): 18 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-5 (T001-T049) = 49 tasks for complete core authentication and task creation

**Agent Delegation**:
- **nextjs-ui agent**: All frontend implementation tasks (T001-T106)
- **auth-security agent**: Security review after US1 and US7 implementation

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
