# Quickstart Guide: Authentication & API Security

**Feature**: 002-auth-api-security
**Date**: 2026-01-11
**Prerequisites**: Feature 001 (Backend API Foundation) must be complete

## Overview

This guide walks through setting up JWT-based authentication for the Todo application, including backend JWT validation, frontend Better Auth integration, and user isolation enforcement.

---

## Backend Setup

### Step 1: Install Dependencies

Add authentication-related packages to `backend/requirements.txt`:

```txt
# Existing dependencies from Feature 001
fastapi==0.104.1
sqlmodel==0.0.14
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.5.0
pydantic-settings==2.1.0
uvicorn[standard]==0.25.0

# NEW: Authentication dependencies
PyJWT==2.8.0
bcrypt==4.1.2
python-multipart==0.0.6
```

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Add JWT secret to `backend/.env`:

```bash
# Existing from Feature 001
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_9ga4XmceJDyT@ep-curly-term-ah63iacd-pooler.c-3.us-east-1.aws.neon.tech/neondb
APP_ENV=development
DEBUG=true

# NEW: JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-32-bytes
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**IMPORTANT**: Generate a secure JWT secret:

```bash
# Generate a secure 32-byte (256-bit) secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Create User Model

Create `backend/src/models/user.py`:

```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True, nullable=False)
    username: str = Field(min_length=3, max_length=30, unique=True, index=True, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
```

### Step 4: Update Task Model

Update `backend/src/models/task.py` to add user_id:

```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)  # NEW
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: "User" = Relationship(back_populates="tasks")  # NEW
```

### Step 5: Create Security Utilities

Create `backend/src/core/security.py`:

```python
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from .config import settings

def hash_password(password: str) -> str:
    """Hash password using bcrypt with 12 salt rounds."""
    salt = bcrypt.gensalt(rounds=12)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_hash.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(
        password.encode('utf-8'),
        password_hash.encode('utf-8')
    )

def create_access_token(user_id: UUID, email: str, username: str) -> str:
    """Generate JWT access token."""
    payload = {
        "user_id": str(user_id),
        "email": email,
        "username": username,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_access_token(token: str) -> dict:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, please login again"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
```

### Step 6: Create Authentication Dependency

Update `backend/src/api/dependencies.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ..core.database import get_db
from ..core.security import decode_access_token
from ..models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validate JWT token and return authenticated user.
    Raises 401 if token is invalid, expired, or user not found.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    user_id = UUID(payload.get("user_id"))

    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

### Step 7: Create Authentication Schemas

Create `backend/src/schemas/auth.py`:

```python
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_]+$')
    email: EmailStr
    password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: UUID
    email: str
    username: str
    created_at: datetime

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400  # 24 hours in seconds
    user: UserProfile

class RegisterResponse(BaseModel):
    user: UserProfile
    message: str = "Registration successful"
