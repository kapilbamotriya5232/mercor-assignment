# Insightful API Contract Mapping

This document tracks the exact API endpoints from Insightful's documentation that we need to implement for the mercor assignment.

## 🔴 Status Legend
- ❌ Not documented yet
- ⏳ Partially documented
- ✅ Fully documented
- 🚧 Implemented

---

## 1. Employee API ✅

### Required Endpoints:
```
POST   /api/v1/employee              - Create new employee (invite)
GET    /api/v1/employee/:id          - Get employee by ID
GET    /api/v1/employee              - List all employees
PUT    /api/v1/employee/:id          - Update employee
GET    /api/v1/employee/deactivate/:id - Deactivate employee
```

### Contract Details:
**Base URL**: `API-DOMAIN/api/v1`
**Authentication**: All requests require Bearer token in Authorization header

#### POST /api/v1/employee
- **Description**: Create new employee and send invitation
- **Request Body**:
  ```json
  {
    "name": "Employee 4",
    "email": "employee4@gmail.com",
    "teamId": "wautlmuhdnndn7f",
    "sharedSettingsId": "waufhwfhb0p41mr"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "wf8rsovxa8vjq8w",
    "name": "Employee 4",
    "email": "employee4@gmail.com",
    "teamId": "wautlmuhdnndn7f",
    "sharedSettingsId": "waufhwfhb0p41mr",
    "accountId": "wmwrbaurf3xddu5",
    "identifier": "employee4@gmail.com",
    "type": "personal",
    "organizationId": "wbtmikjuiimvh3z",
    "projects": [],
    "deactivated": 0,
    "invited": 1592922679686,
    "createdAt": 1592922679689
  }
  ```
- **Error Response (422)**:
  ```json
  {
    "type": "VALIDATION_ERROR",
    "message": "Parameters validation error!",
    "details": [
      {
        "type": "required",
        "field": "name",
        "message": "The 'name' field is required!"
      }
    ]
  }
  ```

#### GET /api/v1/employee/:id
- **Description**: Get single employee by ID
- **Path Parameters**: `id` - Employee ID
- **Response (200)**:
  ```json
  {
    "id": "wspxwyl3mzilfz5",
    "email": "employee23@gmail.com",
    "name": "John Doe",
    "teamId": "wautlmuhdnndn7f",
    "sharedSettingsId": "waufhwfhb0p41mr",
    "accountId": "wtl6qh6ygxbinqj",
    "identifier": "employee23@gmail.com",
    "type": "personal",
    "organizationId": "wbtmikjuiimvh3z",
    "projects": [],
    "deactivated": 0,
    "invited": 1592850492316,
    "createdAt": 1592850492318
  }
  ```
- **Error Response (404)**:
  ```json
  {
    "type": "EntityNotFound",
    "message": "Employee doesn't exist."
  }
  ```

#### GET /api/v1/employee
- **Description**: List all employees
- **Response (200)**: Array of employee objects
  ```json
  [
    {
      "id": "wk59h7b0cq8b1oq",
      "email": "vxcvxcv@gmail.com",
      "name": "Employee 2",
      "teamId": "wautlmuhdnndn7f",
      "sharedSettingsId": "waufhwfhb0p41mr",
      "accountId": "wiorozokbvlgxgw",
      "identifier": "vxcvxcv@gmail.com",
      "type": "personal",
      "organizationId": "wbtmikjuiimvh3z",
      "projects": ["wguwpw8-o6rdcfn", "wdewmdv6xkfryrb"],
      "deactivated": 1592853287525,
      "invited": 1592568754375,
      "createdAt": 1592568754382
    }
  ]
  ```

#### PUT /api/v1/employee/:id  
- **Description**: Update employee information
- **Path Parameters**: `id` - Employee ID
- **Request Body**: Full employee object with updated fields
  ```json
  {
    "id": "wspxwyl3mzilfz5",
    "email": "john.doe@gmail.com",
    "name": "John Doe",
    "teamId": "wautlmuhdnndn7f",
    "sharedSettingsId": "waufhwfhb0p41mr",
    "accountId": "wtl6qh6ygxbinqj",
    "identifier": "employee23@gmail.com",
    "type": "personal",
    "organizationId": "wbtmikjuiimvh3z",
    "projects": [],
    "deactivated": 0,
    "invited": 1592850492316,
    "createdAt": 1592850492318
  }
  ```
