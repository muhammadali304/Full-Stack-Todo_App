# Implementation Plan: Authentication & API Security

**Branch**: `002-auth-api-security` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-api-security/spec.md`

## Summary

Implement JWT-based authentication system with Better Auth frontend integration and FastAPI backend validation. Users register with username/email/password, receive JWT tokens on login, and all API requests validate tokens for user isolation. Frontend stores tokens in localStorage, backend enforces ownership checks on all todo operations.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript (frontend Next.js 16+)
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.14+, Better Auth (frontend), PyJWT (backend), bcrypt (password hashing), asyncpg (database driver)
**Storage**: Neon Serverless PostgreSQL with async SQLModel ORM
**Testing**: pytest with pytest-asyncio (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application - Linux server (backend), modern browsers (frontend)
**Project Type**: Web (frontend + backend separation)
**Performance Goals**: <50ms JWT validation overhead, <2s login/registration, <10s end-to-end authentication flow
**Constraints**: Stateless authentication (no server-side sessions), 24-hour token expiration, localStorage token storage, username 3-30 chars alphanumeric+underscores
**Scale/Scope**: MVP for multi-user todo application, 5 user stories (3 P1, 2 P2), 21 functional requirements, 11 edge cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Architecture ✅ PASS
- JWT authentication required for all protected operations: **COMPLIANT** - FR-009, FR-010, FR-013, FR-014
- Token validation in Authorization header: **COMPLIANT** - FR-009, User Story 3
- Invalid/missing tokens return 401: **COMPLIANT** - FR-013, FR-014, Edge Cases
- Token expiry enforced: **COMPLIANT** - FR-018 (24 hours), FR-014
- Backend validates signature and extracts user identity: **COMPLIANT** - FR-009, FR-010, FR-011

### Principle II: Strict User Isolation ✅ PASS
- Users can only access their own tasks: **COMPLIANT** - FR-011, FR-012, User Story 3
- Database queries filter by authenticated user ID: **COMPLIANT** - FR-011
- Ownership checks on all CRUD operations: **COMPLIANT** - FR-012, User Story 3 acceptance scenario 4
- User ID from token must match request: **COMPLIANT** - FR-012, Edge Cases (cross-user access)

### Principle III: Spec-Driven Development ✅ PASS
- Specification complete: **COMPLIANT** - spec.md with 5 user stories, 21 FRs, 8 success criteria
- Planning in progress: **COMPLIANT** - this document
- Tasks will follow: **COMPLIANT** - /sp.tasks command next
- Documented requirements and acceptance criteria: **COMPLIANT** - spec.md User Scenarios section

### Principle IV: Agent-Generated Code Only ✅ PASS
- Implementation via specialized agents: **PLANNED**
  - `auth-security` agent: JWT middleware, token validation, password hashing
  - `fastapi-backend-dev` agent: Auth endpoints (register, login), user model
  - `neon-db-architect` agent: User table schema, migrations
  - `nextjs-ui` agent: Login/registration forms, token storage, auth state management

### Principle V: Clear Layer Separation ✅ PASS
- Frontend (Next.js): **DEFINED** - Better Auth integration, localStorage token storage, auth forms
- Backend (FastAPI): **DEFINED** - JWT validation middleware, auth endpoints, user CRUD
- Authentication: **DEFINED** - Better Auth (frontend) + JWT (backend communication)
- Database: **DEFINED** - Neon PostgreSQL via SQLModel, User table with username/email/password_hash

**Gate Status**: ✅ ALL GATES PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-api-security/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (JWT libraries, Better Auth setup)
├── data-model.md        # Phase 1 output (User entity, relationships)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth.openapi.yaml
│   └── auth-flow.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── core/
│   │   ├── config.py           # Environment variables, JWT secret
│   │   ├── database.py         # Existing database connection
│   │   ├── security.py         # NEW: JWT validation, password hashing
│   │   └── errors.py           # Existing error handlers
│   ├── models/
│   │   ├── task.py             # Existing Task model
│   │   └── user.py             # NEW: User SQLModel entity
│   ├── schemas/
│   │   ├── task.py             # Existing Task schemas
│   │   └── auth.py             # NEW: Register/Login request/response schemas
│   ├── api/
│   │   ├── dependencies.py     # UPDATED: Add get_current_user dependency
│   │   └── routes/
│   │       ├── tasks.py        # UPDATED: Add authentication to all endpoints
│   │       └── auth.py         # NEW: Register, login, logout endpoints
│   └── main.py                 # UPDATED: Add JWT middleware
├── alembic/
│   └── versions/
│       └── 002_create_users_table.py  # NEW: User table migration
└── tests/
    ├── test_auth_api.py        # NEW: Auth endpoint tests
    └── test_security.py        # NEW: JWT validation tests

frontend/
├── src/
│   ├── lib/
│   │   └── auth.ts             # NEW: Better Auth configuration
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx   # NEW: Login form component
│   │   │   └── RegisterForm.tsx # NEW: Registration form component
│   │   └── layout/
│   │       └── AuthGuard.tsx   # NEW: Protected route wrapper
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx        # NEW: Login page
│   │   ├── register/
│   │   │   └── page.tsx        # NEW: Registration page
│   │   └── (authenticated)/    # NEW: Protected routes group
│   │       └── todos/
│   │           └── page.tsx    # UPDATED: Add auth guard
│   └── hooks/
│       └── useAuth.ts          # NEW: Authentication state hook
└── tests/
    └── auth/
        ├── LoginForm.test.tsx  # NEW: Login form tests
        └── RegisterForm.test.tsx # NEW: Registration form tests
```

