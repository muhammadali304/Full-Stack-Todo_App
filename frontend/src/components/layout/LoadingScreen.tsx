'use client';

// LoadingScreen component - Animated loading screen with TODO APP branding
// Shows animated text and logo while content is loading

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

/**
 * LoadingScreen component
 *
 * Features:
 * - Animated "TODO APP" text with smooth fade and scale
 * - Animated checkmark logo with professional timing
 * - Smooth fade-out transition when loading completes
 * - Full-screen overlay
 * - Optimized to prevent hydration warnings
 *
 * Usage:
 * ```tsx
 * <LoadingScreen isLoading={loading} />
 * ```
 */
export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // Delay unmounting to allow fade-out animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Animated Logo Container */}
      <div
        style={{
          marginBottom: 'var(--spacing-2xl)',
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Circular Logo with Checkmark */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            position: 'relative',
          }}
        >
          {/* Checkmark SVG */}
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: isVisible ? 0 : 50,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
            }}
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Animated Text */}
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 'var(--spacing-lg)',
          letterSpacing: '0.1em',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
        }}
      >
        TODO APP
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          marginBottom: 'var(--spacing-2xl)',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        }}
      >
        Organize your tasks efficiently
      </p>

      {/* Loading Dots */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              animation: isVisible ? `bounce 1.4s ease-in-out ${i * 0.16}s infinite` : 'none',
            }}
          />
        ))}
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-12px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
