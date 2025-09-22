import { z } from 'zod';

/**
 * Payroll configuration schema for tasks
 */
export const taskPayrollSchema = z.object({
  billRate: z.number(),
  overtimeBillRate: z.number(), // Note: uppercase 'R' for tasks (different from projects)
});

/**
 * Task creation request validation (Insightful compatible)
 */
export const createTaskSchema = z.object({
  name: z.string().min(1, "The 'name' field is required!"),
  projectId: z.string().length(15, "The 'projectId' field must be exactly 15 characters!"),
  employees: z.array(z.string()).min(1, "The 'employees' field must have at least one employee!"),
  description: z.string().optional(),
  status: z.string().optional().default("To Do"),
  priority: z.string().optional().default("low"),
  billable: z.boolean().optional().default(true),
  payroll: taskPayrollSchema.optional(),
  deadline: z.number().optional(), // Unix timestamp in milliseconds
  labels: z.array(z.string()).optional(),
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;

/**
 * Task update request validation (Insightful compatible)
 */
export const updateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  employees: z.array(z.string()).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  billable: z.boolean().optional(),
  payroll: taskPayrollSchema.optional(),
  deadline: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;

/**
 * Task response schema (Insightful compatible)
 */
export const taskResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  priority: z.string(),
  billable: z.boolean(),
  name: z.string(),
  projectId: z.string(),
  employees: z.array(z.string()),
  description: z.string().optional(),
  creatorId: z.string(),
  organizationId: z.string(),
  teams: z.array(z.string()),
  createdAt: z.number(), // Unix timestamp in milliseconds
  deadline: z.number().optional(),
  labels: z.array(z.string()).optional(),
  payroll: taskPayrollSchema.optional(),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;

/**
 * Task list response schema
 */
export const taskListResponseSchema = z.array(taskResponseSchema);

export type TaskListResponse = z.infer<typeof taskListResponseSchema>;

/**
 * Insightful validation error response schema (reuse from project/employee)
 */
export const validationErrorSchema = z.object({
  type: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  details: z.array(z.object({
    type: z.string(),
    field: z.string(),
    message: z.string(),
    expected: z.union([z.string(), z.number()]).optional(),
    actual: z.union([z.string(), z.number()]).optional(),
  })),
});

export type ValidationErrorResponse = z.infer<typeof validationErrorSchema>;

/**
 * Entity not found error schema
 */
export const entityNotFoundSchema = z.object({
  type: z.literal("EntityNotFound"),
  message: z.string(),
});

export type EntityNotFoundResponse = z.infer<typeof entityNotFoundSchema>;

/**
 * Helper function to create validation error response
 */
export function createValidationError(
  field: string,
  message: string,
  type: string = "required",
  expected?: string | number,
  actual?: string | number
): ValidationErrorResponse {
  return {
    type: "VALIDATION_ERROR",
    message: "Parameters validation error!",
    details: [
      {
        type,
        field,
        message,
        ...(expected !== undefined && { expected }),
        ...(actual !== undefined && { actual }),
      },
    ],
  };
}

/**
 * Helper function to create entity not found error
 */
export function createEntityNotFoundError(message: string = "Task doesn't exist."): EntityNotFoundResponse {
  return {
    type: "EntityNotFound",
    message,
  };
}

/**
 * Validate task ID format (15 characters)
 */
export const taskIdSchema = z.string().length(15, "The 'id' field length must be 15 characters long!");

/**
 * Helper function to validate task ID
 */
export function validateTaskId(id: string): { isValid: boolean; error?: ValidationErrorResponse } {
  const result = taskIdSchema.safeParse(id);
  if (!result.success) {
    return {
      isValid: false,
      error: {
        type: "VALIDATION_ERROR",
        message: "Parameters validation error!",
        details: [
          {
            type: "stringLength",
            field: "id",
            message: "The 'id' field length must be 15 characters long!",
            expected: 15,
            actual: id.length,
          },
        ],
      },
    };
  }
  return { isValid: true };
}