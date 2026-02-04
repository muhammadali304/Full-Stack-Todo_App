"""
OpenAI Agent Service

This module provides integration with the OpenAI Agents SDK to process natural language
requests and connect to existing MCP tools for task management operations.
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from uuid import UUID

from openai import OpenAI
from sqlmodel.ext.asyncio.session import AsyncSession

from ..models.message import Message
from ..models.conversation import Conversation
from ..services.conversation_service import ConversationService


class OpenAIAgentService:
    """
    Service class for OpenAI agent integration.

    Manages the connection between the OpenAI Agents SDK and the existing MCP tools
    for task management operations, ensuring proper authentication and user isolation.
    """

    def __init__(self, db_session: AsyncSession):
        """
        Initialize the OpenAI agent service.

        Args:
            db_session: Async database session for database operations
        """
        # Initialize OpenAI client with API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        self.client = OpenAI(api_key=api_key)
        self.db_session = db_session

        # Initialize conversation service for persistence
        self.conversation_service = ConversationService(db_session)

    async def process_chat_request(
        self,
        user_id: str,
        conversation_id: Optional[UUID],
        message_content: str
    ) -> Dict[str, Any]:
        """
        Process a natural language chat request from a user.

        Args:
            user_id: ID of the authenticated user making the request
            conversation_id: Optional ID of existing conversation (creates new if None)
            message_content: Natural language message from the user

        Returns:
            Dictionary containing the agent's response and any tool call results
        """
        # Get or create conversation
        if conversation_id:
            conversation = await self.conversation_service.get_conversation_by_id(conversation_id, user_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found or does not belong to user {user_id}")
        else:
            # Create a new conversation
            conversation_title = f"Chat: {message_content[:50]}..."
            conversation = await self.conversation_service.create_conversation(
                user_id=user_id,
                title=conversation_title
            )
            conversation_id = conversation.id

        # Create a message record for the user's input
        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=message_content
        )
        self.db_session.add(user_message)
        await self.db_session.commit()
        await self.db_session.refresh(user_message)

        # Prepare tools for the agent - these correspond to existing MCP tools
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "Optional description of the task"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Retrieve all tasks for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "completed": {"type": "boolean", "description": "Filter by completion status if provided"}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to complete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Remove a task from the user's list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to delete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Modify an existing task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "New title for the task"},
                            "description": {"type": "string", "description": "New description for the task"},
                            "completed": {"type": "boolean", "description": "New completion status for the task"}
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

        # Create or retrieve the assistant
        # In a real implementation, we would create an assistant once and reuse it
        # For this implementation, we'll create a temporary assistant for each request
        try:
            # Create the assistant with the task management tools
            assistant = self.client.beta.assistants.create(
                name="Todo Manager",
                description="An AI assistant that helps manage your todo tasks",
                model="gpt-4-turbo-preview",  # Using a capable model for function calling
                tools=tools
            )

            # Create a thread for this conversation
            thread = self.client.beta.threads.create(
                messages=[
                    {
                        "role": "user",
                        "content": message_content
                    }
                ]
            )

            # Run the assistant on the thread
            run = self.client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant.id
            )

            # Poll for completion of the run
            import time
            while run.status in ["queued", "in_progress"]:
                time.sleep(0.5)
                run = self.client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id
                )

            # Process the run results
            messages = self.client.beta.threads.messages.list(thread_id=thread.id)

            # Get the latest assistant message
            assistant_response = ""
            tool_calls = []
            tool_call_results = []

            # Process messages in reverse chronological order (newest first)
            for msg in reversed(messages.data):
                if msg.role == "assistant":
                    # Extract text content
                    for content_block in msg.content:
                        if content_block.type == "text":
                            assistant_response = content_block.text.value
                            break

                    # Extract tool calls if any
                    for content_block in msg.content:
                        if hasattr(content_block, 'annotations'):
                            # Process any annotations or tool calls
                            pass

                    # Extract any tool calls from the run steps
                    run_steps = self.client.beta.threads.runs.steps.list(
                        thread_id=thread.id,
                        run_id=run.id
                    )

                    for step in run_steps.data:
                        if step.type == "tool_calls":
                            for tool_call in step.step_details.tool_calls:
                                tool_calls.append({
                                    "id": tool_call.id,
                                    "type": tool_call.type,
                                    "function": {
                                        "name": tool_call.function.name,
                                        "arguments": tool_call.function.arguments
                                    }
                                })

                                # Process the tool call result
                                if tool_call.type == "function":
                                    # In a real implementation, we would call the actual MCP tools here
                                    # For now, we'll simulate the result
                                    result = self._simulate_tool_call(
                                        tool_call.function.name,
                                        json.loads(tool_call.function.arguments),
                                        user_id
                                    )

                                    tool_call_results.append({
                                        "call_id": tool_call.id,
                                        "result": result
                                    })

            # Create a message record for the assistant's response
            assistant_message = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=assistant_response,
                tool_calls=json.dumps(tool_calls) if tool_calls else None,
                tool_call_results=json.dumps(tool_call_results) if tool_call_results else None
            )
            self.db_session.add(assistant_message)
            await self.db_session.commit()

            # Clean up temporary assistant (in production, you'd reuse assistants)
            try:
                self.client.beta.assistants.delete(assistant.id)
            except:
                pass  # Ignore cleanup errors

            # Return the response with tool call information
            return {
                "response": assistant_response,
                "conversation_id": str(conversation_id),
                "tool_calls": tool_calls,
                "tool_call_results": tool_call_results
            }

        except Exception as e:
            # Log the error and return a user-friendly response
            print(f"Error processing chat request: {str(e)}")

            # Create an error message record
            error_message = Message(
                conversation_id=conversation_id,
                role="assistant",
                content="Sorry, I encountered an error processing your request. Please try again."
            )
            self.db_session.add(error_message)
            await self.db_session.commit()

            return {
                "response": "Sorry, I encountered an error processing your request. Please try again.",
                "conversation_id": str(conversation_id),
                "error": str(e)
            }

    def _simulate_tool_call(self, tool_name: str, arguments: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Simulate a tool call result (in a real implementation, this would call actual MCP tools).

        Args:
            tool_name: Name of the tool being called
            arguments: Arguments for the tool call
            user_id: ID of the user making the request

        Returns:
            Simulated result of the tool call
        """
        # In a real implementation, this would call the actual MCP tools
        # For now, we'll return simulated responses based on the tool name
        if tool_name == "add_task":
            return {
                "id": "simulated_task_id",
                "title": arguments.get("title", "New Task"),
                "description": arguments.get("description"),
                "completed": False,
                "created_at": datetime.utcnow().isoformat()
            }
        elif tool_name == "list_tasks":
            return {
                "tasks": [
                    {
                        "id": "task_1",
                        "title": "Sample task",
                        "completed": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                ]
            }
        elif tool_name == "complete_task":
            return {
                "id": arguments.get("task_id"),
                "completed": True,
                "updated_at": datetime.utcnow().isoformat()
            }
        elif tool_name == "delete_task":
            return {
                "id": arguments.get("task_id"),
                "deleted": True
            }
        elif tool_name == "update_task":
            return {
                "id": arguments.get("task_id"),
                "title": arguments.get("title"),
                "description": arguments.get("description"),
                "completed": arguments.get("completed", False),
                "updated_at": datetime.utcnow().isoformat()
            }
        else:
            return {
                "error": f"Unknown tool: {tool_name}"
            }

    async def get_conversation_history(self, conversation_id: UUID, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve the message history for a conversation.

        Args:
            conversation_id: ID of the conversation to retrieve history for
            user_id: ID of the user requesting history (for isolation check)

        Returns:
            List of message dictionaries with role and content
        """
        # Verify user has access to this conversation
        conversation = await self.conversation_service.get_conversation_by_id(conversation_id, user_id)
        if not conversation:
            return []

        # Get messages for this conversation
        messages = await self.conversation_service.get_conversation_messages(conversation_id, user_id, limit=100)

        # Format messages for return
        history = []
        for message in reversed(messages):  # Reverse to get chronological order (oldest first)
            history.append({
                "id": str(message.id),
                "role": message.role,
                "content": message.content,
                "timestamp": message.created_at.isoformat(),
                "tool_calls": json.loads(message.tool_calls) if message.tool_calls else None,
                "tool_call_results": json.loads(message.tool_call_results) if message.tool_call_results else None
            })

        return history

    async def validate_user_access(self, conversation_id: UUID, user_id: str) -> bool:
        """
        Validate that a user has access to a specific conversation.

        Args:
            conversation_id: ID of the conversation to check access for
            user_id: ID of the user requesting access

        Returns:
            True if user has access, False otherwise
        """
        conversation = await self.conversation_service.get_conversation_by_id(conversation_id, user_id)
        return conversation is not None