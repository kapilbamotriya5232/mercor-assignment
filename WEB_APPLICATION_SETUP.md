# Web Application & Employee Activation Setup

## Overview

This document provides comprehensive documentation for the employee activation flow and web application setup in the Mercor time tracking system.

## 🏗️ Architecture

```
Employee Creation → Email Sent → Activation Page → Password Setup → Download Page → Desktop App
```

## 📧 Email Service Setup (Resend)

### 1. Create a Resend Account
- Go to [https://resend.com](https://resend.com)
- Sign up for a free account (100 emails/day free)
- Verify your email address

### 2. Get API Key
- Navigate to API Keys section in Resend dashboard
- Create a new API key
- Copy the key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)
- Go to Domains section
- Add your domain (e.g., mercor.com)
- Add the DNS records provided by Resend to your domain provider
- Verify domain ownership

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT Secrets
JWT_SECRET="your-jwt-secret-key-minimum-32-chars"
ACTIVATION_JWT_SECRET="your-activation-jwt-secret-key"

# Resend Email Service
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="onboarding@yourdomain.com"
RESEND_REPLY_EMAIL="support@yourdomain.com"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Production: https://yourdomain.com
NEXT_PUBLIC_DESKTOP_APP_URL="/downloads/mercor-desktop.dmg"  # URL to desktop app download

# Optional: Email Domain Restrictions
ALLOWED_EMAIL_DOMAINS=""  # Comma-separated list: "company.com,partner.com"
```

## 📁 File Structure

```
app/
├── activate/
│   └── [token]/
│       └── page.tsx          # Activation page UI
├── download/
│   └── page.tsx             # Desktop app download page
├── api/
│   └── auth/
│       ├── activate/
│       │   └── route.ts     # Activation endpoints (GET/POST)
│       └── resend-activation/
│           └── route.ts     # Resend activation email endpoint
lib/
├── email/
│   ├── client.ts            # Resend client configuration
│   ├── service.ts           # Email service functions
│   └── templates/
│       └── activation.tsx   # React Email template
└── auth/
    └── activation-token.ts  # Token generation/validation
```

## 🔄 Employee Activation Flow

### 1. **Employee Creation**
When an admin creates an employee via the API:
```typescript
POST /api/v1/employee
{
  "name": "John Doe",
  "email": "john@example.com",
  "teamId": "123456789012345",
  "sharedSettingsId": "123456789012345"
}
```

The system:
- Creates employee record in database
- Generates activation token (JWT, 24-hour expiry)
- Stores token in ActivationToken table
- Sends activation email with link

### 2. **Email Received**
Employee receives email with:
- Welcome message
- Activation link: `https://app.mercor.com/activate/{token}`
- 24-hour expiry notice
- Installation instructions

### 3. **Activation Page**
When employee clicks the link (`/activate/[token]`):
- Token is validated (signature, expiry, usage)
- Employee info is displayed
- Password form is shown with requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number

### 4. **Account Activation**
When employee submits password:
```typescript
POST /api/auth/activate
{
  "token": "activation_token_here",
  "password": "SecurePassword123"
}
```

The system:
- Validates token again
- Creates AuthUser record with hashed password
- Links AuthUser to Employee
- Marks token as used
- Sends welcome email
- Returns JWT for immediate login
- Redirects to download page

### 5. **Download Page**
Employee is redirected to `/download` where they can:
- Download desktop app for their OS
- View installation instructions
- Access system requirements
- Contact support if needed

## 🛡️ Security Measures

### Password Security
- **Bcrypt hashing** with salt rounds = 12
- **Password requirements** enforced on frontend and backend
- **Strong password policy**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - No common passwords

### Token Security
- **JWT tokens** with 24-hour expiry
- **One-time use** enforcement
- **Secure random generation**
- **Database tracking** of used tokens
- **Automatic cleanup** of expired tokens

### Email Security
- **Domain validation** (optional)
- **SPF/DKIM** for deliverability
- **Rate limiting** on resend requests
- **No user enumeration** (generic messages)

## 📊 Database Models

