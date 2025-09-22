# 🖥️ Electron Desktop Application Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for the macOS desktop application that integrates with the existing time tracking API infrastructure. The app will allow employees to authenticate, view their assigned projects/tasks, and track time with a simple start/stop interface.

## 🎯 Current API Infrastructure

### ✅ Available APIs for Desktop App:

**Authentication:**
- `POST /api/auth/login` - Employee login (returns 30-day JWT)
- `GET /api/auth/validate` - Validate JWT token

**Internal Desktop APIs:**
- `GET /api/internal/employee/assignments` - Get employee's projects/tasks
- `GET /api/internal/window/current` - Check active time session
- `POST /api/internal/window/start` - Start time tracking
- `PUT /api/internal/window/stop/[windowId]` - Stop time tracking

**Public Analytics APIs (for Mercor):**
- `GET /api/v1/analytics/window` - Get time entries
- `GET /api/v1/analytics/project-time` - Get project time data

---

## 🏗️ Phase 1: Core Application Setup (Hours 0-8)

### 1.1 Project Structure
```
desktop-app/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # App entry point
│   │   ├── window.ts        # Window management
│   │   └── tray.ts          # System tray
│   ├── renderer/            # React frontend
│   │   ├── components/      # UI components
│   │   ├── pages/          # App pages
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilities
│   ├── preload/            # Preload scripts
│   │   └── preload.ts      # Secure IPC bridge
│   └── shared/             # Shared types
│       └── types.ts        # TypeScript interfaces
├── assets/                 # App icons, images
├── dist/                  # Built app
└── package.json
```

