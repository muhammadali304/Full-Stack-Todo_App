'use client';

// Modal component - Reusable modal dialog for the application
// Can be used for forms, confirmations, or any content that needs overlay presentation

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal component
 *
 * Features:
 * - Backdrop overlay
 * - Centered content
 * - Close button (X) in top-right corner
 * - Click outside to close
 * - Keyboard support (Escape to close)
 * - Different size options
 * - Smooth animations
 * - Accessible with ARIA attributes
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={showModal} onClose={handleClose} title="Modal Title">
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Define modal sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const sizeClass = sizes[size];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
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
        aria-labelledby="modal-title"
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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideIn 0.3s ease',
        }}
        className={sizeClass}
      >
        {/* Header with title and close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="modal-title"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 600,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-lg)',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-lg)' }}>{children}</div>
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