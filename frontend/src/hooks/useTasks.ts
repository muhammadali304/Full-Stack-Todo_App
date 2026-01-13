'use client';

// useTasks custom hook - Task operations and state management
// Provides fetchTasks, createTask, updateTask, deleteTask, toggleTask methods

import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<Task>;
}

/**
 * useTasks hook
 *
 * Custom hook for task operations and state management
 *
 * Features:
 * - Fetch all user's tasks
 * - Create new task
 * - Update existing task
 * - Delete task
 * - Toggle task completion
 * - Loading and error states
 * - Automatic state updates after operations
 *
 * Usage:
 * ```tsx
 * const { tasks, loading, error, fetchTasks, createTask } = useTasks();
 * ```
 */
export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tasks for authenticated user
   */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<Task[]>('/api/tasks/', {
        method: 'GET',
      });

      // Sort by created_at DESC (newest first)
      const sortedTasks = data.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTasks(sortedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (data: CreateTaskRequest): Promise<Task> => {
    try {
      const newTask = await apiRequest<Task>('/api/tasks/', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Add new task to top of array (newest first)
      setTasks(prev => [newTask, ...prev]);

      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    try {
      const updatedTask = await apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      // Update task in array
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await apiRequest<void>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      // Remove task from array
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Toggle task completion status
   */
  const toggleTask = useCallback(async (id: string): Promise<Task> => {
    try {
      const updatedTask = await apiRequest<Task>(`/api/tasks/${id}/toggle`, {
        method: 'POST',
      });

      // Update task in array
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
