<!--
Sync Impact Report
==================
Version Change: 1.0.0 → 1.1.0
Ratification: 2026-01-11
Last Amended: 2026-01-20

Principles Expanded:
- I. Security-First Architecture (Phase-II) - No changes
- II. Strict User Isolation (Phase-II) - No changes
- III. Spec-Driven Development (NON-NEGOTIABLE) - No changes
- IV. Agent-Generated Code Only (NON-NEGOTIABLE) - No changes
- V. Clear Layer Separation (Phase-II) - No changes
- VI. MCP Protocol-First Development (Phase-III) - New principle
- VII. Stateless Backend Architecture (Phase-III) - New principle
- VIII. Explainable AI Operations (Phase-III) - New principle

Sections Extended:
- Technology Stack Constraints - Added Phase-III technologies
- Security Requirements - Added Phase-III authentication flow
- Development Workflow - Updated for AI/MCP work
- Success Criteria - Added Phase-III success criteria

Templates Status:
⚠️ .specify/templates/spec-template.md - Needs review for AI chatbot/MCP focus
⚠️ .specify/templates/plan-template.md - Needs review for AI chatbot/MCP focus
⚠️ .specify/templates/tasks-template.md - Needs review for AI chatbot/MCP focus

Follow-up TODOs: None
-->

# Todo Application Constitution: Phase-II & Phase-III

## Core Principles

### I. Security-First Architecture (Phase-II)

JWT authentication is REQUIRED for all protected operations. Every API endpoint (except
public auth endpoints) MUST validate the JWT token from the Authorization header before
processing requests. Invalid or missing tokens MUST return 401 Unauthorized. Token expiry
MUST be enforced. Backend MUST validate token signature using the shared secret and
extract user identity for authorization decisions.

**Rationale**: Multi-user applications require robust authentication to prevent
unauthorized access. Stateless JWT tokens enable scalable, secure authentication without
server-side session storage.

### II. Strict User Isolation (Phase-II)

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

### V. Clear Layer Separation (Phase-II)

Maintain strict separation between frontend, backend, authentication, and database layers.
Frontend (Next.js) handles UI and user interactions. Backend (FastAPI) handles business
logic and data operations. Authentication (Better Auth + JWT) handles user identity.
Database (Neon PostgreSQL via SQLModel) handles persistence. Each layer MUST communicate
through well-defined interfaces only.

**Rationale**: Layer separation enables independent development, testing, and scaling of
each component. It also allows specialized agents to work on their respective domains
without conflicts.

### VI. MCP Protocol-First Development (Phase-III)

All todo operations MUST be performed through MCP tools only. The AI agent can ONLY modify
data via officially defined MCP tools (add, list, complete, delete, update). Direct
database writes from the agent are PROHIBITED. Each AI action corresponds to exactly one
MCP tool call, ensuring auditability and consistency.

**Rationale**: MCP protocol-first approach ensures standardized operations, provides
audit trails for all actions, and maintains consistency across different AI agent
implementations. This also enables explainable AI operations.

### VII. Stateless Backend Architecture (Phase-III)

Backend MUST remain stateless with no in-memory state storage. All conversation state,
user data, and tool call history MUST be persisted to the database. No server memory or
Redis is allowed for state management. The system MUST be able to crash and restart
without losing conversation context or tool call information.

**Rationale**: Statelessness enables horizontal scalability and fault tolerance. With
conversations managed by AI agents that may span long periods, persistent storage ensures
reliability and crash recovery without data loss.

### VIII. Explainable AI Operations (Phase-III)

All tool calls and their results MUST be logged and persisted. AI agent responses MUST
include references to the tools called and their outcomes. Users MUST be able to
understand which operations were performed based on their requests. All AI reasoning
steps leading to tool calls MUST be traceable.

**Rationale**: Explainability is essential for debugging, compliance, and user trust.
When AI agents perform operations on behalf of users, transparency about actions taken
is crucial for accountability and troubleshooting.

## Technology Stack Constraints

The following technology stack is FIXED and MUST NOT be substituted:

### Phase-II Technologies:
- **Frontend**: Next.js 16+ with App Router (no Pages Router)
- **Backend**: Python FastAPI (no Flask, Django, or other frameworks)
- **ORM**: SQLModel (no raw SQL, SQLAlchemy Core, or other ORMs)
- **Database**: Neon Serverless PostgreSQL (no other database providers)
- **Authentication**: Better Auth for frontend + JWT for backend communication

### Phase-III Technologies:
- **AI Agent Framework**: OpenAI Agents SDK (no alternative agent frameworks)
- **MCP Protocol**: Official MCP SDK (no custom protocols)
- **Frontend**: OpenAI ChatKit (no custom chat UI frameworks)

**Environment Variables**:
- `BETTER_AUTH_SECRET`: Shared JWT signing secret (MUST be in `.env`, never hardcoded)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for agent operations
- `MCP_SERVER_URL`: MCP server endpoint URL
- All secrets MUST be in `.env` files and excluded from version control

**API Design Standards**:
- RESTful semantics: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- Predictable URL patterns: `/api/users/{user_id}/todos`, `/api/todos/{todo_id}`
- Single chat endpoint: `POST /api/{user_id}/chat`
- JWT required on all endpoints including MCP tools
- JSON request/response bodies with proper Content-Type headers
- Consistent error responses with appropriate HTTP status codes
- Tool call results returned in AI responses

## Security Requirements

### Authentication Flow

