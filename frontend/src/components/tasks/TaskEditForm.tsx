'use client';

// TaskEditForm component - Edit existing task form
// Pre-filled with current task data

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import type { Task, UpdateTaskRequest } from '@/lib/types';

interface TaskEditFormProps {
  task: Task;
  onSubmit: (id: string, data: UpdateTaskRequest) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
}

/**
 * TaskEditForm component
 *
 * Features:
 * - Title and description fields pre-filled with current values
 * - HTML5 validation
 * - Loading state during submission
 * - Error handling with inline messages
 * - Cancel button to revert to view mode
 * - Success feedback
 *
 * Validation Rules:
 * - Title: Required, 1-200 characters
 * - Description: Optional, max 1000 characters
 */
export function TaskEditForm({ task, onSubmit, onCancel, onSuccess }: TaskEditFormProps) {
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: task.title,
    description: task.description,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateTaskRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Reset form data when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
    });
  }, [task]);

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof UpdateTaskRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear submit error on change
    if (submitError) {
      setSubmitError('');
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateTaskRequest, string>> = {};

    // Validate title
    if (formData.title !== undefined) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > 200) {
        newErrors.title = 'Title must not exceed 200 characters';
      }
    }

    // Validate description (optional)
    if (formData.description !== undefined && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous error
    setSubmitError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(task.id, {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
      });

      // Call onSuccess callback
      onSuccess?.();
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('title') && message.includes('required')) {
          setErrors(prev => ({ ...prev, title: 'Title is required' }));
        } else if (message.includes('title') && message.includes('200')) {
          setErrors(prev => ({ ...prev, title: 'Title must not exceed 200 characters' }));
        } else if (message.includes('description') && message.includes('1000')) {
          setErrors(prev => ({ ...prev, description: 'Description must not exceed 1000 characters' }));
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError('Failed to update task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: task.title,
      description: task.description,
    });
    setErrors({});
    setSubmitError('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor={`edit-title-${task.id}`} style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Title <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text"
          id={`edit-title-${task.id}`}
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          required
          maxLength={200}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? `edit-title-error-${task.id}` : `edit-title-hint-${task.id}`}
          placeholder="Enter task title"
        />
        {errors.title ? (
          <div id={`edit-title-error-${task.id}`} className="error-message" role="alert">
            {errors.title}
          </div>
        ) : (
          <div id={`edit-title-hint-${task.id}`} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            {formData.title?.length || 0}/200 characters
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor={`edit-description-${task.id}`} style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Description <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>(optional)</span>
        </label>
        <textarea
          id={`edit-description-${task.id}`}
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={1000}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? `edit-description-error-${task.id}` : `edit-description-hint-${task.id}`}
          placeholder="Enter task description (optional)"
          style={{ minHeight: '100px' }}
        />
        {errors.description ? (
          <div id={`edit-description-error-${task.id}`} className="error-message" role="alert">
            {errors.description}
          </div>
        ) : (
          <div id={`edit-description-hint-${task.id}`} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            {formData.description?.length || 0}/1000 characters
          </div>
        )}
      </div>

      {submitError && (
        <div className="error-message" role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {submitError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ flex: 1, minWidth: '120px' }}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner" style={{ marginRight: 'var(--spacing-sm)' }}></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
          style={{ flex: 1, minWidth: '120px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
