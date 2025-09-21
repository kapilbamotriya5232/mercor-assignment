import jwt from 'jsonwebtoken';
import { Employee } from '../../app/generated/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '30d'; // 30 days expiration

export interface JWTPayload {
  employeeId: string;
  email: string;
  organizationId: string;
  role: string;
  name: string | null;
}

export interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for an employee
 */
export function generateJWT(employee: Partial<Employee>): string {
  if (!employee.id || !employee.email || !employee.organizationId || !employee.role) {
    throw new Error('Missing required employee fields for JWT generation');
  }

  const payload: JWTPayload = {
    employeeId: employee.id,
    email: employee.email,
    organizationId: employee.organizationId,
    role: employee.role,
    name: employee.name || null,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mercor',
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'mercor',
    }) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a refresh token with longer expiration
 */
export function generateRefreshToken(employeeId: string): string {
  return jwt.sign(
    { employeeId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: '90d', // 90 days for refresh token
      issuer: 'mercor',
    }
  );
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { employeeId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'mercor',
    }) as any;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return { employeeId: decoded.employeeId };
  } catch (error) {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  // Support both "Bearer token" and "token" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  
  // If not Bearer format, treat the whole header as token
  return authHeader;
}
