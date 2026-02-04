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
// Chat-Specific Types (for AI Agent Integration)
// ============================================================================

// ToolCall Object - Represents a tool call made by the AI agent
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: any;
  displayType: 'inline' | 'card' | 'expanded';
}

// ToolCallResult Object - Represents the result of a tool call
export interface ToolCallResult {
  toolCallId: string;
  success: boolean;
  data?: any;
  error?: string;
}

// ChatMessage Entity - Represents a single message in the UI
export interface ChatMessageBase {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string; // ISO 8601 string format
  status: 'sending' | 'streaming' | 'completed' | 'error';
  toolCalls?: ToolCall[];
  toolCallResults?: ToolCallResult[];
  isStreaming?: boolean;
  streamingError?: string;
}

export interface ChatMessage extends ChatMessageBase {
  id: string; // UUID
}

export interface ChatMessageCreate extends ChatMessageBase {
  // Properties needed when creating a new message
}

export interface ChatMessageUpdate {
  content?: string;
  status?: 'sending' | 'streaming' | 'completed' | 'error';
  toolCallResults?: ToolCallResult[];
}

// Conversation Entity - Represents a user's chat session
export interface ConversationBase {
  userId: string; // Foreign key to User
  title: string;
  createdAt: string; // ISO 8601 string format
  updatedAt: string; // ISO 8601 string format
  expiresAt: string; // ISO 8601 string format - 30-day retention
  isActive: boolean;
}

export interface Conversation extends ConversationBase {
  id: string; // UUID
  messageCount: number;
}

export interface ConversationCreate {
  userId: string;
  title?: string; // Auto-generated if not provided
}

export interface ConversationUpdate {
  title?: string;
}

// StreamChunk Model - Represents a single chunk of data received from SSE
export interface StreamChunk {
  type: 'message' | 'tool_call' | 'tool_result' | 'error';
  data: any;
  timestamp: string; // ISO 8601 string format
  correlationId: string;
}

// API Request/Response Types for Chat
export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string; // Optional - if continuing existing conversation
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  toolCalls?: ToolCall[];
  toolCallResults?: ToolCallResult[];
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
