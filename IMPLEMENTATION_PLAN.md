# mercor - 48-Hour Implementation Plan

## 🎯 Project Overview
Building a **production-ready** time tracking system compatible with mercor's API in 48 hours.

### Final Deliverables:
1. **Unified Next.js Application** (Backend API + Web Frontend)
2. **Electron Desktop App** for macOS
3. **PostgreSQL Database** with complete data models

---

## 📚 API Documentation Strategy (Swagger/OpenAPI)

### Implementation Overview:
The API will be fully documented using **OpenAPI 3.0 specification** with interactive Swagger UI for testing and exploration.

### Key Components:

#### 1. **Swagger Configuration** (`lib/swagger.ts`)
```typescript
import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'mercor API',
      version: '1.0.0',
      description: 'Time tracking system compatible with mercor\'s API',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.your-domain.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'], // Path to API routes
};
```

#### 2. **Zod to OpenAPI Schema Generation**
- Automatically convert Zod validation schemas to OpenAPI schemas
- Single source of truth for validation and documentation
- Type-safe API contracts

#### 3. **Swagger UI Route** (`/api-docs`)
- Interactive API documentation
- Try-it-out functionality for all endpoints
- Authentication testing interface
- Request/response examples

#### 4. **Documentation Standards**
Each API endpoint will include:
- **Summary & Description**
- **Request Parameters** (path, query, body)
- **Response Schemas** (success & error)
- **Authentication Requirements**
- **Example Requests/Responses**
- **Rate Limiting Information**

### API Documentation Example:
```typescript
/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: List all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeList'
 */
```

### Benefits:
- **Auto-generated client SDKs** from OpenAPI spec
- **API testing** directly from documentation
- **Contract validation** ensuring API compatibility
- **Developer onboarding** with clear, interactive docs
- **Postman/Insomnia import** support

---

## 🏗️ Technical Architecture

### Core Stack Decision:
- **Backend + Web**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Bearer tokens
- **Desktop**: Electron + React + TypeScript
- **Storage**: Local filesystem for screenshots (development), Vercel Blob (production)
- **Deployment**: Vercel (instant deployment)

### Why This Stack:
- **Single codebase** for API + Web = faster development
- **Type safety** across entire stack with TypeScript
- **Prisma** = fastest database setup with migrations
- **Electron** = reuse React knowledge, quick Mac app
- **Vercel** = zero-config deployment with database

---

## 📅 48-Hour Sprint Schedule

### DAY 1: Backend Foundation (Hours 0-24)

#### **Phase 1: Project Setup & Database (Hours 0-3)**
```bash
Timeline: 3 hours
Priority: CRITICAL
```

**Tasks:**
1. Initialize Next.js project with TypeScript
2. Install core dependencies:
   - Prisma + @prisma/client
   - jsonwebtoken + bcrypt
   - zod (validation)
   - date-fns (timezone handling)
   - **swagger-jsdoc + swagger-ui-react** (API documentation)
   - **@types/swagger-jsdoc + @types/swagger-ui-react**
3. Setup PostgreSQL on supabase
4. Setup Swagger/OpenAPI documentation:
   - Configure swagger-jsdoc
   - Create Swagger UI route (`/api-docs`)
   - Setup OpenAPI 3.0 specification
   - Configure automatic schema generation from Zod schemas
5. Design & implement Prisma schema:
   - Employee model
   - Project model
   - Task model
   - TimeEntry model (shifts/activities)
   - Screenshot model
   - Organization model
   - Team model

**Key Files:**
- `prisma/schema.prisma` - Complete database schema
- `.env.local` - Database connection
- `lib/db.ts` - Prisma client singleton
- **`lib/swagger.ts` - Swagger configuration**
- **`app/api-docs/page.tsx` - Swagger UI interface**
- **`lib/swagger-schemas.ts` - Reusable OpenAPI schemas**

---

#### **Phase 2: Authentication System (Hours 3-6)**
```bash
Timeline: 3 hours
Priority: CRITICAL
```