#### Phase-II Web Application Flow:
1. User logs in on Frontend → Better Auth creates session and issues JWT token
2. Frontend stores token securely (httpOnly cookie or secure storage)
3. Frontend includes token in `Authorization: Bearer <token>` header for all API calls
4. Backend extracts token, verifies signature using `BETTER_AUTH_SECRET`
5. Backend decodes token to get user ID, email, and other claims
6. Backend filters data and enforces ownership based on authenticated user ID

#### Phase-III AI Chatbot Flow:
1. User authenticates on frontend → Better Auth creates session and issues JWT token
2. Frontend includes token in `Authorization: Bearer <token>` header for chat API calls
3. Backend validates JWT token before processing any request
4. Backend extracts user ID from token for user isolation enforcement
5. MCP tools verify user ownership before performing operations on data

### Token Validation Rules

- All protected endpoints MUST validate JWT token before processing
- Invalid token signature → 401 Unauthorized
- Expired token → 401 Unauthorized with "Token expired" message
- Missing token → 401 Unauthorized with "Authentication required" message
- Token validation MUST happen in middleware/dependency injection, not per-endpoint

### Ownership Enforcement

#### Phase-II Endpoints:
- GET `/api/users/{user_id}/todos` → Verify `user_id` matches token's user ID
- POST `/api/todos` → Automatically set `user_id` from token (ignore request body)
- PUT `/api/todos/{todo_id}` → Verify todo belongs to authenticated user
- DELETE `/api/todos/{todo_id}` → Verify todo belongs to authenticated user

#### Phase-III Endpoints:
- POST `/api/{user_id}/chat` → Verify `user_id` matches token's user ID
- MCP tools → Verify operations apply only to authenticated user's data
- Tool calls → Include user ID context to ensure data isolation
- Database queries → Always filter by authenticated user's ID

## Development Workflow

### Spec-Driven Process

1. **Specification** (`/sp.specify`): Define user stories, AI interaction patterns,
   MCP tool specifications, requirements, acceptance criteria
2. **Planning** (`/sp.plan`): Design architecture, data models, AI agent behavior,
   MCP tool contracts, conversation flow
3. **Task Breakdown** (`/sp.tasks`): Create actionable, testable implementation tasks
4. **Agent Delegation**: Route tasks to specialized agents based on domain
5. **Iterative Review**: Review agent outputs, iterate as needed, maintain PHRs

### Agent Delegation Rules

#### Phase-II Work:
- **Authentication work** → `auth-security` agent (Better Auth setup, JWT validation,
  securing endpoints)
- **Frontend work** → `nextjs-ui` agent (React components, forms, routing, UI state)
- **Backend API work** → `fastapi-backend-dev` agent (endpoints, Pydantic models,
  business logic)
- **Database work** → `neon-db-architect` agent (schemas, migrations, SQLModel models,
  queries)

#### Phase-III Work:
- **Frontend work** → `nextjs-ui` agent (ChatKit integration, conversation UI,
  authentication flows)
- **Backend API work** → `fastapi-backend-dev` agent (chat endpoint, OpenAI agent
  integration, MCP tool endpoints)
- **Database work** → `neon-db-architect` agent (schemas, migrations, SQLModel models,
  conversation persistence queries)
- **AI/MCP work** → `fastapi-backend-dev` agent with focus on OpenAI integration and
  MCP protocol implementation

### Multi-Agent Coordination

#### Phase-II Sequence:
For Phase-II features spanning multiple domains, follow this sequence:
1. Database schema design (`neon-db-architect`)
2. Backend API implementation (`fastapi-backend-dev`)
3. Authentication integration (`auth-security`)
4. Frontend UI implementation (`nextjs-ui`)

#### Phase-III Sequence:
For Phase-III features spanning multiple domains, follow this sequence:
1. Database schema design (`neon-db-architect`)
2. MCP tool implementation (`fastapi-backend-dev`)
3. AI agent integration (`fastapi-backend-dev`)
4. Authentication integration (`auth-security`)
5. Frontend UI implementation (`nextjs-ui`)

### Quality Gates

- All specs MUST have clear acceptance criteria before planning
- All plans MUST have architectural decisions documented before task breakdown
- All tasks MUST reference specific files and be independently testable
- All MCP tools MUST be validated for user isolation and security
- All implementations MUST be reviewed against original spec requirements

## Success Criteria

The project is considered successful when:

### Phase-II (Web Application) Success:
1. **Functional**: All 5 Basic Level todo features work as web application
2. **Secure**: JWT authentication protects all operations, users isolated
3. **Persistent**: Data stored in Neon PostgreSQL, survives server restarts
4. **Multi-user**: Multiple users can register, login, manage their own todos
5. **Reviewable**: Complete spec → plan → tasks → implementation trail exists

### Phase-III (AI Chatbot) Success:
6. **Functional**: Natural-language todo management works via AI chatbot
7. **MCP Compliant**: All todo operations happen through MCP tools only
8. **Explainable**: Tool calls and results returned in AI responses
9. **Resumable**: Conversations persist and can resume after interruptions
10. **Crash-Safe**: System can recover from restarts without losing conversation state
11. **Stateless**: No in-memory state storage - all data persisted to database

### Overall Success:
12. **Agent-generated**: All code produced by specialized Claude Code agents
13. **Compatible**: Phase-III does not break Phase-II functionality
14. **Secure**: JWT authentication protects all operations, users isolated

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

**Version**: 1.1.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-20
