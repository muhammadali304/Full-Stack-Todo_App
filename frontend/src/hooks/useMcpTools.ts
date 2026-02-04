/**
 * useMcpTools Hook
 *
 * Custom React hook for MCP task operations using the MCP API client.
 * Provides addTask, listTasks, completeTask, deleteTask, updateTask methods
 * that integrate with the MCP tools.
 */

import { useState, useCallback } from 'react';
import { mcpApi, Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/mcp-api';

interface UseMcpToolsReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (completed?: boolean) => Promise<void>;
  addTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<Task>;
}

/**
 * useMcpTools hook
 *
 * Custom hook for task operations using MCP tools.
 *
 * Features:
 * - Fetch all user's tasks via MCP
 * - Create new task via MCP
 * - Update existing task via MCP
 * - Delete task via MCP
 * - Toggle task completion via MCP
 * - Loading and error states
 * - Automatic state updates after operations
 */
export function useMcpTools(): UseMcpToolsReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tasks for authenticated user via MCP
   */
  const fetchTasks = useCallback(async (completed?: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await mcpApi.listTasks(completed);

      // Sort by created_at DESC (newest first)
      const sortedTasks = data.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTasks(sortedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks via MCP:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new task via MCP
   */
  const addTask = useCallback(async (data: CreateTaskRequest): Promise<Task> => {
    try {
      const newTask = await mcpApi.addTask(data);

      // Add new task to top of array (newest first)
      setTasks(prev => [newTask, ...prev]);

      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Update an existing task via MCP
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    try {
      const updatedTask = await mcpApi.updateTask(id, data);

      // Update task in array
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Delete a task via MCP
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await mcpApi.deleteTask(id);

      // Remove task from array
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Toggle task completion status via MCP
   */
  const toggleTask = useCallback(async (id: string): Promise<Task> => {
    try {
      // Find the current task to get its current completion status
      const currentTask = tasks.find(task => task.id === id);
      if (!currentTask) {
        throw new Error(`Task with id ${id} not found`);
      }

      // Update the task with the opposite completion status
      const updatedTask = await mcpApi.updateTask(id, {
        completed: !currentTask.completed
      });

      // Update task in array
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task';
      throw new Error(errorMessage);
    }
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}