**Authentication Strategy: JWT Bearer Tokens**
- Self-contained JWT tokens (no DB lookup needed)
- Works identically on web and desktop
- 30-day expiration
- Includes employee data in payload

**Tasks:**
1. Implement JWT Bearer token authentication
2. Create JWT generation/validation utilities
3. Build authentication middleware
4. Create login endpoint for employees
5. Add API token support for admin compatibility

**API Routes:**
- `POST /api/auth/login` - Employee login (returns JWT)
- `POST /api/auth/validate` - Validate JWT token
- `POST /api/auth/api-token` - Generate API token (admin)
- Middleware: `lib/auth-middleware.ts`

**Key Implementation:**
```typescript
// JWT for employees
jwt.sign({ employeeId, email }, JWT_SECRET, { expiresIn: '30d' })

// Dual validation: JWT for employees, API tokens for admin
validateJWT(token) || validateAPIToken(token)
```

**Swagger Documentation:**
- Document authentication schemes (Bearer & API Key)
- Add request/response schemas for each endpoint
- Include example payloads and error responses

---

#### **Phase 3: Employee API (Hours 6-10)**
```bash
Timeline: 4 hours
Priority: CRITICAL
```

**Implement mercor-compatible endpoints:**
- `GET /api/v1/employees` - List all employees
- `GET /api/v1/employees/{id}` - Get employee details
- `POST /api/v1/employees` - Create employee (triggers email)
- `PUT /api/v1/employees/{id}` - Update employee
- `DELETE /api/v1/employees/{id}` - Deactivate employee
- `POST /api/v1/employees/{id}/activate` - Activate account

**Features:**
- Email invitation system (using Resend API)
- Account activation flow
- System permissions tracking
- **Complete OpenAPI documentation with:**
  - Request/response schemas
  - Error responses (400, 401, 404, 500)
  - Query parameters & filters
  - Example payloads

---

#### **Phase 4: Project & Task APIs (Hours 10-14)**
```bash
Timeline: 4 hours
Priority: HIGH
```

**Project Endpoints:**
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Archive project
- `POST /api/v1/projects/{id}/assign` - Assign employees

**Task Endpoints:**
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task (auto-link to project)
- `PUT /api/v1/tasks/{id}` - Update task
- `GET /api/v1/projects/{id}/tasks` - Get project tasks

---

#### **Phase 5: Time Tracking API (Hours 14-20)**
```bash
Timeline: 6 hours
Priority: CRITICAL
```

**Core Endpoints:**
- `POST /api/v1/time/start` - Clock in
- `POST /api/v1/time/stop` - Clock out
- `GET /api/v1/time/current` - Get active session
- `GET /api/v1/time/entries` - List time entries with filters
- `GET /api/v1/shifts` - Get shift data
- `GET /api/v1/activities` - Get activity data

**Key Features:**
- Timezone handling (store in UTC, translate on request)
- Automatic shift creation
- Activity tracking within shifts
- Break time calculation
- Duration calculations

---

#### **Phase 6: Screenshots API (Hours 20-24)**
```bash
Timeline: 4 hours
Priority: MEDIUM
```

**Endpoints:**
- `POST /api/v1/screenshots` - Upload screenshot
- `GET /api/v1/screenshots` - List screenshots with filters
- `GET /api/v1/screenshots/{id}` - Get specific screenshot
- `DELETE /api/v1/screenshots/{id}` - Delete screenshot

**Features:**
- Base64 image handling
- Permission flags for system access
- Metadata storage (app, URL, productivity)
- Efficient pagination

---

### DAY 2: Frontend & Desktop App (Hours 24-48)

#### **Phase 7: Web Application (Hours 24-30)**
```bash
Timeline: 6 hours
Priority: HIGH
```

**Pages to Build:**
1. **Landing Page** (`/`)
   - Simple, professional design
   - Login for admins

