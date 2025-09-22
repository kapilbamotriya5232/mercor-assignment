import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { startWindow } from '@/lib/services/window';
import { 
  startWindowSchema,
  createValidationError 
} from '@/lib/validation/window';

/**
 * @swagger
 * /api/internal/window/start:
 *   post:
 *     summary: Start a new time tracking session
 *     description: Internal endpoint for desktop app to start time tracking. Requires employee authentication.
 *     tags: [Internal - Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - taskId
 *               - computer
 *               - hwid
 *               - os
 *               - osVersion
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: Project ID (15 characters)
 *                 example: "w585nlssgh_1rm5"
 *               taskId:
 *                 type: string
 *                 description: Task ID (15 characters)
 *                 example: "wtk6de9-iohuwwk"
 *               type:
 *                 type: string
 *                 enum: [manual, tracked]
 *                 default: manual
 *                 description: Type of time tracking
 *                 example: "manual"
 *               note:
 *                 type: string
 *                 description: Optional note for this session
 *                 example: "Working on feature implementation"
 *               computer:
 *                 type: string
 *                 description: Computer name
 *                 example: "John's MacBook Pro"
 *               domain:
 *                 type: string
 *                 description: Domain name (optional)
 *                 example: "company.local"
 *               hwid:
 *                 type: string
 *                 description: Hardware ID for fraud prevention
 *                 example: "ee76a404-4168-52af-9d7a-856278de7f65"
 *               os:
 *                 type: string
 *                 description: Operating system
 *                 example: "darwin"
 *               osVersion:
 *                 type: string
 *                 description: OS version
 *                 example: "14.1.0"
 *               timezoneOffset:
 *                 type: number
 *                 description: Timezone offset in milliseconds
 *                 example: -28800000
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional shift ID to continue existing shift
 *                 example: "8696b16d-136a-44cf-b553-77258fb2ddce"
 *     responses:
 *       200:
 *         description: Time tracking session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 windowId:
 *                   type: string
 *                   example: "292aa814-9b1b-4ec3-8752-7403ae51977c"
 *                 shiftId:
 *                   type: string
 *                   example: "8696b16d-136a-44cf-b553-77258fb2ddce"
 *                 startTime:
 *                   type: number
 *                   example: 1592558256607
 *                 status:
 *                   type: string
 *                   example: "started"
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
 *                         example: "required"
 *                       field:
 *                         type: string
 *                         example: "projectId"
 *                       message:
 *                         type: string
 *                         example: "Project ID must be exactly 15 characters"
 *       409:
 *         description: Conflict - session already active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee already has an active time tracking session"
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
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Only employees can start time tracking sessions
    if (auth.type === 'api-token') {
      const error = createValidationError("auth", "API tokens cannot start time tracking sessions", "forbidden");
      return NextResponse.json(error, { status: 403 });
    }

    const body = await req.json();
    
    // Validate request body
    const validation = startWindowSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "required"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Get employee ID and organization ID from auth context
    const employeeId = auth.employeeId;
    const organizationId = auth.organizationId;
    
    if (!employeeId || !organizationId) {
      const error = createValidationError("auth", "Employee ID and Organization ID are required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Start window
    const result = await startWindow(validation.data, employeeId, organizationId);
    
    if (!result.success) {
      // Handle conflict errors (409)
      if (result.error && 'message' in result.error) {
        return NextResponse.json(result.error, { status: 409 });
      }
      
      // Handle validation errors (422)
      return NextResponse.json(result.error, { status: 422 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/internal/window/start:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
