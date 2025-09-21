import crypto from 'crypto';
import { prisma } from '../db';
import { ApiToken } from '../../app/generated/prisma';

const API_TOKEN_PREFIX = 'mrc_'; // Prefix for API tokens
const TOKEN_LENGTH = 32; // Length of the random part

/**
 * Generate a new API token
 */
export function generateAPIToken(): string {
  const randomToken = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  return `${API_TOKEN_PREFIX}${randomToken}`;
}

/**
 * Hash an API token for storage
 */
export function hashAPIToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get last 4 characters of token for identification
 */
export function getLastFourChars(token: string): string {
  return token.slice(-4);
}

/**
 * Create a new API token in the database
 */
export async function createAPIToken(
  organizationId: string,
  name: string,
  permissions: string[] = [],
  expiresIn?: number // Optional expiry in days
): Promise<{ token: string; apiToken: ApiToken }> {
  const token = generateAPIToken();
  const hashedToken = hashAPIToken(token);
  const lastFourChars = getLastFourChars(token);
  
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
    : null;

  const apiToken = await prisma.apiToken.create({
    data: {
      name,
      token: hashedToken,
      lastFourChars,
      permissions,
      organizationId,
      expiresAt,
    },
  });

  // Return the raw token (only shown once)
  return { token, apiToken };
}

/**
 * Validate an API token
 */
export async function validateAPIToken(
  token: string
): Promise<{ isValid: boolean; apiToken?: ApiToken; organizationId?: string }> {
  try {
    // Check if token has the correct prefix
    if (!token.startsWith(API_TOKEN_PREFIX)) {
      return { isValid: false };
    }

    const hashedToken = hashAPIToken(token);
    
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: hashedToken },
      include: { organization: true },
    });

    if (!apiToken || !apiToken.isActive) {
      return { isValid: false };
    }

    // Check if token has expired
    if (apiToken.expiresAt && new Date() > apiToken.expiresAt) {
      return { isValid: false };
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      isValid: true,
      apiToken,
      organizationId: apiToken.organizationId,
    };
  } catch (error) {
    console.error('Error validating API token:', error);
    return { isValid: false };
  }
}

/**
 * Revoke an API token
 */
export async function revokeAPIToken(tokenId: string): Promise<boolean> {
  try {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });
    return true;
  } catch (error) {
    console.error('Error revoking API token:', error);
    return false;
  }
}

/**
 * List API tokens for an organization (without exposing the actual tokens)
 */
export async function listAPITokens(organizationId: string) {
  return prisma.apiToken.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      lastFourChars: true,
      permissions: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Check if a permission is granted to an API token
 */
export function hasPermission(apiToken: ApiToken, permission: string): boolean {
  const permissions = apiToken.permissions as string[];
  return permissions.includes(permission) || permissions.includes('*');
}

/**
 * Common API permissions
 */
export const API_PERMISSIONS = {
  // Employee management
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_WRITE: 'employee:write',
  EMPLOYEE_DELETE: 'employee:delete',
  
  // Project management
  PROJECT_READ: 'project:read',
  PROJECT_WRITE: 'project:write',
  PROJECT_DELETE: 'project:delete',
  
  // Time tracking
  TIME_READ: 'time:read',
  TIME_WRITE: 'time:write',
  
  // Screenshots
  SCREENSHOT_READ: 'screenshot:read',
  SCREENSHOT_WRITE: 'screenshot:write',
  SCREENSHOT_DELETE: 'screenshot:delete',
  
  // Admin operations
  ADMIN: '*', // Full access
};