- **Response (200)**: Updated employee object
- **Error Response (404)**:
  ```json
  {
    "type": "NOT_FOUND",
    "message": "Not found"
  }
  ```

#### GET /api/v1/employee/deactivate/:id
- **Description**: Deactivate an employee
- **Path Parameters**: `id` - Employee ID
- **Response (200)**: Employee object with deactivated timestamp
  ```json
  {
    "id": "wk59h7b0cq8b1oq",
    "email": "vxcvxcv@gmail.com",
    "name": "vxcvxcv",
    "teamId": "wautlmuhdnndn7f",
    "sharedSettingsId": "waufhwfhb0p41mr",
    "accountId": "wiorozokbvlgxgw",
    "identifier": "vxcvxcv@gmail.com",
    "type": "personal",
    "organizationId": "wbtmikjuiimvh3z",
    "projects": [],
    "deactivated": 1592853287525,
    "invited": 1592568754375,
    "createdAt": 1592568754382
  }
  ```
- **Error Response (409)**:
  ```json
  {
    "message": "Employee is already deactivated"
  }
  ```

### Key Implementation Notes:
- **Endpoint path**: `/api/v1/employee` (singular, not plural)
- **Deactivation**: Uses GET request (unusual but must match exactly)
- **Required fields for creation**: name, email, teamId, sharedSettingsId
- **Timestamps**: `invited`, `createdAt`, and `deactivated` are Unix timestamps in milliseconds
- **Projects**: Array of project IDs that employee is assigned to
- **Type**: Always "personal" for employees
- **Identifier**: Usually matches email

---

## 2. Project API ✅

### Required Endpoints:
```
POST   /api/v1/project        - Create new project
GET    /api/v1/project/:id    - Get project by ID
GET    /api/v1/project        - List all projects
PUT    /api/v1/project/:id    - Update project
DELETE /api/v1/project/:id    - Delete project
```

### Contract Details:
**Authentication**: All requests require Bearer token in Authorization header

#### POST /api/v1/project
- **Description**: Create new project with assigned employees
- **Request Body**:
  ```json
  {
    "name": "Your project name",
    "description": "Your project description",
    "employees": [
      "wk59h7b0cq8b1oq",
      "w8jt496hid4shz3"
    ],
    "statuses": [
      "To Do",
      "In progress", 
      "Done"
    ],
    "priorities": [
      "low",
      "medium",
      "high"
    ],
    "billable": true,
    "payroll": {
      "billRate": 25,
      "overtimeBillrate": 55
    }
  }
  ```
- **Required Fields**: `name`, `employees[]`
- **Optional Fields**: `description`, `statuses[]`, `priorities[]`, `billable`, `deadline`, `payroll`
- **Response (200)**:
  ```json
  {
    "id": "wiotv0ilptz9uqg",
    "archived": false,
    "statuses": [
      "To Do",
      "In progress",
      "Done"
    ],
    "priorities": [
      "low",
      "medium",
      "high"
    ],
    "billable": true,
    "payroll": {
      "billRate": 25,
      "overtimeBillrate": 55
    },
    "name": "Your project name",
    "description": "Your project description",
    "employees": [
      "wk59h7b0cq8b1oq",
      "w8jt496hid4shz3"
    ],
    "creatorId": "wuiz-yuxbtr9aul",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [
      "wautlmuhdnndn7f"
    ],
    "createdAt": 1592926661681
  }
  ```

#### GET /api/v1/project/:id
- **Description**: Get single project by ID
- **Path Parameters**: `id` - Project ID (must be exactly 15 characters)
- **Response (200)**:
  ```json
  {
    "id": "wj7qcsinkdn7ugd",
    "archived": false,
    "statuses": [
      "To do",
      "On hold",
      "In progress",
      "Done"
    ],
    "priorities": [
      "low",
      "medium",
      "high"
    ],
    "billable": true,
    "payroll": {
      "billRate": 1,
      "overtimeBillRate": 1
    },
    "name": "Project 2",
    "employees": [],
    "creatorId": "wlaxrvp-a_wznu1",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [],
    "createdAt": 1592568826171
  }
  ```
