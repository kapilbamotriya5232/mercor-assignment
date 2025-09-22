import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAuditEvent } from '../../../../lib/auth/auth-middleware';
import { generateJWT, generateRefreshToken } from '../../../../lib/auth/jwt';
import { comparePassword } from '../../../../lib/auth/password';
import { prisma } from '../../../../lib/db';
import { loginSchema } from '../../../../lib/validation/auth';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Employee login
 *     description: Authenticate an employee with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token for getting new JWT
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 employee:
 *                   type: object
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
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       403:
 *         description: Account not activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Account not activated. Please check your email for activation link.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);
    
    // Find AuthUser by email with associated Employee
    const authUser = await prisma.authUser.findUnique({
      where: { email: validatedData.email },
      include: {
        employee: {
          include: {
            organization: true,
          },
        },
      },
    });
    
    if (!authUser || !authUser.employee) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if account is activated
    if (!authUser.isActive) {
      return NextResponse.json(
        { error: 'Account not activated. Please check your email for activation link.' },
        { status: 403 }
      );
    }
    
    // Check if user has set a password (account activated)
    if (!authUser.password) {
      return NextResponse.json(
        { error: 'Account setup not completed. Please use the activation link from your email.' },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      authUser.password
    );
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await logAuditEvent(
        'LOGIN_FAILED',
        authUser.id,
        { email: validatedData.email, reason: 'Invalid password' }
      );
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const employee = authUser.employee;
    
    // Generate tokens (using employee data for compatibility)
    const tokenPayload = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: authUser.role,
      organizationId: employee.organizationId,
    };
    const token = generateJWT(tokenPayload);
    const refreshToken = generateRefreshToken(employee.id);
    
    // Update last login time
    await prisma.authUser.update({
      where: { id: authUser.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Log successful login
    await logAuditEvent(
      'LOGIN_SUCCESS',
      authUser.id,
      { email: validatedData.email }
    );
    
    // Return success response
    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      employee: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: authUser.role,
        organizationId: employee.organizationId,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
