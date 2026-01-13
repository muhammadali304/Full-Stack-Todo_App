# Authentication Flow Diagram

**Feature**: 002-auth-api-security
**Date**: 2026-01-11

## Overview

This document describes the complete authentication flow from user registration through protected resource access, including JWT token generation, validation, and user isolation enforcement.

---

## Flow 1: User Registration

```
┌─────────┐                ┌──────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │                │   Neon   │
│         │                │ Frontend │                │ Backend  │                │   DB     │
└────┬────┘                └────┬─────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │                           │
     │ 1. Fill registration     │                           │                           │
     │    form (username,       │                           │                           │
     │    email, password)      │                           │                           │
     │─────────────────────────>│                           │                           │
     │                          │                           │                           │
     │                          │ 2. Validate input         │                           │
     │                          │    (client-side)          │                           │
     │                          │                           │                           │
     │                          │ 3. POST /api/auth/register│                           │
     │                          │    {username, email,      │                           │
     │                          │     password}             │                           │
     │                          │──────────────────────────>│                           │
     │                          │                           │                           │
     │                          │                           │ 4. Validate email format  │
     │                          │                           │    and username format    │
     │                          │                           │                           │
     │                          │                           │ 5. Check email uniqueness │
     │                          │                           │    (case-insensitive)     │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (email available)      │
     │                          │                           │                           │
     │                          │                           │ 6. Check username         │
     │                          │                           │    uniqueness             │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (username available)   │
     │                          │                           │                           │
     │                          │                           │ 7. Validate password      │
     │                          │                           │    strength (8+ chars,    │
     │                          │                           │    1 upper, 1 lower,      │
     │                          │                           │    1 number)              │
     │                          │                           │                           │
     │                          │                           │ 8. Hash password          │
     │                          │                           │    (bcrypt, 12 rounds)    │
     │                          │                           │                           │
     │                          │                           │ 9. Create user record     │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (user created)         │
     │                          │                           │                           │
     │                          │ 10. 201 Created           │                           │
     │                          │     {user: {id, email,    │                           │
     │                          │      username, created_at}│                           │
     │                          │      message: "Success"}  │                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │                           │
     │ 11. Show success message │                           │                           │
     │     and redirect to login│                           │                           │
     │<─────────────────────────│                           │                           │
     │                          │                           │                           │
```

**Error Scenarios**:
- **Duplicate Email**: Return 400 "Email already registered"
- **Duplicate Username**: Return 400 "Username already taken"
- **Weak Password**: Return 400 with specific validation errors
- **Invalid Email Format**: Return 400 "Invalid email format"
- **Invalid Username Format**: Return 400 "Username must be 3-30 characters, alphanumeric and underscores only"

---

## Flow 2: User Login & JWT Token Generation

```
┌─────────┐                ┌──────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │                │   Neon   │
│         │                │ Frontend │                │ Backend  │                │   DB     │
└────┬────┘                └────┬─────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │                           │
     │ 1. Fill login form       │                           │                           │
     │    (email, password)     │                           │                           │
     │─────────────────────────>│                           │                           │
     │                          │                           │                           │
     │                          │ 2. POST /api/auth/login   │                           │
     │                          │    {email, password}      │                           │
     │                          │──────────────────────────>│                           │
     │                          │                           │                           │
     │                          │                           │ 3. Find user by email     │
     │                          │                           │    (case-insensitive)     │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (user record)          │
     │                          │                           │                           │
     │                          │                           │ 4. Verify password        │
     │                          │                           │    bcrypt.checkpw()       │
     │                          │                           │                           │
     │                          │                           │ 5. Generate JWT token     │
     │                          │                           │    payload = {            │
     │                          │                           │      user_id: UUID,       │
     │                          │                           │      email: string,       │
     │                          │                           │      username: string,    │
     │                          │                           │      iat: timestamp,      │
     │                          │                           │      exp: iat + 24h       │
     │                          │                           │    }                      │
     │                          │                           │    Sign with JWT_SECRET   │
     │                          │                           │                           │
     │                          │                           │ 6. Log login event        │
     │                          │                           │    (timestamp, email,     │
     │                          │                           │     IP, user agent)       │
     │                          │                           │                           │
     │                          │ 7. 200 OK                 │                           │
     │                          │    {access_token: "jwt",  │                           │
     │                          │     token_type: "bearer", │                           │
     │                          │     expires_in: 86400,    │                           │
     │                          │     user: {id, email,     │                           │
     │                          │            username}}     │                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │                           │
     │                          │ 8. Store token in         │                           │
     │                          │    localStorage           │                           │
     │                          │    key: "auth_token"      │                           │
     │                          │                           │                           │
     │                          │ 9. Store user info in     │                           │
     │                          │    localStorage           │                           │
     │                          │    key: "user"            │                           │
     │                          │                           │                           │
     │ 10. Redirect to todos    │                           │                           │
     │     page                 │                           │                           │
     │<─────────────────────────│                           │                           │
     │                          │                           │                           │
```

