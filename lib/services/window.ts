import { prisma } from '../db';
import { generateInsightfulId } from '../utils/id-generator';
import { nowUnixMs, formatTimestamp, msToHours } from '../utils/time';
import { 
  StartWindowRequest,
  StopWindowRequest,
  BulkWindowRequest,
  WindowQueryParams,
  ProjectTimeQueryParams,
  WindowResponse,
  ProjectTimeResponse,
  StartWindowResponse,
  StopWindowResponse,
  CurrentWindowResponse,
  EmployeeAssignmentsResponse,
  ValidationErrorResponse,
  EntityNotFoundResponse,
  createValidationError,
  createEntityNotFoundError,
  createConflictError,
} from '../validation/window';
import { v4 as uuidv4 } from 'uuid';

export interface WindowServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationErrorResponse | EntityNotFoundResponse | { message: string };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate Elasticsearch-style index for compatibility
 */
function generateWindowIndex(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `windows-smb-${year}-${month}`;
}

/**
 * Check if employee should get a new shift
 */
async function shouldCreateNewShift(employeeId: string, shiftId?: string): Promise<{ shouldCreate: boolean; shiftId?: string }> {
  if (shiftId) {
    return { shouldCreate: false, shiftId };
  }

  // Find the last window for this employee
  const lastWindow = await prisma.window.findFirst({
    where: {
      employeeId,
      end: { not: null },
    },
    orderBy: {
      end: 'desc',
    },
  });

  if (!lastWindow || !lastWindow.end) {
    return { shouldCreate: true };
  }

  // Check if more than 4 hours have passed
  const gapMs = Number(nowUnixMs()) - Number(lastWindow.end);
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

  return {
    shouldCreate: gapMs > FOUR_HOURS_MS,
    shiftId: gapMs <= FOUR_HOURS_MS ? lastWindow.shiftId : undefined,
  };
}

/**
 * Validate hardware consistency for fraud prevention
 */
async function validateHardwareId(employeeId: string, hwid: string): Promise<void> {
  // Check for concurrent sessions on different hardware
  const activeSessions = await prisma.window.findMany({
    where: {
      employeeId,
      end: null,
      hwid: { not: hwid },
    },
  });

  if (activeSessions.length > 0) {
    throw new Error('CONCURRENT_SESSION_DIFFERENT_HARDWARE');
  }

  // Check if this is a new hardware ID
  const previousWindows = await prisma.window.findFirst({
    where: { employeeId, hwid },
  });

  if (!previousWindows) {
    // Log for manual review - this would typically create an audit log
    console.warn(`New hardware detected for employee ${employeeId}: ${hwid}`);
  }
}

/**
 * Get payroll rates from task/project hierarchy
 */
async function getPayrollRates(taskId: string, projectId: string): Promise<{
  billRate: number;
  overtimeBillRate: number;
  payRate: number;
  overtimePayRate: number;
}> {
  // Get task with project data
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Task rates override project rates
  const taskPayroll = task.payroll as any;
  const projectPayroll = task.project?.payroll as any;

  return {
    billRate: taskPayroll?.billRate || projectPayroll?.billRate || 0,
    overtimeBillRate: taskPayroll?.overtimeBillRate || projectPayroll?.overtimeBillrate || 0,
    payRate: taskPayroll?.payRate || projectPayroll?.payRate || 0,
    overtimePayRate: taskPayroll?.overtimePayRate || projectPayroll?.overtimePayRate || 0,
  };
}

/**
 * Format Window database model to Insightful API response format
 */
