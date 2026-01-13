# Quickstart Guide: Frontend UI & End-to-End Integration

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-11
**Prerequisites**: Backend API (002-auth-api-security) must be running

## Overview

This guide provides step-by-step instructions for setting up and running the Next.js frontend application that integrates with the FastAPI backend. Follow these steps to get the complete full-stack application running locally.

## Prerequisites

### Required Software

- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 9+ (comes with Node.js)
- **Backend API**: Must be running on http://localhost:8001
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (last 2 versions)

### Backend Setup

Before starting the frontend, ensure the backend is running:

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already activated)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start the backend server
uvicorn src.main:app --reload --port 8001

# Verify backend is running
# Open http://localhost:8001/docs in browser
# You should see the FastAPI Swagger documentation
```

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Dependencies** (from package.json):
- next@16+
- react@18+
- react-dom@18+
- better-auth@latest
- typescript@5+
- @types/react@18+
- @types/node@20+

### Step 3: Configure Environment Variables

Create `.env.local` file in the frontend directory:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
BETTER_AUTH_SECRET=<same-as-backend-JWT_SECRET>
```

**Important**: The `BETTER_AUTH_SECRET` must match the `JWT_SECRET` in the backend's `.env` file.

To get the backend JWT_SECRET:
```bash
# From backend directory
cat .env | grep JWT_SECRET
```

### Step 4: Start Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000

**Expected Output**:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

## Verification Steps

### 1. Verify Backend Connection

Open http://localhost:3000 in your browser. The application should load without errors.

Check browser console (F12) for any connection errors. You should NOT see:
- CORS errors
- Network errors
- 404 errors for API endpoints

### 2. Test User Registration

1. Navigate to http://localhost:3000/register
2. Fill in the registration form:
   - Email: test@example.com
   - Username: testuser
   - Password: Test1234
3. Click "Register"
4. You should be redirected to the login page with a success message

**Verify in Backend**:
```bash
# Check backend logs - you should see:
INFO: 127.0.0.1:xxxxx - "POST /api/auth/register HTTP/1.1" 201 Created
```

### 3. Test User Login

1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: Test1234
3. Click "Login"
4. You should be redirected to http://localhost:3000/todos

**Verify in Browser**:
- Open DevTools → Application → Local Storage
- You should see `auth_token` with a JWT value
- You should see `user` with user profile JSON

**Verify in Backend**:
```bash
# Check backend logs - you should see:
INFO: 127.0.0.1:xxxxx - "POST /api/auth/login HTTP/1.1" 200 OK
```

### 4. Test Task Creation

1. On the todos page, find the "Create Task" form
2. Enter task details:
   - Title: "Complete project documentation"
   - Description: "Write comprehensive docs for the API"
3. Click "Create"
4. The new task should appear in the task list immediately

**Verify in Backend**:
```bash
# Check backend logs - you should see:
INFO: 127.0.0.1:xxxxx - "POST /api/tasks/ HTTP/1.1" 201 Created
```

### 5. Test Task Operations

**Toggle Completion**:
- Click the checkbox next to a task
- Task should show as completed (strikethrough or checkmark)
- Click again to mark as incomplete

**Edit Task**:
- Click "Edit" button on a task
- Modify title or description
- Click "Save"
- Changes should be reflected immediately

**Delete Task**:
- Click "Delete" button on a task
- Confirm deletion in the dialog
- Task should be removed from the list

### 6. Test User Isolation

1. Open a new incognito/private browser window
2. Register a second user (different email/username)
3. Login as the second user
4. Create some tasks
5. Verify that:
   - Second user only sees their own tasks
   - First user's tasks are not visible
   - Each user has independent task lists

### 7. Test Session Persistence

1. Login to the application
2. Create a task
3. Refresh the page (F5)
4. Verify that:
   - You remain logged in
   - Your tasks are still visible
   - No redirect to login page

### 8. Test Logout

1. Click the "Logout" button (in header/navigation)
2. Verify that:
   - You are redirected to the login page
   - Local storage is cleared (check DevTools)
   - Attempting to access /todos redirects to /login

## Common Issues and Solutions

### Issue 1: CORS Error

**Symptom**: Browser console shows CORS error when making API requests

