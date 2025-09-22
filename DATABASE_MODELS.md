# Database Models Documentation

## Overview

Our database schema uses a **dual-model approach** to maintain compatibility with Insightful's API while supporting our internal authentication system.

## Key Design Principles

### 1. **Insightful Compatibility**
- All Insightful-facing models use exact field names and data types from their API
- IDs are 15-character strings (e.g., `"wk59h7b0cq8b1oq"`)
- Timestamps stored as BigInt (Unix milliseconds)
- Arrays stored as JSON fields

### 2. **Dual Authentication Model**
```
AuthUser (Internal Auth) ←→ Employee (Insightful API)
     ↓                           ↓
  - Password                  - Projects
  - Role                      - Teams
  - Activation                - Billing Info
```

## Core Models

### **Employee** (Insightful API Compatible)
```prisma
model Employee {
  id                String   @id // 15-char Insightful ID
  email             String   @unique
  name              String
  teamId            String   // FK to Team
  sharedSettingsId  String   // FK to SharedSettings
  organizationId    String   // FK to Organization
  projects          Json     // Array of project IDs
  deactivated       BigInt   // Unix timestamp (0 = active)
  invited           BigInt   // Unix timestamp
  createdAt         BigInt   // Unix timestamp
  authUserId        String?  // FK to AuthUser
}
```

### **AuthUser** (Internal Authentication)
```prisma
model AuthUser {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String?  // Hashed password
  role        Role     // ADMIN | MANAGER | EMPLOYEE
  isActive    Boolean  @default(true)
  employee    Employee? // 1:1 relationship
}
```

### **Project** (Insightful API Compatible)
```prisma
model Project {
  id             String  @id // 15-char Insightful ID
  name           String
  employees      Json    // Array of employee IDs
  billable       Boolean
  payroll        Json    // {billRate, overtimeBillrate}
  organizationId String
  createdAt      BigInt  // Unix timestamp
}
```

### **Task** (Insightful API Compatible)
```prisma
model Task {
  id        String  @id // 15-char Insightful ID
  name      String
  projectId String  // FK to Project
  employees Json    // Array of employee IDs
  billable  Boolean
  priority  String  @default("low")
  status    String  @default("To Do")
  createdAt BigInt  // Unix timestamp
}
```

## Special Models

### **Window** (Time Tracking)
```prisma
model Window {
  id            String @id @default(uuid())
  start         BigInt // Unix timestamp
  end           BigInt // Unix timestamp
  employeeId    String
  projectId     String
  taskId        String
  shiftId       String
  hwid          String // Hardware ID for fraud prevention
  billRate      Float
  overtime      Boolean
}
```

### **Screenshot** (Monitoring)
```prisma
model Screenshot {
  id             String @id @default(uuid())
  timestamp      BigInt // Unix timestamp
  employeeId     String
  projectId      String
  taskId         String
  hwid           String // Hardware ID
  app            String // Application name
  title          String // Window title
  url            String // Web URL (if applicable)
  gateways       Json   // Array of MAC addresses
  productivity   Int    // 1-3 rating
  link           String // Image storage URL
}
```

## Key Features

### **ID Generation**
```typescript
// Insightful-compatible IDs (15 characters)
function generateInsightfulId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = 'w'; // Most Insightful IDs start with 'w'
  for (let i = 0; i < 14; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
```

### **Timestamp Handling**
```typescript
// Convert to Unix milliseconds for storage
const timestamp = BigInt(Date.now());

// Convert back for API responses
const jsDate = new Date(Number(timestamp));
```

### **JSON Arrays**
```typescript
// Store arrays as JSON in database
projects: ["wk59h7b0cq8b1oq", "w8jt496hid4shz3"]

// Retrieve and use in code
const projectIds = employee.projects as string[];
```

## Authentication Flow

1. **Employee Login**
   - Query `AuthUser` by email
   - Verify password hash
   - Generate JWT with `Employee` data
   - Return Insightful-compatible response

2. **Token Validation**
   - Decode JWT to get `employeeId`
   - Query `Employee` and related `AuthUser`
   - Check if `AuthUser.isActive` is true
   - Return employee data

## API Compatibility

### **Field Mapping**
| Insightful Field | Our Model | Type | Notes |
|------------------|-----------|------|-------|
| `id` | `Employee.id` | String | 15-character |
| `organizationId` | `Employee.organizationId` | String | FK reference |
| `projects` | `Employee.projects` | Json | Array of IDs |
| `deactivated` | `Employee.deactivated` | BigInt | Unix timestamp |
| `invited` | `Employee.invited` | BigInt | Unix timestamp |
| `createdAt` | `Employee.createdAt` | BigInt | Unix timestamp |

### **Response Format**
```json
{
  "id": "wk59h7b0cq8b1oq",
  "email": "john@example.com",
  "name": "John Doe",
  "organizationId": "wbtmikjuiimvh3z",
  "projects": ["wguwpw8-o6rdcfn"],
  "deactivated": 0,
  "invited": 1592922679686,
  "createdAt": 1592922679689
}
```

## Relationships

```
Organization
    ↓ (1:many)
  Employee ←→ AuthUser (1:1)
    ↓ (many:many via JSON)
  Project
    ↓ (1:many)
  Task
    ↓ (1:many)
  Window → Screenshot (many:1)
```

## Migration Strategy

1. **Schema Changes**: Use Prisma migrations
2. **Data Consistency**: Maintain Employee ↔ AuthUser links
3. **ID Format**: Generate Insightful-compatible IDs for new records
4. **Timestamps**: Store all times as Unix milliseconds (BigInt)

This design ensures 100% API compatibility with Insightful while maintaining secure authentication and audit capabilities.
