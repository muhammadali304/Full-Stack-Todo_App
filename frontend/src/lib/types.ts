// TypeScript types and interfaces for the Todo application
// Based on data-model.md from specs/003-frontend-ui-integration/

// ============================================================================
// Core Entities
// ============================================================================

export interface User {
  id: string;              // UUID
  email: string;           // User's email address
  username: string;        // User's display name
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}

export interface Task {
  id: string;              // UUID
  user_id: string;         // UUID - owner of the task
  title: string;           // Task title (required)
  description: string;     // Task description (optional, can be empty string)
  completed: boolean;      // Completion status
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}

// ============================================================================
// Authentication Models
// ============================================================================

export interface RegisterRequest {
  email: string;           // Valid email format
  username: string;        // 3-30 characters
  password: string;        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
}

export interface RegisterResponse {
  id: string;              // UUID of created user
  email: string;           // Registered email
  username: string;        // Registered username
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}

export interface LoginRequest {
  email: string;           // User's email
  password: string;        // User's password
}

export interface LoginResponse {
  access_token: string;    // JWT token
  token_type: string;      // Always "bearer"
  expires_in: number;      // Token expiry in seconds (86400 = 24 hours)
  user: User;              // User profile data
}

export interface LogoutResponse {
  message: string;         // Success message
}

// ============================================================================
// Task Operation Models
// ============================================================================

export interface CreateTaskRequest {
  title: string;           // Required, 1-200 characters
  description?: string;    // Optional, max 1000 characters
  completed?: boolean;     // Optional, defaults to false
}

export interface UpdateTaskRequest {
  title?: string;          // Optional, 1-200 characters
  description?: string;    // Optional, max 1000 characters
  completed?: boolean;     // Optional
}

export type TaskListResponse = Task[];

// ============================================================================
// Form State Models
// ============================================================================

export interface FormState<T> {
  values: T;               // Form field values
  errors: Partial<Record<keyof T, string>>;  // Validation errors
  touched: Partial<Record<keyof T, boolean>>; // Fields that have been touched
  isSubmitting: boolean;   // Submission in progress
  isValid: boolean;        // All validations pass
}

// ============================================================================
// API Error Models
// ============================================================================

export interface APIError {
  detail: string;          // Error message
  status_code?: number;    // HTTP status code
}

// ============================================================================
// Authentication Context Model
// ============================================================================

export interface AuthContextValue {
  user: User | null;       // Current authenticated user
  token: string | null;    // JWT access token
  loading: boolean;        // Auth state loading
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  isAuthenticated: boolean; // Computed: !!user && !!token
}

// ============================================================================
// Task Context Model (Optional)
// ============================================================================

export interface TaskContextValue {
  tasks: Task[];           // List of user's tasks
  loading: boolean;        // Tasks loading state
  error: string | null;    // Error message if any
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<Task>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function isTask(obj: any): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

export type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: APIError;
};