async function formatWindowResponse(window: any): Promise<WindowResponse> {
  // Get employee data for user fields
  const employee = await prisma.employee.findUnique({
    where: { id: window.employeeId },
    select: {
      email: true,
      name: true,
      teamId: true,
      sharedSettingsId: true,
      organizationId: true,
    },
  });

  if (!employee) {
    throw new Error('Employee not found for window');
  }

  // Get task data for status/priority
  const task = await prisma.task.findUnique({
    where: { id: window.taskId },
    select: { status: true, priority: true },
  });

  return {
    id: window.id,
    type: window.type,
    note: window.note,
    start: Number(window.start),
    end: window.end ? Number(window.end) : Number(nowUnixMs()),
    timezoneOffset: Number(window.timezoneOffset),
    shiftId: window.shiftId,
    projectId: window.projectId,
    taskId: window.taskId,
    paid: window.paid,
    billable: window.billable,
    overtime: window.overtime,
    billRate: window.billRate,
    overtimeBillRate: window.overtimeBillRate,
    payRate: window.payRate,
    overtimePayRate: window.overtimePayRate,
    taskStatus: task?.status || window.taskStatus || 'in progress',
    taskPriority: task?.priority || window.taskPriority || 'low',
    user: employee.email.split('@')[0], // Username from email
    computer: window.computer,
    domain: window.domain,
    name: employee.name,
    hwid: window.hwid,
    os: window.os,
    osVersion: window.osVersion,
    processed: window.processed,
    createdAt: window.createdAt.toISOString(),
    updatedAt: window.updatedAt.toISOString(),
    employeeId: window.employeeId,
    teamId: employee.teamId,
    sharedSettingsId: employee.sharedSettingsId,
    organizationId: employee.organizationId,
    startTranslated: Number(window.startTranslated),
    endTranslated: window.endTranslated ? Number(window.endTranslated) : Number(nowUnixMs()),
    negativeTime: Number(window.negativeTime),
    deletedScreenshots: window.deletedScreenshots,
    _index: generateWindowIndex(window.createdAt),
  };
}

// ==================== PUBLIC API FUNCTIONS ====================

/**
 * Get time tracking windows with filtering (Insightful-compatible)
 */
