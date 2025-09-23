  import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { jsonWithBigInts } from '@/lib/utils/json';
import { listScreenshots } from '@/lib/services/screenshot';
import {
  screenshotPaginateQuerySchema,
  createValidationError,
} from '@/lib/validation/screenshot';

/**
 * @swagger
 * /api/v1/analytics/screenshot-paginate:
 *   get:
 *     summary: Get list of screenshots with advanced filtering and pagination
 *     description: Retrieve a paginated list of screenshots with advanced filtering options
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
 *         name: timezone
 *         schema:
 *           type: string
 *         description: Timezone string
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: Comma-separated task IDs
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *         description: Comma-separated shift IDs
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Comma-separated project IDs
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: ScreenshotSort enum value
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Number of results (default 10000)
 *       - in: query
 *         name: next
 *         schema:
 *           type: string
 *         description: Hash value from previous response for pagination
 *     responses:
 *       200:
 *         description: Paginated list of screenshots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screenshot'
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
import { AuthResult } from '@/lib/auth/auth-middleware';

export const GET = requireAuth(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validation = screenshotPaginateQuerySchema.safeParse(query);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "invalid_type"
      );
      return jsonWithBigInts(validationError, { status: 422 });
    }

    const organizationId = auth.organizationId;
    if (!organizationId) {
      const error = createValidationError("organizationId", "Organization ID is required", "required");
      return jsonWithBigInts(error, { status: 422 });
    }

    const filters = {
      start: Number(validation.data.start),
      end: Number(validation.data.end),
      limit: Number(validation.data.limit),
      timezone: validation.data.timezone,
      taskId: validation.data.taskId,
      shiftId: validation.data.shiftId,
      projectId: validation.data.projectId,
      sortBy: validation.data.sortBy,
      next: validation.data.next,
    };

    const result = await listScreenshots(organizationId, filters);

    if (!result.success) {
      return jsonWithBigInts({ error: result.error }, { status: 500 });
    }

    return jsonWithBigInts({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/analytics/screenshot-paginate:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return jsonWithBigInts(validationError, { status: 500 });
  }
});