### 1.2 Dependencies
```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "electron-store": "^8.1.0",
    "date-fns": "^2.30.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "electron-builder": "^24.6.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

### 1.3 Core Features

**Authentication System:**
- Login form with email/password
- JWT token storage in `electron-store`
- Auto-login on app startup
- Token validation and refresh

**API Client Implementation:**
```typescript
// src/renderer/utils/api.ts
class ApiClient {
  private baseURL = 'https://your-api-domain.com';
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await axios.post(`${this.baseURL}/api/auth/login`, {
      email, password
    });
    this.token = response.data.token;
    return response.data;
  }

  async getAssignments() {
    return axios.get(`${this.baseURL}/api/internal/employee/assignments`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  async startWindow(projectId: string, taskId: string, systemInfo: SystemInfo) {
    return axios.post(`${this.baseURL}/api/internal/window/start`, {
      projectId, taskId, ...systemInfo
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  async stopWindow(windowId: string) {
    return axios.put(`${this.baseURL}/api/internal/window/stop/${windowId}`, {}, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }
}
```

---

## 🎨 Phase 2: UI & Time Tracking (Hours 8-16)

### 2.1 Login Screen
```typescript
// src/renderer/pages/Login.tsx
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await apiClient.login(email, password);
      // Navigate to main app
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Time Tracker</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

### 2.2 Main Timer Interface
```typescript
// src/renderer/pages/Main.tsx
const Main = () => {
  const [assignments, setAssignments] = useState<Project[]>([]);
  const [currentWindow, setCurrentWindow] = useState<Window | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    loadAssignments();
    checkCurrentWindow();
  }, []);

  useEffect(() => {
    if (currentWindow) {
      const interval = setInterval(() => {
        setTimer(Date.now() - currentWindow.start);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentWindow]);

  const handleStart = async () => {
    if (!selectedProject || !selectedTask) return;
    
    const systemInfo = await collectSystemInfo();
    const response = await apiClient.startWindow(
      selectedProject.id,
      selectedTask.id,
      systemInfo
    );
    setCurrentWindow(response.data);
  };

  const handleStop = async () => {
    if (!currentWindow) return;
    
    await apiClient.stopWindow(currentWindow.id);
    setCurrentWindow(null);
    setTimer(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Time Tracker</h1>
        
        {/* Project/Task Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Project & Task</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProject(assignments.find(p => p.id === e.target.value) || null)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Select Project</option>
              {assignments.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedTask?.id || ''}
              onChange={(e) => setSelectedTask(selectedProject?.tasks.find(t => t.id === e.target.value) || null)}
              className="px-3 py-2 border rounded-md"
              disabled={!selectedProject}
            >
              <option value="">Select Task</option>
              {selectedProject?.tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-mono mb-4">
              {formatTime(timer)}
            </div>
            <div className="text-gray-600 mb-4">
              {currentWindow ? 'Currently tracking' : 'Not tracking'}
            </div>
            <button
              onClick={currentWindow ? handleStop : handleStart}
              disabled={!selectedProject || !selectedTask}
              className={`px-8 py-3 rounded-lg font-semibold ${
                currentWindow
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:bg-gray-400`}
            >
              {currentWindow ? 'Stop Timer' : 'Start Timer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2.3 System Information Collection
```typescript
// src/renderer/utils/system.ts
export const collectSystemInfo = async (): Promise<SystemInfo> => {
  const os = require('os');
  
  return {
    computer: os.hostname(),
    domain: os.hostname().includes('.') ? os.hostname() : undefined,
    hwid: await getHardwareId(),
    os: process.platform,
    osVersion: os.release(),
    timezoneOffset: new Date().getTimezoneOffset() * 60000
  };
};

const getHardwareId = async (): Promise<string> => {
  const networkInterfaces = require('os').networkInterfaces();
  const mac = Object.values(networkInterfaces)
    .flat()
    .find(iface => iface && !iface.internal && iface.mac !== '00:00:00:00:00:00')
    ?.mac;
  
  return mac || 'unknown';
};
```

---

## 🚀 Phase 3: Advanced Features (Hours 16-24)

### 3.1 App Lifecycle Management

**System Tray Integration:**
```typescript
// src/main/tray.ts
export class SystemTray {
  private tray: Tray;
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createTray();
  }

  private createTray() {
    const iconPath = path.join(__dirname, '../assets/tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    this.tray = new Tray(icon);
    this.tray.setToolTip('Time Tracker');
    this.updateMenu();
  }

  private updateMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => this.mainWindow.show()
      },
      {
        label: 'Start Timer',
        click: () => this.sendToRenderer('start-timer')
      },
      {
        label: 'Stop Timer',
        click: () => this.sendToRenderer('stop-timer')
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }
}
```

**App Lifecycle Handling:**
```typescript
// src/main/main.ts
app.on('window-all-closed', (event) => {
  event.preventDefault();
  mainWindow.hide(); // Hide to system tray
});

app.on('before-quit', async (event) => {
  const hasActiveTimer = await checkActiveTimer();
  
  if (hasActiveTimer) {
    event.preventDefault();
    
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Stop Timer & Quit', 'Cancel'],
      defaultId: 0,
      message: 'You have an active timer. Do you want to stop it and quit?'
    });
    
    if (result.response === 0) {
      await stopActiveTimer();
      app.quit();
    }
  }
});
```

### 3.2 Data Persistence
```typescript
// src/renderer/utils/storage.ts
export class AppStorage {
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'time-tracker',
      defaults: {
        token: null,
        user: null,
        assignments: [],
        currentWindow: null,
        settings: {
          autoStart: false,
          screenshotInterval: 10
        }
      }
    });
  }

  setToken(token: string) {
    this.store.set('token', token);
  }

  getToken(): string | null {
    return this.store.get('token') as string | null;
  }

  setCurrentWindow(window: Window | null) {
    this.store.set('currentWindow', window);
  }

  getCurrentWindow(): Window | null {
    return this.store.get('currentWindow') as Window | null;
  }
}
```

### 3.3 Screenshot Capture (Future)
```typescript
// src/renderer/utils/screenshot.ts
export class ScreenshotCapture {
  private intervalId: NodeJS.Timeout | null = null;
  private isCapturing = false;

