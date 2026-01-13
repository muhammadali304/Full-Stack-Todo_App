# Todo Frontend Application

A modern task management application built with Next.js 16+, TypeScript, and React 18+.

## Features

- User authentication (registration, login, logout)
- Create, read, update, and delete tasks
- Toggle task completion status
- Responsive design (320px-1920px)
- Session persistence with JWT tokens
- User isolation (users can only see their own tasks)

## Technology Stack

- **Frontend Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **UI Library**: React 18+
- **Authentication**: Better Auth with JWT tokens
- **API Communication**: Native Fetch API
- **Styling**: CSS Modules with CSS Variables

## Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:8001` (see backend README)

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
```

**Important**: The `BETTER_AUTH_SECRET` should match the `JWT_SECRET` in the backend `.env` file.

## Better Auth Configuration

This application uses Better Auth for JWT-based authentication with the backend API. The configuration is located in `src/lib/auth.ts`.

### Authentication Flow

1. **Registration**: User submits username, email, and password → Backend creates account with hashed password → User redirected to login
2. **Login**: User submits email and password → Backend validates credentials → Backend returns JWT token → Frontend stores token in localStorage
3. **Protected Requests**: Frontend includes JWT token in `Authorization: Bearer <token>` header → Backend validates token → Backend returns user-specific data
4. **Logout**: User clicks logout → Frontend clears token from localStorage → User redirected to login page

### Token Management

**Storage**: JWT tokens are stored in `localStorage` with the key `auth_token`

**Expiration**: Tokens expire after 24 hours (86400 seconds)

**Automatic Handling**:
- On page load, the `useAuth` hook checks for existing token in localStorage
- If token exists, user is automatically authenticated
- If token is expired or invalid, user is redirected to login
- On 401 responses from API, token is cleared and user is redirected to login

### Key Configuration Files

**`src/lib/auth.ts`** - Better Auth configuration:
```typescript
import { createAuth } from 'better-auth';

export const auth = createAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  endpoints: {
    signUp: '/api/auth/register',
    signIn: '/api/auth/login',
    signOut: '/api/auth/logout',
    getSession: '/api/auth/me',
  },
  storage: {
    type: 'localStorage',
    key: 'auth_token',
  },
});
```

**`src/lib/api.ts`** - API client with JWT injection:
```typescript
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    signal: AbortSignal.timeout(5000) // 5 second timeout
  });

  // Automatic 401 handling
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response.json();
}
```

**`src/hooks/useAuth.ts`** - Authentication state management:
- Manages user authentication state
- Provides `login()`, `logout()`, and `register()` functions
- Automatically loads token from localStorage on mount
- Handles token expiration and 401 responses

**`src/contexts/AuthContext.tsx`** - Global authentication context:
- Provides authentication state to all components
- Wraps the application in `layout.tsx`
- Makes `useAuth` hook available throughout the app

**`src/components/auth/AuthGuard.tsx`** - Route protection:
- Wraps protected pages (e.g., `/todos`)
- Checks if user is authenticated
- Redirects to `/login` if not authenticated
- Shows loading state while checking authentication

### Security Best Practices

✅ **Implemented**:
- JWT tokens stored in localStorage (persists across sessions)
- Automatic token expiration after 24 hours
- Automatic 401 handling with token clearing
- Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
- User isolation enforced by backend (frontend trusts backend)
- No sensitive data in error messages
- HTTPS required in production

⚠️ **Production Considerations**:
- Use HTTPS for all API communication
- Set secure `BETTER_AUTH_SECRET` (use `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- Enable CORS only for trusted origins
- Consider implementing token refresh for longer sessions
- Add rate limiting for authentication endpoints
- Monitor authentication logs for suspicious activity

### Troubleshooting Authentication

**"Invalid authentication token" error:**
- Token may be expired (24 hours) - user must re-login
- Token may be malformed - clear localStorage and re-login
- Backend JWT_SECRET may have changed - all users must re-login

**"Session expired" error:**
- Token has expired after 24 hours
- User will be automatically redirected to login
- This is expected behavior

**Token not persisting across refreshes:**
- Check that localStorage is enabled in browser
- Verify `auth_token` key exists in localStorage (DevTools → Application → Local Storage)
- Check browser console for errors

**Cannot login after registration:**
- Verify backend is running and accessible
- Check that email/password meet validation requirements
- Check browser console and network tab for errors
- Verify CORS is configured correctly in backend

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development

The application will be available at `http://localhost:3000`.

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication route group
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── todos/             # Protected todos page
│   │   ├── layout.tsx         # Root layout with AuthProvider
│   │   └── page.tsx           # Home page (redirects)
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── tasks/             # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskEditForm.tsx
│   │   └── layout/            # Layout components
│   │       └── Header.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Global authentication state
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useTasks.ts        # Task operations hook
│   ├── lib/
│   │   ├── api.ts             # API client utilities
│   │   ├── auth.ts            # Auth configuration
│   │   └── types.ts           # TypeScript types
│   └── styles/
│       └── globals.css        # Global styles
├── public/                     # Static assets
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## Usage

### 1. Register a New Account

1. Navigate to `http://localhost:3000`
2. Click "Sign up" or go to `/register`
3. Enter email, username, and password
4. Click "Create Account"
5. You'll be redirected to the login page

### 2. Login

1. Go to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to `/todos`

### 3. Manage Tasks

**Create a Task:**
- Fill in the "Create New Task" form
- Enter a title (required, max 200 characters)
- Optionally add a description (max 1000 characters)
- Click "Create Task"

**View Tasks:**
- All your tasks are displayed in the "Your Tasks" section
- Tasks are ordered by creation date (newest first)

**Toggle Completion:**
- Click the checkbox next to a task to mark it as complete/incomplete
- Completed tasks show with strikethrough text

**Edit a Task:**
- Click the "Edit" button on a task
- Modify the title or description
- Click "Save Changes" or "Cancel"

**Delete a Task:**
- Click the "Delete" button on a task
- Confirm the deletion in the dialog
- The task will be permanently removed

### 4. Logout

- Click the "Logout" button in the header
- You'll be redirected to the login page
- Your session will be cleared

## API Integration

The frontend communicates with the backend API at `http://localhost:8001`:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/tasks/` - List user's tasks
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/toggle` - Toggle completion
- `DELETE /api/tasks/{id}` - Delete task

All protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

## Security

- JWT tokens are stored in `localStorage`
- Tokens expire after 24 hours
- Automatic 401 handling (clears token and redirects to login)
- User isolation enforced by backend (users can only access their own tasks)
- Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)

## Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px - 767px)
- Tablets (768px - 1023px)
- Desktops (1024px - 1919px)
- Large desktops (1920px+)

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements for loading and error states
- Minimum 44x44px touch targets

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Troubleshooting

**Cannot connect to backend:**
- Ensure the backend is running at `http://localhost:8001`
- Check that CORS is configured correctly in the backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**Session expires immediately:**
- Check that `BETTER_AUTH_SECRET` matches backend `JWT_SECRET`
- Verify token expiration time (24 hours default)

**Tasks not loading:**
- Check browser console for errors
- Verify JWT token is present in localStorage
- Ensure backend API is accessible

## Development Workflow

1. Start the backend API server
2. Start the frontend development server (`npm run dev`)
3. Make changes to components in `src/`
4. Hot reload will update the browser automatically
5. Build for production with `npm run build`

## License

MIT
