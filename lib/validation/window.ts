import { z } from 'zod';

// ==================== VALIDATION ERROR TYPES ====================

export interface ValidationErrorDetail {
  type: string;
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  type: 'VALIDATION_ERROR';
  message: string;
  details: ValidationErrorDetail[];
}

export interface EntityNotFoundResponse {
  type: 'EntityNotFound' | 'NOT_FOUND';
  message: string;
}

// ==================== QUERY SCHEMAS ====================

// Query parameters for GET /api/v1/analytics/window
export const windowQuerySchema = z.object({
  start: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, {
      message: "Start time must be a valid Unix timestamp in milliseconds"
    }),
  end: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, {
      message: "End time must be a valid Unix timestamp in milliseconds"
    }),
  timezone: z.string().optional(),
  employeeId: z.string().length(15).optional(),
  teamId: z.string().length(15).optional(),
  projectId: z.string().length(15).optional(),
  taskId: z.string().length(15).optional(),
  shiftId: z.string().uuid().optional(),
});

// Query parameters for GET /api/v1/analytics/project-time
export const projectTimeQuerySchema = windowQuerySchema;

// ==================== INTERNAL API SCHEMAS ====================

// POST /api/internal/window/start
export const startWindowSchema = z.object({
  projectId: z.string().length(15, "Project ID must be exactly 15 characters"),
  taskId: z.string().length(15, "Task ID must be exactly 15 characters"),
  type: z.enum(['manual', 'tracked']).default('manual'),
  note: z.string().default(''),
  
  // System information (required from desktop app)
  computer: z.string().min(1, "Computer name is required"),
  domain: z.string().default(''),
  hwid: z.string().min(1, "Hardware ID is required"),
  os: z.string().min(1, "Operating system is required"),
  osVersion: z.string().min(1, "OS version is required"),
  timezoneOffset: z.number().default(0),
  
  // Optional
  shiftId: z.string().uuid().optional(),
});

// PUT /api/internal/window/stop
export const stopWindowSchema = z.object({
  endTime: z.number().optional(),
  note: z.string().optional(),
  deletedScreenshots: z.number().min(0).default(0),
});

// POST /api/internal/window/bulk
export const bulkWindowSchema = z.object({
  windows: z.array(z.object({
    start: z.number().min(1, "Start time is required"),
    end: z.number().min(1, "End time is required"),
    projectId: z.string().length(15),
    taskId: z.string().length(15),
    type: z.enum(['manual', 'tracked']).default('manual'),
    note: z.string().default(''),
    computer: z.string().min(1),
    domain: z.string().default(''),
    hwid: z.string().min(1),
    os: z.string().min(1),
    osVersion: z.string().min(1),
    timezoneOffset: z.number().default(0),
    shiftId: z.string().uuid().optional(),
    deletedScreenshots: z.number().min(0).default(0),
  }))
});

// ==================== RESPONSE TYPES ====================

// Window response format (Insightful-compatible)
export interface WindowResponse {
  id: string;
  type: string;
  note: string;
  start: number;
  end: number;
  timezoneOffset: number;
  shiftId: string;
  projectId: string;
  taskId: string;
  paid: boolean;
  billable: boolean;
  overtime: boolean;
  billRate: number;
  overtimeBillRate: number;
  payRate: number;
  overtimePayRate: number;
  taskStatus: string | null;
  taskPriority: string | null;
  user: string;
  computer: string;
  domain: string;
  name: string;
  hwid: string;
  os: string;
  osVersion: string;
  processed: boolean;
  createdAt: string;
  updatedAt: string;
  employeeId: string;
  teamId: string;
  sharedSettingsId: string;
  organizationId: string;
  startTranslated: number;
  endTranslated: number;
  negativeTime: number;
  deletedScreenshots: number;
  _index: string;
}

// Project time response format
export interface ProjectTimeResponse {
  id: string;
  time: number;
  costs: number;
  income: number;
}

// Internal API response types
export interface StartWindowResponse {
  windowId: string;
  shiftId: string;
  startTime: number;
  status: 'started';
}

export interface StopWindowResponse {
  windowId: string;
  duration: number;
  billableAmount: number;
  status: 'stopped';
}

export interface CurrentWindowResponse {
  active: boolean;
  window?: {
    id: string;
    projectId: string;
    taskId: string;
    projectName: string;
    taskName: string;
    start: number;
    duration: number;
    shiftId: string;
  };
}

export interface EmployeeAssignmentsResponse {
  projects: Array<{
    id: string;
    name: string;
    billable: boolean;
    tasks: Array<{
      id: string;
      name: string;
      status: string;
      priority: string;
      windows: Array<{
        id: string;
        start: number;
        end: number | null;
        duration: number;
        shiftId: string;
        note: string;
        computer: string;
        os: string;
        osVersion: string;
        createdAt: string;
      }>;
      totalTimeWorked: number; // Total duration in milliseconds
    }>;
  }>;
}

// ==================== TYPE GUARDS ====================

export type StartWindowRequest = z.infer<typeof startWindowSchema>;
export type StopWindowRequest = z.infer<typeof stopWindowSchema>;
export type BulkWindowRequest = z.infer<typeof bulkWindowSchema>;
export type WindowQueryParams = z.infer<typeof windowQuerySchema>;
export type ProjectTimeQueryParams = z.infer<typeof projectTimeQuerySchema>;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create a validation error response
 */
export function createValidationError(
  field: string,
  message: string,
  type: string = 'required'
): ValidationErrorResponse {
  return {
    type: 'VALIDATION_ERROR',
    message: 'Parameters validation error!',
    details: [
      {
        type,
        field,
        message: message || `The '${field}' field is required!`,
      },
    ],
  };
}

/**
 * Create an entity not found error response
 */
export function createEntityNotFoundError(message: string): EntityNotFoundResponse {
  return {
    type: 'EntityNotFound',
    message,
  };
}

/**
 * Create a conflict error response
 */
export function createConflictError(message: string): { message: string } {
  return {
    message,
  };
}
