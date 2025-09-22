import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '../db';

const ACTIVATION_SECRET = process.env.ACTIVATION_JWT_SECRET || process.env.JWT_SECRET || 'activation-secret';
const ACTIVATION_EXPIRES_IN = '24h'; // 24 hours

export interface ActivationTokenPayload {
  employeeId: string;
  email: string;
  type: 'activation';
}

/**
 * Generate a secure activation token
 */
export function generateActivationToken(employeeId: string, email: string): string {
  const payload: ActivationTokenPayload = {
    employeeId,
    email,
    type: 'activation',
  };

  return jwt.sign(payload, ACTIVATION_SECRET, {
    expiresIn: ACTIVATION_EXPIRES_IN,
    issuer: 'mercor-activation',
  });
}

/**
 * Verify and decode activation token
 */
export function verifyActivationToken(token: string): ActivationTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACTIVATION_SECRET, {
      issuer: 'mercor-activation',
    }) as ActivationTokenPayload;
    
    if (decoded.type !== 'activation') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Create and store activation token in database
 */
export async function createActivationToken(employeeId: string, email: string) {
  // Generate JWT token
  const token = generateActivationToken(employeeId, email);
  
  // Calculate expiry (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // Store in database for tracking
  await prisma.activationToken.create({
    data: {
      token,
      employeeId,
      email,
      expiresAt,
    },
  });
  
  return token;
}

/**
 * Validate activation token from database
 */
export async function validateActivationToken(token: string) {
  // First verify JWT signature
  const decoded = verifyActivationToken(token);
  if (!decoded) {
    return { valid: false, error: 'Invalid token' };
  }
  
  // Check database record
  const dbToken = await prisma.activationToken.findUnique({
    where: { token },
  });
  
  if (!dbToken) {
    return { valid: false, error: 'Token not found' };
  }
  
  if (dbToken.used) {
    return { valid: false, error: 'Token already used' };
  }
  
  if (new Date() > dbToken.expiresAt) {
    return { valid: false, error: 'Token expired' };
  }
  
  return {
    valid: true,
    employeeId: dbToken.employeeId,
    email: dbToken.email,
  };
}

/**
 * Mark activation token as used
 */
export async function markTokenAsUsed(token: string) {
  await prisma.activationToken.update({
    where: { token },
    data: {
      used: true,
      usedAt: new Date(),
    },
  });
}

/**
 * Clean up expired tokens (can be run as a cron job)
 */
export async function cleanupExpiredTokens() {
  const result = await prisma.activationToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { 
          AND: [
            { used: true },
            { usedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // 30 days old
          ],
        },
      ],
    },
  });
  
  return result.count;
}

/**
 * Generate a random verification code (alternative to JWT)
 */
export function generateVerificationCode(length: number = 6): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  
  return code;
}
