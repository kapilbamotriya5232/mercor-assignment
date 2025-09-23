import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthResult } from '@/lib/auth/auth-middleware';
import { listScreenshots } from '@/lib/services/screenshot';
import {
  screenshotQuerySchema,
  createValidationError,
} from '@/lib/validation/screenshot';

/**
 * @swagger
 * /api/v1/analytics/screenshot:
 *   get:
 *     summary: Get list of screenshots with basic filtering
 *     description: Retrieve a list of screenshots based on time range and limit
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *         description: Unix timestamp in milliseconds - data start time
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *         description: Unix timestamp in milliseconds - data end time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Number of results (default 15)
 *     responses:
 *       200:
 *         description: List of screenshots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screenshot'
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const GET = requireAuth(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validation = screenshotQuerySchema.safeParse(query);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "invalid_type"
      );
      return NextResponse.json(validationError, { status: 422 });
    }

    const organizationId = auth.organizationId;
    if (!organizationId) {
      const error = createValidationError("organizationId", "Organization ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    const filters = {
      start: Number(validation.data.start),
      end: Number(validation.data.end),
      limit: Number(validation.data.limit),
    };

    const result = await listScreenshots(organizationId, filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/analytics/screenshot:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
