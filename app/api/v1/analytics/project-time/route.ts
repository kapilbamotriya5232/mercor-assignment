import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { getProjectTime } from '@/lib/services/window';
import { 
  projectTimeQuerySchema,
  createValidationError 
} from '@/lib/validation/window';

/**
 * @swagger
 * /api/v1/analytics/project-time:
 *   get:
 *     summary: Get aggregated project time data
 *     description: Retrieve time, costs, and income aggregated by project ID. Used for financial reporting and project analysis.
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
 *         example: "1592558256607"
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *         description: Unix timestamp in milliseconds - data end time
 *         example: "2574195046418"
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
 *         description: Array of project time summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Project ID
 *                     example: "wauimd1z_j0sbgy"
 *                   time:
 *                     type: number
 *                     description: Total time in milliseconds
 *                     example: 40291000
 *                   costs:
 *                     type: number
 *                     description: Total costs (payRate * hours)
 *                     example: 0
 *                   income:
 *                     type: number
 *                     description: Total income (billRate * hours)
 *                     example: 134.30333333333334
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
    const validation = projectTimeQuerySchema.safeParse(cleanParams);
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

    // Get project time data
    const result = await getProjectTime(validation.data, organizationId, employeeIdForScoping);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/analytics/project-time:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