**Solution**:
1. Verify backend CORS configuration includes frontend origin
2. Check backend logs for CORS-related errors
3. Ensure backend is running on http://localhost:8001
4. Restart backend server after CORS configuration changes

### Issue 2: 401 Unauthorized on All Requests

**Symptom**: All API requests return 401, even after login

**Solution**:
1. Check that JWT_SECRET matches between frontend and backend
2. Verify token is stored in localStorage (DevTools → Application)
3. Check that Authorization header is included in requests (DevTools → Network)
4. Verify backend JWT validation is working (check backend logs)

### Issue 3: Frontend Won't Start

**Symptom**: `npm run dev` fails with errors

**Solution**:
1. Delete `node_modules` and `.next` directories
2. Run `npm install` again
3. Check Node.js version: `node --version` (should be 18+)
4. Check for port conflicts (port 3000 already in use)

### Issue 4: Tasks Not Appearing

**Symptom**: Tasks are created but don't appear in the list

**Solution**:
1. Check browser console for JavaScript errors
2. Verify API response in Network tab (DevTools)
3. Check that user_id in task matches authenticated user
4. Refresh the page to force re-fetch

### Issue 5: Session Expires Immediately

**Symptom**: User is logged out immediately after login

**Solution**:
1. Check JWT token expiration time (should be 24 hours)
2. Verify system clock is correct (JWT uses timestamps)
3. Check backend JWT_EXPIRATION_HOURS setting
4. Look for 401 responses in Network tab

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure Overview

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── todos/          # Protected task management page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── auth/          # Auth-related components
│   │   ├── tasks/         # Task-related components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Authentication hook
│   │   └── useTasks.ts    # Task operations hook
│   └── lib/               # Utilities
│       ├── auth.ts        # Better Auth config
│       ├── api.ts         # API client
│       └── types.ts       # TypeScript types
├── public/                # Static assets
├── tests/                 # Test files
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout (security logging)

### Tasks (All require authentication)
- `GET /api/tasks/` - List user's tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/toggle` - Toggle completion
- `DELETE /api/tasks/{id}` - Delete task

## Environment Variables Reference

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001  # Backend API base URL
BETTER_AUTH_SECRET=<jwt-secret>            # Must match backend JWT_SECRET
```

### Backend (.env)
```bash
JWT_SECRET=<256-bit-secret>                # Shared secret for JWT signing
JWT_ALGORITHM=HS256                        # JWT signing algorithm
JWT_EXPIRATION_HOURS=24                    # Token expiry (24 hours)
DATABASE_URL=<neon-postgresql-url>         # Database connection string
```

## Next Steps

After completing the quickstart:

1. **Explore the UI**: Navigate through all pages and test all features
2. **Review the Code**: Examine component structure and implementation patterns
3. **Run Tests**: Execute the test suite to verify functionality
4. **Customize**: Modify styles, add features, or enhance UX
5. **Deploy**: Follow deployment guide for production deployment

## Support and Documentation

- **Specification**: See `specs/003-frontend-ui-integration/spec.md`
- **Implementation Plan**: See `specs/003-frontend-ui-integration/plan.md`
- **API Contract**: See `specs/003-frontend-ui-integration/contracts/frontend-api-integration.md`
- **Data Model**: See `specs/003-frontend-ui-integration/data-model.md`
- **Backend Docs**: See `specs/002-auth-api-security/` for backend documentation

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Backend is running on http://localhost:8001
- [ ] Backend /docs page is accessible
- [ ] Frontend is running on http://localhost:3000
- [ ] .env.local file exists with correct values
- [ ] JWT_SECRET matches between frontend and backend
- [ ] Node.js version is 18 or higher
- [ ] npm install completed without errors
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API requests
- [ ] Local storage contains auth_token after login

## Success Criteria

The quickstart is successful when:

- ✅ Frontend starts without errors
- ✅ User can register a new account
- ✅ User can login and receive JWT token
- ✅ User can create, view, update, and delete tasks
- ✅ User can toggle task completion status
- ✅ User can logout successfully
- ✅ Session persists across page refreshes
- ✅ Multiple users have isolated task lists
- ✅ All API requests complete within 5 seconds
- ✅ UI is responsive on mobile, tablet, and desktop

**Status**: ✅ Quickstart guide complete - Ready for implementation
