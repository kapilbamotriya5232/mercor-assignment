# Revised Internal API Implementation Plan (v2) - [COMPLETED]

This plan outlines the backend changes required to build a robust, server-authoritative time tracking system with inactivity logging. It incorporates user feedback for a more efficient and data-rich implementation.

### Core Strategy
- **Server-Authoritative State**: The server remains the single source of truth for active time-tracking windows.
- **Client Heartbeat**: The desktop app will periodically send system data to a new endpoint, which serves as a heartbeat.
- **Inactivity Logging**: A non-destructive cron job will log periods of inactivity by recording missed heartbeats, rather than terminating sessions prematurely.

---

### Phase 1: Database Schema Modifications - [✅ COMPLETE]

**File:** `prisma/schema.prisma`
**Status:** Implemented.

1.  **Update `Window` Model:**
    -   `lastHeartbeat`: Changed to `BigInt?` to store a precise Unix timestamp in milliseconds.
    -   `missedScreenshots`: Added a `Json?` field to store an array of Unix timestamps.

2.  **Define `Screenshot` Model:**
    -   Created a new model to store screenshot metadata, which also functions as the heartbeat record.
    -   Added a relation back to the `Window` model.

**Implementation Notes:**
- A new migration `20250923055119_add_heartbeat_and_screenshot_models` was created and applied to the database.
- The database was reset to resolve a schema drift issue before applying the final migration.

---

### Phase 2: API Endpoint Implementation - [✅ COMPLETE]

**Status:** Implemented.

1.  **Leverage Existing `/api/internal/window/current` Endpoint**
    -   **File:** `app/api/internal/window/current/route.ts`
    -   **Action:** No changes were needed. This endpoint was confirmed to be suitable for the desktop app's state restoration on startup.

2.  **Create Internal Screenshot Upload Endpoint (Heartbeat)**
    -   **File:** `app/api/internal/screenshot/upload/route.ts`
    -   **Method:** `POST`
    -   **Implementation Notes:**
        -   Endpoint created and secured for employee-only access.
        -   It accepts a `windowId` and system info.
        -   Uses a database transaction to create a `Screenshot` record and update the `lastHeartbeat` on the corresponding `Window`.
        -   Initial implementation had several TypeScript errors related to Zod validation, missing `auth` properties, and missing required fields in the `create` call. These were iteratively debugged and fixed.

---

### Phase 3: Implement Inactivity Logging Cron Job - [✅ COMPLETE]

**Status:** Implemented.

1.  **Configure Cron Job (`vercel.json`):**
    -   Added a cron job definition to run every 10 minutes, targeting the new endpoint.

2.  **Create Cron Job Endpoint:**
    -   **File:** `app/api/internal/cron/log-inactivity/route.ts`
    -   **Implementation Notes:**
        -   Endpoint created with a simple bearer token authorization check using `CRON_SECRET`.
        -   The logic correctly finds active windows with a `lastHeartbeat` older than 15 minutes.
        -   It appends the current timestamp to the `missedScreenshots` array and updates the `lastHeartbeat` to prevent duplicate logging in subsequent runs.
