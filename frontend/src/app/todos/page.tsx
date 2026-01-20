'use client';

// Updated Todos page - Main task management interface with all CRUD operations
// Protected route - requires authentication

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Header } from '@/components/layout/Header';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/common/Modal';
import type { CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

export default function TodosPage() {
  const { user } = useAuth();
  const { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Handle task creation
   */
  const handleCreateTask = async (data: CreateTaskRequest) => {
    await createTask(data);
    // Close the modal after successful creation
    setShowCreateForm(false);
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

  /**
   * Handle "Create Task" button click
   */
  const handleCreateTaskButtonClick = () => {
    setShowCreateForm(true);
  };

  /**
   * Handle closing the modal
   */
  const handleCloseModal = () => {
    setShowCreateForm(false);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-secondary)' }}>
        {/* Header with navigation and logout */}
        <Header />

        {/* Main content */}
        <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
          {/* Welcome message and create button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                My Tasks
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                Welcome back, {user?.username || 'User'}!
              </p>
            </div>

            {/* Create Task Button */}
            <button
              onClick={handleCreateTaskButtonClick}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
              aria-label="Create new task"
            >
              <span>+</span>
              <span>Create Task</span>
            </button>
          </div>

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

        {/* Create Task Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={handleCloseModal}
          title="Create New Task"
          size="md"
        >
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </AuthGuard>
  );
}
