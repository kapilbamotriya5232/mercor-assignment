# Authentication Testing Guide

## 🚀 Quick Start

The authentication system is now fully implemented and ready to test!

## Testing Methods

### Method 1: Using Swagger UI (Recommended for Beginners)
1. Open your browser and go to: **http://localhost:3000/api-docs**
2. You'll see the interactive API documentation
3. Click on any endpoint to expand it
4. Click "Try it out" button
5. Enter the required data
6. Click "Execute" to test the endpoint

### Method 2: Using cURL Commands (Terminal)

#### Test Login
```bash
# Login as Employee
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@mercor.com",
    "password": "Employee@123"
  }'

# Login as Admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mercor.com",
    "password": "Admin@123"
  }'
```

#### Validate Token
```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create API Token (Admin only)
```bash
# First login as admin and get the JWT token
# Then use that token in Authorization header
curl -X POST http://localhost:3000/api/auth/api-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Production API",
    "permissions": ["employee:read", "time:read"],
    "expiresInDays": 30
  }'
```

### Method 3: Using VS Code REST Client Extension
1. Install the "REST Client" extension in VS Code (by Huachao Mao)
2. Open the `test-auth.http` file
3. Click on "Send Request" link that appears above each request
4. The response will appear in a split window

### Method 4: Using Postman
1. Import these endpoints into Postman:
   - POST `http://localhost:3000/api/auth/login`
   - GET `http://localhost:3000/api/auth/validate`
   - POST `http://localhost:3000/api/auth/api-token`
2. Set the request body and headers as shown in the examples above

## 📝 Test Credentials

| Role     | Email                  | Password      | Description                    |
|----------|------------------------|---------------|--------------------------------|
| Admin    | admin@mercor.com       | Admin@123     | Full system access             |
| Manager  | manager@mercor.com     | Manager@123   | Team management access         |
| Employee | employee@mercor.com    | Employee@123  | Regular user access            |
| Pending  | pending@mercor.com     | (not set)     | Needs activation first         |

## 🔐 Authentication Flow

### 1. Employee Login
```json
POST /api/auth/login
{
  "email": "employee@mercor.com",
  "password": "Employee@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "employee": {
    "id": "clm...",
    "email": "employee@mercor.com",
    "name": "John Doe",
    "role": "EMPLOYEE",
    "organizationId": "clm..."
  }
}
```

### 2. Using the JWT Token
After login, use the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 3. API Token (for System Integration)
Admin users can generate API tokens for system-to-system integration:
```json
POST /api/auth/api-token
Authorization: Bearer [admin-jwt-token]
{
  "name": "CI/CD Pipeline",
  "permissions": ["employee:read", "time:read", "time:write"]
}

Response:
{
  "success": true,
  "token": "mrc_a1b2c3d4...", // Save this! Only shown once
  "apiToken": {
    "id": "clm...",
    "name": "CI/CD Pipeline",
    "lastFourChars": "d4e5",
    "permissions": [...]
  }
}
```

Use API tokens with the X-API-Key header:
```
X-API-Key: mrc_a1b2c3d4...
```

## 🧪 Test Scenarios

### ✅ Successful Login
1. Use correct credentials for any test user
2. Receive JWT token
3. Use token to access protected endpoints

### ❌ Failed Login
1. Wrong password: Returns 401 Unauthorized
2. Non-existent email: Returns 401 Unauthorized  
3. Unactivated account: Returns 403 Forbidden

### 🔒 Protected Routes
All API endpoints (except login) require authentication via:
- JWT token (Bearer token) for user sessions
- API token (X-API-Key) for system integration

### 🛡️ Role-Based Access
- **ADMIN**: Full access to all endpoints
- **MANAGER**: Team and employee management
- **EMPLOYEE**: Own data and assigned projects

## 📊 View Database

To inspect the database and see the created data:
```bash
cd mercor-assignment
npm run db:studio
```
This opens Prisma Studio at http://localhost:5555

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check if the JWT token is correctly copied
- Ensure the token hasn't expired (30-day expiry)
- Verify the Authorization header format: `Bearer [token]`

### "Account not activated" Error
- The user needs to complete activation first
- Check the `pending@mercor.com` user for this flow

### Can't Connect to API
- Ensure the server is running: `npm run dev`
- Check if port 3000 is available
- Verify the database connection in `.env`

## 🎯 Next Steps

Phase 2 Authentication is complete! You can now:
1. Test all authentication endpoints
2. View API documentation at `/api-docs`
3. Use authenticated endpoints to build features
4. Implement the Employee API endpoints (Phase 3)

## Summary

✅ **Completed in Phase 2:**
- Database models with authentication fields
- JWT token generation and validation
- Password hashing and verification
- API token system for integrations
- Role-based access control
- Complete Swagger documentation
- Test data seeding
- Full authentication flow

The authentication system is production-ready and follows industry best practices!
