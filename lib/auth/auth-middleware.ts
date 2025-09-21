import { NextRequest } from 'next/server';
import { verifyJWT, extractTokenFromHeader, DecodedToken } from './jwt';
import { validateAPIToken } from './api-token';
import { prisma } from '../db';
import { Employee, ApiToken } from '../../app/generated/prisma';

export interface AuthenticatedRequest extends NextRequest {
  auth?: {
    type: 'jwt' | 'api-token';
    employeeId?: string;
    employee?: Employee;
    organizationId: string;
    apiToken?: ApiToken;
    token?: DecodedToken;
  };
}

export interface AuthResult {
  isAuthenticated: boolean;
  type?: 'jwt' | 'api-token';
  employeeId?: string;
  employee?: Employee;
  organizationId?: string;
  apiToken?: ApiToken;
  token?: DecodedToken;
  error?: string;
}

/**
 * Authenticate a request using JWT or API token
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  try {
    // Check for Bearer token (JWT)
    const authHeader = req.headers.get('authorization');
    const bearerToken = extractTokenFromHeader(authHeader || '');
    
    if (bearerToken) {
      const decodedToken = verifyJWT(bearerToken);
      
      if (decodedToken) {
        // Fetch the employee to ensure they exist and are active
        const employee = await prisma.employee.findUnique({
          where: { id: decodedToken.employeeId },
        });
        
        if (employee && employee.isActive) {
          return {
            isAuthenticated: true,
            type: 'jwt',
            employeeId: employee.id,
            employee,
            organizationId: employee.organizationId,
            token: decodedToken,
          };
        }
        
        return {
          isAuthenticated: false,
          error: 'Employee not found or inactive',
        };
      }
    }
    
    // Check for API token (X-API-Key header)
    const apiKey = req.headers.get('x-api-key');
    
    if (apiKey) {
      const validationResult = await validateAPIToken(apiKey);
      
      if (validationResult.isValid && validationResult.apiToken) {
        return {
          isAuthenticated: true,
          type: 'api-token',
          organizationId: validationResult.organizationId,
          apiToken: validationResult.apiToken,
        };
      }
    }
    
    return {
      isAuthenticated: false,
      error: 'No valid authentication token provided',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Require authentication for a route handler
 */
export function requireAuth(
  handler: (req: NextRequest, auth: AuthResult) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const auth = await authenticateRequest(req);
    
    if (!auth.isAuthenticated) {
      return new Response(
        JSON.stringify({
          error: auth.error || 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return handler(req, auth);
  };
}

/**
 * Require specific role for a route handler
 */
export function requireRole(
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
  handler: (req: NextRequest, auth: AuthResult) => Promise<Response>
) {
  return requireAuth(async (req: NextRequest, auth: AuthResult) => {
    // API tokens bypass role checks if they have admin permission
    if (auth.type === 'api-token') {
      const permissions = auth.apiToken?.permissions as string[];
      if (permissions && permissions.includes('*')) {
        return handler(req, auth);
      }
      return new Response(
        JSON.stringify({
          error: 'Insufficient permissions',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // For JWT, check the employee's role
    if (auth.employee) {
      const allowedRoles = {
        ADMIN: ['ADMIN'],
        MANAGER: ['ADMIN', 'MANAGER'],
        EMPLOYEE: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      };
      
      if (allowedRoles[role].includes(auth.employee.role)) {
        return handler(req, auth);
      }
    }
    
    return new Response(
      JSON.stringify({
        error: 'Insufficient role permissions',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}

/**
 * Check if request has specific permission (for API tokens)
 */
export function requirePermission(
  permission: string,
  handler: (req: NextRequest, auth: AuthResult) => Promise<Response>
) {
  return requireAuth(async (req: NextRequest, auth: AuthResult) => {
    // JWT tokens have all permissions for their role
    if (auth.type === 'jwt') {
      return handler(req, auth);
    }
    
    // Check API token permissions
    if (auth.type === 'api-token' && auth.apiToken) {
      const permissions = auth.apiToken.permissions as string[];
      if (permissions.includes(permission) || permissions.includes('*')) {
        return handler(req, auth);
      }
    }
    
    return new Response(
      JSON.stringify({
        error: `Missing required permission: ${permission}`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export async function optionalAuth(
  handler: (req: NextRequest, auth: AuthResult | null) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const auth = await authenticateRequest(req);
    return handler(req, auth.isAuthenticated ? auth : null);
  };
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  action: string,
  employeeId?: string,
  metadata?: any,
  entityType?: string,
  entityId?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        employeeId,
        metadata,
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
