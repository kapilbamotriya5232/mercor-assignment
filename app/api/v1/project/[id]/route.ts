import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-middleware';
import { 
  getProjectById, 
  updateProject,
  deleteProject 
} from '@/lib/services/project';
import { 
  updateProjectSchema,
  validateProjectId,
  createValidationError,
} from '@/lib/validation/project';

/**
 * @swagger
 * /api/v1/project/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve a single project by its ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID (must be exactly 15 characters)
 *         schema:
 *           type: string
 *           minLength: 15
 *           maxLength: 15
 *           example: "wj7qcsinkdn7ugd"
 *     responses:
 *       200:
 *         description: Successfully retrieved project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 archived:
 *                   type: boolean
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
 *                   properties:
 *                     billRate:
 *                       type: number
 *                     overtimeBillRate:
 *                       type: number
 *                 name:
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
 *       404:
 *         description: Project not found
 *       422:
 *         description: Invalid project ID format
 */
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Validate project ID format
    const idValidation = validateProjectId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Get project
    const result = await getProjectById(id, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 500;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/v1/project/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/project/{id}:
 *   put:
 *     summary: Update project
 *     description: Update an existing project's information
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "wiotv0ilptz9uqg"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Project ID (must match path parameter)
 *               name:
 *                 type: string
 *                 description: New project name
 *               description:
 *                 type: string
 *                 description: New project description
 *               employees:
 *                 type: array
 *                 description: Updated array of employee IDs
 *                 items:
 *                   type: string
 *               statuses:
 *                 type: array
 *                 items:
 *                   type: string
 *               priorities:
 *                 type: array
 *                 items:
 *                   type: string
 *               billable:
 *                 type: boolean
 *               payroll:
 *                 type: object
 *                 properties:
 *                   billRate:
 *                     type: number
 *                   overtimeBillrate:
 *                     type: number
 *               deadline:
 *                 type: number
 *               archived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated project
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
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
    
    // Validate project ID format
    const idValidation = validateProjectId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Validate request body
    const validation = updateProjectSchema.safeParse({ ...body, id });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const validationError = createValidationError(
        firstError.path[0] as string,
        firstError.message,
        "validation"
      );
      
      return NextResponse.json(validationError, { status: 422 });
    }

    // Update project
    const result = await updateProject(id, validation.data, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 422;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/v1/project/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});

/**
 * @swagger
 * /api/v1/project/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Delete a project and all its associated tasks
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "wiotv0ilptz9uqg"
 *     responses:
 *       200:
 *         description: Successfully deleted project (returns deleted project object)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       422:
 *         description: Invalid project ID format
 */
export const DELETE = requireAuth(async (req: NextRequest, auth) => {
  try {
    // Extract ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Validate project ID format
    const idValidation = validateProjectId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(idValidation.error, { status: 422 });
    }

    // Delete project
    const result = await deleteProject(id, auth.organizationId!);
    
    if (!result.success) {
      const statusCode = result.error && 'type' in result.error && result.error.type === 'EntityNotFound' ? 404 : 500;
      return NextResponse.json(result.error, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/v1/project/[id]:', error);
    const validationError = createValidationError("general", "Internal server error", "internal");
    return NextResponse.json(validationError, { status: 500 });
  }
});
