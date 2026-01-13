'use client';

// RegisterForm component - User registration form
// Includes email, username, password fields with HTML5 and custom validation

import { useState, FormEvent, ChangeEvent } from 'react';
import type { RegisterRequest } from '@/lib/types';

interface RegisterFormProps {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * RegisterForm component
 *
 * Features:
 * - Email, username, password fields
 * - HTML5 validation (required, email format)
 * - Custom password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 * - Loading state during submission
 * - Error handling with user-friendly messages
 * - Success message display
 *
 * Validation Rules:
 * - Email: Valid email format, required
 * - Username: 3-30 characters, alphanumeric + underscore, required
 * - Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, required
 */
export function RegisterForm({ onSubmit, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validate password strength
   * Min 8 chars, 1 uppercase, 1 lowercase, 1 number
   */
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  /**
   * Validate username format
   * 3-30 characters, alphanumeric + underscore
   */
  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 30) {
      return 'Username must not exceed 30 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof RegisterRequest]) {
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
    const newErrors: Partial<Record<keyof RegisterRequest, string>> = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate username
    const usernameError = validateUsername(formData.username);
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (usernameError) {
      newErrors.username = usernameError;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordError) {
      newErrors.password = passwordError;
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
      await onSubmit(formData);

      // Show success message
      setSuccessMessage('Registration successful! Redirecting to login...');

      // Clear form
      setFormData({ email: '', username: '', password: '' });

      // Call onSuccess callback after short delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('email already registered') || message.includes('duplicate email')) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        } else if (message.includes('username already taken') || message.includes('duplicate username')) {
          setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError('Registration failed. Please try again.');
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
        <label htmlFor="username" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
          Username <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
          required
          minLength={3}
          maxLength={30}
          aria-required="true"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          placeholder="johndoe"
        />
        {errors.username && (
          <div id="username-error" className="error-message" role="alert">
            {errors.username}
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
            minLength={8}
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
        {errors.password ? (
          <div id="password-error" className="error-message" role="alert">
            {errors.password}
          </div>
        ) : (
          <div id="password-hint" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            Min 8 characters, 1 uppercase, 1 lowercase, 1 number
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ width: '100%' }}
      >
        {isSubmitting ? (
          <>
            <span className="loading-spinner" style={{ marginRight: 'var(--spacing-sm)' }}></span>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
