'use client';

// Contact Us page - Contact information and form
// Provides ways for users to get in touch

import Link from 'next/link';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section
        style={{
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          textAlign: 'center',
          backgroundColor: 'var(--color-background-secondary)',
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: 'var(--spacing-md)',
              color: 'var(--color-text)',
            }}
          >
            Get in Touch
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Have questions, feedback, or need support? We&apos;d love to hear from you.
            Fill out the form below or reach out through any of our contact channels.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-2xl)',
            }}
          >
            {/* Contact Information */}
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Contact Information
              </h2>

              {/* Email */}
              <div
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                      Email
                    </h3>
                    <a
                      href="mailto:support@todoapp.com"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      support@todoapp.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                      Phone
                    </h3>
                    <a
                      href="tel:+1234567890"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                      Office Hours
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      Mon - Fri: 9:00 AM - 6:00 PM
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      Sat - Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Send us a Message
              </h2>

              <form
                onSubmit={handleSubmit}
                style={{
                  padding: 'var(--spacing-xl)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Name */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Subject */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label
                    htmlFor="subject"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label
                    htmlFor="message"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>

                {/* Success Message */}
                {submitMessage && (
                  <div
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--color-success-light)',
                      color: 'var(--color-success)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {submitMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: 'var(--spacing-xl) var(--spacing-md)',
          backgroundColor: 'var(--color-background-secondary)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
            {/* Logo */}
            <div style={{ flex: '0 0 auto' }}>
              <img
                src="/favicon.ico"
                alt="Todo App Logo"
                width="128"
                height="128"
                style={{ verticalAlign: 'middle' }}
              />
            </div>

            {/* About */}
            <div style={{ flex: '0 0 auto' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                About Us
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                A simple and powerful task management tool.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ flex: '0 0 auto' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                Quick Links
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <a
                  href="/todos"
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  Manage Tasks
                </a>
                <a
                  href="/about"
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  About
                </a>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', textAlign: 'center', width: '100%' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              © 2026 Todo App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
