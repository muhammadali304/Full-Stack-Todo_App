<!--
Sync Impact Report
==================
Version Change: INITIAL → 1.0.0
Ratification: 2026-01-11
Last Amended: 2026-01-11

Principles Defined:
- I. Security-First Architecture
- II. Strict User Isolation
- III. Spec-Driven Development (NON-NEGOTIABLE)
- IV. Agent-Generated Code Only (NON-NEGOTIABLE)
- V. Clear Layer Separation

Sections Added:
- Technology Stack Constraints
- Security Requirements
- Development Workflow

Templates Status:
✅ .specify/templates/spec-template.md - Reviewed, compatible
✅ .specify/templates/plan-template.md - Reviewed, compatible
✅ .specify/templates/tasks-template.md - Reviewed, compatible

Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Security-First Architecture

JWT authentication is REQUIRED for all protected operations. Every API endpoint (except
public auth endpoints) MUST validate the JWT token from the Authorization header before
processing requests. Invalid or missing tokens MUST return 401 Unauthorized. Token expiry
MUST be enforced. Backend MUST validate token signature using the shared secret and
extract user identity for authorization decisions.

**Rationale**: Multi-user applications require robust authentication to prevent
unauthorized access. Stateless JWT tokens enable scalable, secure authentication without
server-side session storage.

### II. Strict User Isolation

Users can ONLY access their own tasks. All database queries MUST filter by the
authenticated user's ID extracted from the JWT token. Backend MUST enforce ownership
checks on all CRUD operations (create, read, update, delete). User ID from token MUST
match user ID in request URL/body for modification operations.

**Rationale**: Data isolation is critical for multi-user applications. Without strict
enforcement, users could access or modify other users' data, violating privacy and
security requirements.

### III. Spec-Driven Development (NON-NEGOTIABLE)

No implementation without approved specification and plan. Development workflow MUST
follow: Write spec (`/sp.specify`) → Generate plan (`/sp.plan`) → Break into tasks
(`/sp.tasks`) → Implement via specialized agents. All features MUST have documented
requirements, acceptance criteria, and architectural decisions before code is written.

**Rationale**: Spec-driven development ensures alignment between requirements and
implementation, enables reviewable workflows, and prevents scope creep. This approach is
mandatory for the hackathon evaluation process.

### IV. Agent-Generated Code Only (NON-NEGOTIABLE)

All code MUST be generated through Claude Code specialized agents. Manual coding is
strictly prohibited. Use appropriate agents for each domain: `auth-security` for
authentication, `nextjs-ui` for frontend, `fastapi-backend-dev` for backend APIs,
`neon-db-architect` for database operations.

**Rationale**: Agent-generated code ensures consistency, follows best practices, and
demonstrates the Agentic Dev Stack workflow required for hackathon evaluation. Manual
coding would invalidate the project's core methodology.

### V. Clear Layer Separation

Maintain strict separation between frontend, backend, authentication, and database layers.
Frontend (Next.js) handles UI and user interactions. Backend (FastAPI) handles business
logic and data operations. Authentication (Better Auth + JWT) handles user identity.
Database (Neon PostgreSQL via SQLModel) handles persistence. Each layer MUST communicate
through well-defined interfaces only.

**Rationale**: Layer separation enables independent development, testing, and scaling of
each component. It also allows specialized agents to work on their respective domains
without conflicts.

## Technology Stack Constraints

The following technology stack is FIXED and MUST NOT be substituted:

- **Frontend**: Next.js 16+ with App Router (no Pages Router)
- **Backend**: Python FastAPI (no Flask, Django, or other frameworks)
- **ORM**: SQLModel (no raw SQL, SQLAlchemy Core, or other ORMs)
- **Database**: Neon Serverless PostgreSQL (no other database providers)
- **Authentication**: Better Auth for frontend + JWT for backend communication

**Environment Variables**:
- `BETTER_AUTH_SECRET`: Shared JWT signing secret (MUST be in `.env`, never hardcoded)
- `DATABASE_URL`: Neon PostgreSQL connection string
- All secrets MUST be in `.env` files and excluded from version control