```

### Step 8: Create Authentication Routes

Create `backend/src/api/routes/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ...core.database import get_db
from ...core.security import hash_password, verify_password, create_access_token
from ...models.user import User
from ...schemas.auth import (
    RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, UserProfile
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check email uniqueness (case-insensitive)
    result = await db.execute(
        select(User).where(func.lower(User.email) == data.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check username uniqueness
    result = await db.execute(
        select(User).where(User.username == data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Hash password
    password_hash = hash_password(data.password)

    # Create user
    user = User(
        email=data.email,
        username=data.username,
        password_hash=password_hash
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return RegisterResponse(user=UserProfile.from_orm(user))

@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    # Find user by email (case-insensitive)
    result = await db.execute(
        select(User).where(func.lower(User.email) == data.email.lower())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate JWT token
    access_token = create_access_token(user.id, user.email, user.username)

    return LoginResponse(
        access_token=access_token,
        user=UserProfile.from_orm(user)
    )

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get authenticated user's profile."""
    return UserProfile.from_orm(current_user)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token clearing)."""
    return {"message": "Logout successful"}
```

### Step 9: Update Task Routes

Update `backend/src/api/routes/tasks.py` to require authentication:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from ...core.database import get_db
from ...models.task import Task
from ...models.user import User
from ...schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),  # NEW
    db: AsyncSession = Depends(get_db)
):
    """Create a new task for the authenticated user."""
    task = Task(**task_data.dict(), user_id=current_user.id)  # NEW: Set user_id from token
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    current_user: User = Depends(get_current_user),  # NEW
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks for the authenticated user."""
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id)  # NEW: Filter by user_id
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()

# Similar updates for get_task, update_task, delete_task, toggle_task
# All must include current_user dependency and filter by user_id
```

### Step 10: Run Database Migration

Create migration for users table:

```bash
cd backend
alembic revision -m "Create users table and add user_id to tasks"
```

Edit the generated migration file (see data-model.md for complete migration code), then run:

```bash
alembic upgrade head
```

### Step 11: Update Main Application

Update `backend/src/main.py` to include auth routes:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import tasks, auth  # NEW: Import auth routes

app = FastAPI(title="Todo API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router, prefix="/api")  # NEW

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Step 12: Test Backend

Start the server:

```bash
cd backend
uvicorn src.main:app --reload --port 8001
```

Test registration:

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_dev","email":"alice@example.com","password":"SecurePass123"}'
```

Test login:

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123"}'
```

Test protected endpoint:

```bash
TOKEN="<jwt_token_from_login>"
curl -X GET http://localhost:8001/api/tasks/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install better-auth
```

### Step 2: Configure Better Auth

Create `frontend/src/lib/auth.ts`:

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

### Step 3: Create Authentication Hook

Create `frontend/src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token and user from localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, login, logout };
}
```

### Step 4: Create Login Form

Create `frontend/src/components/auth/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/todos');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Step 5: Create Auth Guard

Create `frontend/src/components/layout/AuthGuard.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### Step 6: Create Login Page

Create `frontend/src/app/login/page.tsx`:

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
    </div>
  );
}
```

### Step 7: Protect Todo Routes

Update `frontend/src/app/todos/page.tsx`:

```typescript
import { AuthGuard } from '@/components/layout/AuthGuard';
import { TodoList } from '@/components/TodoList';

export default function TodosPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">My Todos</h1>
        <TodoList />
      </div>
    </AuthGuard>
  );
}
```

### Step 8: Update API Calls

Update all API calls to include the JWT token:

```typescript
const token = localStorage.getItem('auth_token');

const response = await fetch('http://localhost:8001/api/tasks/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Testing the Complete Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_dev","email":"alice@example.com","password":"SecurePass123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123"}'
```

Save the `access_token` from the response.

### 3. Create a Task

```bash
TOKEN="<your_jwt_token>"
curl -X POST http://localhost:8001/api/tasks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Testing authentication"}'
```

### 4. List Tasks

```bash
curl -X GET http://localhost:8001/api/tasks/ \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test User Isolation

Register a second user and try to access the first user's tasks - should return empty array.

---

## Troubleshooting

### Issue: "Invalid authentication token"

**Solution**: Check that:
- JWT_SECRET in backend `.env` matches the secret used to sign tokens
- Token is being sent in `Authorization: Bearer <token>` header
- Token hasn't expired (24 hours)

### Issue: "Email already registered"

**Solution**: Email uniqueness is case-insensitive. `alice@example.com` and `ALICE@example.com` are considered the same.

### Issue: CORS errors

**Solution**: Ensure backend CORS middleware allows frontend origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Session expired" errors

**Solution**: Token expires after 24 hours. User must login again. Frontend should handle 401 responses by redirecting to login page.

---

## Next Steps

1. Run `/sp.tasks` to generate task breakdown
2. Use `auth-security` agent to implement backend authentication
3. Use `neon-db-architect` agent to create user table migration
4. Use `fastapi-backend-dev` agent to create auth endpoints
5. Use `nextjs-ui` agent to create frontend auth components
6. Test complete authentication flow end-to-end

---

**Status**: ✅ Quickstart guide complete
**Ready for**: Task breakdown (`/sp.tasks` command)
