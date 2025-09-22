import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { getEmployeeAssignments } from '@/lib/services/window';
import { createValidationError } from '@/lib/validation/window';

/**
 * @swagger
 * /api/internal/employee/assignments:
 *   get:
 *     summary: Get employee project and task assignments
 *     description: Internal endpoint for desktop app to get projects and tasks assigned to the current employee.
 *     tags: [Internal - Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee assignments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   description: Projects assigned to the employee
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "w585nlssgh_1rm5"
 *                       name:
 *                         type: string
 *                         example: "Test Project with All Fields"
 *                       billable:
 *                         type: boolean
 *                         example: true
 *                       tasks:
 *                         type: array
 *                         description: Tasks within this project assigned to the employee
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "wtk6de9-iohuwwk"
 *                             name:
 *                               type: string
 *                               example: "Test Task with All Fields"
 *                             status:
 *                               type: string
 *                               example: "To Do"
 *                             priority:
 *                               type: string
 *                               example: "high"
 *       200 (No Assignments):
 *         description: Employee has no project assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   example: []
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
    // Only employees can get their assignments
    if (auth.type === 'api-token') {
      const error = createValidationError("auth", "API tokens cannot access employee assignments", "forbidden");
      return NextResponse.json(error, { status: 403 });
    }

    // Get employee ID and organization ID from auth context
    const employeeId = auth.employeeId;
    const organizationId = auth.organizationId;
    
    if (!employeeId || !organizationId) {
      const error = createValidationError("auth", "Employee ID and Organization ID are required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // Get employee assignments
    const result = await getEmployeeAssignments(employeeId, organizationId);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/internal/employee/assignments:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