- **Error Response (422)**:
  ```json
  {
    "type": "VALIDATION_ERROR",
    "message": "Parameters validation error!",
    "details": [
      {
        "type": "stringLength",
        "expected": 15,
        "actual": 14,
        "field": "id",
        "message": "The 'id' field length must be 15 characters long!"
      }
    ]
  }
  ```

#### GET /api/v1/project
- **Description**: List all projects
- **Response (200)**: Array of project objects
  ```json
  [
    {
      "id": "w7wn6lphwsq820i",
      "archived": false,
      "statuses": [
        "To do",
        "On hold", 
        "In progress",
        "Done"
      ],
      "priorities": [
        "low",
        "medium",
        "high"
      ],
      "billable": true,
      "payroll": {
        "billRate": 1,
        "overtimeBillRate": 1
      },
      "name": "Project 1",
      "employees": [],
      "creatorId": "wr-sz9z22eojwz9",
      "organizationId": "wbtmikjuiimvh3z",
      "teams": [],
      "createdAt": 1592571902985
    }
  ]
  ```

#### PUT /api/v1/project/:id
- **Description**: Update project information
- **Path Parameters**: `id` - Project ID
- **Request Body**: Partial project object with fields to update
  ```json
  {
    "id": "wiotv0ilptz9uqg",
    "name": "New Project name",
    "description": "New project description",
    "employees": [
      "wk59h7b0cq8b1oq"
    ]
  }
  ```
- **Optional Fields**: `name`, `description`, `employees[]`, `statuses[]`, `priorities[]`, `billable`, `deadline`, `payroll`, `screenshotSettings`
- **Response (200)**: Updated project object

#### DELETE /api/v1/project/:id  
- **Description**: Delete project
- **Path Parameters**: `id` - Project ID
- **Request Body**: None required
- **Response (200)**: Deleted project object

### Key Implementation Notes:
- **Endpoint path**: `/api/v1/project` (singular, not plural)
- **Employee assignment**: Done during create/update via `employees[]` array
- **ID validation**: Project IDs must be exactly 15 characters
- **Payroll structure**: Contains `billRate` and `overtimeBillrate` (note lowercase 'r')
- **Timestamps**: `createdAt` is Unix timestamp in milliseconds
- **Archived flag**: All projects have `archived` boolean (false for active)
- **Teams array**: Contains team IDs associated with project
- **Default statuses**: Usually ["To do", "On hold", "In progress", "Done"]
- **Default priorities**: Usually ["low", "medium", "high"]

---

## 3. Task API ✅

### Required Endpoints:
```
POST   /api/v1/task        - Create new task
GET    /api/v1/task/:id    - Get task by ID
GET    /api/v1/task        - List all tasks
PUT    /api/v1/task/:id    - Update task
DELETE /api/v1/task/:id    - Delete task
```

### Contract Details:
**Authentication**: All requests require Bearer token in Authorization header

#### POST /api/v1/task
- **Description**: Create new task in organization
- **Request Body**:
  ```json
  {
    "name": "Your task name",
    "projectId": "wiotv0ilptz9uqg",
    "employees": ["wk59h7b0cq8b1oq"],
    "description": "Your task description",
    "status": "To Do",
    "billable": true,
    "payroll": {
      "billRate": 1,
      "overtimeBillRate": 1
    }
  }
  ```
- **Required Fields**: `name`, `employees[]`, `projectId`
- **Optional Fields**: `description`, `deadline`, `status`, `labels[]`, `priority`, `billable`
- **Response (200)**:
  ```json
  {
    "id": "ww6sybfoyylxrap",
    "status": "To Do",
    "priority": "low",
    "billable": true,
    "name": "Your task name",
    "projectId": "wiotv0ilptz9uqg",
    "employees": [
      "wk59h7b0cq8b1oq"
    ],
    "description": "Your task description",
    "creatorId": "wuiz-yuxbtr9aul",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [
      "wautlmuhdnndn7f"
    ],
    "createdAt": 1592927491659
  }
  ```

