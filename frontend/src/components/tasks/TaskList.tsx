'use client';

// Updated TaskList component - Display array of tasks with all operations
// Shows loading state, empty state, and error state
// Includes filter buttons for All/Active/Completed tasks

import { useState } from 'react';
import { TaskItem } from './TaskItem';
import type { Task, UpdateTaskRequest } from '@/lib/types';

type FilterType = 'all' | 'active' | 'completed';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle?: (id: string) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTaskRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

/**
 * TaskList component
 *
 * Displays a list of tasks with:
 * - Loading state (spinner)
 * - Empty state (no tasks message)
 * - Error state (error message)
 * - Task items with all CRUD operations
 * - Filter buttons (All/Active/Completed)
 *
 * Features:
 * - Responsive grid layout
 * - Accessible loading and error announcements
 * - Ordered by created_at DESC (newest first)
 * - Task filtering by completion status
 */
export function TaskList({ tasks, loading, error, onToggle, onUpdate, onDelete }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };
  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-2xl)',
          textAlign: 'center',
        }}
        role="status"
        aria-live="polite"
      >
        <div className="loading-spinner" style={{ marginBottom: 'var(--spacing-md)' }}></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading tasks...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: 'var(--spacing-xl)',
          backgroundColor: 'var(--color-error-light)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
        }}
        role="alert"
        aria-live="assertive"
      >
        <p style={{ color: 'var(--color-error)', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
          Error loading tasks
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (filteredTasks.length === 0 && !loading && !error) {
    const emptyMessages = {
      all: 'No tasks yet. Create your first task to get started!',
      active: 'No active tasks. All tasks are completed!',
      completed: 'No completed tasks yet. Mark some tasks as complete!',
    };

    return (
      <>
        {/* Filter buttons */}
        {tasks.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-lg)',
              flexWrap: 'wrap',
            }}
            role="group"
            aria-label="Task filters"
          >
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              All ({taskCounts.all})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Active ({taskCounts.active})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Completed ({taskCounts.completed})
            </button>
          </div>
        )}

        <div
          style={{
            padding: 'var(--spacing-2xl)',
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
            {emptyMessages[filter]}
          </p>
        </div>
      </>
    );
  }

  // Task list
  return (
    <>
      {/* Filter buttons */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
        }}
        role="group"
        aria-label="Task filters"
      >
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          All ({taskCounts.all})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Active ({taskCounts.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Completed ({taskCounts.completed})
        </button>
      </div>

      {/* Task list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        role="list"
        aria-label="Task list"
      >
        {filteredTasks.map((task) => (
          <div key={task.id} role="listitem">
            <TaskItem
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </>
  );
}
