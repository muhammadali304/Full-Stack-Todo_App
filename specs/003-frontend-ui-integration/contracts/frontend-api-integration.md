# API Integration Contract: Frontend ↔ Backend

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-11
**Backend API**: 002-auth-api-security (FastAPI)
**Frontend**: Next.js 16+ Application

## Overview

This document defines the contract between the Next.js frontend and FastAPI backend. All endpoints are RESTful and use JSON for request/response bodies. Authentication is handled via JWT tokens in the Authorization header.

## Base Configuration

**Backend Base URL**: `http://localhost:8001` (development)
**API Prefix**: `/api`
**Authentication**: JWT Bearer token in `Authorization` header
**Content-Type**: `application/json`
**Timeout**: 5 seconds (per spec requirement FR-007)

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/register`
**Authentication**: None (public endpoint)
**Purpose**: Create a new user account

**Request**:
```typescript
{
  email: string;      // Valid email format
  username: string;   // 3-30 characters, alphanumeric + underscore
  password: string;   // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
}
```

**Success Response** (201 Created):
```typescript
{
  id: string;         // UUID
  email: string;
  username: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input format
  ```json
  { "detail": "Invalid email format" }
  ```
- `409 Conflict`: Email or username already exists
  ```json
  { "detail": "Email already registered" }
  { "detail": "Username already taken" }
  ```
- `422 Unprocessable Entity`: Validation error
  ```json
  { "detail": "Password must contain at least one uppercase letter" }
  ```

**Frontend Implementation**:
```typescript
const response = await apiRequest<RegisterResponse>('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, username, password })
});
```

---

### 2. User Login

**Endpoint**: `POST /api/auth/login`
**Authentication**: None (public endpoint)
**Purpose**: Authenticate user and receive JWT token

**Request**:
```typescript
{
  email: string;      // User's email
  password: string;   // User's password
}
```

**Success Response** (200 OK):
```typescript
{
  access_token: string;  // JWT token
  token_type: string;    // "bearer"
  expires_in: number;    // 86400 (24 hours in seconds)
  user: {
    id: string;
    email: string;
    username: string;
    created_at: string;
    updated_at: string;
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  { "detail": "Invalid credentials" }
  ```
- `400 Bad Request`: Missing required fields
  ```json
  { "detail": "Email and password are required" }
  ```

**Frontend Implementation**:
```typescript
const response = await apiRequest<LoginResponse>('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Store token and user
localStorage.setItem('auth_token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));
```

---

### 3. Get Current User

**Endpoint**: `GET /api/auth/me`
**Authentication**: Required (JWT token)
**Purpose**: Retrieve current authenticated user's profile

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```typescript
{
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
- `401 Unauthorized`: Missing, invalid, or expired token
  ```json
  { "detail": "Invalid or expired authentication token" }
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
const user = await apiRequest<User>('/api/auth/me', {
  method: 'GET'
});
```

---

### 4. User Logout

**Endpoint**: `POST /api/auth/logout`
**Authentication**: Required (JWT token)
**Purpose**: Log out current user (security logging only, token invalidation is client-side)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```typescript
{
  message: string;  // "Successfully logged out"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
await apiRequest<LogoutResponse>('/api/auth/logout', {
  method: 'POST'
});

// Clear local storage
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
```

---

## Task Management Endpoints

All task endpoints require authentication via JWT token in Authorization header.

### 5. List User's Tasks

**Endpoint**: `GET /api/tasks/`
**Authentication**: Required (JWT token)
**Purpose**: Retrieve all tasks belonging to authenticated user

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```typescript
[
  {
    id: string;
    user_id: string;
    title: string;
    description: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  },
  // ... more tasks
]
```

**Notes**:
- Tasks are ordered by `created_at DESC` (newest first)
- Empty array returned if user has no tasks
- Only returns tasks belonging to authenticated user

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Invalid or expired authentication token" }
  ```

**Frontend Implementation**:
```typescript
const tasks = await apiRequest<Task[]>('/api/tasks/', {
  method: 'GET'
});
```

---

### 6. Create Task

**Endpoint**: `POST /api/tasks/`
**Authentication**: Required (JWT token)
**Purpose**: Create a new task for authenticated user

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  title: string;        // Required, 1-200 characters
  description?: string; // Optional, max 1000 characters
}
```

**Success Response** (201 Created):
```typescript
{
  id: string;
  user_id: string;      // Automatically set from JWT token
  title: string;
  description: string;
  completed: boolean;   // Always false for new tasks
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
  ```json
  { "detail": "Title is required" }
  { "detail": "Title must not exceed 200 characters" }
  ```
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
const task = await apiRequest<Task>('/api/tasks/', {
  method: 'POST',
  body: JSON.stringify({ title, description })
});
```

---

### 7. Get Single Task

**Endpoint**: `GET /api/tasks/{task_id}`
**Authentication**: Required (JWT token)
**Purpose**: Retrieve a specific task (only if it belongs to authenticated user)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```typescript
{
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
- `404 Not Found`: Task doesn't exist or doesn't belong to user
  ```json
  { "detail": "Task not found" }
  ```
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
const task = await apiRequest<Task>(`/api/tasks/${taskId}`, {
  method: 'GET'
});
```

---

### 8. Update Task

**Endpoint**: `PUT /api/tasks/{task_id}`
**Authentication**: Required (JWT token)
**Purpose**: Update an existing task (only if it belongs to authenticated user)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  title?: string;       // Optional, 1-200 characters
  description?: string; // Optional, max 1000 characters
  completed?: boolean;  // Optional
}
```

**Notes**:
- At least one field must be provided
- Only provided fields are updated
- `user_id` cannot be changed

**Success Response** (200 OK):
```typescript
{
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;  // Updated timestamp
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
  ```json
  { "detail": "Title must not exceed 200 characters" }
  ```
- `404 Not Found`: Task doesn't exist or doesn't belong to user
  ```json
  { "detail": "Task not found" }
  ```
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
const task = await apiRequest<Task>(`/api/tasks/${taskId}`, {
  method: 'PUT',
  body: JSON.stringify({ title, description, completed })
});
```

---

### 9. Toggle Task Completion

**Endpoint**: `PATCH /api/tasks/{task_id}/toggle`
**Authentication**: Required (JWT token)
**Purpose**: Toggle task completion status (completed ↔ incomplete)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):
```typescript
{
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;   // Toggled value
  created_at: string;
  updated_at: string;   // Updated timestamp
}
```

**Error Responses**:
- `404 Not Found`: Task doesn't exist or doesn't belong to user
  ```json
  { "detail": "Task not found" }
  ```
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
const task = await apiRequest<Task>(`/api/tasks/${taskId}/toggle`, {
  method: 'PATCH'
});
```

---

### 10. Delete Task

**Endpoint**: `DELETE /api/tasks/{task_id}`
**Authentication**: Required (JWT token)
**Purpose**: Permanently delete a task (only if it belongs to authenticated user)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (204 No Content):
```
(empty response body)
```

**Error Responses**:
- `404 Not Found`: Task doesn't exist or doesn't belong to user
  ```json
  { "detail": "Task not found" }
  ```
- `401 Unauthorized`: Missing or invalid token
  ```json
  { "detail": "Authentication required" }
  ```

**Frontend Implementation**:
```typescript
await apiRequest<void>(`/api/tasks/${taskId}`, {
  method: 'DELETE'
});
```

---

## Error Handling Contract

### Standard Error Response Format

All error responses follow this format:

```typescript
{
  detail: string;  // Human-readable error message
}
```

### HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|----------------|
| 200 | OK | Process response data |
| 201 | Created | Process created resource |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Display validation error to user |
| 401 | Unauthorized | Clear token, redirect to login |
| 404 | Not Found | Display "not found" message |
| 409 | Conflict | Display conflict error (duplicate email/username) |
| 422 | Unprocessable Entity | Display validation errors |
| 500 | Internal Server Error | Display generic error, log to console |

### Frontend Error Handling Strategy

```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    // Handle 401 - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new Error(data.detail || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}
```

---

## Authentication Flow

### Initial Authentication

```
1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. Receive LoginResponse with access_token
   ↓
4. Store token in localStorage
   ↓
5. Store user in localStorage
   ↓
6. Redirect to /todos
```

### Authenticated Requests

```
1. User performs action (e.g., create task)
   ↓
2. Retrieve token from localStorage
   ↓
3. Include token in Authorization header
   ↓
4. POST /api/tasks/ with Authorization: Bearer <token>
   ↓
5. Backend validates token and extracts user_id
   ↓
6. Backend processes request with user context
   ↓
7. Return response
```

### Token Expiration Handling

```
1. User makes authenticated request
   ↓
2. Backend validates token
   ↓
3. Token is expired
   ↓
4. Backend returns 401 Unauthorized
   ↓
5. Frontend detects 401
   ↓
6. Clear localStorage (token + user)
   ↓
7. Redirect to /login
   ↓
8. Display "Session expired, please login again"
```

---

## CORS Configuration

**Backend CORS Settings** (already configured in 002-auth-api-security):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Frontend Requirements**:
- No special CORS handling needed
- Credentials are sent via Authorization header (not cookies)
- All requests use standard HTTP methods (GET, POST, PUT, PATCH, DELETE)

---

## Security Requirements

### Token Management

1. **Storage**: Store JWT token in localStorage with key `auth_token`
2. **Transmission**: Always include token in `Authorization: Bearer <token>` header
3. **Expiration**: Handle 401 responses by clearing token and redirecting to login
4. **Logout**: Clear token from localStorage on logout

### Request Security

1. **HTTPS**: Use HTTPS in production (HTTP allowed in development)
2. **Content-Type**: Always set `Content-Type: application/json` for POST/PUT/PATCH
3. **Timeout**: Set 5-second timeout for all requests
4. **Error Handling**: Never expose sensitive information in error messages

### User Isolation

1. **Backend Enforcement**: Backend filters all queries by authenticated user_id
2. **Frontend Trust**: Frontend trusts backend to enforce isolation
3. **No Client Filtering**: Frontend does not need to filter tasks by user_id
4. **Display Only**: Frontend displays only data returned by backend

---

## Testing Contract

### Authentication Tests

- [ ] Register with valid credentials → 201 Created
- [ ] Register with duplicate email → 409 Conflict
- [ ] Register with weak password → 422 Unprocessable Entity
- [ ] Login with valid credentials → 200 OK with token
- [ ] Login with invalid credentials → 401 Unauthorized
- [ ] Access /api/auth/me with valid token → 200 OK
- [ ] Access /api/auth/me with invalid token → 401 Unauthorized
- [ ] Logout with valid token → 200 OK

### Task Management Tests

- [ ] List tasks with valid token → 200 OK with array
- [ ] Create task with valid token → 201 Created
- [ ] Create task without title → 400 Bad Request
- [ ] Get task that belongs to user → 200 OK
- [ ] Get task that doesn't belong to user → 404 Not Found
- [ ] Update task with valid data → 200 OK
- [ ] Toggle task completion → 200 OK with toggled status
- [ ] Delete task → 204 No Content
- [ ] Access any task endpoint without token → 401 Unauthorized

### User Isolation Tests

- [ ] User A creates task → User B cannot see it
- [ ] User A cannot access User B's task by ID
- [ ] User A cannot update User B's task
- [ ] User A cannot delete User B's task

---

## Contract Checklist

- [x] All endpoints documented with request/response formats
- [x] Authentication requirements specified for each endpoint
- [x] Error responses documented with status codes
- [x] Frontend implementation examples provided
- [x] Error handling strategy defined
- [x] Authentication flow documented
- [x] CORS configuration documented
- [x] Security requirements specified
- [x] Testing contract defined

**Status**: ✅ API contract complete - Frontend and backend integration contract established
