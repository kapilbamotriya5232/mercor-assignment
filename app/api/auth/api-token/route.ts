import { NextRequest, NextResponse } from 'next/server';
import { createAPIToken, listAPITokens, revokeAPIToken, API_PERMISSIONS } from '../../../../lib/auth/api-token';
import { requireRole, AuthResult } from '../../../../lib/auth/auth-middleware';
import { createApiTokenSchema } from '../../../../lib/validation/auth';
import { z } from 'zod';

/**
 * @swagger
 * /api/auth/api-token:
 *   post:
 *     summary: Generate API token
 *     description: Create a new API token for system integration (Admin only)
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Friendly name for the token
 *                 example: Production API
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permissions for the token
 *                 example: ["employee:read", "time:read", "time:write"]
 *               expiresInDays:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Optional expiration in days
 *                 example: 90
 *     responses:
 *       200:
 *         description: API token created successfully
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
 *                   description: The actual API token (only shown once)
 *                   example: mrc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
 *                 apiToken:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: clm1234567890
 *                     name:
 *                       type: string
 *                       example: Production API
 *                     lastFourChars:
 *                       type: string
 *                       example: y5z6
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["employee:read", "time:read", "time:write"]
 *                     expiresAt:
 *                       type: string
 *                       nullable: true
 *                       format: date-time
 *                       example: 2024-03-20T12:00:00Z
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid request data
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Insufficient role permissions
 */
export const POST = requireRole('ADMIN', async (req: NextRequest, auth: AuthResult) => {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = createApiTokenSchema.parse(body);
    
    // Get organization ID
    const organizationId = auth.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not found' },
        { status: 400 }
      );
    }
    
    // Create the API token
    const { token, apiToken } = await createAPIToken(
      organizationId,
      validatedData.name,
      validatedData.permissions || [API_PERMISSIONS.EMPLOYEE_READ, API_PERMISSIONS.TIME_READ],
      validatedData.expiresInDays
    );
    
    return NextResponse.json({
      success: true,
      token, // This is the only time the raw token is shown
      apiToken: {
        id: apiToken.id,
        name: apiToken.name,
        lastFourChars: apiToken.lastFourChars,
        permissions: apiToken.permissions,
        expiresAt: apiToken.expiresAt,
        createdAt: apiToken.createdAt,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }
    
    console.error('API token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/auth/api-token:
 *   get:
 *     summary: List API tokens
 *     description: Get a list of all API tokens for the organization (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of API tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tokens:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: clm1234567890
 *                       name:
 *                         type: string
 *                         example: Production API
 *                       lastFourChars:
 *                         type: string
 *                         example: y5z6
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["employee:read", "time:read"]
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       lastUsedAt:
 *                         type: string
 *                         nullable: true
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                       expiresAt:
 *                         type: string
 *                         nullable: true
 *                         format: date-time
 *                         example: 2024-03-20T12:00:00Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-12-20T12:00:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export const GET = requireRole('ADMIN', async (req: NextRequest, auth: AuthResult) => {
  try {
    const organizationId = auth.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not found' },
        { status: 400 }
      );
    }
    
    const tokens = await listAPITokens(organizationId);
    
    return NextResponse.json({
      success: true,
      tokens,
    });
    
  } catch (error) {
    console.error('API token list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/auth/api-token:
 *   delete:
 *     summary: Revoke API token
 *     description: Revoke an API token (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the token to revoke
 *         example: clm1234567890
 *     responses:
 *       200:
 *         description: Token revoked successfully
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
 *                   example: API token revoked successfully
 *       400:
 *         description: Token ID not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: API token not found
 */
export const DELETE = requireRole('ADMIN', async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('tokenId');
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }
    
    const success = await revokeAPIToken(tokenId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'API token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'API token revoked successfully',
    });
    
  } catch (error) {
    console.error('API token revoke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