#### GET /api/v1/task/:id
- **Description**: Get single task by ID
- **Path Parameters**: `id` - Task ID
- **Response (200)**:
  ```json
  {
    "id": "w-4xfzgjiv-8jn8",
    "status": "To Do",
    "priority": "low",
    "billable": true,
    "name": "Your task name 2",
    "projectId": "wiotv0ilptz9uqg",
    "employees": [
      "wk59h7b0cq8b1oq"
    ],
    "description": "Your task description 2",
    "creatorId": "wuiz-yuxbtr9aul",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [
      "wautlmuhdnndn7f"
    ],
    "createdAt": 1592927582955
  }
  ```

#### GET /api/v1/task
- **Description**: Retrieve list of all tasks in organization
- **Response (200)**: Array of task objects

#### PUT /api/v1/task/:id
- **Description**: Update task information
- **Path Parameters**: `id` - Task ID
- **Request Body**: Partial task object with fields to update
  ```json
  {
    "name": "Your task new name",
    "employees": ["wk59h7b0cq8b1oq"]
  }
  ```
- **Optional Fields**: `name`, `description`, `employees[]`, `deadline`, `status`, `labels[]`, `priority`, `billable`
- **Response (200)**:
  ```json
  {
    "id": "ww6sybfoyylxrap",
    "status": "To Do",
    "priority": "low",
    "billable": true,
    "name": "Your task new name",
    "projectId": "wiotv0ilptz9uqg",
    "employees": [
      "wk59h7b0cq8b1oq"
    ],
    "description": "Your task description",
    "creatorId": "wuiz-yuxbtr9aul",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [
      "wautlmuhdnndn7f"
    ],
    "createdAt": 1592927491659
  }
  ```

#### DELETE /api/v1/task/:id
- **Description**: Delete task
- **Path Parameters**: `id` - Task ID
- **Request Body**: None required
- **Response (200)**: Deleted task object
  ```json
  {
    "id": "w-4xfzgjiv-8jn8",
    "status": "To Do",
    "priority": "low",
    "billable": true,
    "name": "Your task name 2",
    "projectId": "wiotv0ilptz9uqg",
    "employees": [
      "wk59h7b0cq8b1oq"
    ],
    "description": "Your task description 2",
    "creatorId": "wuiz-yuxbtr9aul",
    "organizationId": "wbtmikjuiimvh3z",
    "teams": [
      "wautlmuhdnndn7f"
    ],
    "createdAt": 1592927582955
  }
  ```

### Key Implementation Notes:
- **Endpoint path**: `/api/v1/task` (singular, not plural)
- **Required fields for creation**: `name`, `employees[]`, `projectId`
- **Project relationship**: Tasks must belong to a project via `projectId`
- **Employee assignment**: Done via `employees[]` array in request
- **Timestamps**: `createdAt` is Unix timestamp in milliseconds
- **Teams inheritance**: Tasks inherit teams from their project
- **Default priority**: Appears to be "low" if not specified
- **Status management**: Status must match project's available statuses
- **Billable flag**: Can be set per task, overriding project settings
- **Payroll**: Tasks can have their own payroll rates

### Special Implementation Notes:
- Assignment recommends 1:1 mapping from project to "default task"
- Tasks must belong to a project
- Tasks have their own assigned employees

---

## 4. Time Tracking API ✅

### Required Endpoints:
```
GET    /api/v1/analytics/window       - Get time tracking windows/entries
GET    /api/v1/analytics/project-time - Get aggregated project time data
```

### Contract Details:
**Authentication**: All requests require Bearer token in Authorization header

#### GET /api/v1/analytics/window
- **Description**: Get detailed time tracking windows/entries with filtering
- **Query Parameters**:
  - `start` (required): Unix timestamp in milliseconds - data start time
  - `end` (required): Unix timestamp in milliseconds - data end time
  - `timezone` (optional): Timezone string
  - `employeeId` (optional): Filter by specific employee ID
  - `teamId` (optional): Filter by team ID
  - `projectId` (optional): Filter by project ID  
  - `taskId` (optional): Filter by task ID
  - `shiftId` (optional): Filter by shift ID
- **Request Example**:
  ```bash
  curl --location 'https://app.insightful.io/api/v1/analytics/window?start=1592498100575&end=1592929252004'
  ```
