# Research: AI Agent + Chat Endpoint Implementation

**Feature**: 005-ai-agent-chat
**Date**: 2026-01-20

## Overview

This document outlines the research findings for implementing an AI agent chat endpoint that enables users to manage their todos through natural language processing. The research covers technology choices, integration patterns, and best practices for the required components.

## OpenAI Agents SDK Research

**Decision**: Use OpenAI Agents SDK for natural language processing
**Rationale**: The requirement specifically states "OpenAI Agents SDK only", so we must use the OpenAI Agents SDK. This provides the necessary tools to create AI agents that can process natural language requests and interact with tools.
**Alternatives considered**: Custom NLP models, other AI agent frameworks were rejected due to constraints.

## Agent Configuration Research

**Decision**: Configure agent with system prompt for todo management
**Rationale**: The agent needs to understand its role in managing todos and how to interact with the MCP tools. A well-crafted system prompt will guide the agent's behavior and responses.
**Alternatives considered**: Generic agent configuration was rejected for being too broad and not specific to the todo management domain.

## Chat Endpoint Research

**Decision**: Implement stateless chat endpoint at POST /api/{user_id}/chat
**Rationale**: The requirement specifies a stateless chat endpoint. Each request will be self-contained with the necessary context, relying on database persistence for conversation state rather than in-memory storage.
**Alternatives considered**: WebSocket connections were rejected due to the stateless requirement.

## Conversation Persistence Research

**Decision**: Use SQLModel to create Conversation and Message entities
**Rationale**: The requirement for conversation persistence necessitates storing conversation history in the database. SQLModel provides the necessary ORM capabilities to integrate with the existing database infrastructure.
**Alternatives considered**: External storage services were rejected to maintain consistency with existing data storage patterns.

## MCP Tool Bridge Research

**Decision**: Create bridge between OpenAI agent and existing MCP tools
**Rationale**: The agent needs to interact with the existing MCP tools for task management operations. This bridge will translate agent actions into MCP tool calls.
**Alternatives considered**: Direct database operations were rejected due to the constraint requiring MCP tools only for DB writes.

## Authentication Research

**Decision**: Reuse existing JWT authentication infrastructure
**Rationale**: The existing authentication system already provides JWT validation using Better Auth. This eliminates the need to reimplement authentication logic and ensures consistency with other endpoints.
**Alternatives considered**: Separate authentication system was rejected for adding complexity and inconsistency.

## Error Handling Research

**Decision**: Implement comprehensive error handling with user-friendly messages
**Rationale**: The requirement specifies comprehensive error handling with user-friendly messages. This ensures users receive helpful feedback when errors occur.
**Alternatives considered**: Basic error codes were rejected for being unhelpful to users.

## Conversation Entity Design

**Decision**: Design Conversation entity with user ownership, timestamps, and retention policy
**Rationale**: The requirement for conversation persistence and user isolation necessitates a Conversation entity that includes user_id for ownership, timestamps for ordering, and retention tracking.
**Fields identified**: id, user_id, title (from first message), created_at, updated_at, expires_at (for 30-day retention)

## Message Entity Design

**Decision**: Design Message entity with role, content, and tool call tracking
**Rationale**: The requirement for message history and tool invocation tracking necessitates a Message entity that captures the conversation flow and tool interactions.
**Fields identified**: id, conversation_id, role (user/assistant), content, created_at, tool_calls (JSON array), tool_call_results (JSON array)

## Agent Behavior Rules

**Decision**: Define clear agent behavior rules for add/list/complete/delete/update operations
**Rationale**: The agent needs to understand how to interpret natural language requests and map them to the appropriate MCP tools.
**Rules established**:
- Add: Interpret requests to create new tasks and call add_task MCP tool
- List: Interpret requests to retrieve tasks and call list_tasks MCP tool
- Complete: Interpret requests to mark tasks as completed and call complete_task MCP tool
- Delete: Interpret requests to remove tasks and call delete_task MCP tool
- Update: Interpret requests to modify tasks and call update_task MCP tool