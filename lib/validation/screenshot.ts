import { z } from 'zod';

export interface ValidationErrorResponse {
  type: 'VALIDATION_ERROR';
  message: string;
  details: Array<{
    type: string;
    field: string;
    message: string;
  }>;
}

export function createValidationError(
  field: string,
  message: string,
  type = 'invalid_type'
): ValidationErrorResponse {
  return {
    type: 'VALIDATION_ERROR',
    message: 'Parameters validation error!',
    details: [
      {
        type,
        field,
        message,
      },
    ],
  };
}

export const screenshotQuerySchema = z.object({
  start: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Start must be a valid Unix timestamp in milliseconds',
  }),
  end: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'End must be a valid Unix timestamp in milliseconds',
  }),
  limit: z.string().optional().default('15'),
});

export const screenshotPaginateQuerySchema = z.object({
  start: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Start must be a valid Unix timestamp in milliseconds',
  }),
  end: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'End must be a valid Unix timestamp in milliseconds',
  }),
  timezone: z.string().optional(),
  taskId: z.string().optional(),
  shiftId: z.string().optional(),
  projectId: z.string().optional(),
  sortBy: z.string().optional(),
  limit: z.string().optional().default('10000'),
  next: z.string().optional(),
});

export const validateScreenshotId = (id: string) => {
  if (!id || typeof id !== 'string') {
    return createValidationError('id', 'Screenshot ID is required', 'required');
  }
  return null;
};
