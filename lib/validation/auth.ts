import { z } from 'zod';

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Token validation request
 */
export const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type ValidateTokenRequest = z.infer<typeof validateTokenSchema>;

/**
 * API token creation request
 */
export const createApiTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  permissions: z.array(z.string()).optional().default([]),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export type CreateApiTokenRequest = z.infer<typeof createApiTokenSchema>;

/**
 * Employee activation request
 */
export const activateAccountSchema = z.object({
  token: z.string().min(1, 'Activation token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  name: z.string().min(1, 'Name is required'),
});

export type ActivateAccountRequest = z.infer<typeof activateAccountSchema>;

/**
 * Password reset request
 */
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RequestPasswordResetRequest = z.infer<typeof requestPasswordResetSchema>;

/**
 * Reset password request
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

/**
 * Change password request (for logged-in users)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

/**
 * Refresh token request
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

/**
 * Response schemas for Swagger documentation
 */
export const authResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  refreshToken: z.string().optional(),
  employee: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
    organizationId: z.string(),
  }).optional(),
});

export const apiTokenResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  apiToken: z.object({
    id: z.string(),
    name: z.string(),
    lastFourChars: z.string(),
    permissions: z.array(z.string()),
    expiresAt: z.string().nullable(),
  }).optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});
