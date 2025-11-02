# Backend Authentication Setup Guide

## Problem
The authentication endpoints are returning **401 Unauthorized** errors. This is because your Medusa v2 backend on Railway needs the authentication module configured.

## Quick Fix - Frontend Changes ✅
I've updated the frontend to use simpler Medusa v2 endpoints that work without additional auth modules:

**NEW Endpoints (No Auth Module Required):**
- Register: `POST /store/customers` - Creates customer directly
- Login: `POST /store/auth` - Session-based authentication
- Get Customer: `GET /store/customers/me` - Retrieves logged-in customer

These should work with your Railway backend without any backend changes!

---

## Backend Setup (If Needed)

### Option A: Enable Email/Password Auth Module (Recommended for Production)

1. **Install Auth Module** (on your Railway backend):
   ```bash
   npm install @medusajs/auth-emailpass
   ```

2. **Add to `medusa-config.js`**:
   ```javascript
   module.exports = {
     projectConfig: {
       // ... existing config
     },
     modules: {
       // Add authentication module
       auth: {
         resolve: "@medusajs/auth-emailpass",
         options: {
           // Optional: Configure JWT secret
           jwt_secret: process.env.JWT_SECRET || "your-secret-key-here",
         },
       },
     },
   };
   ```

3. **Set Environment Variable** (in Railway dashboard):
   ```
   JWT_SECRET=your-random-secret-key-at-least-32-characters-long
   ```

4. **Redeploy** your Railway backend

5. **Update Frontend** (if using auth module endpoints):
   ```typescript
   // Use these endpoints instead:
   POST /auth/customer/emailpass/register  // Register
   POST /auth/customer/emailpass           // Login
   GET /store/customers/me                 // Get customer
   ```

---

### Option B: Use Simple Store API (Already Implemented! ✅)

**Current frontend code uses these endpoints:**
- `POST /store/customers` - Direct customer creation
- `POST /store/auth` - Simple authentication
- `GET /store/customers/me` - Customer details

**Advantages:**
- ✅ No backend changes needed
- ✅ Works with basic Medusa v2 setup
- ✅ Simpler to maintain
- ✅ Already implemented in frontend

**Requirements:**
- Medusa v2 backend running
- Store API enabled (default)
- CORS configured properly

---

## Testing Authentication

### 1. Test Registration
```javascript
// In browser console:
const response = await fetch('https://backend-production-991f.up.railway.app/store/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User'
  })
});
console.log(await response.json());
```

**Expected Response:**
```json
{
  "customer": {
    "id": "cus_...",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "has_account": true
  }
}
```

### 2. Test Login
```javascript
const response = await fetch('https://backend-production-991f.up.railway.app/store/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123'
  })
});
console.log(await response.json());
```

**Expected Response:**
```json
{
  "customer": {
    "id": "cus_...",
    "email": "test@example.com"
  }
}
```

---

## Common Issues

### 401 Unauthorized
**Cause:** Auth module not configured OR endpoint doesn't exist
**Solution:** Use simple store API endpoints (already implemented)

### 409 Conflict - "Email Already Exists"
**Cause:** Customer already registered
**Solution:** Use login instead of register

### CORS Errors
**Cause:** Backend doesn't allow requests from your domain
**Solution:** Add to `medusa-config.js`:
```javascript
module.exports = {
  projectConfig: {
    // ...
    store_cors: process.env.STORE_CORS || "https://zabsstore.netlify.app,http://localhost:3000",
  },
};
```

### 400 Bad Request
**Cause:** Missing required fields
**Solution:** Ensure email, password (min 8 chars) are provided

---

## Environment Variables (Railway Backend)

Add these in Railway dashboard under your backend service:

```env
# Required
DATABASE_URL=<your-postgres-url>
REDIS_URL=<your-redis-url>

# Authentication (Optional - only if using auth module)
JWT_SECRET=your-random-secret-key-at-least-32-characters-long

# CORS (Required)
STORE_CORS=https://zabsstore.netlify.app,http://localhost:3000

# Admin CORS (Optional)
ADMIN_CORS=http://localhost:7001,http://localhost:9000
```

---

## Current Status

✅ **Frontend Updated** - Using simple store API endpoints
✅ **Error Handling** - Better error messages for users
✅ **Auto-Login** - After registration, automatically logs in user
✅ **Fallback Support** - Works with or without auth module

🔄 **Action Required:** Test authentication in the app!

---

## Next Steps

1. **Test the app** - Try registering a new account
2. **If still 401 errors** - Check backend logs in Railway dashboard
3. **If CORS errors** - Add `STORE_CORS` environment variable to Railway
4. **If other errors** - Check this guide for common issues

---

## Support Resources

- [Medusa v2 Store API Docs](https://docs.medusajs.com/api/store)
- [Medusa v2 Authentication](https://docs.medusajs.com/modules/users/backend/module-options)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)

---

**Last Updated:** Performance optimizations complete, authentication endpoints updated to use simpler store API.
