import { prisma } from '../db';
import { generateInsightfulId } from '../utils/id-generator';
import { nowUnixMs } from '../utils/time';
import { hashPassword } from '../auth/password';
import { 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest, 
  EmployeeResponse,
  EmployeeListResponse,
  ValidationErrorResponse,
  EntityNotFoundResponse,
  NotFoundErrorResponse,
  ConflictErrorResponse,
  createValidationError,
  createEntityNotFoundError,
  createNotFoundError,
  createConflictError,
} from '../validation/employee';

export interface EmployeeServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationErrorResponse | EntityNotFoundResponse | NotFoundErrorResponse | ConflictErrorResponse;
}

/**
 * Convert Employee database model to Insightful API response format
 */
function formatEmployeeResponse(employee: any): EmployeeResponse {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    teamId: employee.teamId,
    sharedSettingsId: employee.sharedSettingsId,
    accountId: employee.accountId || employee.id, // Use employee ID as accountId if not set
    identifier: employee.identifier || employee.email, // Use email as identifier if not set
    type: employee.type || "personal", // Default to "personal"
    organizationId: employee.organizationId,
    projects: Array.isArray(employee.projects) ? employee.projects : [],
    deactivated: Number(employee.deactivated || 0),
    invited: Number(employee.invited),
    createdAt: Number(employee.createdAt),
  };
}

/**
 * Create a new employee and send invitation
 */
export async function createEmployee(
  data: CreateEmployeeRequest,
  organizationId: string
): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    // Check if employee with this email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      return {
        success: false,
        error: createValidationError("email", "Employee with this email already exists", "unique"),
      };
    }

    // Validate that team exists
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
    });

    if (!team) {
      return {
        success: false,
        error: createValidationError("teamId", "Team does not exist", "exists"),
      };
    }

    // Validate that shared settings exist
    const sharedSettings = await prisma.sharedSettings.findUnique({
      where: { id: data.sharedSettingsId },
    });

    if (!sharedSettings) {
      return {
        success: false,
        error: createValidationError("sharedSettingsId", "Shared settings do not exist", "exists"),
      };
    }

    const now = Number(nowUnixMs());
    const employeeId = generateInsightfulId();

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        id: employeeId,
        name: data.name,
        email: data.email,
        teamId: data.teamId,
        sharedSettingsId: data.sharedSettingsId,
        organizationId,
        accountId: employeeId, // Use employee ID as account ID
        identifier: data.email, // Use email as identifier
        type: "personal",
        projects: [],
        deactivated: BigInt(0),
        invited: BigInt(now),
        createdAt: BigInt(now),
      },
    });

    // TODO: Send invitation email here
    // await sendInvitationEmail(employee.email, employee.name, invitationToken);

    return {
      success: true,
      data: formatEmployeeResponse(employee),
    };
  } catch (error) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      error: createValidationError("general", "Failed to create employee", "internal"),
    };
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return {
        success: false,
        error: createEntityNotFoundError(),
      };
    }

    return {
      success: true,
      data: formatEmployeeResponse(employee),
    };
  } catch (error) {
    console.error('Error getting employee:', error);
    return {
      success: false,
      error: createEntityNotFoundError(),
    };
  }
}

/**
 * List all employees in organization
 */
export async function listEmployees(organizationId: string): Promise<EmployeeServiceResult<EmployeeListResponse>> {
  try {
    const employees = await prisma.employee.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedEmployees = employees.map(formatEmployeeResponse);

    return {
      success: true,
      data: formattedEmployees,
    };
  } catch (error) {
    console.error('Error listing employees:', error);
    return {
      success: false,
      error: createValidationError("general", "Failed to list employees", "internal"),
    };
  }
}

/**
 * Update employee information
 */