**Structure Decision**: Web application structure with separate backend/ and frontend/ directories. Backend uses FastAPI with SQLModel ORM, frontend uses Next.js 16+ App Router. Authentication layer spans both with Better Auth (frontend) and JWT validation (backend). Existing backend structure from Feature 001 will be extended with new auth modules.

## Complexity Tracking

> **No violations** - All constitution principles are satisfied by the planned architecture.

---

## Phase 0: Research & Technology Decisions

### Research Tasks

1. **JWT Library Selection (Backend)**
   - **Decision**: PyJWT (python-jose alternative)
   - **Rationale**: Industry standard, well-maintained, supports RS256/HS256, integrates with FastAPI
   - **Alternatives Considered**:
     - python-jose: Less actively maintained, similar features
     - authlib: More complex, overkill for MVP
   - **Implementation**: `pip install PyJWT[crypto]`

2. **Better Auth Configuration**
   - **Decision**: Better Auth with JWT plugin for Next.js
   - **Rationale**: Modern auth library, supports JWT tokens, integrates with Next.js App Router
   - **Alternatives Considered**:
     - NextAuth.js: More complex setup, session-based by default
     - Custom implementation: Reinventing the wheel, error-prone
   - **Implementation**: `npm install better-auth` with JWT plugin configuration

3. **Password Hashing Strategy**
   - **Decision**: bcrypt with salt rounds=12
   - **Rationale**: Industry standard, resistant to rainbow tables, adjustable work factor
   - **Alternatives Considered**:
     - argon2: More secure but less widely supported
     - scrypt: Good but bcrypt more familiar to developers
   - **Implementation**: `pip install bcrypt`, use `bcrypt.hashpw()` and `bcrypt.checkpw()`

4. **Token Storage (Frontend)**
   - **Decision**: localStorage with 24-hour expiration (from clarifications)
   - **Rationale**: Persists across browser sessions, simple implementation, aligns with FR-016
   - **Alternatives Considered**:
     - sessionStorage: Cleared on browser close, poor UX
     - httpOnly cookies: More secure but requires backend cookie management
   - **Implementation**: Store token in `localStorage.setItem('auth_token', token)`

5. **JWT Claims Structure**
   - **Decision**: Include user_id (UUID), email, username, iat, exp
   - **Rationale**: Minimal claims for user identification, supports display name (username)
   - **Alternatives Considered**:
     - Minimal (user_id only): Insufficient for frontend display
     - Extended (roles, permissions): Out of scope for MVP
   - **Implementation**:
     ```python
     payload = {
         "user_id": str(user.id),
         "email": user.email,
         "username": user.username,
         "iat": datetime.utcnow(),
         "exp": datetime.utcnow() + timedelta(hours=24)
     }
     ```

6. **Middleware vs Dependency Injection**
   - **Decision**: FastAPI dependency injection with `Depends(get_current_user)`
   - **Rationale**: More flexible, allows per-endpoint control, better error handling
   - **Alternatives Considered**:
     - Global middleware: Less flexible, harder to exclude public endpoints
     - Decorator pattern: Not idiomatic for FastAPI
   - **Implementation**: Create `get_current_user()` dependency that validates JWT

7. **User ID Enforcement Strategy**
   - **Decision**: Extract user_id from token, ignore user_id in request body/URL
   - **Rationale**: Prevents user impersonation, token is source of truth
   - **Alternatives Considered**:
     - Validate URL user_id matches token: Redundant, adds complexity
     - Trust request body: Security vulnerability
   - **Implementation**: `task.user_id = current_user.id` (override any request value)