### ActivationToken Model
```prisma
model ActivationToken {
  id          String    @id @default(cuid())
  token       String    @unique
  employeeId  String    @db.Char(15)
  email       String
  used        Boolean   @default(false)
  usedAt      DateTime?
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  
  authUserId  String?
  authUser    AuthUser? @relation(fields: [authUserId], references: [id])
}
```

## 🧪 Testing the Flow

### 1. Create Test Organization & Team
```bash
# Run seed script or manually create in database
npx prisma db seed
```

### 2. Create Test Employee
```bash
curl -X POST http://localhost:3000/api/v1/employee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "name": "Test Employee",
    "email": "test@example.com",
    "teamId": "123456789012345",
    "sharedSettingsId": "123456789012345"
  }'
```

### 3. Check Email
- If using Resend without verified domain, check Resend dashboard for email status
- With verified domain, email will be delivered to inbox

### 4. Test Activation
- Click activation link in email
- Set password
- Verify redirect to download page
- Check database for AuthUser creation

## 🐛 Troubleshooting

### Email Not Sending
1. **Check Resend API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Check From Email**: Must be verified domain or use `onboarding@resend.dev` for testing
3. **Check Resend Dashboard**: View email logs and errors
4. **Check Console Logs**: Server logs will show email sending errors

### Token Invalid
1. **Check Token Expiry**: Tokens expire after 24 hours
2. **Check Token Usage**: Tokens can only be used once
3. **Check Database**: Verify ActivationToken record exists
4. **Check JWT Secret**: Ensure `ACTIVATION_JWT_SECRET` is consistent

### Activation Fails
1. **Check Employee Exists**: Verify employee record in database
2. **Check Not Already Activated**: AuthUser shouldn't exist
3. **Check Password Requirements**: Must meet all criteria
4. **Check Database Connection**: Ensure Prisma can connect

## 📝 API Endpoints

### Activation Endpoints
```
GET  /api/auth/activate?token={token}  - Validate token
POST /api/auth/activate                - Activate account
POST /api/auth/resend-activation       - Resend activation email
```

### Response Examples

**Successful Activation:**
```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": {
    "token": "jwt_token_here",
    "employee": {
      "id": "123456789012345",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Invalid Token:**
```json
{
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired activation token",
  "valid": false
}
```

## 🚀 Production Deployment

### 1. Environment Setup
- Set production DATABASE_URL
- Generate strong JWT secrets
- Configure production URLs
- Set up Resend with verified domain

### 2. Email Domain Setup
- Add domain to Resend
- Configure DNS records (SPF, DKIM, DMARC)
- Verify domain ownership
- Update FROM email address

### 3. Desktop App Distribution
- Build desktop apps for all platforms
- Host downloads on CDN or GitHub Releases
- Update NEXT_PUBLIC_DESKTOP_APP_URL
- Create download directory structure

### 4. Security Hardening
- Enable HTTPS only
- Set secure headers
- Implement rate limiting
- Add CSRF protection
- Enable audit logging

## 📱 Desktop App Integration

After activation, employees will:
1. Download the desktop app
2. Launch and see login screen
3. Enter email and password
4. App calls `/api/auth/login` to get JWT
5. JWT stored securely in app
6. App fetches assigned projects/tasks
7. Employee can start tracking time

## 🔄 Maintenance

### Regular Tasks
- **Clean expired tokens**: Run cleanup job weekly
- **Monitor email delivery**: Check Resend dashboard
- **Review failed activations**: Check logs for patterns
- **Update dependencies**: Keep packages current
- **Backup database**: Regular backup schedule

### Monitoring
- Track activation success rate
- Monitor email bounce rate
- Alert on high failure rates
- Log all activation attempts
- Track time to activation

## 📞 Support

For issues with activation flow:
1. Check this documentation
2. Review server logs
3. Check Resend dashboard
4. Contact: support@mercor.com

## 🎯 Success Metrics

- **Activation Rate**: >90% of invited employees activate
- **Time to Activation**: <24 hours average
- **Email Delivery**: >99% successful delivery
- **Support Tickets**: <5% activation-related
- **Password Reset**: <10% need password reset
