# Revised Electron Desktop App Implementation Plan (v2) - [COMPLETED]

This plan details the client-side changes required to create a robust and state-aware time tracking application. It aligns with the revised Internal API plan (v2) and incorporates user feedback for a more efficient implementation.

### Core Strategy
- **Decoupled State Initialization**: The app fetches its two primary pieces of state—available assignments and the current tracking status—in parallel on startup.
- **Server-Authoritative UI**: The UI state is dictated entirely by the response from the `/api/internal/window/current` endpoint.
- **Reliable Heartbeat**: A consistent background timer ensures the server is kept aware of the app's active state.
- **State Synchronization**: The renderer process communicates with the main process to keep the local `electron-store` in sync, preventing state inconsistencies.

---

### Phase 1: Robust State Management on Application Load - [✅ COMPLETE]

**Files:**
- `desktop-app/src/renderer/pages/Main.tsx`

**Status:** Implemented.

**Logic:**
1.  **Concurrent Data Fetching:** The `useEffect` hook on mount was refactored to use `Promise.all`, fetching assignments and the current window status simultaneously for better performance.

2.  **State Hydration & Bug Fixes:**
    -   The logic was corrected to properly parse the nested `window` object from the `/api/internal/window/current` response, fixing the state restoration bug.
    -   The `startTimer` function was corrected to use `response.windowId` and `response.startTime` (instead of `id` and `start`), fixing the "failed to start timer" error.

---

### Phase 2: Implement Heartbeat & State Sync - [✅ COMPLETE]

**Files:**
- `desktop-app/src/renderer/pages/Main.tsx`
- `desktop-app/src/preload/preload.ts`
- `desktop-app/src/main/main.ts`
- `desktop-app/src/main/api-client.ts`

**Status:** Implemented.

**Logic:**
1.  **Heartbeat Interval:**
    -   A `useEffect` hook was added to `Main.tsx` that triggers on changes to `activeSession`.
    -   When a session becomes active, it starts a `setInterval` that calls `window.electronAPI.sendHeartbeat` every 10 minutes.
    -   The interval is correctly cleared when the session stops or the component unmounts.

2.  **IPC Channel Implementation:**
    -   A `timer:heartbeat` IPC channel was added to the preload script and the main process.
    -   The handler in `main.ts` collects system info and calls the `apiClient`.

3.  **API Client Method:**
    -   A `sendHeartbeat` method was added to `api-client.ts`.
    -   **Bug Fix:** A `TypeError` for `BigInt` serialization was fixed by converting the timestamp to a string (`Date.now().toString()`) before sending it via Axios.

4.  **Stop Timer Bug Fix:**
    -   A `timer:sync` IPC channel was added to the preload script and main process.
    -   The renderer now calls `syncActiveWindow` when it restores a session from the API.
    -   The handler in `main.ts` updates the `currentWindow` in the `electron-store`. This ensures that if the user reloads the app and then clicks "Stop", the main process has the correct `windowId` to send to the API.