8. **Error Response Format**
   - **Decision**: RFC 7807 Problem Details (existing from Feature 001)
   - **Rationale**: Consistent with existing API, industry standard
   - **Alternatives Considered**: N/A (already established)
   - **Implementation**: Extend existing error handlers for 401 Unauthorized

### Best Practices

- **JWT Secret Management**: Store in `.env` as `JWT_SECRET`, minimum 256 bits (32 bytes), never commit to git
- **Token Expiration**: 24 hours (FR-018), include `exp` claim, validate on every request
- **Password Requirements**: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number (FR-004)
- **Username Validation**: 3-30 chars, alphanumeric + underscores, unique (from clarifications)
- **Security Logging**: Log authentication events (login, registration, logout, token failures) with timestamp, email, IP, user agent (from clarifications)
- **Error Messages**: User-friendly, don't reveal email existence (FR-021), graceful failure (from clarifications)

---

## Phase 1: Data Model & API Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Summary**:
- **User Entity**: id (UUID), email (unique), username (unique), password_hash, created_at, updated_at
- **Task Entity** (updated): Add user_id foreign key referencing User.id
- **Relationships**: User has many Tasks (one-to-many)
- **Indexes**: email (unique), username (unique), user_id on tasks table

### API Contracts

See [contracts/auth.openapi.yaml](./contracts/auth.openapi.yaml) for complete OpenAPI specification.

**Endpoints**:
1. `POST /api/auth/register` - User registration
2. `POST /api/auth/login` - User login (returns JWT token)
3. `POST /api/auth/logout` - User logout (client-side token clearing)
4. `GET /api/auth/me` - Get current user info (requires authentication)

**Updated Endpoints** (from Feature 001):
- All `/api/tasks/*` endpoints now require `Authorization: Bearer <token>` header
- All task operations filtered by authenticated user's ID

### Quickstart

See [quickstart.md](./quickstart.md) for complete setup instructions.

**Summary**:
1. Add `JWT_SECRET` to backend `.env`
2. Run user table migration: `alembic upgrade head`
3. Install Better Auth in frontend: `npm install better-auth`
4. Configure Better Auth with JWT plugin
5. Update existing task endpoints to require authentication
6. Test authentication flow: register → login → access protected resource

---

## Phase 2: Task Breakdown

**Note**: Task breakdown is generated by the `/sp.tasks` command, not `/sp.plan`.

The tasks will be organized into these phases:
1. **Backend Authentication Infrastructure** (auth-security agent)
2. **Database Schema Updates** (neon-db-architect agent)
3. **Backend Auth Endpoints** (fastapi-backend-dev agent)
4. **Frontend Better Auth Setup** (nextjs-ui agent)
5. **Frontend Auth UI Components** (nextjs-ui agent)
6. **Integration & Testing** (manual validation)

---

## Architectural Decisions

### Decision 1: JWT vs Session-Based Authentication

**Decision**: JWT (stateless tokens)

**Rationale**:
- Aligns with constitution requirement for stateless authentication (Principle I)
- Scales horizontally without shared session storage
- Frontend and backend can authenticate independently
- Supports Better Auth integration

**Alternatives Considered**:
- Session-based: Requires server-side storage, doesn't scale well
- OAuth2: Overkill for MVP, adds complexity

**Tradeoffs**:
- ✅ Stateless, scalable, simple
- ❌ Cannot revoke tokens before expiration (acceptable for MVP)
- ❌ Token size larger than session ID (acceptable overhead)

### Decision 2: Password Hashing Algorithm

**Decision**: bcrypt with 12 salt rounds

**Rationale**:
- Industry standard for password hashing
- Resistant to rainbow table attacks
- Adjustable work factor for future-proofing
- Well-supported in Python ecosystem

**Alternatives Considered**:
- argon2: More secure but less widely adopted
- PBKDF2: Older, less resistant to GPU attacks
- scrypt: Good but bcrypt more familiar

**Tradeoffs**:
- ✅ Proven security, wide adoption
- ❌ Slower than argon2 (acceptable for auth operations)

### Decision 3: Token Storage Location

**Decision**: localStorage (from clarifications)

**Rationale**:
- Persists across browser sessions (FR-016)
- Simple implementation
- Aligns with 24-hour token expiration
- User explicitly chose this in clarifications

**Alternatives Considered**:
- sessionStorage: Cleared on browser close, poor UX
- httpOnly cookies: More secure but requires backend cookie management

**Tradeoffs**:
- ✅ Persistent, simple, good UX
- ❌ Vulnerable to XSS attacks (mitigated by CSP headers)

