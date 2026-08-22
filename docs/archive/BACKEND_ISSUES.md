# Backend Issues - Authentication

## Critical Issue: Register Endpoint Not Working

### Problem

The `/api/auth/register` endpoint is returning a 400 error with message "next is not a function". This prevents creating any users, including the super admin.

### Error Details

**Request**:
```bash
curl -X POST 'http://localhost:5000/api/auth/register' \
  -H 'Content-Type: application/json' \
  --data-raw '{"name":"Super Admin","email":"admin@bhavingarara.com","password":"Admin@123","role":"superadmin"}'
```

**Response**:
```json
{
  "status": "error",
  "message": "next is not a function"
}
```

### Root Cause

The error "next is not a function" typically indicates:
1. Missing `next` parameter in middleware function
2. Incorrect middleware signature (e.g., `(req, res) =>` instead of `(req, res, next) =>`)
3. Calling `next()` when `next` is undefined
4. Middleware chain issue in Express.js

### Expected Behavior

**Successful Registration Response**:
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id_here",
      "name": "Super Admin",
      "email": "admin@bhavingarara.com",
      "role": "superadmin",
      "avatar": null,
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-02-04T11:30:00.000Z",
      "updatedAt": "2026-02-04T11:30:00.000Z"
    }
  }
}
```

---

## How to Fix (Backend Team)

### Step 1: Check Middleware Signature

Look for middleware in the `/api/auth/register` route that might have incorrect signature:

**WRONG**:
```javascript
// Missing 'next' parameter
app.use((req, res) => {
  // ... do something
  next(); // Error: next is not a function!
});
```

**CORRECT**:
```javascript
// Include 'next' parameter
app.use((req, res, next) => {
  // ... do something
  next(); // Works correctly
});
```

### Step 2: Check Route Handler

Verify the register route handler in your auth routes file:

**Example Fix**:
```javascript
// routes/auth.routes.js or similar
router.post('/register',
  validateRegisterInput,  // Make sure this middleware has (req, res, next)
  authController.register  // Make sure this is defined
);
```

### Step 3: Check Validation Middleware

If using validation middleware (like express-validator):

**WRONG**:
```javascript
const validateRegisterInput = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  // Missing validation result check!
];
```

**CORRECT**:
```javascript
const validateRegisterInput = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next(); // Don't forget this!
  }
];
```

### Step 4: Check Error Handling

Make sure error handling middleware is properly set up:

```javascript
// Error handling middleware (should be AFTER all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});
```

---

## Temporary Workaround

Since the register endpoint is broken, you can manually create a user directly in the database:

### MongoDB Example:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Super Admin",
  email: "admin@bhavingarara.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "Admin@123"
  role: "superadmin",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Generate Password Hash:

```javascript
// In Node.js console or separate script
const bcrypt = require('bcrypt');
const password = 'Admin@123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  console.log('Hashed password:', hash);
  // Use this hash in the database
});
```

Or use online bcrypt generator: https://bcrypt-generator.com/
- Input: `Admin@123`
- Rounds: 10
- Copy the generated hash

---

## Testing the Fix

After backend team fixes the register endpoint:

### Test 1: Register New User

```bash
curl -X POST 'http://localhost:5000/api/auth/register' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Expected**: Status 200/201 with token and user data

### Test 2: Register Super Admin

```bash
curl -X POST 'http://localhost:5000/api/auth/register' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "name": "Super Admin",
    "email": "admin@bhavingarara.com",
    "password": "Admin@123",
    "role": "superadmin"
  }'
```

**Expected**: Status 200/201 with token and user data, role = "superadmin"

### Test 3: Login with New User

```bash
curl -X POST 'http://localhost:5000/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "email": "admin@bhavingarara.com",
    "password": "Admin@123"
  }'
```

**Expected**: Status 200 with token and user data

### Test 4: Use Frontend Script

```bash
npm run create-admin
```

**Expected**: Success message with admin credentials

---

## Current Status

- ✅ Login endpoint works correctly (returns proper 401 for invalid credentials)
- ✅ Health check endpoint works
- ❌ Register endpoint broken ("next is not a function")
- ⏳ Cannot create admin user until register is fixed

---

## Frontend Changes Already Made

The frontend has been updated to handle 401 errors correctly:

1. **Auth Service** (`src/services/auth.service.ts`):
   - Fixed response interceptor to NOT redirect on login 401
   - Only redirects on 401 for authenticated requests (expired tokens)
   - Properly distinguishes between login failures and auth expiration

2. **Sign-In Component** (`src/features/auth/components/sign-in-view.tsx`):
   - Properly displays error messages from backend
   - Shows loading states
   - Handles all error cases with toast notifications

---

## Next Steps

1. **Backend Team**: Fix the `/api/auth/register` endpoint
2. **Frontend Team**: Once fixed, run `npm run create-admin` to create super admin
3. **Test**: Login with `admin@bhavingarara.com` / `Admin@123`
4. **Verify**: User data displays correctly in dashboard

---

## Contact

If backend team needs more information:
- Check backend server logs for full error stack trace
- Look for middleware files in backend codebase
- Review auth route definitions
- Check validation middleware implementation

---

**Date**: 2026-02-04
**Status**: ⚠️ **Blocked - Waiting for Backend Fix**
**Blocking Issue**: Register endpoint returns "next is not a function"