- **Response (200)**: Array of time tracking windows
  ```json
  [
    {
      "id": "292aa814-9b1b-4ec3-8752-7403ae51977c",
      "type": "manual",
      "note": "",
      "start": 1592558256607,
      "end": 1592558320939,
      "timezoneOffset": -7200000,
      "shiftId": "8696b16d-136a-44cf-b553-77258fb2ddce",
      "projectId": "wauimd1z_j0sbgy",
      "taskId": "wfrk32jg36mdq99",
      "paid": false,
      "billable": true,
      "overtime": false,
      "billRate": 12,
      "overtimeBillRate": 0,
      "payRate": 0,
      "overtimePayRate": 0,
      "taskStatus": "in progress",
      "taskPriority": "low",
      "user": "janajovanovic",
      "computer": "jana's macbook air",
      "domain": "",
      "name": "Jana Jovanovic",
      "hwid": "ee76a404-4168-52af-9d7a-856278de7f65",
      "os": "darwin",
      "osVersion": "18.2.0",
      "processed": false,
      "createdAt": "2020-06-19T07:17:36.608Z",
      "updatedAt": "2020-06-19T07:18:40.949Z",
      "employeeId": "wpuuerb5saeydb4",
      "teamId": "wide_zvn0ihbddz",
      "sharedSettingsId": "wecqwcgmor6qypc",
      "organizationId": "wts6fn6zccv5dnw",
      "startTranslated": 1592558256607,
      "endTranslated": 1592558320939,
      "negativeTime": 0,
      "deletedScreenshots": 0,
      "_index": "windows-smb-2020-06"
    }
  ]
  ```

#### GET /api/v1/analytics/project-time
- **Description**: Get aggregated time data per project
- **Query Parameters**: Same as window endpoint
  - `start` (required): Unix timestamp in milliseconds
  - `end` (required): Unix timestamp in milliseconds  
  - `timezone` (optional): Timezone string
  - `employeeId` (optional): Filter by employee ID
  - `teamId` (optional): Filter by team ID
  - `projectId` (optional): Filter by project ID
  - `taskId` (optional): Filter by task ID
  - `shiftId` (optional): Filter by shift ID
- **Request Example**:
  ```bash
  curl --location 'https://app.insightful.io/api/v1/analytics/project-time?start=1592558256607&end=2574195046418'
  ```
- **Response (200)**: Array of project time summaries
  ```json
  [
    {
      "id": "wauimd1z_j0sbgy",
      "time": 40291000,
      "costs": 0,
      "income": 134.30333333333334
    },
    {
      "id": "wcl6pilk_f89fzo", 
      "time": 24617000,
      "costs": 0,
      "income": 88.89472222222221
    }
  ]
  ```

### Key Implementation Notes:
- **Endpoint path**: `/api/v1/analytics/window` and `/api/v1/analytics/project-time`
- **Time format**: Unix timestamps in milliseconds for all time fields
- **Timezone handling**: 
  - `timezoneOffset` in milliseconds (e.g., -7200000 for -2 hours)
  - `startTranslated` and `endTranslated` for timezone-adjusted times
- **Window types**: Includes "manual" type (possibly others like "automatic")
- **Payroll data**: Each window contains billing and pay rates
- **System information**: Hardware ID (hwid), OS, computer name, domain
- **Shift relationships**: Windows can be grouped by `shiftId`
- **Project/Task linking**: Each window belongs to a project and task
- **Processing status**: `processed` flag indicates if window has been processed
- **Screenshot tracking**: `deletedScreenshots` count for each window
- **Employee information**: Full employee details included in each window

### Critical Requirements:
- **Most important API** for business (used for payouts)
- Must track who logged time and when  
- Timezone handling required (multiple timezone fields)
- Duration calculations (start/end times in milliseconds)
- Hardware identification via `hwid` field
- Payroll rate tracking per time window

### Missing Endpoints (May Need Additional Research):
```
# These endpoints may exist but weren't provided:
POST   /api/v1/time/start      - Start time tracking session
POST   /api/v1/time/stop       - Stop time tracking session
GET    /api/v1/time/current    - Get current active session
```

**Note**: The provided endpoints appear to be analytics/reporting focused. For a complete time tracking system, there may be additional endpoints for starting/stopping time tracking sessions that weren't included in this contract documentation.

---

## 5. Screenshots API ✅

