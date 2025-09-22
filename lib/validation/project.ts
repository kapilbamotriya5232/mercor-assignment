import { z } from 'zod';

/**
 * Payroll configuration schema
 */
export const payrollSchema = z.object({
  billRate: z.number(),
  overtimeBillrate: z.number(), // Note: lowercase 'r' to match Insightful
});

/**
 * Screenshot settings schema
 */
export const screenshotSettingsSchema = z.object({
  frequency: z.number().optional(),
  enabled: z.boolean().optional(),
  blur: z.boolean().optional(),
});

/**
 * Project creation request validation (Insightful compatible)
 */
export const createProjectSchema = z.object({
  name: z.string().min(1, "The 'name' field is required!"),
  description: z.string().optional(),
  employees: z.array(z.string()).min(1, "The 'employees' field must have at least one employee!"),
  statuses: z.array(z.string()).optional().default(["To do", "On hold", "In progress", "Done"]),
  priorities: z.array(z.string()).optional().default(["low", "medium", "high"]),
  billable: z.boolean().optional().default(true),
  payroll: payrollSchema.optional(),
  deadline: z.number().optional(), // Unix timestamp in milliseconds
  screenshotSettings: screenshotSettingsSchema.optional(),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

/**
 * Project update request validation (Insightful compatible)
 */
export const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  employees: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  priorities: z.array(z.string()).optional(),
  billable: z.boolean().optional(),
  payroll: payrollSchema.optional(),
  deadline: z.number().optional(),
  screenshotSettings: screenshotSettingsSchema.optional(),
  archived: z.boolean().optional(),
});

export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;

/**
 * Project response schema (Insightful compatible)
 */
export const projectResponseSchema = z.object({
  id: z.string(),
  archived: z.boolean(),
  statuses: z.array(z.string()),
  priorities: z.array(z.string()),
  billable: z.boolean(),
  payroll: payrollSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
  employees: z.array(z.string()),
  creatorId: z.string(),
  organizationId: z.string(),
  teams: z.array(z.string()),
  createdAt: z.number(), // Unix timestamp in milliseconds
  deadline: z.number().optional(),
  screenshotSettings: screenshotSettingsSchema.optional(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

/**
 * Project list response schema
 */
export const projectListResponseSchema = z.array(projectResponseSchema);

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;

/**
 * Insightful validation error response schema (reuse from employee)
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
export function createEntityNotFoundError(message: string = "Project doesn't exist."): EntityNotFoundResponse {
  return {
    type: "EntityNotFound",
    message,
  };
}

/**
 * Validate project ID format (15 characters)
 */
export const projectIdSchema = z.string().length(15, "The 'id' field length must be 15 characters long!");

/**
 * Helper function to validate project ID
 */
export function validateProjectId(id: string): { isValid: boolean; error?: ValidationErrorResponse } {
  const result = projectIdSchema.safeParse(id);
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