# Research: Frontend UI & End-to-End Integration

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-11
**Status**: Phase 0 Complete

## Overview

This document captures research findings and technical decisions for implementing a Next.js 16+ frontend that integrates with the secured FastAPI backend. The research focuses on authentication patterns, state management, API integration, and responsive UI design.

## Research Areas

### 1. Next.js 16+ App Router Architecture

**Decision**: Use Next.js 16+ App Router with route groups for authentication pages

**Rationale**:
- App Router is the recommended approach for Next.js 16+ (Pages Router is legacy)
- Route groups `(auth)` allow organizing authentication pages without affecting URL structure
- Server Components by default improve performance and SEO
- Client Components (`'use client'`) used only where interactivity is needed
- Built-in support for layouts, loading states, and error boundaries

**Alternatives Considered**:
- **Pages Router**: Rejected - legacy approach, not recommended for new projects
- **Flat route structure**: Rejected - harder to organize and maintain as app grows
- **Custom routing library**: Rejected - unnecessary complexity, App Router is sufficient

**Implementation Pattern**:
```
app/
├── (auth)/          # Route group - doesn't affect URL
│   ├── login/       # URL: /login
│   └── register/    # URL: /register
├── todos/           # URL: /todos (protected)
├── layout.tsx       # Root layout (navigation, providers)
└── page.tsx         # Home page (landing/redirect)
```

**Best Practices**:
- Use Server Components by default for static content
- Add `'use client'` directive only for interactive components (forms, buttons)
- Implement loading.tsx for loading states
- Implement error.tsx for error boundaries
- Use metadata API for SEO

---

### 2. Better Auth Integration for JWT Authentication

**Decision**: Use Better Auth library for frontend authentication with JWT token management

**Rationale**:
- Better Auth provides built-in JWT token handling and session management
- Simplifies token storage, refresh, and expiration handling
- Integrates well with Next.js App Router
- Reduces boilerplate code for authentication flows
- Provides TypeScript support out of the box

**Alternatives Considered**:
- **NextAuth.js**: Rejected - more complex, designed for OAuth providers, overkill for JWT-only
- **Custom JWT handling**: Rejected - reinventing the wheel, error-prone, more maintenance
- **Auth0/Clerk**: Rejected - third-party services not allowed per constitution

**Implementation Pattern**:
```typescript
// lib/auth.ts - Better Auth configuration
import { createAuth } from 'better-auth'

export const auth = createAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  endpoints: {
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
    signOut: '/api/auth/logout',
    getSession: '/api/auth/me'
  },
  storage: {
    type: 'localStorage',
    key: 'auth_token'
  },
  tokenExpiry: 24 * 60 * 60 * 1000 // 24 hours
})
```

**Best Practices**:
- Store JWT token in localStorage (as specified in backend implementation)
- Include token in Authorization header: `Bearer <token>`
- Implement automatic token expiration handling
- Clear token on logout or 401 responses
- Never expose token in URL or logs

---

### 3. React State Management for Authentication

**Decision**: Use React Context + Custom Hooks for authentication state

**Rationale**:
- Simple, built-in React solution - no external state management library needed
- Context provides global auth state (user, token, loading)
- Custom hooks (useAuth) provide clean API for components
- Sufficient for this application's complexity (no complex state interactions)
- Reduces bundle size and dependencies

**Alternatives Considered**:
- **Redux/Redux Toolkit**: Rejected - overkill for simple auth state, adds complexity
- **Zustand**: Rejected - unnecessary dependency, Context is sufficient
- **Jotai/Recoil**: Rejected - atomic state not needed for this use case
- **Component-level state**: Rejected - auth state needs to be global