### Required Endpoints:
```
GET    /api/v1/analytics/screenshot           - List screenshots with basic filtering
GET    /api/v1/analytics/screenshot-paginate  - List screenshots with advanced pagination
DELETE /api/v1/analytics/screenshot/:id       - Delete specific screenshot
```

### Contract Details:
**Authentication**: All requests require Bearer token in Authorization header

#### GET /api/v1/analytics/screenshot
- **Description**: Get list of screenshots with basic filtering
- **Query Parameters**:
  - `start` (required): Unix timestamp in milliseconds - data start time
  - `end` (required): Unix timestamp in milliseconds - data end time
  - `limit` (optional): Number of results (default: 15)
- **Request Example**:
  ```bash
  curl --location 'https://app.insightful.io/api/v1/analytics/screenshot?start=1592498100575&end=1592929252004&limit=15'
  ```

#### GET /api/v1/analytics/screenshot-paginate
- **Description**: Get list of screenshots with advanced filtering and pagination
- **Query Parameters**:
  - `start` (required): Unix timestamp in milliseconds - data start time
  - `end` (required): Unix timestamp in milliseconds - data end time
  - `timezone` (optional): Timezone string
  - `taskId` (optional): Comma-separated task IDs
  - `shiftId` (optional): Comma-separated shift IDs
  - `projectId` (optional): Comma-separated project IDs
  - `sortBy` (optional): ScreenshotSort enum value
  - `limit` (optional): Number of results (default: 10000)
  - `next` (optional): Hash value from previous response for pagination
- **Request Example**:
  ```bash
  curl --location 'https://app.insightful.io/api/v1/analytics/screenshot-paginate?start=1592498100575&end=1592929252004'
  ```
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "gateways": ["b0:ac:d2:54:71:6a"],
        "id": "b3f265e0-e41b-4eea-a20a-4d0b03bf7114",
        "type": "scheduled",
        "timestamp": 1576002025594,
        "timezoneOffset": -3600000,
        "app": "Google Chrome",
        "appFileName": "Google Chrome.app",
        "appFilePath": "/Applications/Google Chrome.app",
        "title": "Workpuls | Employee Monitoring and Time Tracking Software - Google Chrome",
        "url": "http://app.workpuls.local:8000/#/app/settings/shared",
        "document": "",
        "windowId": "43e70af3-5529-4c8d-9126-ca661e0900d6",
        "shiftId": "",
        "projectId": "wirgndh4f2vnpdj",
        "taskId": "wmxiy1jtadoibfw",
        "taskStatus": "to do",
        "taskPriority": "low",
        "user": "milandinic",
        "computer": "milan's macbook pro",
        "domain": "",
        "name": "Milan Dinic",
        "hwid": "489c8746-c41e-5f75-87dc-bba0f420f116",
        "os": "darwin",
        "osVersion": "18.2.0",
        "active": true,
        "processed": false,
        "createdAt": "2019-12-10T17:20:25.594Z",
        "updatedAt": "2019-12-10T17:20:25.594Z",
        "employeeId": "wgpw4lgwq2y4vmx",
        "teamId": "whkh7s1stoei4ml",
        "sharedSettingsId": "wecqwcgmor6qypc",
        "organizationId": "wts6fn6zccv5dnw",
        "appId": "wk34454ebmk9mu-",
        "appLabelId": "wejvrbosjibxg81",
        "categoryId": "",
        "categoryLabelId": "",
        "productivity": 1,
        "site": "app.workpuls.local:8000",
        "timestampTranslated": 1576002025594,
        "index": "screenshots-smb-2019-12",
        "link": ""
      }
    ]
  }
  ```

#### DELETE /api/v1/analytics/screenshot/:id
- **Description**: Delete specific screenshot by ID
- **Path Parameters**: `id` - Screenshot ID
- **Request Example**:
  ```bash
  curl --location --request DELETE 'https://app.insightful.io/api/v1/analytics/screenshot/b3f265e0-e41b-4eea-a20a-4d0b03bf7114'
  ```

### Key Implementation Notes:
- **Endpoint path**: `/api/v1/analytics/screenshot` and `/api/v1/analytics/screenshot-paginate`
- **Time format**: Unix timestamps in milliseconds for all time fields
- **Timezone handling**: `timezoneOffset` in milliseconds, `timestampTranslated` for adjusted times
- **Screenshot types**: Includes "scheduled" type (possibly others like "manual")
- **Rich metadata**: Each screenshot includes extensive app and system information
- **Network information**: `gateways` array contains MAC addresses of network gateways
- **Application tracking**: Full app details including file paths, window titles, URLs
- **Productivity scoring**: Numeric productivity rating (1-3, where higher seems less productive)
- **Project/Task linking**: Each screenshot belongs to a project and task
- **Processing status**: `processed` flag indicates if screenshot has been analyzed
- **Employee information**: Full employee details included in each screenshot
- **Pagination**: Uses hash-based pagination with `next` parameter

### Special Requirements:
- **Network gateway tracking** - MAC addresses of network access points
- **Application monitoring** - Detailed app information including file paths
- **URL/Document tracking** - Web pages and document names being viewed
- **Productivity analysis** - Numeric scoring system for activities
- **Window management** - Track specific application windows via `windowId`
- **Screenshot storage** - `link` field (empty in examples, likely contains actual image URL)
- **Site categorization** - Automatic extraction of site domains from URLs

### Critical Features for Assignment:
- **Hardware identification** via `hwid` field (essential for fraud prevention)
- **Network tracking** via `gateways` (MAC addresses for location verification)
- **Application monitoring** for productivity verification
- **Timezone handling** for accurate time reporting
- **Project/Task association** for proper billing

### Missing Information:
- **Image data format** - Actual screenshot images not shown in response
- **Permission flags** - Not explicitly shown, may need additional research
- **Upload endpoint** - No POST endpoint provided for uploading screenshots
- **Image storage** - `link` field suggests external image storage

**Note**: This API appears to be analytics/retrieval focused. There may be separate endpoints for uploading screenshots from the desktop application that weren't provided in this contract documentation.

---

## 6. Authentication/Authorization ❌

### Required Endpoints:
```
POST   /api/v1/auth/login      - Employee login
POST   /api/v1/auth/logout     - Employee logout
POST   /api/v1/auth/refresh    - Refresh token
GET    /api/v1/auth/me         - Get current user

