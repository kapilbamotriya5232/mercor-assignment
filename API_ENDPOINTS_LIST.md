# Complete API Endpoints List - Insightful Compatible

This is the comprehensive list of all API endpoints that need to be built for the mercor assignment, based on the exact Insightful API contracts.

## 🔗 All Required Endpoints

### 1. **Employee API** - `/api/v1/employee` (Singular)
```
POST   /api/v1/employee              - Create new employee (send invitation)
GET    /api/v1/employee/:id          - Get employee by ID
GET    /api/v1/employee              - List all employees
PUT    /api/v1/employee/:id          - Update employee
GET    /api/v1/employee/deactivate/:id - Deactivate employee (unusual GET)
```

### 2. **Project API** - `/api/v1/project` (Singular)
```
POST   /api/v1/project        - Create new project
GET    /api/v1/project/:id    - Get project by ID
GET    /api/v1/project        - List all projects
PUT    /api/v1/project/:id    - Update project
DELETE /api/v1/project/:id    - Delete project
```

### 3. **Task API** - `/api/v1/task` (Singular)
```
POST   /api/v1/task        - Create new task
GET    /api/v1/task/:id    - Get task by ID
GET    /api/v1/task        - List all tasks
PUT    /api/v1/task/:id    - Update task
DELETE /api/v1/task/:id    - Delete task
```

### 4. **Time Tracking API** - `/api/v1/analytics/`
```
GET    /api/v1/analytics/window       - Get time tracking windows/entries
GET    /api/v1/analytics/project-time - Get aggregated project time data
```

### 5. **Screenshots API** - `/api/v1/analytics/`
```
GET    /api/v1/analytics/screenshot           - List screenshots basic
GET    /api/v1/analytics/screenshot-paginate  - List screenshots advanced
DELETE /api/v1/analytics/screenshot/:id       - Delete screenshot
```

### 6. **Authentication API** (Already Implemented in Phase 2)
```
POST   /api/auth/login      - Employee login
GET    /api/auth/validate   - Validate token
POST   /api/auth/api-token  - Generate API token (Admin)
GET    /api/auth/api-token  - List API tokens (Admin)
DELETE /api/auth/api-token  - Revoke API token (Admin)
```

---

## 📋 **TOTAL ENDPOINTS TO BUILD: 19**

### ✅ **Already Built (Phase 2):**
- ✅ `POST /api/auth/login`
- ✅ `GET /api/auth/validate`
- ✅ `POST /api/auth/api-token`
- ✅ `GET /api/auth/api-token`
- ✅ `DELETE /api/auth/api-token`

### 🚧 **Need to Build (14 endpoints):**

#### **Employee API (5 endpoints)**
- `POST /api/v1/employee`
- `GET /api/v1/employee/:id`
- `GET /api/v1/employee`
- `PUT /api/v1/employee/:id`
- `GET /api/v1/employee/deactivate/:id`

#### **Project API (5 endpoints)**
- `POST /api/v1/project`
- `GET /api/v1/project/:id`
- `GET /api/v1/project`
- `PUT /api/v1/project/:id`
- `DELETE /api/v1/project/:id`

#### **Task API (5 endpoints)**
- `POST /api/v1/task`
- `GET /api/v1/task/:id`
- `GET /api/v1/task`
- `PUT /api/v1/task/:id`
- `DELETE /api/v1/task/:id`

#### **Time Tracking API (2 endpoints)**
- `GET /api/v1/analytics/window`
- `GET /api/v1/analytics/project-time`

#### **Screenshots API (3 endpoints)**
- `GET /api/v1/analytics/screenshot`
- `GET /api/v1/analytics/screenshot-paginate`
- `DELETE /api/v1/analytics/screenshot/:id`

---

## ⚠️ **Critical Implementation Notes**

### **Endpoint Naming (MUST BE EXACT):**
- ✅ **Singular paths**: `/employee`, `/project`, `/task` (NOT plural)
- ✅ **Analytics paths**: `/analytics/window`, `/analytics/screenshot`
- ✅ **Unusual GET deactivate**: `GET /api/v1/employee/deactivate/:id`

### **Key Requirements:**
- 🔑 **Project IDs**: Must be exactly 15 characters
- 📅 **Timestamps**: Unix milliseconds (invited, createdAt, deactivated)
- 🏗️ **Employee assignment**: Via `employees[]` arrays
- 🔧 **Hardware ID**: `hwid` field for fraud prevention
- 🌍 **Timezone handling**: Multiple timezone fields required
- 💰 **Payroll**: `billRate` and `overtimeBillrate` (lowercase 'r')

### **Data Format Requirements:**
- **Error responses**: VALIDATION_ERROR with details array
- **Response structure**: Must match Insightful format exactly
- **Field names**: Exact field names from contracts
- **Network tracking**: MAC addresses in `gateways` array
- **Productivity scoring**: 1-3 numeric rating system

---

## 🎯 **Implementation Priority**

### **Phase 1 (Critical - Start Here):**
1. **Employee API** - Core entity management
2. **Project API** - Required for time tracking
3. **Task API** - Required for time tracking

### **Phase 2 (Essential):**
4. **Time Tracking API** - Most critical for business
5. **Screenshots API** - Verification system

---

## 🔍 **Next Steps**
1. Review complete contracts in `INSIGHTFUL_API_CONTRACTS.md`
2. Start implementing Employee API first
3. Test each endpoint against Insightful format
4. Ensure exact contract compatibility

**Ready to start building! 🚀**