2. **Employee Activation** (`/activate/[token]`)
   - Email verification
   - Set password
   - Download desktop app

3. **Admin Dashboard** (`/admin`)
   - View employees
   - View time entries
   - Basic project management

4. **Download Page** (`/download`)
   - Mac desktop app download
   - Installation instructions

**Components:**
- Responsive navigation
- Forms with validation
- Data tables
- Loading states
- Error handling

---

#### **Phase 8: Desktop App Core (Hours 30-38)**
```bash
Timeline: 8 hours
Priority: CRITICAL
```

**Setup Electron App:**
1. Initialize Electron with TypeScript
2. Create main process and renderer
3. Setup IPC communication
4. Build UI with React

**Core Features:**
1. **Login Screen**
   - API token authentication
   - Remember credentials

2. **Main Timer Interface**
   - Project/task selector
   - Start/stop button
   - Timer display
   - Current session info

3. **System Tray**
   - Quick access
   - Timer status
   - Start/stop controls

**File Structure:**
```
desktop-app/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/        # React app
│   ├── preload/         # Preload scripts
│   └── shared/          # Shared types
```

---

#### **Phase 9: Screenshot & Monitoring (Hours 38-44)**
```bash
Timeline: 6 hours
Priority: MEDIUM
```

**Desktop App Features:**
1. **Screenshot Capture**
   - Use Electron's `desktopCapturer` API
   - Capture every 10 minutes during active time
   - Handle multiple screens
   - Check screen recording permissions

2. **System Information**
   - Collect MAC address
   - Get IP address
   - Computer name
   - OS version

3. **Background Sync**
   - Queue screenshots locally
   - Upload in batches
   - Handle offline mode
   - Retry failed uploads

---

#### **Phase 10: Integration & Deployment (Hours 44-48)**
```bash
Timeline: 4 hours
Priority: CRITICAL
```

**Final Steps:**
1. **Production Setup**
   - Configure Vercel deployment
   - Setup production database
   - Environment variables
   - CORS configuration

2. **Desktop App Packaging**
   - Build .dmg installer
   - Code signing (if possible)
   - Auto-updater setup
   - Upload to GitHub releases

3. **Integration Testing**
   - Full employee onboarding flow
   - Time tracking workflow
   - Screenshot verification
   - API compatibility check

---

## 🚀 Implementation Order

### Build Sequence (Optimized for Dependencies):

1. **Database Schema** ➜ Foundation for everything
2. **Auth System** ➜ Required for all APIs
3. **Employee API** ➜ Core entity, needed for projects
4. **Time Tracking API** ➜ Most critical business logic
5. **Web Onboarding** ➜ Required for desktop app users
6. **Desktop Timer** ➜ Core functionality first
7. **Projects/Tasks API** ➜ Enhancement to time tracking
8. **Screenshot System** ➜ Additional verification
9. **Admin Dashboard** ➜ Nice to have
10. **Polish & Deploy** ➜ Production ready

---

## 📦 Key Dependencies

### Next.js App:
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "prisma": "^5.x",
    "@prisma/client": "^5.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "zod": "^3.x",
    "date-fns": "^2.x",
    "date-fns-tz": "^2.x",
    "@tanstack/react-query": "^5.x",
    "resend": "^2.x",
    "tailwindcss": "^3.x",
    "swagger-jsdoc": "^6.x",
    "swagger-ui-react": "^5.x",
    "zod-to-openapi": "^6.x"
  },
  "devDependencies": {
    "@types/swagger-jsdoc": "^6.x",
    "@types/swagger-ui-react": "^4.x"
  }
}
```

### Desktop App:
```json
{
  "dependencies": {
    "electron": "^28.x",
    "electron-forge": "^7.x",
    "react": "^18",
    "axios": "^1.x",
    "electron-store": "^8.x",
    "screenshot-desktop": "^1.x"
  }
}
```

---

## 🔑 Critical Success Factors

### Must-Have Features (MVP):
✅ Employee can receive invitation email  
✅ Employee can activate account  
✅ Employee can download desktop app  
✅ Employee can login to desktop app  
✅ Employee can select project/task  
✅ Employee can start/stop timer  
✅ Time entries are saved to database  
✅ API returns time entries in mercor format  

### Nice-to-Have (If Time Permits):
⭐ Screenshots with permissions  
⭐ Admin dashboard  
⭐ Break tracking  
⭐ Productivity labeling  
⭐ Overtime calculations  

---

## 🛠️ Development Commands

### Quick Start:
```bash
# Backend/Web Setup
npx create-next-app@latest . --typescript --tailwind --app
npm install prisma @prisma/client jsonwebtoken bcryptjs zod date-fns
npm install swagger-jsdoc swagger-ui-react zod-to-openapi
npm install -D @types/swagger-jsdoc @types/swagger-ui-react
npx prisma init
npx prisma migrate dev

