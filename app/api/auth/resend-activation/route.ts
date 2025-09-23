import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resendActivationEmail } from '@/lib/email/service';

/**
 * @swagger
 * /api/auth/resend-activation:
 *   post:
 *     summary: Resend activation email
 *     description: Resends the activation email to a user who has not yet activated their account.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Activation email resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If an account exists with this email, a new activation link has been sent.
 *       400:
 *         description: Bad request, such as invalid email format or if the account is already activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: INTERNAL_ERROR
 *                 message:
 *                   type: string
 *                   example: Failed to resend activation email. Please try again later.
 */
// Request schema for resending activation
const resendRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = resendRequestSchema.safeParse(body);
    
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
    
    const { email } = validation.data;
    
    // Resend activation email
    const result = await resendActivationEmail(email);
    
    if (!result.success) {
      // Don't reveal whether the email exists or not for security
      if (result.error?.includes('not found')) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, a new activation link has been sent.',
        });
      }
      
      if (result.error?.includes('already activated')) {
        return NextResponse.json(
          {
            error: 'ALREADY_ACTIVATED',
            message: 'This account is already activated. Please login instead.',
          },
          { status: 400 }
        );
      }
      
      throw new Error(result.error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Activation email has been resent. Please check your inbox.',
      data: {
        activationLink: 'data' in result ? result.data?.activationLink : undefined,
      },
    });
  } catch (error) {
    console.error('Error resending activation email:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to resend activation email. Please try again later.',
      },
      { status: 500 }
    );
  }
}
