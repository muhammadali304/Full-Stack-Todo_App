'use client';

// Updated Todos page - Main task management interface with all CRUD operations
// Protected route - requires authentication

import { useEffect } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Header } from '@/components/layout/Header';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import type { CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

export default function TodosPage() {
  const { user } = useAuth();
  const { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask } = useTasks();

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Handle task creation
   */
  const handleCreateTask = async (data: CreateTaskRequest) => {
    await createTask(data);
  };

  /**
   * Handle task toggle
   */
  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
  };

  /**
   * Handle task update
   */
  const handleUpdateTask = async (id: string, data: UpdateTaskRequest) => {
    await updateTask(id, data);
  };

  /**
   * Handle task delete
   */
  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-secondary)' }}>
        {/* Header with navigation and logout */}
        <Header />

        {/* Main content */}
        <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
          {/* Welcome message */}
          {user && (
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                My Tasks
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                Welcome back, {user.username}!
              </p>
            </div>
          )}

          {/* Task creation form */}
          <section
            style={{
              backgroundColor: 'var(--color-background)',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Create New Task
            </h2>
            <TaskForm onSubmit={handleCreateTask} />
          </section>

          {/* Task list */}
          <section
            style={{
              backgroundColor: 'var(--color-background)',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              Your Tasks ({tasks.length})
            </h2>
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onToggle={handleToggleTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
