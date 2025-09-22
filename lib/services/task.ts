import { prisma } from '../db';
import { generateInsightfulId } from '../utils/id-generator';
import { nowUnixMs } from '../utils/time';
import {
  CreateTaskRequest,
  EntityNotFoundResponse,
  TaskListResponse,
  TaskResponse,
  UpdateTaskRequest,
  ValidationErrorResponse,
  createEntityNotFoundError,
  createValidationError,
} from '../validation/task';

export interface TaskServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationErrorResponse | EntityNotFoundResponse;
}

/**
 * Convert Task database model to Insightful API response format
 */
function formatTaskResponse(task: any): TaskResponse {
  // Extract unique team IDs from assigned employees and project
  const teams: string[] = [];
  
  // Get teams from project if available
  if (task.project?.employees && Array.isArray(task.project.employees)) {
    const projectEmployeeTeams = task.projectEmployees?.map((e: any) => e.teamId).filter(Boolean) || [];
    projectEmployeeTeams.forEach((teamId: string) => {
      if (!teams.includes(teamId)) {
        teams.push(teamId);
      }
    });
  }

  // Get teams from task employees
  if (task.taskEmployees && Array.isArray(task.taskEmployees)) {
    task.taskEmployees.forEach((employee: any) => {
      if (employee.teamId && !teams.includes(employee.teamId)) {
        teams.push(employee.teamId);
      }
    });
  }

  return {
    id: task.id,
    status: task.status || "To Do",
    priority: task.priority || "low",
    billable: task.billable ?? true,
    name: task.name,
    projectId: task.projectId,
    employees: Array.isArray(task.employees) ? task.employees : [],
    description: task.description || undefined,
    creatorId: task.creatorId,
    organizationId: task.organizationId,
    teams: teams,
    createdAt: Number(task.createdAt),
    deadline: task.deadline ? Number(task.deadline) : undefined,
    labels: Array.isArray(task.labels) ? task.labels : undefined,
    payroll: task.payroll ? {
      billRate: task.payroll.billRate || 1,
      overtimeBillRate: task.payroll.overtimeBillRate || 1,
    } : undefined,
  };
}

/**
 * Create a new task
 */
export async function createTask(
  data: CreateTaskRequest,
  organizationId: string,
  creatorId: string
): Promise<TaskServiceResult<TaskResponse>> {
  try {
    // Validate that the project exists and belongs to the organization
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId,
      },
      select: { 
        id: true,
        statuses: true,
        priorities: true,
        employees: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: createValidationError('projectId', 'Project does not exist'),
      };
    }

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

    // Validate status if provided
    if (data.status && Array.isArray(project.statuses) && !project.statuses.includes(data.status)) {
      return {
        success: false,
        error: createValidationError('status', `Invalid status. Must be one of: ${project.statuses.join(', ')}`),
      };
    }

    // Validate priority if provided
    if (data.priority && Array.isArray(project.priorities) && !project.priorities.includes(data.priority)) {
      return {
        success: false,
        error: createValidationError('priority', `Invalid priority. Must be one of: ${project.priorities.join(', ')}`),
      };
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        id: generateInsightfulId(),
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        employees: data.employees,
        status: data.status || "To Do",
        priority: data.priority || "low",
        billable: data.billable ?? true,
        payroll: data.payroll ? {
          billRate: data.payroll.billRate,
          overtimeBillRate: data.payroll.overtimeBillRate,
        } : undefined,
        deadline: data.deadline ? BigInt(data.deadline) : null,
        labels: data.labels || [],
        creatorId,
        organizationId,
        createdAt: nowUnixMs(),
      },
    });

    // Get project employees for teams array
    const projectEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(project.employees) ? project.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    // Create a response with teams array
    const response = formatTaskResponse({
      ...task,
      project,
      taskEmployees: employees,
      projectEmployees,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to create task'),
    };
  }
}

/**
 * Get task by ID
 */
export async function getTaskById(
  taskId: string,
  organizationId: string
): Promise<TaskServiceResult<TaskResponse>> {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
      include: {
        project: {
          select: {
            id: true,
            employees: true,
          },
        },
      },
    });

    if (!task) {
      return {
        success: false,
        error: createEntityNotFoundError("Task doesn't exist."),
      };
    }

    // Get task employees for teams
    const taskEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(task.employees) ? task.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    // Get project employees for teams
    const projectEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(task.project?.employees) ? task.project.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatTaskResponse({
      ...task,
      taskEmployees,
      projectEmployees,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error getting task:', error);
    return {
      success: false,
      error: createEntityNotFoundError("Task doesn't exist."),
    };
  }
}

