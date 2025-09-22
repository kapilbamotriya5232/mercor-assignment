import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { getWindows } from '@/lib/services/window';
import { 
  windowQuerySchema,
  createValidationError 
} from '@/lib/validation/window';

/**
 * @swagger
 * /api/v1/analytics/window:
 *   get:
 *     summary: Get time tracking windows/entries
 *     description: Retrieve detailed time tracking windows with filtering. This is the most important API for payroll calculations.
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
 *         example: "1592498100575"
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *         description: Unix timestamp in milliseconds - data end time
 *         example: "1592929252004"
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *         description: Timezone string (optional)
 *         example: "America/New_York"
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by specific employee ID (15 chars)
 *         example: "wpuuerb5saeydb4"
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Filter by team ID (15 chars)
 *         example: "wide_zvn0ihbddz"
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID (15 chars)
 *         example: "wauimd1z_j0sbgy"
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: Filter by task ID (15 chars)
 *         example: "wfrk32jg36mdq99"
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *         description: Filter by shift ID (UUID)
 *         example: "8696b16d-136a-44cf-b553-77258fb2ddce"
 *     responses:
 *       200:
 *         description: Array of time tracking windows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "292aa814-9b1b-4ec3-8752-7403ae51977c"
 *                   type:
 *                     type: string
 *                     example: "manual"
 *                   note:
 *                     type: string
 *                     example: ""
 *                   start:
 *                     type: number
 *                     example: 1592558256607
 *                   end:
 *                     type: number
 *                     example: 1592558320939
 *                   timezoneOffset:
 *                     type: number
 *                     example: -7200000
 *                   shiftId:
 *                     type: string
 *                     example: "8696b16d-136a-44cf-b553-77258fb2ddce"
 *                   projectId:
 *                     type: string
 *                     example: "wauimd1z_j0sbgy"
 *                   taskId:
 *                     type: string
 *                     example: "wfrk32jg36mdq99"
 *                   paid:
 *                     type: boolean
 *                     example: false
 *                   billable:
 *                     type: boolean
 *                     example: true
 *                   overtime:
 *                     type: boolean
 *                     example: false
 *                   billRate:
 *                     type: number
 *                     example: 12
 *                   overtimeBillRate:
 *                     type: number
 *                     example: 0
 *                   payRate:
 *                     type: number
 *                     example: 0
 *                   overtimePayRate:
 *                     type: number
 *                     example: 0
 *                   taskStatus:
 *                     type: string
 *                     example: "in progress"
 *                   taskPriority:
 *                     type: string
 *                     example: "low"
 *                   user:
 *                     type: string
 *                     example: "janajovanovic"
 *                   computer:
 *                     type: string
 *                     example: "jana's macbook air"
 *                   domain:
 *                     type: string
 *                     example: ""
 *                   name:
 *                     type: string
 *                     example: "Jana Jovanovic"
 *                   hwid:
 *                     type: string
 *                     example: "ee76a404-4168-52af-9d7a-856278de7f65"
 *                   os:
 *                     type: string
 *                     example: "darwin"
 *                   osVersion:
 *                     type: string
 *                     example: "18.2.0"
 *                   processed:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     example: "2020-06-19T07:17:36.608Z"
 *                   updatedAt:
 *                     type: string
 *                     example: "2020-06-19T07:18:40.949Z"
 *                   employeeId:
 *                     type: string
 *                     example: "wpuuerb5saeydb4"
 *                   teamId:
 *                     type: string
 *                     example: "wide_zvn0ihbddz"
 *                   sharedSettingsId:
 *                     type: string
 *                     example: "wecqwcgmor6qypc"
 *                   organizationId:
 *                     type: string
 *                     example: "wts6fn6zccv5dnw"
 *                   startTranslated:
 *                     type: number
 *                     example: 1592558256607
 *                   endTranslated:
 *                     type: number
 *                     example: 1592558320939
 *                   negativeTime:
 *                     type: number
 *                     example: 0
 *                   deletedScreenshots:
 *                     type: number
 *                     example: 0
 *                   _index:
 *                     type: string
 *                     example: "windows-smb-2020-06"
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
 *                         example: "start"
 *                       message:
 *                         type: string
 *                         example: "The 'start' field is required!"
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
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      start: searchParams.get('start'),
      end: searchParams.get('end'),
      timezone: searchParams.get('timezone'),
      employeeId: searchParams.get('employeeId'),
      teamId: searchParams.get('teamId'),
      projectId: searchParams.get('projectId'),
      taskId: searchParams.get('taskId'),
      shiftId: searchParams.get('shiftId'),
    };

    // Remove null values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== null)
    );

    // Validate query parameters
    const validation = windowQuerySchema.safeParse(cleanParams);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "required"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Get organization ID from auth context
    const organizationId = auth.organizationId;
    if (!organizationId) {
      const error = createValidationError("organizationId", "Organization ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Determine employee scoping - regular employees can only see their own data
    const employeeIdForScoping = auth.token?.role === 'EMPLOYEE' ? auth.employeeId : undefined;

    // Get windows
    const result = await getWindows(validation.data, organizationId, employeeIdForScoping);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/analytics/window:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
