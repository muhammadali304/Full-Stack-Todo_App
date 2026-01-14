'use client';

// Updated TaskItem component with edit mode support
// Shows title, description, completion status, and action buttons
// Supports inline editing with TaskEditForm

import { useState } from 'react';
import { TaskEditForm } from './TaskEditForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Task, UpdateTaskRequest } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
  onUpdate?: (id: string, data: UpdateTaskRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

/**
 * TaskItem component
 *
 * Displays a single task with:
 * - Title and description
 * - Completion checkbox
 * - Edit and delete buttons
 * - Inline edit mode with TaskEditForm
 * - Custom delete confirmation dialog
 * - Completion visual styling (strikethrough)
 * - Responsive layout
 *
 * Features:
 * - Optimistic UI updates for toggle
 * - Loading states for async operations
 * - Error handling with rollback
 * - Edit mode toggle
 * - Custom confirmation modal for delete
 */
export function TaskItem({ task, onToggle, onEdit, onUpdate, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(task.completed);

  /**
   * Handle checkbox toggle with optimistic update
   */
  const handleToggle = async () => {
    if (!onToggle || isToggling) return;

    // Optimistic update
    const previousCompleted = localCompleted;
    setLocalCompleted(!localCompleted);
    setIsToggling(true);

    try {
      await onToggle(task.id);
    } catch (error) {
      // Rollback on error
      setLocalCompleted(previousCompleted);
      console.error('Error toggling task:', error);
    } finally {
      setIsToggling(false);
    }
  };

  /**
   * Handle delete button click - Show confirmation dialog
   */
  const handleDeleteClick = () => {
    if (!onDelete || isDeleting) return;
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
      setIsDeleting(false);
    }
  };

  /**
   * Handle delete cancellation
   */
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) {
      onEdit(task.id);
    }
  };

  /**
   * Handle edit form submission
   */
  const handleUpdate = async (id: string, data: UpdateTaskRequest) => {
    if (onUpdate) {
      await onUpdate(id, data);
      setIsEditing(false);
    }
  };

  /**
   * Handle edit cancel
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Edit mode view
  if (isEditing && onUpdate) {
    return (
      <div
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-primary-light)',
          border: '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>
          Edit Task
        </h4>
        <TaskEditForm
          task={task}
          onSubmit={handleUpdate}
          onCancel={handleCancelEdit}
          onSuccess={handleCancelEdit}
        />
      </div>
    );
  }

  // Normal view mode
  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-md)',
        opacity: isDeleting ? 0.5 : 1,
        transition: 'opacity var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
        {/* Animated Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling || isDeleting}
          aria-label={`Mark task "${task.title}" as ${localCompleted ? 'incomplete' : 'complete'}`}
          aria-checked={localCompleted}
          role="checkbox"
          style={{
            width: '24px',
            height: '24px',
            minWidth: '24px',
            minHeight: '24px',
            marginTop: '2px',
            cursor: isToggling || isDeleting ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            border: `2px solid ${localCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: localCompleted ? 'var(--color-primary)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'all 0.2s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Checkmark */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: localCompleted ? 1 : 0,
              transform: localCompleted ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)',
              transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        {/* Task content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 500,
              marginBottom: 'var(--spacing-xs)',
              textDecoration: localCompleted ? 'line-through' : 'none',
              color: localCompleted ? 'var(--color-text-secondary)' : 'var(--color-text)',
              wordBreak: 'break-word',
            }}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-sm)',
                textDecoration: localCompleted ? 'line-through' : 'none',
                wordBreak: 'break-word',
              }}
            >
              {task.description}
            </p>
          )}

          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-light)',
              marginTop: 'var(--spacing-sm)',
            }}
          >
            Created: {new Date(task.created_at).toLocaleDateString()} at{' '}
            {new Date(task.created_at).toLocaleTimeString()}
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          {onUpdate && (
            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="btn btn-secondary"
              aria-label={`Edit task "${task.title}"`}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                minHeight: '36px',
                minWidth: '60px',
              }}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="btn btn-danger"
              aria-label={`Delete task "${task.title}"`}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                minHeight: '36px',
                minWidth: '60px',
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
}
