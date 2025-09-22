import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { deactivateEmployee } from '@/lib/services/employee';
import { 
  createValidationError,
  validateEmployeeId
} from '@/lib/validation/employee';

/**
 * @swagger
 * /api/v1/employee/deactivate/{id}:
 *   get:
 *     summary: Deactivate an employee
 *     description: Deactivate an employee by setting their deactivated timestamp. Note - This uses GET method to match Insightful's API exactly.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 15
 *           maxLength: 15
 *         description: Employee ID (must be exactly 15 characters)
 *         example: "wk59h7b0cq8b1oq"
 *     responses:
 *       200:
 *         description: Employee deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "wk59h7b0cq8b1oq"
 *                 email:
 *                   type: string
 *                   example: "vxcvxcv@gmail.com"
 *                 name:
 *                   type: string
 *                   example: "vxcvxcv"
 *                 teamId:
 *                   type: string
 *                   example: "wautlmuhdnndn7f"
 *                 sharedSettingsId:
 *                   type: string
 *                   example: "waufhwfhb0p41mr"
 *                 accountId:
 *                   type: string
 *                   example: "wiorozokbvlgxgw"
 *                 identifier:
 *                   type: string
 *                   example: "vxcvxcv@gmail.com"
 *                 type:
 *                   type: string
 *                   example: "personal"
 *                 organizationId:
 *                   type: string
 *                   example: "wbtmikjuiimvh3z"
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 deactivated:
 *                   type: number
 *                   description: Unix timestamp when employee was deactivated
 *                   example: 1592853287525
 *                 invited:
 *                   type: number
 *                   example: 1592568754375
 *                 createdAt:
 *                   type: number
 *                   example: 1592568754382
 *       404:
 *         description: Employee not found
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
 *                   example: "Employee doesn't exist."
 *       409:
 *         description: Employee already deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee is already deactivated"
 *       422:
 *         description: Validation error (invalid ID format)
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
 *                         example: "stringLength"
 *                       field:
 *                         type: string
 *                         example: "id"
 *                       message:
 *                         type: string
 *                         example: "The 'id' field length must be 15 characters long!"
 *                       expected:
 *                         type: number
 *                         example: 15
 *                       actual:
 *                         type: number
 *                         example: 14
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
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Validate employee ID format
    const idValidation = validateEmployeeId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Deactivate employee
    const result = await deactivateEmployee(id);
    
    if (!result.success) {
      let statusCode = 500;
      
      if (result.error && 'type' in result.error) {
        if (result.error.type === 'EntityNotFound') {
          statusCode = 404;
        }
      } else if (result.error && 'message' in result.error) {
        // This is a conflict error (already deactivated)
        statusCode = 409;
      }
      
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/employee/deactivate/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
