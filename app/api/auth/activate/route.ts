import { markTokenAsUsed, validateActivationToken } from '@/lib/auth/activation-token';
import { generateJWT } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email/service';
import { activateEmployeeAccount } from '@/lib/services/employee';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request schema for activation
const activateRequestSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = activateRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    const { token, password } = validation.data;
    
    // Validate activation token
    const tokenValidation = await validateActivationToken(token);
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: tokenValidation.error || 'Invalid or expired activation token',
        },
        { status: 400 }
      );
    }
    
    // Activate employee account
    const result = await activateEmployeeAccount(
      tokenValidation.employeeId!,
      password
    );
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'ACTIVATION_FAILED',
          message: result.error?.message || 'Failed to activate account',
        },
        { status: 400 }
      );
    }
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    // Get the updated employee with auth user
    const employee = await prisma.employee.findUnique({
      where: { id: tokenValidation.employeeId },
      include: { authUser: true },
    });
    
    if (!employee || !employee.authUser) {
      return NextResponse.json(
        {
          error: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found after activation',
        },
        { status: 404 }
      );
    }
    
    // Send welcome email
    await sendWelcomeEmail(employee.email, employee.name);
    
    // Generate JWT for immediate login
    const jwt = generateJWT({
      id: employee.id,
      email: employee.email,
      organizationId: employee.organizationId,
      role: employee.authUser.role,
      name: employee.name,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        token: jwt,
        employee: result.data,
      },
    });
  } catch (error) {
    console.error('Error in activation endpoint:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An internal error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to validate token without activating
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        {
          error: 'MISSING_TOKEN',
          message: 'Token is required',
        },
        { status: 400 }
      );
    }
    
    // Validate activation token
    const tokenValidation = await validateActivationToken(token);
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: tokenValidation.error || 'Invalid or expired activation token',
          valid: false,
        },
        { status: 400 }
      );
    }
    
    // Get employee details
    const employee = await prisma.employee.findUnique({
      where: { id: tokenValidation.employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        authUserId: true,
      },
    });
    
    if (!employee) {
      return NextResponse.json(
        {
          error: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          valid: false,
        },
        { status: 404 }
      );
    }
    
    // Check if already activated
    if (employee.authUserId) {
      return NextResponse.json(
        {
          error: 'ALREADY_ACTIVATED',
          message: 'Account is already activated',
          valid: false,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      employee: {
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (error) {
    console.error('Error validating activation token:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An internal error occurred',
        valid: false,
      },
      { status: 500 }
    );
  }
}
