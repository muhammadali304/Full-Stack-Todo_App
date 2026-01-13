'use client';

// LoginForm component - User login form
// Includes email and password fields with validation

import { useState, FormEvent, ChangeEvent } from 'react';
import type { LoginRequest } from '@/lib/types';

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * LoginForm component
 *
 * Features:
 * - Email and password fields
 * - HTML5 validation (required, email format)
 * - Loading state during submission
 * - Error handling with user-friendly messages
 *
 * Validation Rules:
 * - Email: Valid email format, required
 * - Password: Required, non-empty
 */
export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof LoginRequest]) {
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
    const newErrors: Partial<Record<keyof LoginRequest, string>> = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await onSubmit(formData);

      // Clear form on success
      setFormData({ email: '', password: '' });

      // Call onSuccess callback
      onSuccess?.();
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('invalid credentials') || message.includes('unauthorized')) {
          setSubmitError('Invalid email or password. Please try again.');
        } else if (message.includes('timeout')) {
          setSubmitError('Request timeout. Please check your connection and try again.');
        } else if (message.includes('network')) {
          setSubmitError('Network error. Please check your connection and try again.');
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: '400px' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Email <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          required
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          placeholder="you@example.com"
        />
        {errors.email && (
          <div id="email-error" className="error-message" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Password <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            placeholder="••••••••"
            style={{ paddingRight: '45px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            {showPassword ? (
              // Eye slash icon (hide password)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon (show password)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <div id="password-error" className="error-message" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      {submitError && (
        <div className="error-message" role="alert" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {submitError}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ width: '100%' }}
      >
        {isSubmitting ? (
          <>
            <span className="loading-spinner" style={{ marginRight: 'var(--spacing-sm)' }}></span>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
