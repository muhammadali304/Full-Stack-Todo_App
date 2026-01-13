---
name: auth-skill
description: Build secure authentication systems with signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Auth Skill – Authentication System

## Instructions

1. **Core Features**
   - User Signup
   - User Signin
   - Password Hashing
   - JWT Token Handling
   - Protected Routes

2. **Security Setup**
   - Never store plain text passwords
   - Always hash before saving
   - Use environment variables for secrets
   - Enforce strong password rules

3. **Authentication Flow**
   - Signup → Validate → Hash → Store
   - Signin → Verify → Token Issue
   - Request → Token Check → Access

---

## Modules

### Signup
- Collect user credentials
- Validate input data
- Prevent duplicate accounts
- Save hashed password

### Signin
- Verify user identity
- Handle wrong credentials safely
- Generate access tokens
- Support session management

### Password Hashing
- Use secure hashing algorithms
- Apply salting
- Configure hash strength
- Protect against brute-force

### JWT Tokens
- Issue tokens on login
- Set expiry duration
- Refresh tokens securely
- Revoke compromised tokens

### Better Auth Integration
- Connect with Better Auth system
- Sync users and sessions
- Use built-in security layers
- Customize auth strategies

---

## Best Practices
- Always use HTTPS
- Keep secrets hidden
- Limit login attempts
- Log suspicious activity
- Validate all inputs
- Keep dependencies updated

---

## Skill Outcome

After completing this skill, you will be able to:

- Build full authentication systems
- Secure user data
- Implement token-based security
- Integrate Better Auth effectively
- Follow industry security standards
