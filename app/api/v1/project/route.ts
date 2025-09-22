import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  createProject, 
  listProjects 
} from '@/lib/services/project';
import { 
  createProjectSchema,
  createValidationError,
} from '@/lib/validation/project';

/**
 * @swagger
 * /api/v1/project:
 *   post:
 *     summary: Create new project
 *     description: Creates a new project in the organization with assigned employees
 *     tags: [Project]
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
 *               - employees
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *                 example: "Your project name"
 *               description:
 *                 type: string
 *                 description: Project description
 *                 example: "Your project description"
 *               employees:
 *                 type: array
 *                 description: Array of employee IDs to assign to the project
 *                 items:
 *                   type: string
 *                 example: ["wk59h7b0cq8b1oq", "w8jt496hid4shz3"]
 *               statuses:
 *                 type: array
 *                 description: Available statuses for tasks in this project
 *                 items:
 *                   type: string
 *                 default: ["To Do", "In progress", "Done"]
 *                 example: ["To Do", "In progress", "Done"]
 *               priorities:
 *                 type: array
 *                 description: Available priorities for tasks in this project
 *                 items:
 *                   type: string
 *                 default: ["low", "medium", "high"]
 *                 example: ["low", "medium", "high"]
 *               billable:
 *                 type: boolean
 *                 description: Whether the project is billable
 *                 default: true
 *                 example: true
 *               payroll:
 *                 type: object
 *                 description: Payroll configuration
 *                 properties:
 *                   billRate:
 *                     type: number
 *                     description: Standard billing rate
 *                     example: 25
 *                   overtimeBillrate:
 *                     type: number
 *                     description: Overtime billing rate (note lowercase 'r')
 *                     example: 55
 *               deadline:
 *                 type: number
 *                 description: Project deadline (Unix timestamp in milliseconds)
 *                 example: 1692926661681
 *     responses:
 *       200:
 *         description: Successfully created project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "wiotv0ilptz9uqg"
 *                 archived:
 *                   type: boolean
 *                   example: false
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: string
 *                 priorities:
 *                   type: array
 *                   items:
 *                     type: string
 *                 billable:
 *                   type: boolean
 *                 payroll:
 *                   type: object
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: string
 *                 creatorId:
 *                   type: string
 *                 organizationId:
 *                   type: string
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: number
 *       401:
 *         description: Unauthorized
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
 */
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        createValidationError(
          firstError.path.join('.'),
          firstError.message,
          'required'
        ),
        { status: 422 }
      );
    }

    // Create project
    const result = await createProject(
      validationResult.data,
      auth.organizationId!,
      auth.employeeId! // Use employee ID as creator ID
    );

    if (!result.success) {
      return NextResponse.json(
        result.error,
        { status: result.error?.type === 'VALIDATION_ERROR' ? 422 : 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in POST /api/v1/project:', error);
    return NextResponse.json(
      createValidationError('general', 'Failed to create project'),
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/v1/project:
 *   get:
 *     summary: List all projects
 *     description: Get a list of all projects in the organization
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Successfully retrieved projects list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   archived:
 *                     type: boolean
 *                   statuses:
 *                     type: array
 *                     items:
 *                       type: string
 *                   priorities:
 *                     type: array
 *                     items:
 *                       type: string
 *                   billable:
 *                     type: boolean
 *                   payroll:
 *                     type: object
 *                   name:
 *                     type: string
 *                   employees:
 *                     type: array
 *                     items:
 *                       type: string
 *                   creatorId:
 *                     type: string
 *                   organizationId:
 *                     type: string
 *                   teams:
 *                     type: array
 *                     items:
 *                       type: string
 *                   createdAt:
 *                     type: number
 *       401:
 *         description: Unauthorized
 */
export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const result = await listProjects(auth.organizationId!);

    if (!result.success) {
      return NextResponse.json(
        result.error,
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in GET /api/v1/project:', error);
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    );
  }
});