  async startCapture(intervalMinutes: number = 10) {
    if (this.isCapturing) return;
    
    this.isCapturing = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.captureScreenshot();
      } catch (error) {
        console.error('Screenshot capture failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  stopCapture() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCapturing = false;
  }

  private async captureScreenshot(): Promise<void> {
    // Implementation when screenshot API is ready
    console.log('Screenshot capture triggered');
  }
}
```

---

## 📅 Implementation Timeline

### **Phase 1 (Hours 0-8): Foundation**
- [ ] Setup Electron project with TypeScript + React
- [ ] Implement authentication system
- [ ] Create API client for all endpoints
- [ ] Basic app structure and navigation

### **Phase 2 (Hours 8-16): Core Features**
- [ ] Build login and main UI components
- [ ] Implement project/task selection
- [ ] Create timer interface with start/stop
- [ ] System information collection
- [ ] Basic error handling

### **Phase 3 (Hours 16-24): Polish & Advanced**
- [ ] System tray integration
- [ ] App lifecycle management
- [ ] Offline handling and data persistence
- [ ] Screenshot capture (when API ready)
- [ ] App packaging as .dmg

---

## 🔧 Key Technical Decisions

### **Authentication Flow:**
1. User enters email/password
2. App calls `POST /api/auth/login`
3. JWT token stored in `electron-store`
4. Token used for all subsequent API calls
5. Auto-login on app startup if valid token exists

### **Timer Management:**
1. User selects project/task
2. App calls `POST /api/internal/window/start` with system info
3. Timer starts locally and updates every second
4. On stop, calls `PUT /api/internal/window/stop/[windowId]`
5. App handles app close by checking for active timers

### **System Information:**
- **Computer Name**: `os.hostname()`
- **Hardware ID**: MAC address from network interfaces
- **OS**: `process.platform` (darwin for macOS)
- **OS Version**: `os.release()`
- **Timezone**: `new Date().getTimezoneOffset()`

### **App Lifecycle:**
- **Minimize to Tray**: App stays running in background
- **Close Handling**: Check for active timer, show confirmation
- **Auto-start**: Optional setting to start with system
- **System Tray**: Quick access to start/stop timer

---

## 🎯 Success Criteria

### **Must-Have Features:**
- [ ] Employee can login with email/password
- [ ] Employee can view assigned projects/tasks
- [ ] Employee can start/stop time tracking
- [ ] Time entries are saved to database via API
- [ ] App handles graceful shutdown with active timers
- [ ] System tray integration for background operation

### **Nice-to-Have Features:**
- [ ] Screenshot capture (when API ready)
- [ ] Offline mode with sync
- [ ] Auto-start with system
- [ ] Dark/light theme toggle
- [ ] Time tracking history view

---

## 🚨 Risk Mitigation

### **Potential Issues:**
1. **macOS Permissions**: Request screen recording permission early
2. **Network Connectivity**: Handle offline scenarios gracefully
3. **App Store Guidelines**: Ensure compliance for distribution
4. **Memory Usage**: Optimize for long-running background operation
5. **Battery Impact**: Minimize resource usage when idle

### **Solutions:**
- Implement proper permission handling
- Add offline queue for API calls
- Use electron-builder for distribution
- Optimize React rendering and memory usage
- Implement smart polling intervals

---

## 📦 Distribution

### **Packaging:**
```json
{
  "build": {
    "appId": "com.mercor.timetracker",
    "productName": "Mercor Time Tracker",
    "directories": {
      "output": "dist"
    },
    "mac": {
      "category": "public.app-category.productivity",
      "target": "dmg"
    }
  }
}
```

### **Build Commands:**
```bash
# Development
npm run dev

# Build for production
npm run build

# Package as .dmg
npm run dist
```

This implementation provides a solid foundation for the desktop application that integrates seamlessly with the existing API infrastructure while providing a clean, user-friendly interface for time tracking.
