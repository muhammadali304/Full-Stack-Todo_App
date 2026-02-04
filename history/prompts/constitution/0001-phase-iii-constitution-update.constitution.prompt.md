---
id: "0001"
title: "Phase-III Constitution Update"
stage: "constitution"
date_iso: "2026-01-20"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "unknown"
command: "/sp.constitution"
labels: ["constitution", "phase-iii", "todo-chatbot", "mcp", "ai-agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
  - "CLAUDE.md"
tests_yaml:
  - "none"
---

# Prompt History Record

## Context
Updating the project constitution to incorporate Phase-III requirements for the AI Chatbot using MCP Server and OpenAI Agents SDK, while preserving existing Phase-II web application requirements.

## Prompt Text
```
/sp.constitution — Phase-III (Todo AI Chatbot)

## Project
AI-powered Todo Chatbot using MCP Server + OpenAI Agents SDK

---

## Core Principles
- Stateless backend (no in-memory state)
- All task changes via MCP tools only
- Protocol-first (Official MCP SDK)
- JWT-secured user isolation (Better Auth)
- Explainable AI (log + persist all tool calls)
- Crash-safe (resume conversations after restart)

---

## Key Standards
- One MCP tool per AI action
- Input validation + user ownership enforced
- Persist user message before agent run
- Persist assistant response after tool run
- JWT required on `/api/{user_id}/chat` + tools
- SQLModel ORM only
- OpenAI Agents SDK only
- Official MCP SDK only

---

## Constraints
- Backend: FastAPI (Python)
- Frontend: OpenAI ChatKit
- DB: Neon PostgreSQL
- Auth: Better Auth (JWT)
- No manual coding (Claude Code only)
- No server memory or Redis
- Single chat endpoint: `POST /api/{user_id}/chat`
- No direct DB writes from agent
- No breaking Phase-II APIs

---

## Success Criteria
- Natural-language todo management works
- MCP tools: add, list, complete, delete, update
- Conversations persist + resume
- Tool calls returned in responses
- 401 on unauthorized requests
- User data fully isolated
- Stateless chat endpoint
- Graceful error handling
- All MCP tools tested
- Demo flows pass (add, list, complete, delete, update)

---
```

## Response Text
Updated the constitution to include both Phase-II (web application) and Phase-III (AI chatbot) requirements, adding new principles for MCP protocol-first development, stateless backend architecture, and explainable AI operations.

## Outcome Impact
The constitution now supports both the original web application (Phase-II) and the new AI chatbot (Phase-III) requirements, ensuring continuity while enabling the evolution to AI-powered todo management with MCP tools.

## Tests Summary
none

## Files Summary
- .specify/memory/constitution.md: Updated to include Phase-III elements while preserving Phase-II content
- CLAUDE.md: Updated to reflect Phase-III technology stack and agent delegation rules

## Next Prompts
- Continue with Phase-III implementation following the updated constitution
- Generate specification for the AI chatbot features
- Create implementation plan for MCP tools integration

## Reflection Note
Successfully evolved the constitution to support both phases of the project while maintaining backward compatibility and clear delineation between Phase-II and Phase-III requirements.

---
## Acceptance Criteria
- [x] Full prompt preserved verbatim
- [x] Constitution updated with Phase-III requirements
- [x] Phase-II requirements preserved
- [x] New principles added for AI chatbot
- [x] Technology stack updated for both phases
- [x] Success criteria expanded for both phases

## Failure Modes Observed
None

## Next Experiment to Improve Prompt Quality
Consider adding more specific guidance about how to handle multi-phase requirements in the constitution.