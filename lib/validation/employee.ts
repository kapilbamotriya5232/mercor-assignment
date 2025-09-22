import { z } from 'zod';

/**
 * Employee creation request validation (Insightful compatible)
 */
export const createEmployeeSchema = z.object({
  name: z.string().min(1, "The 'name' field is required!"),
  email: z.string().email("Invalid email address"),
  teamId: z.string().min(1, "The 'teamId' field is required!"),
  sharedSettingsId: z.string().min(1, "The 'sharedSettingsId' field is required!"),
});

export type CreateEmployeeRequest = z.infer<typeof createEmployeeSchema>;

/**
 * Employee update request validation (Insightful compatible)
 */
export const updateEmployeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  teamId: z.string().min(1).optional(),
  sharedSettingsId: z.string().min(1).optional(),
  accountId: z.string().optional(),
  identifier: z.string().optional(),
  type: z.string().optional(),
  organizationId: z.string().optional(),
  projects: z.array(z.string()).optional(),
  deactivated: z.number().optional(),
  invited: z.number().optional(),
  createdAt: z.number().optional(),
});

export type UpdateEmployeeRequest = z.infer<typeof updateEmployeeSchema>;

/**
 * Employee response schema (Insightful compatible)
 */
export const employeeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  teamId: z.string(),
  sharedSettingsId: z.string(),
  accountId: z.string(),
  identifier: z.string(),
  type: z.string(),
  organizationId: z.string(),
  projects: z.array(z.string()),
  deactivated: z.number(),
  invited: z.number(),
  createdAt: z.number(),
});

export type EmployeeResponse = z.infer<typeof employeeResponseSchema>;

/**
 * Employee list response schema
 */
export const employeeListResponseSchema = z.array(employeeResponseSchema);

export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;

/**
 * Insightful validation error response schema
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
 * Not found error schema
 */
export const notFoundErrorSchema = z.object({
  type: z.literal("NOT_FOUND"),
  message: z.string(),
});

export type NotFoundErrorResponse = z.infer<typeof notFoundErrorSchema>;

/**
 * Conflict error schema (for already deactivated)
 */
export const conflictErrorSchema = z.object({
  message: z.string(),
});

export type ConflictErrorResponse = z.infer<typeof conflictErrorSchema>;

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
export function createEntityNotFoundError(message: string = "Employee doesn't exist."): EntityNotFoundResponse {
  return {
    type: "EntityNotFound",
    message,
  };
}

/**
 * Helper function to create not found error
 */
export function createNotFoundError(message: string = "Not found"): NotFoundErrorResponse {
  return {
    type: "NOT_FOUND",
    message,
  };
}

/**
 * Helper function to create conflict error
 */
export function createConflictError(message: string): ConflictErrorResponse {
  return {
    message,
  };
}

/**
 * Validate employee ID format (15 characters)
 */
export const employeeIdSchema = z.string().length(15, "The 'id' field length must be 15 characters long!");

/**
 * Helper function to validate employee ID
 */
export function validateEmployeeId(id: string): { isValid: boolean; error?: ValidationErrorResponse } {
  const result = employeeIdSchema.safeParse(id);
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