# Desktop App Setup (separate directory)
npm init electron-app@latest desktop-app -- --template=typescript-webpack
cd desktop-app
npm install react react-dom axios electron-store
```

### Database Commands:
```bash
# Development
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio  # Visual database editor

# Production
npx prisma migrate deploy
```

### Build Commands:
```bash
# Next.js
npm run build
npm run start

# Desktop App
npm run make  # Creates .dmg
```

---

## 💡 Pro Tips for Speed

1. **Use Prisma Studio** for quick data verification
2. **Copy mercor's API response format exactly** - test with their Postman collection
3. **Use Swagger UI** at `/api-docs` to test endpoints during development
4. **Generate TypeScript types** from OpenAPI spec for frontend
5. **Start with hardcoded auth token** - add proper auth later
6. **Use Vercel's preview deployments** for quick testing
7. **Focus on happy path** - skip extensive error handling initially
8. **Use React Query** for API calls in frontend - automatic caching
9. **Screenshot as base64 strings** initially - optimize later
10. **Single "Default Task" per project** - simplifies task management

---

## 🚨 Risk Mitigation

### Potential Blockers:
1. **Mac Permissions**: Request screen recording permission early in desktop app
2. **Email Sending**: Use Resend API (quick setup) or skip email, use direct activation links
3. **Screenshot Storage**: Start with base64 in database, move to file storage if needed
4. **Timezone Issues**: Store everything in UTC, convert on display
5. **API Compatibility**: Test each endpoint with mercor's Postman collection

---

## 📝 Submission Checklist

- [ ] API matches mercor contract (test with Postman)
- [ ] **Swagger documentation accessible at `/api-docs`**
- [ ] **All endpoints documented with OpenAPI spec**
- [ ] Employee can complete full onboarding flow
- [ ] Desktop app runs on macOS without errors
- [ ] Timer accurately tracks time
- [ ] Database persists all data correctly
- [ ] Basic documentation/README provided
- [ ] Deployed to Vercel with public URL
- [ ] Desktop app packaged as .dmg
- [ ] Source code clean and organized
- [ ] No hardcoded secrets in code

---

## 🎯 Hour-by-Hour Breakdown

### Day 1 Schedule:
- **Hour 0-3**: Setup + Database
- **Hour 3-6**: Authentication
- **Hour 6-10**: Employee API
- **Hour 10-14**: Project/Task API
- **Hour 14-20**: Time Tracking API
- **Hour 20-24**: Screenshots API + Sleep

### Day 2 Schedule:
- **Hour 24-30**: Web Application
- **Hour 30-38**: Desktop App Core
- **Hour 38-44**: Screenshots + Monitoring
- **Hour 44-48**: Integration + Deployment

---

## 🏁 Let's Build!

This plan prioritizes:
1. **Core functionality first** (time tracking)
2. **mercor API compatibility** (their contract is the spec)
3. **Working end-to-end flow** (employee can actually use it)
4. **Clean, maintainable code** (impress with quality)

Remember: **A working subset is better than a broken full implementation!**