**API Design Standards**:
- RESTful semantics: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- Predictable URL patterns: `/api/users/{user_id}/todos`, `/api/todos/{todo_id}`
- JSON request/response bodies with proper Content-Type headers
- Consistent error responses with appropriate HTTP status codes

## Security Requirements

### Authentication Flow

1. User logs in on Frontend → Better Auth creates session and issues JWT token
2. Frontend stores token securely (httpOnly cookie or secure storage)
3. Frontend includes token in `Authorization: Bearer <token>` header for all API calls
4. Backend extracts token, verifies signature using `BETTER_AUTH_SECRET`
5. Backend decodes token to get user ID, email, and other claims
6. Backend filters data and enforces ownership based on authenticated user ID

### Token Validation Rules

- All protected endpoints MUST validate JWT token before processing
- Invalid token signature → 401 Unauthorized
- Expired token → 401 Unauthorized with "Token expired" message
- Missing token → 401 Unauthorized with "Authentication required" message
- Token validation MUST happen in middleware/dependency injection, not per-endpoint

### Ownership Enforcement

- GET `/api/users/{user_id}/todos` → Verify `user_id` matches token's user ID
- POST `/api/todos` → Automatically set `user_id` from token (ignore request body)
- PUT `/api/todos/{todo_id}` → Verify todo belongs to authenticated user
- DELETE `/api/todos/{todo_id}` → Verify todo belongs to authenticated user

## Development Workflow

### Spec-Driven Process

1. **Specification** (`/sp.specify`): Define user stories, requirements, acceptance
   criteria
2. **Planning** (`/sp.plan`): Design architecture, data models, API contracts
3. **Task Breakdown** (`/sp.tasks`): Create actionable, testable implementation tasks
4. **Agent Delegation**: Route tasks to specialized agents based on domain
5. **Iterative Review**: Review agent outputs, iterate as needed, maintain PHRs

### Agent Delegation Rules

- **Authentication work** → `auth-security` agent (Better Auth setup, JWT validation,
  securing endpoints)
- **Frontend work** → `nextjs-ui` agent (React components, forms, routing, UI state)
- **Backend API work** → `fastapi-backend-dev` agent (endpoints, Pydantic models,
  business logic)
- **Database work** → `neon-db-architect` agent (schemas, migrations, SQLModel models,
  queries)

### Multi-Agent Coordination

For features spanning multiple domains, follow this sequence:
1. Database schema design (`neon-db-architect`)
2. Backend API implementation (`fastapi-backend-dev`)
3. Authentication integration (`auth-security`)
4. Frontend UI implementation (`nextjs-ui`)

### Quality Gates

- All specs MUST have clear acceptance criteria before planning
- All plans MUST have architectural decisions documented before task breakdown
- All tasks MUST reference specific files and be independently testable
- All implementations MUST be reviewed against original spec requirements

## Success Criteria

The project is considered successful when:

1. **Functional**: All 5 Basic Level todo features work as web application
2. **Secure**: JWT authentication protects all operations, users isolated
3. **Persistent**: Data stored in Neon PostgreSQL, survives server restarts
4. **Multi-user**: Multiple users can register, login, manage their own todos
5. **Reviewable**: Complete spec → plan → tasks → implementation trail exists
6. **Agent-generated**: All code produced by specialized Claude Code agents

## Governance

### Amendment Procedure

1. Propose amendment with rationale and impact analysis
2. Update constitution with new version number following semantic versioning
3. Update dependent templates (spec, plan, tasks) for consistency
4. Create ADR for significant architectural changes
5. Update CLAUDE.md if agent delegation rules change

### Versioning Policy

- **MAJOR** (X.0.0): Backward-incompatible changes (e.g., removing a principle, changing
  tech stack)
- **MINOR** (0.X.0): New principles added, sections expanded, new requirements
- **PATCH** (0.0.X): Clarifications, typo fixes, wording improvements

### Compliance Review

- All PRs MUST verify compliance with constitution principles
- Spec/plan/tasks documents MUST reference constitution principles where applicable
- Violations MUST be justified in "Complexity Tracking" section of plan.md
- Constitution supersedes all other practices and guidelines

**Version**: 1.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-11
