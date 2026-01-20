'use client';

// TaskForm component - Create new task form
// Includes title and description fields with validation

import { useState, FormEvent, ChangeEvent, useRef } from 'react';
import type { CreateTaskRequest } from '@/lib/types';

interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * TaskForm component
 *
 * Features:
 * - Title field (required, max 200 chars)
 * - Description field (optional, max 1000 chars)
 * - HTML5 validation
 * - Loading state during submission
 * - Error handling with inline messages
 * - Success feedback
 * - Auto-focus on title field after submission
 * - Cancel functionality
 *
 * Validation Rules:
 * - Title: Required, 1-200 characters
 * - Description: Optional, max 1000 characters
 */
export function TaskForm({ onSubmit, onSuccess, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    completed: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof CreateTaskRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear submit error on change
    if (submitError) {
      setSubmitError('');
    }

    // Clear success message on change
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Handle checkbox change
   */
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTaskRequest, string>> = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Validate description (optional)
    if (formData.description && formData.description.length > 1000) {
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

    // Clear previous messages
    setSubmitError('');
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        completed: formData.completed || false,
      });

      // Show success message
      setSuccessMessage('Task created successfully!');

      // Clear form
      setFormData({ title: '', description: '', completed: false });

      // Auto-focus on title field
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

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
        setSubmitError('Failed to create task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Title <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          ref={titleInputRef}
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          required
          maxLength={200}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : 'title-hint'}
          placeholder="Enter task title"
        />
        {errors.title ? (
          <div id="title-error" className="error-message" role="alert">
            {errors.title}
          </div>
        ) : (
          <div id="title-hint" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            {formData.title.length}/200 characters
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Description <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={1000}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : 'description-hint'}
          placeholder="Enter task description (optional)"
          style={{ minHeight: '100px' }}
        />
        {errors.description ? (
          <div id="description-error" className="error-message" role="alert">
            {errors.description}
          </div>
        ) : (
          <div id="description-hint" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            {formData.description?.length || 0}/1000 characters
          </div>
        )}
      </div>

      {submitError && (
        <div className="error-message" role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="success-message" role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {successMessage}
        </div>
      )}

      {/* Completed checkbox */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            id="completed"
            name="completed"
            checked={formData.completed || false}
            onChange={handleCheckboxChange}
            disabled={isSubmitting}
            style={{
              width: '20px',
              height: '20px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          />
          <span style={{ fontWeight: 500 }}>
            Completed
          </span>
        </label>
        {/* <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)', marginLeft: '28px' }}>
          Check this if the task is already completed
        </div> */}
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner" style={{ marginRight: 'var(--spacing-sm)' }}></span>
              Creating task...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}