**Error Scenarios**:
- **Invalid Credentials**: Return 401 "Invalid credentials" (don't reveal which field is wrong)
- **Missing Fields**: Return 400 "Email and password are required"
- **User Not Found**: Return 401 "Invalid credentials" (same message as wrong password)

---

## Flow 3: Accessing Protected Resources (with JWT Validation)

```
┌─────────┐                ┌──────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │                │   Neon   │
│         │                │ Frontend │                │ Backend  │                │   DB     │
└────┬────┘                └────┬─────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │                           │
     │ 1. Request todos page    │                           │                           │
     │─────────────────────────>│                           │                           │
     │                          │                           │                           │
     │                          │ 2. Check localStorage     │                           │
     │                          │    for auth_token         │                           │
     │                          │                           │                           │
     │                          │ 3. GET /api/tasks/        │                           │
     │                          │    Headers:               │                           │
     │                          │    Authorization: Bearer  │                           │
     │                          │    <jwt_token>            │                           │
     │                          │──────────────────────────>│                           │
     │                          │                           │                           │
     │                          │                           │ 4. Extract token from     │
     │                          │                           │    Authorization header   │
     │                          │                           │                           │
     │                          │                           │ 5. Verify JWT signature   │
     │                          │                           │    using JWT_SECRET       │
     │                          │                           │                           │
     │                          │                           │ 6. Check token expiration │
     │                          │                           │    (exp claim)            │
     │                          │                           │                           │
     │                          │                           │ 7. Extract user_id from   │
     │                          │                           │    token payload          │
     │                          │                           │                           │
     │                          │                           │ 8. Query tasks filtered   │
     │                          │                           │    by user_id             │
     │                          │                           │    WHERE user_id = <id>   │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (user's tasks only)    │
     │                          │                           │                           │
     │                          │ 9. 200 OK                 │                           │
     │                          │    [{task1}, {task2}, ...]│                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │                           │
     │ 10. Display tasks        │                           │                           │
     │<─────────────────────────│                           │                           │
     │                          │                           │                           │
```

**Error Scenarios**:
- **Missing Token**: Return 401 "Authentication required"
- **Invalid Token Signature**: Return 401 "Invalid authentication token"
- **Expired Token**: Return 401 "Session expired, please login again"
- **Malformed Token**: Return 401 "Invalid authentication token"

---

## Flow 4: User Isolation Enforcement (Cross-User Access Attempt)

```
┌─────────┐                ┌──────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │                │   Neon   │
│ (Alice) │                │ Frontend │                │ Backend  │                │   DB     │
└────┬────┘                └────┬─────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │                           │
     │ 1. Try to access Bob's   │                           │                           │
     │    task (malicious)      │                           │                           │
     │─────────────────────────>│                           │                           │
     │                          │                           │                           │
     │                          │ 2. GET /api/tasks/        │                           │
     │                          │    {bob_task_id}          │                           │
     │                          │    Headers:               │                           │
     │                          │    Authorization: Bearer  │                           │
     │                          │    <alice_jwt_token>      │                           │
     │                          │──────────────────────────>│                           │
     │                          │                           │                           │
     │                          │                           │ 3. Validate Alice's token │
     │                          │                           │    Extract alice_user_id  │
     │                          │                           │                           │
     │                          │                           │ 4. Query task with        │
     │                          │                           │    ownership check        │
     │                          │                           │    WHERE id = bob_task_id │
     │                          │                           │    AND user_id =          │
     │                          │                           │    alice_user_id          │
     │                          │                           │──────────────────────────>│
     │                          │                           │<──────────────────────────│
     │                          │                           │    (no results - task     │
     │                          │                           │     belongs to Bob)       │
     │                          │                           │                           │
     │                          │ 5. 404 Not Found          │                           │
     │                          │    (don't reveal task     │                           │
     │                          │     exists)               │                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │                           │
     │ 6. Show "Task not found" │                           │                           │
     │<─────────────────────────│                           │                           │
     │                          │                           │                           │
```

**Security Principle**: Always return 404 "Not found" for cross-user access attempts, never reveal that the resource exists but belongs to another user.

---

## Flow 5: Token Expiration Handling

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │
│         │                │ Frontend │                │ Backend  │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │ 1. Request with expired  │                           │
     │    token (>24 hours old) │                           │
     │─────────────────────────>│                           │
     │                          │                           │
     │                          │ 2. GET /api/tasks/        │
     │                          │    Headers:               │
     │                          │    Authorization: Bearer  │
     │                          │    <expired_jwt_token>    │
     │                          │──────────────────────────>│
     │                          │                           │
     │                          │                           │ 3. Verify token signature │
     │                          │                           │    (valid signature)      │
     │                          │                           │                           │
     │                          │                           │ 4. Check expiration       │
     │                          │                           │    exp < current_time     │
     │                          │                           │    (token expired)        │
     │                          │                           │                           │
     │                          │ 5. 401 Unauthorized       │                           │
     │                          │    {detail: "Session      │                           │
     │                          │     expired, please       │                           │
     │                          │     login again"}         │                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │
     │                          │ 6. Clear localStorage     │
     │                          │    (auth_token, user)     │
     │                          │                           │
     │                          │ 7. Redirect to login page │
     │                          │                           │
     │ 8. Show "Session expired"│                           │
     │    message               │                           │
     │<─────────────────────────│                           │
     │                          │                           │
```

---

## Flow 6: User Logout

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ FastAPI  │
│         │                │ Frontend │                │ Backend  │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │ 1. Click logout button   │                           │
     │─────────────────────────>│                           │
     │                          │                           │
     │                          │ 2. POST /api/auth/logout  │
     │                          │    Headers:               │
     │                          │    Authorization: Bearer  │
     │                          │    <jwt_token>            │
     │                          │──────────────────────────>│
     │                          │                           │
     │                          │                           │ 3. Validate token         │
     │                          │                           │    (optional - for        │
     │                          │                           │     logging purposes)     │
     │                          │                           │                           │
     │                          │                           │ 4. Log logout event       │
     │                          │                           │    (timestamp, email,     │
     │                          │                           │     IP, user agent)       │
     │                          │                           │                           │
     │                          │ 5. 200 OK                 │                           │
     │                          │    {message: "Logout      │                           │
     │                          │     successful"}          │                           │
     │                          │<──────────────────────────│                           │
     │                          │                           │
     │                          │ 6. Clear localStorage     │
     │                          │    (auth_token, user)     │
     │                          │                           │
     │                          │ 7. Redirect to login page │
     │                          │                           │
     │ 8. Show login page       │                           │
     │<─────────────────────────│                           │
     │                          │                           │
```

**Note**: For stateless JWT authentication, logout is primarily a client-side operation (clearing the token). The backend endpoint is optional but useful for logging purposes.

---

## Security Considerations

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "username": "alice_dev",
    "iat": 1736595000,
    "exp": 1736681400
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), JWT_SECRET)"
}
```

### Token Validation Checklist

1. ✅ Extract token from `Authorization: Bearer <token>` header
2. ✅ Verify token signature using `JWT_SECRET`
3. ✅ Check token expiration (`exp` claim < current time)
4. ✅ Extract `user_id` from payload
5. ✅ Use `user_id` for all database queries (never trust request body/URL)
6. ✅ Return 401 for any validation failure

### User Isolation Enforcement

1. ✅ All task queries MUST include `WHERE user_id = <authenticated_user_id>`
2. ✅ Never trust `user_id` from request body or URL parameters
3. ✅ Always extract `user_id` from validated JWT token
4. ✅ Return 404 (not 403) for cross-user access attempts
5. ✅ Log all authentication events for security monitoring

---

**Status**: ✅ Authentication flow documented and ready for implementation
**Next Step**: Create quickstart.md with setup instructions
