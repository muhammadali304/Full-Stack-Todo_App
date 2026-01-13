# Backend API - Todo Application

RESTful backend API for todo task management with FastAPI, SQLModel, and Neon PostgreSQL. Includes JWT-based authentication, user isolation, and secure password hashing.

## Quick Start

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Neon PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require
APP_ENV=development
DEBUG=true

# Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-32-bytes
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**IMPORTANT**: Generate a secure JWT secret:

```bash
# Generate a secure 32-byte (256-bit) secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as your `JWT_SECRET` value. Never commit this secret to version control.

### 3. Initialize Database

```bash
# Create initial migration for tasks table
alembic revision --autogenerate -m "Create tasks table"

# Create migration for users table and authentication
alembic revision --autogenerate -m "Create users table and add user_id to tasks"

# Apply all migrations
alembic upgrade head
```

**Note**: The database migrations include:
- Tasks table with user_id foreign key
- Users table with email, username, password_hash
- Indexes for email and username uniqueness
- Cascade delete for user tasks

### 4. Run Server

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication Endpoints (Public)

- `POST /api/auth/register` - Register new user with username, email, password
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user profile (requires authentication)
- `POST /api/auth/logout` - Logout (client-side token clearing)

### Task Endpoints (Protected - Requires JWT Token)

- `POST /api/tasks` - Create new task for authenticated user
- `GET /api/tasks` - List all tasks for authenticated user (newest first)
- `GET /api/tasks/{id}` - Get specific task (user's own tasks only)
- `PUT /api/tasks/{id}` - Update task (user's own tasks only)
- `DELETE /api/tasks/{id}` - Delete task (user's own tasks only)
- `PATCH /api/tasks/{id}/toggle` - Toggle completion status (user's own tasks only)

**Note**: All task endpoints enforce user isolation - users can only access their own tasks.

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel database models
│   │   ├── user.py      # User model with authentication
│   │   └── task.py      # Task model with user_id
│   ├── api/
│   │   ├── routes/      # API endpoint routes
│   │   │   ├── auth.py  # Authentication endpoints
│   │   │   └── tasks.py # Task endpoints (protected)
│   │   └── dependencies.py  # get_current_user dependency
│   ├── core/            # Configuration and utilities
│   │   ├── config.py    # Settings with JWT config
│   │   ├── database.py  # Database connection
│   │   └── security.py  # Password hashing, JWT utilities
│   ├── schemas/         # Pydantic request/response schemas
│   │   ├── auth.py      # Auth schemas (register, login)
│   │   └── task.py      # Task schemas
│   └── main.py          # FastAPI application entry point
├── tests/               # Pytest test files
├── alembic/             # Database migrations
│   └── versions/        # Migration files
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (not in git)
```

## Development

### Authentication Usage Examples

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_dev","email":"alice@example.com","password":"SecurePass123"}'
```

**Login and get JWT token:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123"}'
```

Response includes `access_token` - save this for authenticated requests.

**Access protected endpoints:**
```bash
# Set your token
TOKEN="your_jwt_token_here"

# Create a task (requires authentication)
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","description":"Testing authentication"}'

# List your tasks (requires authentication)
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Get current user profile
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Important Security Notes:**
- All task endpoints require a valid JWT token in the `Authorization: Bearer <token>` header
- Users can only access their own tasks (user isolation enforced)
- Tokens expire after 24 hours - users must re-login
- Passwords are hashed with bcrypt (12 rounds) before storage
- Never commit JWT_SECRET to version control

See [quickstart.md](../specs/002-auth-api-security/quickstart.md) for detailed authentication setup and testing guide.

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_task_api.py
```

## Technology Stack

- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.14+
- **Database**: Neon Serverless PostgreSQL
- **Validation**: Pydantic 2.0+
- **Authentication**: JWT (PyJWT 2.8+)
- **Password Hashing**: bcrypt 4.1+
- **Testing**: pytest with pytest-asyncio
- **Migrations**: Alembic 1.13+

### Key Dependencies

```txt
fastapi==0.104.1          # Web framework
sqlmodel==0.0.14          # ORM with Pydantic integration
asyncpg==0.29.0           # PostgreSQL async driver
alembic==1.13.1           # Database migrations
pydantic==2.5.0           # Data validation
pydantic-settings==2.1.0  # Settings management
uvicorn[standard]==0.25.0 # ASGI server
PyJWT==2.8.0              # JWT token generation/validation
bcrypt==4.1.2             # Password hashing
python-multipart==0.0.6   # Form data parsing
```
