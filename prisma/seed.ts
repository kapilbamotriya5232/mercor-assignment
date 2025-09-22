/**
 * Seed script for Insightful-compatible database
 * Creates default organization, teams, settings, and test data
 */

import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';
import { generateInsightfulId } from '../lib/utils/id-generator';
import { nowUnixMs } from '../lib/utils/time';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.apiToken.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.window.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.authUser.deleteMany();
  await prisma.sharedSettings.deleteMany();
  await prisma.team.deleteMany();
  await prisma.organization.deleteMany();

  // Create default organization
  const orgId = generateInsightfulId();
  const organization = await prisma.organization.create({
    data: {
      id: orgId,
      name: 'Mercor Organization',
      createdAt: nowUnixMs(),
    },
  });
  console.log('✅ Created organization:', organization.name);

  // Create default team
  const teamId = generateInsightfulId();
  const team = await prisma.team.create({
    data: {
      id: teamId,
      name: 'Default Team',
      description: 'Default team for all employees',
      organizationId: orgId,
      default: true,
      createdAt: nowUnixMs(),
    },
  });
  console.log('✅ Created team:', team.name);

  // Create default shared settings
  const settingsId = generateInsightfulId();
  const sharedSettings = await prisma.sharedSettings.create({
    data: {
      id: settingsId,
      name: 'Default Settings',
      type: 'personal',
      settings: JSON.stringify({
        screenshotInterval: 600000, // 10 minutes
        trackingMode: 'automatic',
        idleTimeout: 300000, // 5 minutes
      }),
      organizationId: orgId,
      default: true,
      createdAt: nowUnixMs(),
    },
  });
  console.log('✅ Created shared settings:', sharedSettings.name);

  // Create auth users with different roles
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const employeePassword = await bcrypt.hash('Employee@123', 10);

  const adminUser = await prisma.authUser.create({
    data: {
      email: 'admin@mercor.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isOnboarded: true,
    },
  });

  const managerUser = await prisma.authUser.create({
    data: {
      email: 'manager@mercor.com',
      password: managerPassword,
      role: 'MANAGER',
      isActive: true,
      isOnboarded: true,
    },
  });

  const employeeUser = await prisma.authUser.create({
    data: {
      email: 'employee@mercor.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      isActive: true,
      isOnboarded: true,
    },
  });

  console.log('✅ Created auth users');

  // Create corresponding Insightful employees
  const adminEmployeeId = generateInsightfulId();
  const managerEmployeeId = generateInsightfulId();
  const employeeEmployeeId = generateInsightfulId();

  const adminEmployee = await prisma.employee.create({
    data: {
      id: adminEmployeeId,
      email: 'admin@mercor.com',
      name: 'Admin User',
      teamId,
      sharedSettingsId: settingsId,
      accountId: generateInsightfulId(),
      identifier: 'admin@mercor.com',
      type: 'personal',
      organizationId: orgId,
      projects: JSON.stringify([]),
      deactivated: BigInt(0),
      invited: nowUnixMs(),
      createdAt: nowUnixMs(),
      authUserId: adminUser.id,
    },
  });

  const managerEmployee = await prisma.employee.create({
    data: {
      id: managerEmployeeId,
      email: 'manager@mercor.com',
      name: 'Manager User',
      teamId,
      sharedSettingsId: settingsId,
      accountId: generateInsightfulId(),
      identifier: 'manager@mercor.com',
      type: 'personal',
      organizationId: orgId,
      projects: JSON.stringify([]),
      deactivated: BigInt(0),
      invited: nowUnixMs(),
      createdAt: nowUnixMs(),
      authUserId: managerUser.id,
    },
  });

  const employeeEmployee = await prisma.employee.create({
    data: {
      id: employeeEmployeeId,
      email: 'employee@mercor.com',
      name: 'Employee User',
      teamId,
      sharedSettingsId: settingsId,
      accountId: generateInsightfulId(),
      identifier: 'employee@mercor.com',
      type: 'personal',
      organizationId: orgId,
      projects: JSON.stringify([]),
      deactivated: BigInt(0),
      invited: nowUnixMs(),
      createdAt: nowUnixMs(),
      authUserId: employeeUser.id,
    },
  });

  console.log('✅ Created Insightful employees');

  // Create sample projects
  const project1Id = generateInsightfulId();
  const project2Id = generateInsightfulId();

  const project1 = await prisma.project.create({
    data: {
      id: project1Id,
      name: 'Web Development Project',
      description: 'Building the new company website',
      archived: false,
      statuses: JSON.stringify(['To do', 'In progress', 'Done']),
      priorities: JSON.stringify(['low', 'medium', 'high']),
      billable: true,
      payroll: JSON.stringify({
        billRate: 50,
        overtimeBillrate: 75,
      }),
      employees: JSON.stringify([employeeEmployeeId, managerEmployeeId]),
      creatorId: adminEmployeeId,
      organizationId: orgId,
      teams: JSON.stringify([teamId]),
      createdAt: nowUnixMs(),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      id: project2Id,
      name: 'Mobile App Development',
      description: 'Creating the mobile application',
      archived: false,
      statuses: JSON.stringify(['To do', 'In progress', 'Review', 'Done']),
      priorities: JSON.stringify(['low', 'medium', 'high', 'critical']),
      billable: true,
      payroll: JSON.stringify({
        billRate: 60,
        overtimeBillrate: 90,
      }),
      employees: JSON.stringify([employeeEmployeeId]),
      creatorId: adminEmployeeId,
      organizationId: orgId,
      teams: JSON.stringify([teamId]),
      createdAt: nowUnixMs(),
    },
  });

  console.log('✅ Created projects:', project1.name, project2.name);

  // Create default tasks for each project (1:1 mapping as recommended)
  const task1Id = generateInsightfulId();
  const task2Id = generateInsightfulId();

  const task1 = await prisma.task.create({
    data: {
      id: task1Id,
      name: 'Default Task - Web Development',
      description: 'Default task for web development project',
      projectId: project1Id,
      status: 'In progress',
      priority: 'medium',
      billable: true,
      employees: JSON.stringify([employeeEmployeeId, managerEmployeeId]),
      creatorId: adminEmployeeId,
      organizationId: orgId,
      teams: JSON.stringify([teamId]),
      createdAt: nowUnixMs(),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: task2Id,
      name: 'Default Task - Mobile App',
      description: 'Default task for mobile app project',
      projectId: project2Id,
      status: 'To Do',
      priority: 'high',
      billable: true,
      employees: JSON.stringify([employeeEmployeeId]),
      creatorId: adminEmployeeId,
      organizationId: orgId,
      teams: JSON.stringify([teamId]),
      createdAt: nowUnixMs(),
    },
  });

  console.log('✅ Created tasks:', task1.name, task2.name);

  // Update employees with project assignments
  await prisma.employee.update({
    where: { id: employeeEmployeeId },
    data: {
      projects: JSON.stringify([project1Id, project2Id]),
    },
  });

  await prisma.employee.update({
    where: { id: managerEmployeeId },
    data: {
      projects: JSON.stringify([project1Id]),
    },
  });

  console.log('✅ Updated employee project assignments');

  // Create a sample API token for testing
  const hashedToken = await bcrypt.hash('test_api_token_12345', 10);
  await prisma.apiToken.create({
    data: {
      name: 'Test API Token',
      token: hashedToken,
      lastFourChars: '2345',
      permissions: JSON.stringify(['read:all', 'write:all']),
      isActive: true,
      organizationId: orgId,
    },
  });

  console.log('✅ Created test API token');

  console.log(`
🎉 Seed completed successfully!

Test Credentials:
-----------------
Admin:    admin@mercor.com / Admin@123
Manager:  manager@mercor.com / Manager@123
Employee: employee@mercor.com / Employee@123

API Token: test_api_token_12345

Organization ID: ${orgId}
Team ID: ${teamId}
Project IDs: ${project1Id}, ${project2Id}
Task IDs: ${task1Id}, ${task2Id}
`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
