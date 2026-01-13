# Data Model: Frontend UI & End-to-End Integration

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-11
**Status**: Phase 1 Complete

## Overview

This document defines the TypeScript types and interfaces used in the frontend application. These models correspond to the backend API responses and ensure type safety throughout the application.

## Core Entities

### User

Represents an authenticated user in the system.

```typescript
interface User {
  id: string;              // UUID
  email: string;           // User's email address
  username: string;        // User's display name
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

**Source**: Backend User model (backend/src/models/user.py)

**Usage**:
- Stored in authentication context after login
- Displayed in user profile/header
- Used for user identification throughout the app

**Validation Rules**:
- `email`: Valid email format, unique across system
- `username`: 3-30 characters, alphanumeric + underscore, unique
- All fields required (no nulls)

---

### Task

Represents a todo item belonging to a user.

```typescript
interface Task {
  id: string;              // UUID
  user_id: string;         // UUID - owner of the task
  title: string;           // Task title (required)
  description: string;     // Task description (optional, can be empty string)
  completed: boolean;      // Completion status
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

**Source**: Backend Task model (backend/src/models/task.py)

**Usage**:
- Displayed in task list
- Edited in task forms
- Filtered by authenticated user (backend enforces)

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Boolean, defaults to false
- `user_id`: Automatically set from JWT token (backend)

**State Transitions**:
```
[New Task] --create--> [Incomplete Task]
[Incomplete Task] --toggle--> [Complete Task]
[Complete Task] --toggle--> [Incomplete Task]
[Any State] --update--> [Same State with new data]
[Any State] --delete--> [Deleted]
```

---

## Authentication Models

### RegisterRequest

Request payload for user registration.

```typescript
interface RegisterRequest {
  email: string;           // Valid email format
  username: string;        // 3-30 characters
  password: string;        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
}
```

**Validation Rules** (Client-side):
- `email`: HTML5 email validation + format check
- `username`: 3-30 characters, alphanumeric + underscore
- `password`: Min 8 chars, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

**Backend Validation**: Backend performs additional validation and checks for duplicates

---

### RegisterResponse

Response from successful registration.

```typescript
interface RegisterResponse {
  id: string;              // UUID of created user
  email: string;           // Registered email
  username: string;        // Registered username
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

**Usage**: Display success message, redirect to login

---

### LoginRequest

Request payload for user login.

```typescript
interface LoginRequest {
  email: string;           // User's email
  password: string;        // User's password
}
```

**Validation Rules** (Client-side):
- `email`: Required, valid email format
- `password`: Required, non-empty

---

### LoginResponse

Response from successful login.

```typescript
interface LoginResponse {
  access_token: string;    // JWT token
  token_type: string;      // Always "bearer"
  expires_in: number;      // Token expiry in seconds (86400 = 24 hours)
  user: User;              // User profile data
}
```

**Usage**:
- Store `access_token` in localStorage
- Store `user` in authentication context
- Use `access_token` in Authorization header for all API calls

---

### LogoutResponse

Response from logout endpoint.

```typescript
interface LogoutResponse {
  message: string;         // Success message
}
```

**Usage**: Display confirmation, clear local storage, redirect to login

---

## Task Operation Models

### CreateTaskRequest

Request payload for creating a new task.

```typescript
interface CreateTaskRequest {
  title: string;           // Required, 1-200 characters
  description?: string;    // Optional, max 1000 characters
}
```

**Note**: `user_id` is automatically set from JWT token by backend

**Validation Rules** (Client-side):
- `title`: Required, non-empty, max 200 characters
- `description`: Optional, max 1000 characters

---

### UpdateTaskRequest

Request payload for updating an existing task.

```typescript
interface UpdateTaskRequest {
  title?: string;          // Optional, 1-200 characters
  description?: string;    // Optional, max 1000 characters
  completed?: boolean;     // Optional
}
```

**Note**: At least one field must be provided

**Validation Rules** (Client-side):
- `title`: If provided, non-empty, max 200 characters
- `description`: If provided, max 1000 characters
- `completed`: If provided, boolean

---

### TaskListResponse

Response from GET /api/tasks/ endpoint.

```typescript
type TaskListResponse = Task[];
```

**Usage**: Display in task list, ordered by created_at DESC (newest first)

---

## Form State Models

### FormState

Generic form state for handling loading, errors, and validation.

```typescript
interface FormState<T> {
  values: T;               // Form field values
  errors: Partial<Record<keyof T, string>>;  // Validation errors
  touched: Partial<Record<keyof T, boolean>>; // Fields that have been touched
  isSubmitting: boolean;   // Submission in progress
  isValid: boolean;        // All validations pass
}
```

**Usage**: Manage form state for registration, login, task creation, task editing

**Example**:
```typescript
const [formState, setFormState] = useState<FormState<LoginRequest>>({
  values: { email: '', password: '' },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: false
});
```

---

## API Error Models

### APIError

Standard error response from backend.

```typescript
interface APIError {
  detail: string;          // Error message
  status_code?: number;    // HTTP status code
}
```

**Common Error Responses**:
- `400 Bad Request`: Validation error, malformed request
- `401 Unauthorized`: Missing/invalid/expired token
- `404 Not Found`: Resource not found or user doesn't own it
- `409 Conflict`: Duplicate email/username during registration
- `500 Internal Server Error`: Server error

**Usage**: Display error message to user, handle specific status codes

---

## Authentication Context Model

### AuthContextValue

Context value for authentication state management.

```typescript
interface AuthContextValue {
  user: User | null;       // Current authenticated user
  token: string | null;    // JWT access token
  loading: boolean;        // Auth state loading
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  isAuthenticated: boolean; // Computed: !!user && !!token
}
```

**Usage**: Provided by AuthContext, consumed by useAuth hook

---

## Task Context Model

### TaskContextValue

Context value for task state management (optional - can use local state instead).

```typescript
interface TaskContextValue {
  tasks: Task[];           // List of user's tasks
  loading: boolean;        // Tasks loading state
  error: string | null;    // Error message if any
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<Task>;
}
```

**Usage**: Provided by TaskContext (if implemented), consumed by useTasks hook

**Note**: Task context is optional - can use local state in components instead

---

## Type Guards

### Type guard functions for runtime type checking

```typescript
function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

function isTask(obj: any): obj is Task {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}
```

**Usage**: Validate API responses at runtime

---

## Utility Types

### API Response Wrapper

```typescript
type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: APIError;
};
```

**Usage**: Wrap API responses for consistent error handling

---

## Data Flow

### Authentication Flow

```
1. User submits login form
   → LoginRequest sent to POST /api/auth/login
   → LoginResponse received
   → Store token in localStorage
   → Store user in AuthContext
   → Redirect to /todos

