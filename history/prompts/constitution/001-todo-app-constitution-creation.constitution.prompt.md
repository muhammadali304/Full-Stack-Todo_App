---
id: 001
title: Todo App Constitution Creation
stage: constitution
date: 2026-01-11
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: muhammadali304
command: /sp.constitution
labels: ["constitution", "security", "spec-driven", "multi-user", "jwt-auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document, no tests)
---

## Prompt

Project: Todo Full-Stack Web Application (Secure, Multi-user, Persistent)

Core principles:
- Security-first architecture (JWT required for all protected operations)
- Strict user isolation (users can only access their own tasks)
- Spec-driven development (no implementation without approved spec & plan)
- Agent-generated code only (no manual coding)
- Clear separation of frontend, backend, authentication, and database layers

Key standards:
- RESTful API design with predictable semantics
- Stateless backend authentication using JWT
- SQLModel ORM for all database interactions
- Neon Serverless PostgreSQL for persistent storage
- Better Auth used exclusively for authentication on frontend

Constraints:
- Fixed technology stack:
  - Frontend: Next.js 16+ (App Router)
  - Backend: Python FastAPI
  - ORM: SQLModel
  - Database: Neon Serverless PostgreSQL
  - Auth: Better Auth + JWT
- Shared JWT signing secret via BETTER_AUTH_SECRET environment variable
- All endpoints require authentication after login
- No manual code writing

Security requirements:
- JWT token required in Authorization header
- Invalid or missing token returns 401 Unauthorized
- Token expiry enforced
- Backend must validate token signature and extract user identity
- All task operations must enforce ownership checks

Success criteria:
- Fully functional multi-user Todo web application
- Secure, stateless authentication flow
- Persistent, user-scoped task data
- End-to-end reviewable spec → plan → implementation workflow

## Response snapshot

Created comprehensive project constitution (v1.0.0) with 5 core principles:

1. **Security-First Architecture**: JWT authentication required for all protected operations with token validation, expiry enforcement, and signature verification.

2. **Strict User Isolation**: Users can only access their own tasks with database-level filtering and ownership checks on all CRUD operations.

3. **Spec-Driven Development (NON-NEGOTIABLE)**: Mandatory workflow of spec → plan → tasks → implementation with no code written before approved specifications.

4. **Agent-Generated Code Only (NON-NEGOTIABLE)**: All code must be generated through specialized Claude Code agents (auth-security, nextjs-ui, fastapi-backend-dev, neon-db-architect).

5. **Clear Layer Separation**: Strict separation between frontend (Next.js), backend (FastAPI), authentication (Better Auth + JWT), and database (Neon PostgreSQL) layers.

Additional sections defined:
- **Technology Stack Constraints**: Fixed stack with Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth
- **Security Requirements**: Detailed authentication flow, token validation rules, ownership enforcement patterns
- **Development Workflow**: Spec-driven process, agent delegation rules, multi-agent coordination sequence, quality gates

Constitution includes governance procedures for amendments, versioning policy (semantic versioning), and compliance review requirements.

## Outcome

- ✅ Impact: Project constitution established as authoritative governance document for Todo Full-Stack Web Application development
- 🧪 Tests: N/A (governance document)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0)
- 🔁 Next prompts: Ready for /sp.specify to create first feature specification following constitution principles
- 🧠 Reflection: Constitution successfully captures security-first, multi-user requirements with clear agent delegation rules and non-negotiable spec-driven workflow

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation completed successfully
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, principles clearly defined, templates reviewed for compatibility
- Prompt variant (if applicable): Standard constitution creation with project-specific security and multi-user requirements
- Next experiment (smallest change to try): Begin feature specification process with /sp.specify for first todo application feature
