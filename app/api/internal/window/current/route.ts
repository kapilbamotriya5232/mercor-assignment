import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { getCurrentWindow } from '@/lib/services/window';
import { createValidationError } from '@/lib/validation/window';

/**
 * @swagger
 * /api/internal/window/current:
 *   get:
 *     summary: Get current active time tracking session
 *     description: Internal endpoint for desktop app to check if employee has an active time tracking session.
 *     tags: [Internal - Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current session status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: boolean
 *                   description: Whether employee has an active session
 *                   example: true
 *                 window:
 *                   type: object
 *                   nullable: true
 *                   description: Current window details (null if no active session)
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "292aa814-9b1b-4ec3-8752-7403ae51977c"
 *                     projectId:
 *                       type: string
 *                       example: "w585nlssgh_1rm5"
 *                     taskId:
 *                       type: string
 *                       example: "wtk6de9-iohuwwk"
 *                     projectName:
 *                       type: string
 *                       example: "Test Project with All Fields"
 *                     taskName:
 *                       type: string
 *                       example: "Test Task with All Fields"
 *                     start:
 *                       type: number
 *                       description: Start time as Unix timestamp in milliseconds
 *                       example: 1592558256607
 *                     duration:
 *                       type: number
 *                       description: Current duration in milliseconds
 *                       example: 64332
 *                     shiftId:
 *                       type: string
 *                       example: "8696b16d-136a-44cf-b553-77258fb2ddce"
 *       200 (No Active Session):
 *         description: No active session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: boolean
 *                   example: false
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
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Only employees can check their current session
    if (auth.type === 'api-token') {
      const error = createValidationError("auth", "API tokens cannot access current session", "forbidden");
      return NextResponse.json(error, { status: 403 });
    }

    // Get employee ID from auth context
    const employeeId = auth.employeeId;
    
    if (!employeeId) {
      const error = createValidationError("auth", "Employee ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Get current window
    const result = await getCurrentWindow(employeeId);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/internal/window/current:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