# API Token Management (for system integration)
POST   /api/v1/auth/api-tokens - Generate API token
GET    /api/v1/auth/api-tokens - List API tokens
DELETE /api/v1/auth/api-tokens/{id} - Revoke token
```

### Contract Details:
*To be filled with exact Insightful specifications*

---

## 📋 Implementation Checklist

### Priority 1 - Core Functionality
- [ ] Employee creation and invitation flow
- [ ] Employee activation endpoint
- [ ] Time tracking start/stop
- [ ] Time entries retrieval
- [ ] Basic authentication

### Priority 2 - Essential Features
- [ ] Project management
- [ ] Task creation (with 1:1 project mapping)
- [ ] Employee-project assignment
- [ ] Screenshot upload
- [ ] Permission flags for screenshots

### Priority 3 - Full Compatibility
- [ ] All CRUD operations for each entity
- [ ] Filtering and pagination
- [ ] Complete error handling
- [ ] Full Insightful API compatibility

---

## 🔗 Insightful API Documentation Reference
- Base Documentation: https://developers.insightful.io
- Postman Collection: *To be added*
- API Version: *To be confirmed*

---

## 📝 Notes for Implementation

1. **Exact Contract Match**: Every endpoint must match Insightful's contract exactly for plug-n-play compatibility
2. **Response Format**: Must match Insightful's response structure precisely
3. **Error Codes**: Should use same error codes and messages as Insightful
4. **Authentication**: Needs to support both JWT (for employees) and API tokens (for system integration)
5. **Timezone Handling**: Store in UTC, convert based on request headers/params

---

## 🚨 Questions to Clarify

1. Exact base path - is it `/api/v1/` or just `/v1/`?
2. Authentication header format - Bearer token? API key?
3. Pagination format - page/limit or offset/limit?
4. Date format - ISO 8601?
5. Error response structure
6. Rate limiting requirements

---

## Updates Log

- **[Date]** - Initial document created, waiting for Insightful API contract details
- *Updates will be logged here as we receive API specifications*

---

**Next Steps:**
Please share the Insightful API contract details one by one, and I will update this document with the exact specifications for each endpoint.
