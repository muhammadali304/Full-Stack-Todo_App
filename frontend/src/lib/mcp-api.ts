/**
 * MCP API Client
 *
 * This module provides functions for interacting with the MCP task tools
 * from the frontend.
 */

import { apiRequest } from './api';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * MCP API Client for task management operations
 */
class McpApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MCP_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Add a new task using the MCP add_task tool
   */
  async addTask(data: CreateTaskRequest): Promise<Task> {
    try {
      const result = await apiRequest<Task>('/mcp/tools/add_task', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'add_task',
          params: data
        }),
      });

      return result;
    } catch (error) {
      console.error('Error adding task via MCP:', error);
      throw error;
    }
  }

  /**
   * List tasks using the MCP list_tasks tool
   */
  async listTasks(completed?: boolean): Promise<Task[]> {
    try {
      const params: Record<string, any> = {};
      if (completed !== undefined) {
        params.completed = completed;
      }

      const result = await apiRequest<Task[]>('/mcp/tools/list_tasks', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'list_tasks',
          params: params
        }),
      });

      return result;
    } catch (error) {
      console.error('Error listing tasks via MCP:', error);
      throw error;
    }
  }

  /**
   * Complete a task using the MCP complete_task tool
   */
  async completeTask(taskId: string): Promise<Task> {
    try {
      const result = await apiRequest<Task>('/mcp/tools/complete_task', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'complete_task',
          params: { task_id: taskId }
        }),
      });

      return result;
    } catch (error) {
      console.error('Error completing task via MCP:', error);
      throw error;
    }
  }

  /**
   * Delete a task using the MCP delete_task tool
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await apiRequest<void>('/mcp/tools/delete_task', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'delete_task',
          params: { task_id: taskId }
        }),
      });
    } catch (error) {
      console.error('Error deleting task via MCP:', error);
      throw error;
    }
  }

  /**
   * Update a task using the MCP update_task tool
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const result = await apiRequest<Task>('/mcp/tools/update_task', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'update_task',
          params: {
            task_id: taskId,
            ...data
          }
        }),
      });

      return result;
    } catch (error) {
      console.error('Error updating task via MCP:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const mcpApi = new McpApiClient();

export default mcpApi;