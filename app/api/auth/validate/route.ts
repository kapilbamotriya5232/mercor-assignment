import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, extractTokenFromHeader } from '../../../../lib/auth/jwt';
import { validateAPIToken } from '../../../../lib/auth/api-token';
import { validateTokenSchema } from '../../../../lib/validation/auth';
import { prisma } from '../../../../lib/db';
import { z } from 'zod';

/**
 * @swagger
 * /api/auth/validate:
 *   post:
 *     summary: Validate authentication token
 *     description: Validate a JWT or API token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT or API token to validate
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 type:
 *                   type: string
 *                   enum: [jwt, api-token]
 *                   example: jwt
 *                 employee:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: clm1234567890
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       example: John Doe
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, MANAGER, EMPLOYEE]
 *                       example: EMPLOYEE
 *                     organizationId:
 *                       type: string
 *                       example: clm0987654321
 *                 organizationId:
 *                   type: string
 *                   example: clm0987654321
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token is required
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = validateTokenSchema.parse(body);
    const { token } = validatedData;
    
    // Try to validate as JWT first
    const decodedJWT = verifyJWT(token);
    
    if (decodedJWT) {
      // Fetch employee details
      const employee = await prisma.employee.findUnique({
        where: { id: decodedJWT.employeeId },
      });
      
      if (employee && employee.isActive) {
        return NextResponse.json({
          valid: true,
          type: 'jwt',
          employee: {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: employee.role,
            organizationId: employee.organizationId,
          },
          organizationId: employee.organizationId,
        });
      }
    }
    
    // Try to validate as API token
    const apiTokenResult = await validateAPIToken(token);
    
    if (apiTokenResult.isValid) {
      return NextResponse.json({
        valid: true,
        type: 'api-token',
        organizationId: apiTokenResult.organizationId,
        employee: null,
      });
    }
    
    // Token is invalid
    return NextResponse.json(
      {
        valid: false,
        error: 'Invalid or expired token',
      },
      { status: 401 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validate authentication from headers
 *     description: Validate JWT from Authorization header or API key from X-API-Key header
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 type:
 *                   type: string
 *                   enum: [jwt, api-token]
 *                   example: jwt
 *                 employee:
 *                   type: object
 *                   nullable: true
 *                 organizationId:
 *                   type: string
 *                   example: clm0987654321
 *       401:
 *         description: No valid token found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No valid authentication token provided
 */
export async function GET(req: NextRequest) {
  try {
    // Check Authorization header for JWT
    const authHeader = req.headers.get('authorization');
    const bearerToken = extractTokenFromHeader(authHeader || '');
    
    if (bearerToken) {
      const decodedJWT = verifyJWT(bearerToken);
      
      if (decodedJWT) {
        const employee = await prisma.employee.findUnique({
          where: { id: decodedJWT.employeeId },
        });
        
        if (employee && employee.isActive) {
          return NextResponse.json({
            valid: true,
            type: 'jwt',
            employee: {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              role: employee.role,
              organizationId: employee.organizationId,
            },
            organizationId: employee.organizationId,
          });
        }
      }
    }
    
    // Check X-API-Key header
    const apiKey = req.headers.get('x-api-key');
    
    if (apiKey) {
      const apiTokenResult = await validateAPIToken(apiKey);
      
      if (apiTokenResult.isValid) {
        return NextResponse.json({
          valid: true,
          type: 'api-token',
          organizationId: apiTokenResult.organizationId,
          employee: null,
        });
      }
    }
    
    return NextResponse.json(
      {
        valid: false,
        error: 'No valid authentication token provided',
      },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