export async function updateEmployee(
  id: string,
  data: UpdateEmployeeRequest
): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return {
        success: false,
        error: createNotFoundError(),
      };
    }

    // If email is being updated, check for conflicts
    if (data.email && data.email !== existingEmployee.email) {
      const emailConflict = await prisma.employee.findUnique({
        where: { email: data.email },
      });

      if (emailConflict) {
        return {
          success: false,
          error: createValidationError("email", "Employee with this email already exists", "unique"),
        };
      }
    }

    // Validate team if being updated
    if (data.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: data.teamId },
      });

      if (!team) {
        return {
          success: false,
          error: createValidationError("teamId", "Team does not exist", "exists"),
        };
      }
    }

    // Validate shared settings if being updated
    if (data.sharedSettingsId) {
      const sharedSettings = await prisma.sharedSettings.findUnique({
        where: { id: data.sharedSettingsId },
      });

      if (!sharedSettings) {
        return {
          success: false,
          error: createValidationError("sharedSettingsId", "Shared settings do not exist", "exists"),
        };
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.teamId) updateData.teamId = data.teamId;
    if (data.sharedSettingsId) updateData.sharedSettingsId = data.sharedSettingsId;
    if (data.accountId) updateData.accountId = data.accountId;
    if (data.identifier) updateData.identifier = data.identifier;
    if (data.type) updateData.type = data.type;
    if (data.projects) updateData.projects = data.projects;
    if (data.deactivated !== undefined) updateData.deactivated = BigInt(data.deactivated);

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      data: formatEmployeeResponse(updatedEmployee),
    };
  } catch (error) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      error: createNotFoundError(),
    };
  }
}

/**
 * Deactivate employee (set deactivated timestamp)
 */
export async function deactivateEmployee(id: string): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return {
        success: false,
        error: createEntityNotFoundError(),
      };
    }

    // Check if already deactivated
    if (Number(employee.deactivated) > 0) {
      return {
        success: false,
        error: createConflictError("Employee is already deactivated"),
      };
    }

    const now = Number(nowUnixMs());

    // Deactivate employee
    const deactivatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        deactivated: BigInt(now),
      },
    });

    // Also deactivate the associated AuthUser if exists
    if (deactivatedEmployee.authUserId) {
      await prisma.authUser.update({
        where: { id: deactivatedEmployee.authUserId },
        data: { isActive: false },
      });
    }

    return {
      success: true,
      data: formatEmployeeResponse(deactivatedEmployee),
    };
  } catch (error) {
    console.error('Error deactivating employee:', error);
    return {
      success: false,
      error: createEntityNotFoundError(),
    };
  }
}

/**
 * Activate employee account (create AuthUser and link)
 */
export async function activateEmployeeAccount(
  employeeId: string,
  password: string,
  name?: string
): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return {
        success: false,
        error: createEntityNotFoundError(),
      };
    }

    // Check if already activated
    if (employee.authUserId) {
      return {
        success: false,
        error: createConflictError("Employee account is already activated"),
      };
    }

    const hashedPassword = await hashPassword(password);

    // Create AuthUser
    const authUser = await prisma.authUser.create({
      data: {
        email: employee.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        isActive: true,
      },
    });

    // Link AuthUser to Employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        authUserId: authUser.id,
        ...(name && { name }), // Update name if provided
      },
    });

    return {
      success: true,
      data: formatEmployeeResponse(updatedEmployee),
    };
  } catch (error) {
    console.error('Error activating employee account:', error);
    return {
      success: false,
      error: createValidationError("general", "Failed to activate account", "internal"),
    };
  }
}

/**
 * Add employee to project
 */
export async function addEmployeeToProject(
  employeeId: string,
  projectId: string
): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return {
        success: false,
        error: createEntityNotFoundError(),
      };
    }

    const currentProjects = Array.isArray(employee.projects) ? employee.projects as string[] : [];
    
    // Add project if not already assigned
    if (!currentProjects.includes(projectId)) {
      const updatedProjects = [...currentProjects, projectId];
      
      const updatedEmployee = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          projects: updatedProjects,
        },
      });

      return {
        success: true,
        data: formatEmployeeResponse(updatedEmployee),
      };
    }

    return {
      success: true,
      data: formatEmployeeResponse(employee),
    };
  } catch (error) {
    console.error('Error adding employee to project:', error);
    return {
      success: false,
      error: createValidationError("general", "Failed to add employee to project", "internal"),
    };
  }
}

/**
 * Remove employee from project
 */
export async function removeEmployeeFromProject(
  employeeId: string,
  projectId: string
): Promise<EmployeeServiceResult<EmployeeResponse>> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return {
        success: false,
        error: createEntityNotFoundError(),
      };
    }

    const currentProjects = Array.isArray(employee.projects) ? employee.projects as string[] : [];
    const updatedProjects = currentProjects.filter(id => id !== projectId);
    
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        projects: updatedProjects,
      },
    });

    return {
      success: true,
      data: formatEmployeeResponse(updatedEmployee),
    };
  } catch (error) {
    console.error('Error removing employee from project:', error);
    return {
      success: false,
      error: createValidationError("general", "Failed to remove employee from project", "internal"),
    };
  }
}
