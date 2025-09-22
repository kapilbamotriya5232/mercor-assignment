import { prisma } from '../db';
import { generateInsightfulId } from '../utils/id-generator';
import { nowUnixMs } from '../utils/time';
import { 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectResponse,
  ProjectListResponse,
  ValidationErrorResponse,
  EntityNotFoundResponse,
  createValidationError,
  createEntityNotFoundError,
} from '../validation/project';

export interface ProjectServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationErrorResponse | EntityNotFoundResponse;
}

/**
 * Convert Project database model to Insightful API response format
 */
function formatProjectResponse(project: any): ProjectResponse {
  // Extract unique team IDs from assigned employees
  const teams: string[] = [];
  if (project.employees && Array.isArray(project.employees)) {
    // Get employee data to extract their teams
    const employeeTeams = project.employeeRelations?.map((rel: any) => rel.employee?.teamId).filter(Boolean) || [];
    employeeTeams.forEach((teamId: string) => {
      if (!teams.includes(teamId)) {
        teams.push(teamId);
      }
    });
  }

  return {
    id: project.id,
    archived: project.archived || false,
    statuses: Array.isArray(project.statuses) ? project.statuses : ["To do", "On hold", "In progress", "Done"],
    priorities: Array.isArray(project.priorities) ? project.priorities : ["low", "medium", "high"],
    billable: project.billable ?? true,
    payroll: project.payroll ? {
      billRate: project.payroll.billRate || 1,
      overtimeBillrate: project.payroll.overtimeBillrate || 1,
    } : undefined,
    name: project.name,
    description: project.description || undefined,
    employees: Array.isArray(project.employees) ? project.employees : [],
    creatorId: project.creatorId,
    organizationId: project.organizationId,
    teams: teams,
    createdAt: Number(project.createdAt),
    deadline: project.deadline ? Number(project.deadline) : undefined,
    screenshotSettings: project.screenshotSettings || undefined,
  };
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectRequest,
  organizationId: string,
  creatorId: string
): Promise<ProjectServiceResult<ProjectResponse>> {
  try {
    // Validate that all employee IDs exist and belong to the organization
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: data.employees },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    if (employees.length !== data.employees.length) {
      return {
        success: false,
        error: createValidationError('employees', 'One or more employee IDs are invalid'),
      };
    }

    // Extract unique team IDs from employees
    const teams = [...new Set(employees.map(e => e.teamId))];

    // Create the project
    const project = await prisma.project.create({
      data: {
        id: generateInsightfulId(),
        name: data.name,
        description: data.description,
        employees: data.employees,
        statuses: data.statuses || ["To do", "On hold", "In progress", "Done"],
        priorities: data.priorities || ["low", "medium", "high"],
        billable: data.billable ?? true,
        payroll: data.payroll ? {
          billRate: data.payroll.billRate,
          overtimeBillrate: data.payroll.overtimeBillrate,
        } : undefined,
        deadline: data.deadline ? BigInt(data.deadline) : null,
        screenshotSettings: data.screenshotSettings || {},
        archived: false,
        creatorId,
        organizationId,
        createdAt: nowUnixMs(),
      },
    });

    // Create a response with teams array
    const response = formatProjectResponse({
      ...project,
      employeeRelations: employees.map(e => ({ employee: e })),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to create project'),
    };
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(
  projectId: string,
  organizationId: string
): Promise<ProjectServiceResult<ProjectResponse>> {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return {
        success: false,
        error: createEntityNotFoundError("Project doesn't exist."),
      };
    }

    // Get employee teams for the teams array
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(project.employees) ? project.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatProjectResponse({
      ...project,
      employeeRelations: employees.map(e => ({ employee: e })),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error getting project:', error);
    return {
      success: false,
      error: createEntityNotFoundError("Project doesn't exist."),
    };
  }
}

/**
 * List all projects in organization
 */
export async function listProjects(
  organizationId: string
): Promise<ProjectServiceResult<ProjectListResponse>> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all unique employee IDs from all projects
    const allEmployeeIds = new Set<string>();
    projects.forEach(p => {
      if (Array.isArray(p.employees)) {
        p.employees.forEach(id => allEmployeeIds.add(id));
      }
    });

    // Get employee teams for all projects
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: Array.from(allEmployeeIds) },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const formattedProjects = projects.map(project => {
      const projectEmployees = Array.isArray(project.employees) 
        ? project.employees.map(id => employeeMap.get(id)).filter(Boolean)
        : [];
      
      return formatProjectResponse({
        ...project,
        employeeRelations: projectEmployees.map(e => ({ employee: e })),
      });
    });

    return {
      success: true,
      data: formattedProjects,
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to list projects'),
    };
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest,
  organizationId: string
): Promise<ProjectServiceResult<ProjectResponse>> {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!existingProject) {
      return {
        success: false,
        error: createEntityNotFoundError("Project doesn't exist."),
      };
    }

    // If updating employees, validate they exist
    if (data.employees) {
      const employees = await prisma.employee.findMany({
        where: {
          id: { in: data.employees },
          organizationId,
        },
        select: { id: true },
      });

      if (employees.length !== data.employees.length) {
        return {
          success: false,
          error: createValidationError('employees', 'One or more employee IDs are invalid'),
        };
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.employees !== undefined) updateData.employees = data.employees;
    if (data.statuses !== undefined) updateData.statuses = data.statuses;
    if (data.priorities !== undefined) updateData.priorities = data.priorities;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.archived !== undefined) updateData.archived = data.archived;
    if (data.deadline !== undefined) updateData.deadline = BigInt(data.deadline);
    if (data.payroll !== undefined) updateData.payroll = data.payroll;
    if (data.screenshotSettings !== undefined) updateData.screenshotSettings = data.screenshotSettings;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: updateData,
    });

    // Get employee teams for the response
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(updatedProject.employees) ? updatedProject.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatProjectResponse({
      ...updatedProject,
      employeeRelations: employees.map(e => ({ employee: e })),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to update project'),
    };
  }
}

/**
 * Delete project
 */
export async function deleteProject(
  projectId: string,
  organizationId: string
): Promise<ProjectServiceResult<ProjectResponse>> {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!existingProject) {
      return {
        success: false,
        error: createEntityNotFoundError("Project doesn't exist."),
      };
    }

    // Delete related tasks first
    await prisma.task.deleteMany({
      where: {
        projectId,
        organizationId,
      },
    });

    // Delete the project
    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // Get employee teams for the response
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(deletedProject.employees) ? deletedProject.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatProjectResponse({
      ...deletedProject,
      employeeRelations: employees.map(e => ({ employee: e })),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to delete project'),
    };
  }
}