/**
 * List all tasks in organization
 */
export async function listTasks(
  organizationId: string,
  projectId?: string
): Promise<TaskServiceResult<TaskListResponse>> {
  try {
    const where: any = { organizationId };
    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            employees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all unique employee IDs from all tasks
    const allEmployeeIds = new Set<string>();
    const allProjectEmployeeIds = new Set<string>();
    
    tasks.forEach(t => {
      if (Array.isArray(t.employees)) {
        t.employees.forEach(id => allEmployeeIds.add(id));
      }
      if (Array.isArray(t.project?.employees)) {
        t.project.employees.forEach(id => allProjectEmployeeIds.add(id));
      }
    });

    // Get all employees for teams
    const taskEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.from(allEmployeeIds) },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const projectEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.from(allProjectEmployeeIds) },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const taskEmployeeMap = new Map(taskEmployees.map(e => [e.id, e]));
    const projectEmployeeMap = new Map(projectEmployees.map(e => [e.id, e]));

    const formattedTasks = tasks.map(task => {
      const taskEmps = Array.isArray(task.employees) 
        ? task.employees.map(id => taskEmployeeMap.get(id)).filter(Boolean)
        : [];
      
      const projectEmps = Array.isArray(task.project?.employees)
        ? task.project.employees.map(id => projectEmployeeMap.get(id)).filter(Boolean)
        : [];
      
      return formatTaskResponse({
        ...task,
        taskEmployees: taskEmps,
        projectEmployees: projectEmps,
      });
    });

    return {
      success: true,
      data: formattedTasks,
    };
  } catch (error) {
    console.error('Error listing tasks:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to list tasks'),
    };
  }
}

/**
 * Update task
 */
export async function updateTask(
  taskId: string,
  data: UpdateTaskRequest,
  organizationId: string
): Promise<TaskServiceResult<TaskResponse>> {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
      include: {
        project: {
          select: {
            id: true,
            statuses: true,
            priorities: true,
            employees: true,
          },
        },
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: createEntityNotFoundError("Task doesn't exist."),
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

    // Validate status if provided
    if (data.status && Array.isArray(existingTask.project.statuses) && 
        !existingTask.project.statuses.includes(data.status)) {
      return {
        success: false,
        error: createValidationError('status', 
          `Invalid status. Must be one of: ${existingTask.project.statuses.join(', ')}`),
      };
    }

    // Validate priority if provided
    if (data.priority && Array.isArray(existingTask.project.priorities) && 
        !existingTask.project.priorities.includes(data.priority)) {
      return {
        success: false,
        error: createValidationError('priority', 
          `Invalid priority. Must be one of: ${existingTask.project.priorities.join(', ')}`),
      };
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.employees !== undefined) updateData.employees = data.employees;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.deadline !== undefined) updateData.deadline = BigInt(data.deadline);
    if (data.labels !== undefined) updateData.labels = data.labels;
    if (data.payroll !== undefined) updateData.payroll = data.payroll;

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            employees: true,
          },
        },
      },
    });

    // Get employees for teams
    const taskEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(updatedTask.employees) ? updatedTask.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const projectEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(updatedTask.project?.employees) ? updatedTask.project.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatTaskResponse({
      ...updatedTask,
      taskEmployees,
      projectEmployees,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to update task'),
    };
  }
}

/**
 * Delete task
 */
export async function deleteTask(
  taskId: string,
  organizationId: string
): Promise<TaskServiceResult<TaskResponse>> {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
      include: {
        project: {
          select: {
            id: true,
            employees: true,
          },
        },
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: createEntityNotFoundError("Task doesn't exist."),
      };
    }

    // Delete the task
    const deletedTask = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    // Get employees for teams
    const taskEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(deletedTask.employees) ? deletedTask.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const projectEmployees = await prisma.employee.findMany({
      where: {
        id: { in: Array.isArray(existingTask.project?.employees) ? existingTask.project.employees : [] },
        organizationId,
      },
      select: { id: true, teamId: true },
    });

    const response = formatTaskResponse({
      ...deletedTask,
      project: existingTask.project,
      taskEmployees,
      projectEmployees,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to delete task'),
    };
  }
}