**Implementation Pattern**:
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string) => {
    const response = await auth.signIn({ email, password })
    setToken(response.access_token)
    setUser(response.user)
    localStorage.setItem('auth_token', response.access_token)
  }

  const logout = async () => {
    await auth.signOut()
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  return { user, token, loading, login, logout }
}
```

**Best Practices**:
- Initialize auth state from localStorage on mount
- Provide loading state to prevent flash of unauthenticated content
- Implement automatic redirect on 401 responses
- Clear all auth state on logout
- Use TypeScript for type safety

---

### 4. API Integration Patterns

**Decision**: Use native Fetch API with custom wrapper for backend communication

**Rationale**:
- Fetch API is built into modern browsers - no external dependency
- Custom wrapper provides consistent error handling and token injection
- Simpler than axios for this use case
- Supports all required HTTP methods (GET, POST, PUT, DELETE)
- Easy to add request/response interceptors

**Alternatives Considered**:
- **Axios**: Rejected - unnecessary dependency, Fetch API is sufficient
- **React Query/SWR**: Rejected - adds complexity, not needed for simple CRUD operations
- **GraphQL**: Rejected - backend is REST API, not GraphQL

**Implementation Pattern**:
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    timeout: 5000 // 5 second timeout per spec
  })

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Authentication required')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'API request failed')
  }

  return response.json()
}
```

**Best Practices**:
- Centralize API base URL in environment variable
- Automatically inject JWT token from localStorage
- Handle 401 responses globally (redirect to login)
- Implement 5-second timeout per spec requirement
- Provide TypeScript generics for type-safe responses
- Handle network errors gracefully

---

### 5. Form Validation Strategy

**Decision**: Use HTML5 validation + custom JavaScript validation

**Rationale**:
- HTML5 validation provides immediate feedback (required, email format, min length)
- Custom validation for complex rules (password strength, username format)
- No external validation library needed (Formik, React Hook Form)
- Matches spec requirement: "Form validation will use HTML5 validation attributes plus custom JavaScript validation"
- Lightweight and performant

**Alternatives Considered**:
- **Formik**: Rejected - adds 13KB, overkill for simple forms
- **React Hook Form**: Rejected - adds complexity, HTML5 validation is sufficient
- **Yup/Zod**: Rejected - schema validation not needed, backend validates anyway

**Implementation Pattern**:
```typescript
// Client-side validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain number'
  return null
}

// HTML5 validation
<input
  type="email"
  required
  pattern="[^@]+@[^@]+\.[^@]+"
  minLength={3}
/>
```

**Best Practices**:
- Use HTML5 attributes (required, type, pattern, minLength, maxLength)
- Display validation errors inline near form fields
- Validate on blur and on submit
- Show clear, actionable error messages
- Disable submit button while validation fails

---

### 6. Responsive Design Approach

**Decision**: Use CSS Flexbox/Grid + Media Queries for responsive layout

**Rationale**:
- Native CSS solution - no UI framework dependency
- Flexbox for component-level layouts (forms, task items)
- Grid for page-level layouts (dashboard, task list)
- Media queries for breakpoints (320px mobile, 768px tablet, 1024px desktop)
- Matches spec requirement: "responsive and usable on desktop, tablet, and mobile screen sizes"

**Alternatives Considered**:
- **Tailwind CSS**: Rejected - not mentioned in spec, adds build complexity
- **Bootstrap**: Rejected - heavy framework, not needed for simple layouts
- **Material-UI/Chakra**: Rejected - component libraries add unnecessary weight
- **CSS-in-JS (styled-components)**: Rejected - adds runtime overhead

**Implementation Pattern**:
```css
/* Mobile-first approach */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .task-list {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .task-list {
    max-width: 1200px;
  }
}
```

**Best Practices**:
- Mobile-first design (base styles for 320px+)
- Use relative units (rem, em, %) instead of fixed pixels
- Test on actual devices or browser dev tools
- Ensure touch targets are at least 44x44px on mobile
- Use viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

### 7. Error Handling Strategy

**Decision**: Display errors inline for forms, toast notifications for operations

**Rationale**:
- Inline errors for form validation (immediate feedback)
- Toast notifications for API operations (create, update, delete tasks)
- Matches spec requirement: "Error messages will be displayed inline near the relevant form fields or as toast notifications"
- Simple implementation without external toast library

**Alternatives Considered**:
- **Modal dialogs**: Rejected - disruptive, blocks user interaction
- **Alert banners**: Rejected - takes up screen space, hard to dismiss
- **Console logging only**: Rejected - users won't see errors

**Implementation Pattern**:
```typescript
// Inline form errors
<input type="email" />
{errors.email && <span className="error">{errors.email}</span>}

// Toast notifications (simple implementation)
const showToast = (message: string, type: 'success' | 'error') => {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}
```

**Best Practices**:
- Show errors immediately after validation fails
- Use clear, actionable error messages (not technical jargon)
- Auto-dismiss success toasts after 3 seconds
- Keep error toasts visible until user dismisses
- Use color coding (red for errors, green for success)