### Decision 4: Username Field Addition

**Decision**: Add username field to User entity (from clarifications)

**Rationale**:
- Provides display name separate from email
- User explicitly chose this in clarifications
- Improves UX (show username instead of email)

**Alternatives Considered**:
- Email only: Less user-friendly
- Auto-generate from email: Less flexible

**Tradeoffs**:
- ✅ Better UX, flexible display names
- ❌ Additional validation required (uniqueness, format)

### Decision 5: User ID Enforcement Strategy

**Decision**: Extract user_id from JWT token, ignore request body/URL user_id

**Rationale**:
- Prevents user impersonation attacks
- Token is authoritative source of identity
- Simplifies endpoint logic (no validation needed)

**Alternatives Considered**:
- Validate URL user_id matches token: Redundant
- Trust request body: Security vulnerability

**Tradeoffs**:
- ✅ Secure, simple, prevents impersonation
- ❌ None identified

### Decision 6: Dependency Injection vs Middleware

**Decision**: FastAPI dependency injection with `Depends(get_current_user)`

**Rationale**:
- More flexible than global middleware
- Allows per-endpoint authentication control
- Better error handling and testing
- Idiomatic FastAPI pattern

**Alternatives Considered**:
- Global middleware: Less flexible, harder to exclude public endpoints
- Decorator pattern: Not idiomatic for FastAPI

**Tradeoffs**:
- ✅ Flexible, testable, idiomatic
- ❌ Must add to each protected endpoint (acceptable boilerplate)

---

## Testing Strategy

### Unit Tests

**Backend**:
- JWT token generation and validation
- Password hashing and verification
- User model validation (email, username, password)
- Authentication dependency injection

**Frontend**:
- Login form validation
- Registration form validation
- Auth state management
- Token storage and retrieval

### Integration Tests

**Backend**:
- Register endpoint (success, duplicate email, duplicate username, weak password)
- Login endpoint (success, invalid credentials, missing fields)
- Protected endpoints (valid token, invalid token, expired token, missing token)
- User isolation (cannot access other users' tasks)

**Frontend**:
- Complete auth flow (register → login → access protected page)
- Token persistence across page refreshes
- Logout clears token and redirects
- Auth guard redirects unauthenticated users

### Acceptance Tests

Map to User Stories in spec.md:
- **User Story 1**: Registration with username/email/password, validation errors
- **User Story 2**: Login with credentials, error handling
- **User Story 3**: Protected resource access, user isolation, token validation
- **User Story 4**: Session persistence across refreshes
- **User Story 5**: Logout clears token

---

## Security Considerations

1. **JWT Secret**: Minimum 256 bits, stored in `.env`, never committed
2. **Password Storage**: bcrypt hashed, never plaintext, salt rounds=12
3. **Token Expiration**: 24 hours, validated on every request
4. **Error Messages**: Don't reveal email existence (FR-021)
5. **User Isolation**: All queries filtered by authenticated user ID
6. **HTTPS**: Required in production for token transmission
7. **Security Logging**: Authentication events logged with IP and user agent
8. **Input Validation**: Email format, username format (3-30 chars), password strength

---

## Rollout Plan

### Phase 1: Backend Authentication (auth-security + neon-db-architect)
1. Create User table migration
2. Implement JWT validation middleware
3. Implement password hashing utilities
4. Create register endpoint
5. Create login endpoint
6. Update task endpoints to require authentication

### Phase 2: Frontend Authentication (nextjs-ui)
1. Install and configure Better Auth
2. Create registration form component
3. Create login form component
4. Implement token storage in localStorage
5. Create auth state hook
6. Add auth guard to protected routes

### Phase 3: Integration & Testing
1. Test complete auth flow end-to-end
2. Verify user isolation (cannot access other users' tasks)
3. Test all edge cases (invalid tokens, expired tokens, etc.)
4. Verify security logging
5. Performance testing (JWT validation overhead <50ms)

---

## Success Metrics

- ✅ All 21 functional requirements implemented
- ✅ All 5 user stories pass acceptance tests
- ✅ 100% user isolation enforcement (SC-003)
- ✅ Registration completes in <1 minute (SC-001)
- ✅ Login completes in <10 seconds (SC-002)
- ✅ JWT validation adds <50ms overhead (performance requirement)
- ✅ All 11 edge cases handled gracefully
- ✅ Security events logged correctly

---

**Plan Status**: ✅ COMPLETE - Ready for `/sp.tasks` command
**Next Command**: `/sp.tasks` to generate task breakdown
