'use client';

// ConfirmDialog component - Custom confirmation modal
// Replaces browser's default confirm dialog with a styled modal

import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmDialog component
 *
 * Features:
 * - Custom styled modal dialog
 * - Backdrop overlay
 * - Accessible with ARIA attributes
 * - Keyboard support (Escape to cancel)
 * - Different variants (danger, warning, info)
 * - Smooth animations
 *
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   title="Delete Task"
 *   message="Are you sure you want to delete this task? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  // Handle Escape key to cancel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Get variant colors
  const variantColors = {
    danger: {
      icon: '🗑️',
      iconBg: 'var(--color-error-light)',
      iconColor: 'var(--color-error)',
      confirmBg: 'var(--color-error)',
      confirmHoverBg: '#dc2626',
    },
    warning: {
      icon: '⚠️',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      confirmBg: '#f59e0b',
      confirmHoverBg: '#d97706',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'var(--color-primary-light)',
      iconColor: 'var(--color-primary)',
      confirmBg: 'var(--color-primary)',
      confirmHoverBg: 'var(--color-primary-dark)',
    },
  };

  const colors = variantColors[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9999,
          width: '90%',
          maxWidth: '450px',
          padding: 'var(--spacing-xl)',
          animation: 'slideIn 0.3s ease',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-lg)',
            fontSize: '24px',
          }}
        >
          {colors.icon}
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-dialog-message"
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          {message}
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-xl)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-xl)',
              fontSize: 'var(--font-size-base)',
              backgroundColor: colors.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmBg;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}