---

### 8. Loading States and User Feedback

**Decision**: Use loading spinners for async operations, disable buttons during submission

**Rationale**:
- Provides immediate feedback that operation is in progress
- Prevents duplicate submissions
- Matches spec requirement: "System MUST display loading states during API operations"
- Simple implementation without animation libraries

**Alternatives Considered**:
- **Skeleton screens**: Rejected - complex to implement, not needed for simple operations
- **Progress bars**: Rejected - can't estimate progress for API calls
- **No loading state**: Rejected - poor UX, users won't know if action was received

**Implementation Pattern**:
```typescript
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  try {
    await apiRequest('/api/tasks', { method: 'POST', body: data })
  } finally {
    setLoading(false)
  }
}

<button disabled={loading}>
  {loading ? 'Creating...' : 'Create Task'}
</button>
```

**Best Practices**:
- Show loading state immediately when operation starts
- Disable interactive elements during loading
- Change button text to indicate action in progress
- Use simple spinner or text indicator
- Always clear loading state (use finally block)

---

## Technology Stack Summary

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| Framework | Next.js | 16+ | App Router, Server Components, modern React patterns |
| Language | TypeScript | 5+ | Type safety, better developer experience |
| Authentication | Better Auth | Latest | JWT handling, session management |
| HTTP Client | Fetch API | Native | Built-in, no dependencies |
| State Management | React Context | Native | Sufficient for auth state, no external library needed |
| Styling | CSS Modules | Native | Scoped styles, no runtime overhead |
| Form Validation | HTML5 + Custom | Native | Lightweight, meets spec requirements |
| Testing | Jest + RTL | Latest | Component testing, industry standard |
| E2E Testing | Playwright | Latest | Cross-browser testing, reliable |

---

## Backend API Endpoints (Already Implemented)

The frontend will integrate with these existing backend endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Task Endpoints (All require JWT authentication)
- `GET /api/tasks/` - List all tasks for authenticated user
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{task_id}` - Get specific task
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task
- `PATCH /api/tasks/{task_id}/toggle` - Toggle task completion status

All protected endpoints require `Authorization: Bearer <token>` header.

---

## Environment Configuration

### Frontend Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
BETTER_AUTH_SECRET=<same-as-backend-JWT_SECRET>
```

### Backend Environment Variables (.env) - Already Configured
```bash
JWT_SECRET=<256-bit-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
DATABASE_URL=<neon-postgresql-url>
```

---

## Security Considerations

1. **Token Storage**: Store JWT in localStorage (as specified in backend implementation)
2. **Token Transmission**: Always use HTTPS in production, include token in Authorization header
3. **Token Expiration**: Handle 401 responses by clearing token and redirecting to login
4. **XSS Prevention**: Sanitize user input, use React's built-in XSS protection
5. **CSRF Protection**: Not needed for JWT-based auth (no cookies)
6. **Input Validation**: Validate on both client and server (never trust client-side validation alone)

---

## Performance Considerations

1. **Code Splitting**: Next.js automatically code-splits by route
2. **Server Components**: Use Server Components for static content to reduce client bundle
3. **Image Optimization**: Use Next.js Image component if images are added
4. **Lazy Loading**: Lazy load components that aren't immediately visible
5. **Caching**: Leverage browser caching for static assets

---

## Accessibility Considerations

1. **Semantic HTML**: Use proper HTML elements (button, form, input, label)
2. **ARIA Labels**: Add aria-label for icon buttons and screen readers
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Manage focus for modals and dynamic content
5. **Color Contrast**: Ensure sufficient contrast for text and interactive elements

---

## Research Completion Checklist

- [x] Next.js 16+ App Router architecture researched
- [x] Better Auth integration pattern defined
- [x] React state management approach decided
- [x] API integration pattern established
- [x] Form validation strategy determined
- [x] Responsive design approach selected
- [x] Error handling strategy defined
- [x] Loading states pattern established
- [x] Technology stack finalized
- [x] Backend API endpoints documented
- [x] Environment configuration specified
- [x] Security considerations documented
- [x] Performance considerations documented
- [x] Accessibility considerations documented

**Status**: ✅ Research complete - Ready for Phase 1 (Design & Contracts)
