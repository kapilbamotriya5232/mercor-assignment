import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  createTask, 
  listTasks 
} from '@/lib/services/task';
import { 
  createTaskSchema,
  createValidationError,
} from '@/lib/validation/task';

/**
 * @swagger
 * /api/v1/task:
 *   post:
 *     summary: Create new task
 *     description: Creates a new task in the organization. Tasks must belong to a project.
 *     tags: [Task]
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
 *               - projectId
 *               - employees
 *             properties:
 *               name:
 *                 type: string
 *                 description: Task name
 *                 example: "Your task name"
 *               projectId:
 *                 type: string
 *                 description: ID of the project this task belongs to (must be exactly 15 characters)
 *                 minLength: 15
 *                 maxLength: 15
 *                 example: "wiotv0ilptz9uqg"
 *               employees:
 *                 type: array
 *                 description: Array of employee IDs assigned to this task
 *                 items:
 *                   type: string
 *                 example: ["wk59h7b0cq8b1oq"]
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Your task description"
 *               status:
 *                 type: string
 *                 description: Task status (must match project statuses)
 *                 default: "To Do"
 *                 example: "To Do"
 *               priority:
 *                 type: string
 *                 description: Task priority (must match project priorities)
 *                 default: "low"
 *                 example: "low"
 *               billable:
 *                 type: boolean
 *                 description: Whether the task is billable
 *                 default: true
 *                 example: true
 *               payroll:
 *                 type: object
 *                 description: Payroll configuration for this task
 *                 properties:
 *                   billRate:
 *                     type: number
 *                     example: 1
 *                   overtimeBillRate:
 *                     type: number
 *                     example: 1
 *               deadline:
 *                 type: number
 *                 description: Task deadline (Unix timestamp in milliseconds)
 *               labels:
 *                 type: array
 *                 description: Task labels
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully created task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "ww6sybfoyylxrap"
 *                 status:
 *                   type: string
 *                   example: "To Do"
 *                 priority:
 *                   type: string
 *                   example: "low"
 *                 billable:
 *                   type: boolean
 *                 name:
 *                   type: string
 *                 projectId:
 *                   type: string
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: string
 *                 description:
 *                   type: string
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
 */
export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createTaskSchema.safeParse(body);
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

    // Create task
    const result = await createTask(
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
    console.error('Error in POST /api/v1/task:', error);
    return NextResponse.json(
      createValidationError('general', 'Failed to create task'),
      { status: 500 }
    );
  }
});

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     summary: List all tasks
 *     description: Retrieve list of all tasks in organization
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         description: Optional filter by project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   billable:
 *                     type: boolean
 *                   name:
 *                     type: string
 *                   projectId:
 *                     type: string
 *                   employees:
 *                     type: array
 *                     items:
 *                       type: string
 *                   description:
 *                     type: string
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
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || undefined;

  try {
    const result = await listTasks(auth.organizationId!, projectId);

    if (!result.success) {
      return NextResponse.json(
        result.error,
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in GET /api/v1/task:', error);
    return NextResponse.json(
      { error: 'Failed to list tasks' },
      { status: 500 }
    );
  }
});
