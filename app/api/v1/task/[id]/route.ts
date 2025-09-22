import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  getTaskById, 
  updateTask,
  deleteTask 
} from '@/lib/services/task';
import { 
  updateTaskSchema,
  validateTaskId,
  createValidationError,
} from '@/lib/validation/task';

/**
 * @swagger
 * /api/v1/task/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieve a single task by its ID
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID (must be exactly 15 characters)
 *         schema:
 *           type: string
 *           minLength: 15
 *           maxLength: 15
 *           example: "w-4xfzgjiv-8jn8"
 *     responses:
 *       200:
 *         description: Successfully retrieved task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
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
 *       404:
 *         description: Task not found
 *       422:
 *         description: Invalid task ID format
 */
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Validate task ID format
    const idValidation = validateTaskId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Get task
    const result = await getTaskById(id, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 500;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/task/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/task/{id}:
 *   put:
 *     summary: Update task
 *     description: Update an existing task's information
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "ww6sybfoyylxrap"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New task name
 *                 example: "Your task new name"
 *               employees:
 *                 type: array
 *                 description: Updated array of employee IDs
 *                 items:
 *                   type: string
 *                 example: ["wk59h7b0cq8b1oq"]
 *               description:
 *                 type: string
 *                 description: Updated description
 *               status:
 *                 type: string
 *                 description: Updated status (must match project statuses)
 *               priority:
 *                 type: string
 *                 description: Updated priority (must match project priorities)
 *               billable:
 *                 type: boolean
 *               payroll:
 *                 type: object
 *                 properties:
 *                   billRate:
 *                     type: number
 *                   overtimeBillRate:
 *                     type: number
 *               deadline:
 *                 type: number
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully updated task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
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
 *       404:
 *         description: Task not found
 *       422:
 *         description: Validation error
 */
export const PUT = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const body = await req.json();
    
    // Validate task ID format
    const idValidation = validateTaskId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Validate request body
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "validation"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Update task
    const result = await updateTask(id, validation.data, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 422;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/v1/task/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/task/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Delete a task from the organization
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "w-4xfzgjiv-8jn8"
 *     responses:
 *       200:
 *         description: Successfully deleted task (returns deleted task object)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
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
 *       404:
 *         description: Task not found
 *       422:
 *         description: Invalid task ID format
 */
export const DELETE = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Validate task ID format
    const idValidation = validateTaskId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Delete task
    const result = await deleteTask(id, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 500;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/v1/task/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