export async function getWindows(
  params: WindowQueryParams,
  organizationId: string,
  employeeId?: string // For employee scoping
): Promise<WindowServiceResult<WindowResponse[]>> {
  try {
    const whereClause: any = {
      organizationId,
      start: {
        gte: BigInt(params.start),
        lte: BigInt(params.end),
      },
    };

    // Apply filters
    if (params.employeeId) whereClause.employeeId = params.employeeId;
    if (params.teamId) whereClause.teamId = params.teamId;
    if (params.projectId) whereClause.projectId = params.projectId;
    if (params.taskId) whereClause.taskId = params.taskId;
    if (params.shiftId) whereClause.shiftId = params.shiftId;

    // Employee scoping - employees can only see their own data
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const windows = await prisma.window.findMany({
      where: whereClause,
      orderBy: [
        { start: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formattedWindows = await Promise.all(
      windows.map(window => formatWindowResponse(window))
    );

    return {
      success: true,
      data: formattedWindows,
    };
  } catch (error) {
    console.error('Error getting windows:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to retrieve time tracking data'),
    };
  }
}

/**
 * Get aggregated project time data (Insightful-compatible)
 */
export async function getProjectTime(
  params: ProjectTimeQueryParams,
  organizationId: string,
  employeeId?: string
): Promise<WindowServiceResult<ProjectTimeResponse[]>> {
  try {
    const whereClause: any = {
      organizationId,
      start: {
        gte: BigInt(params.start),
        lte: BigInt(params.end),
      },
      end: { not: null }, // Only completed windows
    };

    // Apply filters
    if (params.employeeId) whereClause.employeeId = params.employeeId;
    if (params.teamId) whereClause.teamId = params.teamId;
    if (params.projectId) whereClause.projectId = params.projectId;
    if (params.taskId) whereClause.taskId = params.taskId;
    if (params.shiftId) whereClause.shiftId = params.shiftId;

    // Employee scoping
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const windows = await prisma.window.findMany({
      where: whereClause,
    });

    // Aggregate by project
    const projectMap = new Map<string, {
      time: bigint;
      costs: number;
      income: number;
    }>();

    for (const window of windows) {
      if (!window.end) continue;

      const projectId = window.projectId;
      const duration = window.end - window.start;
      const hours = msToHours(duration);
      
      const costs = hours * window.payRate;
      const income = hours * window.billRate;

      const existing = projectMap.get(projectId) || {
        time: BigInt(0),
        costs: 0,
        income: 0,
      };

      projectMap.set(projectId, {
        time: existing.time + duration,
        costs: existing.costs + costs,
        income: existing.income + income,
      });
    }

    const result: ProjectTimeResponse[] = Array.from(projectMap.entries()).map(([id, data]) => ({
      id,
      time: Number(data.time),
      costs: data.costs,
      income: data.income,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error getting project time:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to retrieve project time data'),
    };
  }
}

// ==================== INTERNAL API FUNCTIONS ====================

/**
 * Start a new time tracking window
 */
export async function startWindow(
  data: StartWindowRequest,
  employeeId: string,
  organizationId: string
): Promise<WindowServiceResult<StartWindowResponse>> {
  try {
    // Validate hardware ID
    await validateHardwareId(employeeId, data.hwid);

    // Check if employee has an active window
    const activeWindow = await prisma.window.findFirst({
      where: {
        employeeId,
        end: null,
      },
    });

    if (activeWindow) {
      return {
        success: false,
        error: createConflictError('Employee already has an active time tracking session'),
      };
    }

    // Validate project and task exist and are assigned to employee
    const task = await prisma.task.findFirst({
      where: {
        id: data.taskId,
        projectId: data.projectId,
        organizationId,
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      return {
        success: false,
        error: createValidationError('taskId', 'Task not found or not assigned to your projects'),
      };
    }

    // Check if employee is assigned to this project
    const projectEmployees = Array.isArray(task.project.employees) ? task.project.employees : [];
    if (!projectEmployees.includes(employeeId)) {
      return {
        success: false,
        error: createValidationError('projectId', 'You are not assigned to this project'),
      };
    }

    // Check if employee is assigned to this task
    const taskEmployees = Array.isArray(task.employees) ? task.employees : [];
    if (!taskEmployees.includes(employeeId)) {
      return {
        success: false,
        error: createValidationError('taskId', 'You are not assigned to this task'),
      };
    }

    // Determine shift ID
    const shiftInfo = await shouldCreateNewShift(employeeId, data.shiftId);
    const shiftId = shiftInfo.shiftId || uuidv4();

    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.deactivated !== BigInt(0)) {
      return {
        success: false,
        error: createValidationError('employeeId', 'Employee is deactivated or not found'),
      };
    }

    // Get payroll rates
    const rates = await getPayrollRates(data.taskId, data.projectId);

    // Create the window
    const startTime = nowUnixMs();
    const timezoneOffset = BigInt(data.timezoneOffset);

    const window = await prisma.window.create({
      data: {
        id: uuidv4(),
        type: data.type,
        note: data.note,
        start: startTime,
        end: null,
        timezoneOffset,
        shiftId,
        projectId: data.projectId,
        taskId: data.taskId,
        paid: false,
        billable: task.project.billable,
        overtime: false,
        billRate: rates.billRate,
        overtimeBillRate: rates.overtimeBillRate,
        payRate: rates.payRate,
        overtimePayRate: rates.overtimePayRate,
        taskStatus: task.status,
        taskPriority: task.priority,
        user: employee.email.split('@')[0],
        computer: data.computer,
        domain: data.domain,
        name: employee.name,
        hwid: data.hwid,
        os: data.os,
        osVersion: data.osVersion,
        processed: false,
        employeeId,
        teamId: employee.teamId,
        sharedSettingsId: employee.sharedSettingsId,
        organizationId,
        startTranslated: startTime - timezoneOffset,
        endTranslated: null,
        negativeTime: BigInt(0),
        deletedScreenshots: 0,
      },
    });

    return {
      success: true,
      data: {
        windowId: window.id,
        shiftId: window.shiftId,
        startTime: Number(startTime),
        status: 'started',
      },
    };
  } catch (error) {
    console.error('Error starting window:', error);
    if (error instanceof Error && error.message === 'CONCURRENT_SESSION_DIFFERENT_HARDWARE') {
      return {
        success: false,
        error: createConflictError('Cannot start session: another session is active on different hardware'),
      };
    }
    return {
      success: false,
      error: createValidationError('general', 'Failed to start time tracking session'),
    };
  }
}

/**
 * Stop a time tracking window
 */
export async function stopWindow(
  windowId: string,
  data: StopWindowRequest,
  employeeId: string
): Promise<WindowServiceResult<StopWindowResponse>> {
  try {
    // Find the window
    const window = await prisma.window.findFirst({
      where: {
        id: windowId,
        employeeId,
        end: null, // Must be active
      },
    });

    if (!window) {
      return {
        success: false,
        error: createEntityNotFoundError('Active time tracking session not found'),
      };
    }

    const endTime = data.endTime ? BigInt(data.endTime) : nowUnixMs();
    const duration = endTime - window.start;

    // Validate end time is after start time
    if (endTime <= window.start) {
      return {
        success: false,
        error: createValidationError('endTime', 'End time must be after start time'),
      };
    }

    // Check for excessive duration (24 hours)
    const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
    if (Number(duration) > MAX_DURATION_MS) {
      return {
        success: false,
        error: createValidationError('endTime', 'Session duration cannot exceed 24 hours'),
      };
    }

    // Update the window
    const updatedWindow = await prisma.window.update({
      where: { id: windowId },
      data: {
        end: endTime,
        endTranslated: endTime - window.timezoneOffset,
        note: data.note || window.note,
        deletedScreenshots: data.deletedScreenshots || window.deletedScreenshots,
        updatedAt: new Date(),
      },
    });

    // Calculate billable amount
    const hours = msToHours(duration);
    const billableAmount = hours * updatedWindow.billRate;

    return {
      success: true,
      data: {
        windowId: updatedWindow.id,
        duration: Number(duration),
        billableAmount,
        status: 'stopped',
      },
    };
  } catch (error) {
    console.error('Error stopping window:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to stop time tracking session'),
    };
  }
}

/**
 * Get current active window for employee
 */
export async function getCurrentWindow(
  employeeId: string
): Promise<WindowServiceResult<CurrentWindowResponse>> {
  try {
    const activeWindow = await prisma.window.findFirst({
      where: {
        employeeId,
        end: null,
      },
      include: {
        project: { select: { name: true } },
        task: { select: { name: true } },
      },
    });

    if (!activeWindow) {
      return {
        success: true,
        data: { active: false },
      };
    }

    const duration = Number(nowUnixMs() - activeWindow.start);

    return {
      success: true,
      data: {
        active: true,
        window: {
          id: activeWindow.id,
          projectId: activeWindow.projectId,
          taskId: activeWindow.taskId,
          projectName: activeWindow.project?.name || '',
          taskName: activeWindow.task?.name || '',
          start: Number(activeWindow.start),
          duration,
          shiftId: activeWindow.shiftId,
        },
      },
    };
  } catch (error) {
    console.error('Error getting current window:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to get current session'),
    };
  }
}

/**
 * Get employee project and task assignments
 */
export async function getEmployeeAssignments(
  employeeId: string,
  organizationId: string
): Promise<WindowServiceResult<EmployeeAssignmentsResponse>> {
  try {
    // Get projects where employee is assigned
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        archived: false,
        employees: {
          array_contains: employeeId,
        },
      },
      include: {
        tasks: {
          where: {
            employees: {
              array_contains: employeeId,
            },
          },
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      billable: project.billable,
      tasks: project.tasks,
    }));

    return {
      success: true,
      data: {
        projects: formattedProjects,
      },
    };
  } catch (error) {
    console.error('Error getting employee assignments:', error);
    return {
      success: false,
      error: createValidationError('general', 'Failed to get assignments'),
    };
  }
}
