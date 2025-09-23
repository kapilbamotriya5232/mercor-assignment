import { requireAuth } from '@/lib/auth/auth-middleware';
import { deleteScreenshot } from '@/lib/services/screenshot';
import {
  createValidationError,
  validateScreenshotId,
} from '@/lib/validation/screenshot';
import { NextRequest, NextResponse } from 'next/server';
import { jsonWithBigInts } from '@/lib/utils/json';

/**
 * @swagger
 * /api/v1/analytics/screenshot/{id}:
 *   delete:
 *     summary: Delete specific screenshot by ID
 *     description: Deletes a screenshot by its unique ID
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the screenshot to delete
 *     responses:
 *       200:
 *         description: Screenshot deleted successfully
 *       404:
 *         description: Screenshot not found
 *       422:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
import { AuthResult } from '@/lib/auth/auth-middleware';

export const DELETE = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    const idValidationError = validateScreenshotId(id);
    if (idValidationError) {
      return jsonWithBigInts(idValidationError, { status: 422 });
    }

    const organizationId = auth.organizationId;
    if (!organizationId) {
      const error = createValidationError("organizationId", "Organization ID is required", "required");
      return jsonWithBigInts(error, { status: 422 });
    }

    const result = await deleteScreenshot(id, organizationId);

    if (!result.success) {
      if (result.error === 'Screenshot not found') {
        return jsonWithBigInts({ error: result.error }, { status: 404 });
      }
      return jsonWithBigInts({ error: result.error }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/v1/analytics/screenshot/[id]:`, error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return jsonWithBigInts(validationError, { status: 500 });
  }
});
