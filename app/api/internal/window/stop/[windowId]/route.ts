import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { stopWindow } from '@/lib/services/window';
import { 
  stopWindowSchema,
  createValidationError 
} from '@/lib/validation/window';

/**
 * @swagger
 * /api/internal/window/stop/{windowId}:
 *   put:
 *     summary: Stop an active time tracking session
 *     description: Internal endpoint for desktop app to stop time tracking. Requires employee authentication.
 *     tags: [Internal - Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: windowId
 *         required: true
 *         schema:
 *           type: string
 *         description: The window/session ID to stop
 *         example: "292aa814-9b1b-4ec3-8752-7403ae51977c"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endTime:
 *                 type: number
 *                 description: End time as Unix timestamp in milliseconds (optional, defaults to current time)
 *                 example: 1592558320939
 *               note:
 *                 type: string
 *                 description: Optional note to update for this session
 *                 example: "Completed feature implementation"
 *               deletedScreenshots:
 *                 type: number
 *                 minimum: 0
 *                 description: Number of screenshots deleted during this session
 *                 example: 2
 *     responses:
 *       200:
 *         description: Time tracking session stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 windowId:
 *                   type: string
 *                   example: "292aa814-9b1b-4ec3-8752-7403ae51977c"
 *                 duration:
 *                   type: number
 *                   description: Session duration in milliseconds
 *                   example: 64332
 *                 billableAmount:
 *                   type: number
 *                   description: Billable amount for this session
 *                   example: 21.44
 *                 status:
 *                   type: string
 *                   example: "stopped"
 *       404:
 *         description: Window not found or not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "EntityNotFound"
 *                 message:
 *                   type: string
 *                   example: "Active time tracking session not found"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Parameters validation error!"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "validation"
 *                       field:
 *                         type: string
 *                         example: "endTime"
 *                       message:
 *                         type: string
 *                         example: "End time must be after start time"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 */
export const PUT = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Only employees can stop time tracking sessions
    if (auth.type === 'api-token') {
      const error = createValidationError("auth", "API tokens cannot stop time tracking sessions", "forbidden");
      return NextResponse.json(error, { status: 403 });
    }

    // Extract window ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const windowId = pathSegments[pathSegments.length - 1];
    
    if (!windowId) {
      const error = createValidationError("windowId", "Window ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Parse request body (optional)
    let body = {};
    try {
      const requestBody = await req.text();
      if (requestBody) {
        body = JSON.parse(requestBody);
      }
    } catch (parseError) {
      // Ignore parse errors for empty body
    }
    
    // Validate request body
    const validation = stopWindowSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "validation"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Get employee ID from auth context
    const employeeId = auth.employeeId;
    
    if (!employeeId) {
      const error = createValidationError("auth", "Employee ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Stop window
    const result = await stopWindow(windowId, validation.data, employeeId);
    
    if (!result.success) {
      // Handle not found errors (404)
      if (result.error && 'type' in result.error && result.error.type === 'EntityNotFound') {
        return NextResponse.json(result.error, { status: 404 });
      }
      
      // Handle validation errors (422)
      return NextResponse.json(result.error, { status: 422 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/internal/window/stop:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