2. User accesses protected page
   → AuthGuard checks token in localStorage
   → If token exists, decode and validate expiry
   → If valid, load user from localStorage
   → If invalid/expired, redirect to /login
```

### Task Operations Flow

```
1. Fetch tasks
   → GET /api/tasks/ with Authorization header
   → TaskListResponse received
   → Update tasks state
   → Render TaskList component

2. Create task
   → User submits CreateTaskRequest
   → POST /api/tasks/ with Authorization header
   → Task response received
   → Add to tasks state
   → Show success toast

3. Update task
   → User submits UpdateTaskRequest
   → PUT /api/tasks/{id} with Authorization header
   → Task response received
   → Update in tasks state
   → Show success toast

4. Toggle task
   → User clicks checkbox
   → PATCH /api/tasks/{id}/toggle with Authorization header
   → Task response received
   → Update in tasks state
   → Immediate UI feedback

5. Delete task
   → User confirms deletion
   → DELETE /api/tasks/{id} with Authorization header
   → Success response received
   → Remove from tasks state
   → Show success toast
```

---

## Validation Summary

| Field | Client Validation | Backend Validation |
|-------|------------------|-------------------|
| Email | HTML5 email type, pattern | Format, uniqueness, case-insensitive |
| Username | 3-30 chars, alphanumeric | Length, format, uniqueness |
| Password | Min 8, 1 upper, 1 lower, 1 number | Same + hashing |
| Task Title | Required, max 200 chars | Required, max length |
| Task Description | Optional, max 1000 chars | Max length |

**Note**: Client-side validation provides immediate feedback, but backend validation is authoritative.

---

## Type Safety Strategy

1. **Define all types in `lib/types.ts`**: Single source of truth
2. **Use TypeScript strict mode**: Enable all strict checks
3. **Validate API responses**: Use type guards for runtime validation
4. **No `any` types**: Use `unknown` and type guards instead
5. **Export types**: Make types available to all components

---

## Data Model Checklist

- [x] User entity defined
- [x] Task entity defined
- [x] Authentication request/response models defined
- [x] Task operation models defined
- [x] Form state models defined
- [x] API error models defined
- [x] Context value models defined
- [x] Type guards implemented
- [x] Utility types defined
- [x] Data flow documented
- [x] Validation rules documented
- [x] Type safety strategy defined

**Status**: ✅ Data model complete - Ready for contracts definition
