import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  getEmployeeById, 
  updateEmployee 
} from '@/lib/services/employee';
import { 
  updateEmployeeSchema,
  createValidationError,
  validateEmployeeId
} from '@/lib/validation/employee';

/**
 * @swagger
 * /api/v1/employee/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve a single employee by their ID
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
 *         example: "wspxwyl3mzilfz5"
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "wspxwyl3mzilfz5"
 *                 email:
 *                   type: string
 *                   example: "employee23@gmail.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 teamId:
 *                   type: string
 *                   example: "wautlmuhdnndn7f"
 *                 sharedSettingsId:
 *                   type: string
 *                   example: "waufhwfhb0p41mr"
 *                 accountId:
 *                   type: string
 *                   example: "wtl6qh6ygxbinqj"
 *                 identifier:
 *                   type: string
 *                   example: "employee23@gmail.com"
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
 *                   example: 1592850492316
 *                 createdAt:
 *                   type: number
 *                   example: 1592850492318
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

    // Get employee
    const result = await getEmployeeById(id);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 500;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/employee/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/employee/{id}:
 *   put:
 *     summary: Update employee information
 *     description: Update an existing employee's information
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
 *         example: "wspxwyl3mzilfz5"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Employee ID (should match path parameter)
 *                 example: "wspxwyl3mzilfz5"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: "john.doe@gmail.com"
 *               name:
 *                 type: string
 *                 description: Updated name
 *                 example: "John Doe"
 *               teamId:
 *                 type: string
 *                 description: Updated team ID
 *                 example: "wautlmuhdnndn7f"
 *               sharedSettingsId:
 *                 type: string
 *                 description: Updated shared settings ID
 *                 example: "waufhwfhb0p41mr"
 *               accountId:
 *                 type: string
 *                 description: Account ID
 *                 example: "wtl6qh6ygxbinqj"
 *               identifier:
 *                 type: string
 *                 description: Employee identifier
 *                 example: "employee23@gmail.com"
 *               type:
 *                 type: string
 *                 description: Employee type
 *                 example: "personal"
 *               organizationId:
 *                 type: string
 *                 description: Organization ID
 *                 example: "wbtmikjuiimvh3z"
 *               projects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of project IDs
 *                 example: []
 *               deactivated:
 *                 type: number
 *                 description: Deactivation timestamp (0 for active)
 *                 example: 0
 *               invited:
 *                 type: number
 *                 description: Invitation timestamp
 *                 example: 1592850492316
 *               createdAt:
 *                 type: number
 *                 description: Creation timestamp
 *                 example: 1592850492318
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "wspxwyl3mzilfz5"
 *                 email:
 *                   type: string
 *                   example: "john.doe@gmail.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 teamId:
 *                   type: string
 *                   example: "wautlmuhdnndn7f"
 *                 sharedSettingsId:
 *                   type: string
 *                   example: "waufhwfhb0p41mr"
 *                 accountId:
 *                   type: string
 *                   example: "wtl6qh6ygxbinqj"
 *                 identifier:
 *                   type: string
 *                   example: "employee23@gmail.com"
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
 *                   example: 1592850492316
 *                 createdAt:
 *                   type: number
 *                   example: 1592850492318
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "Not found"
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
 *                         example: "unique"
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Employee with this email already exists"
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
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const body = await req.json();
    
    // Validate employee ID format
    const idValidation = validateEmployeeId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Validate request body
    const validation = updateEmployeeSchema.safeParse({ ...body, id });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "validation"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Update employee
    const result = await updateEmployee(id, validation.data);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'NOT_FOUND' ? 404 : 422;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/v1/employee/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
