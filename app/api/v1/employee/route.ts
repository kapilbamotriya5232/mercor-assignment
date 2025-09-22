import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  createEmployee, 
  listEmployees 
} from '@/lib/services/employee';
import { 
  createEmployeeSchema,
  createValidationError,
  validateEmployeeId
} from '@/lib/validation/employee';

/**
 * @swagger
 * /api/v1/employee:
 *   post:
 *     summary: Create new employee and send invitation
 *     description: Creates a new employee in the organization and sends an invitation email
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - teamId
 *               - sharedSettingsId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Employee's full name
 *                 example: "Employee 4"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *                 example: "employee4@gmail.com"
 *               teamId:
 *                 type: string
 *                 description: ID of the team to assign employee to
 *                 example: "wautlmuhdnndn7f"
 *               sharedSettingsId:
 *                 type: string
 *                 description: ID of the shared settings to use
 *                 example: "waufhwfhb0p41mr"
 *     responses:
 *       200:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "wf8rsovxa8vjq8w"
 *                 name:
 *                   type: string
 *                   example: "Employee 4"
 *                 email:
 *                   type: string
 *                   example: "employee4@gmail.com"
 *                 teamId:
 *                   type: string
 *                   example: "wautlmuhdnndn7f"
 *                 sharedSettingsId:
 *                   type: string
 *                   example: "waufhwfhb0p41mr"
 *                 accountId:
 *                   type: string
 *                   example: "wmwrbaurf3xddu5"
 *                 identifier:
 *                   type: string
 *                   example: "employee4@gmail.com"
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
 *                   example: 0
 *                 invited:
 *                   type: number
 *                   example: 1592922679686
 *                 createdAt:
 *                   type: number
 *                   example: 1592922679689
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
 *                         example: "name"
 *                       message:
 *                         type: string
 *                         example: "The 'name' field is required!"
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
    const body = await req.json();
    
    // Validate request body
    const validation = createEmployeeSchema.safeParse(body);
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

    // Create employee
    const result = await createEmployee(validation.data, organizationId);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 422 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/v1/employee:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/employee:
 *   get:
 *     summary: List all employees
 *     description: Retrieve a list of all employees in the organization
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "wk59h7b0cq8b1oq"
 *                   email:
 *                     type: string
 *                     example: "vxcvxcv@gmail.com"
 *                   name:
 *                     type: string
 *                     example: "Employee 2"
 *                   teamId:
 *                     type: string
 *                     example: "wautlmuhdnndn7f"
 *                   sharedSettingsId:
 *                     type: string
 *                     example: "waufhwfhb0p41mr"
 *                   accountId:
 *                     type: string
 *                     example: "wiorozokbvlgxgw"
 *                   identifier:
 *                     type: string
 *                     example: "vxcvxcv@gmail.com"
 *                   type:
 *                     type: string
 *                     example: "personal"
 *                   organizationId:
 *                     type: string
 *                     example: "wbtmikjuiimvh3z"
 *                   projects:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["wguwpw8-o6rdcfn", "wdewmdv6xkfryrb"]
 *                   deactivated:
 *                     type: number
 *                     example: 1592853287525
 *                   invited:
 *                     type: number
 *                     example: 1592568754375
 *                   createdAt:
 *                     type: number
 *                     example: 1592568754382
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
    // Get organization ID from auth context
    const organizationId = auth.organizationId;
    if (!organizationId) {
      const error = createValidationError("organizationId", "Organization ID is required", "required");
      return NextResponse.json(error, { status: 422 });
    }

    // List employees
    const result = await listEmployees(organizationId);
    
    if (!result.success) {
      return NextResponse.json(result.error, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/employee:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
