import { PrismaClient } from '../app/generated/prisma';
import { hashPassword } from '../lib/auth/password';
import { generateSecureToken } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a default organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Mercor Demo Organization',
    },
  });
  console.log('✅ Created organization:', organization.name);

  // Create admin user (already activated)
  const adminPassword = await hashPassword('Admin@123');
  const admin = await prisma.employee.create({
    data: {
      email: 'admin@mercor.com',
      name: 'Admin User',
      password: adminPassword,
      isActive: true,
      isOnboarded: true,
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create manager user (already activated)
  const managerPassword = await hashPassword('Manager@123');
  const manager = await prisma.employee.create({
    data: {
      email: 'manager@mercor.com',
      name: 'Manager User',
      password: managerPassword,
      isActive: true,
      isOnboarded: true,
      role: 'MANAGER',
      organizationId: organization.id,
    },
  });
  console.log('✅ Created manager user:', manager.email);

  // Create regular employee (already activated)
  const employeePassword = await hashPassword('Employee@123');
  const employee = await prisma.employee.create({
    data: {
      email: 'employee@mercor.com',
      name: 'John Doe',
      password: employeePassword,
      isActive: true,
      isOnboarded: true,
      role: 'EMPLOYEE',
      organizationId: organization.id,
    },
  });
  console.log('✅ Created employee user:', employee.email);

  // Create an unactivated employee (pending activation)
  const pendingEmployee = await prisma.employee.create({
    data: {
      email: 'pending@mercor.com',
      name: null,
      password: null,
      isActive: false,
      isOnboarded: false,
      role: 'EMPLOYEE',
      organizationId: organization.id,
      activationToken: generateSecureToken(),
      activationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });
  console.log('✅ Created pending employee:', pendingEmployee.email);
  console.log('   Activation token:', pendingEmployee.activationToken);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      organizationId: organization.id,
      employees: {
        connect: [{ id: employee.id }, { id: manager.id }],
      },
    },
  });
  console.log('✅ Created project:', project1.name);

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      organizationId: organization.id,
      employees: {
        connect: [{ id: employee.id }],
      },
    },
  });
  console.log('✅ Created project:', project2.name);

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      name: 'Homepage Design',
      projectId: project1.id,
      employees: {
        connect: [{ id: employee.id }],
      },
    },
  });
  console.log('✅ Created task:', task1.name);

  const task2 = await prisma.task.create({
    data: {
      name: 'User Authentication',
      projectId: project2.id,
      employees: {
        connect: [{ id: employee.id }],
      },
    },
  });
  console.log('✅ Created task:', task2.name);

  // Create sample time entries for the employee
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0); // 9 AM yesterday

  const timeEntry1 = await prisma.timeEntry.create({
    data: {
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      durationInSeconds: 4 * 60 * 60, // 4 hours
      employeeId: employee.id,
      taskId: task1.id,
      notes: 'Worked on homepage wireframes',
    },
  });
  console.log('✅ Created time entry for:', timeEntry1.durationInSeconds / 3600, 'hours');

  const today = new Date();
  today.setHours(10, 0, 0, 0); // 10 AM today

  const timeEntry2 = await prisma.timeEntry.create({
    data: {
      startTime: today,
      endTime: null, // Currently running
      durationInSeconds: 0,
      employeeId: employee.id,
      taskId: task2.id,
      notes: 'Working on authentication module',
    },
  });
  console.log('✅ Created active time entry (currently running)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@mercor.com / Admin@123');
  console.log('   Manager: manager@mercor.com / Manager@123');
  console.log('   Employee: employee@mercor.com / Employee@123');
  console.log('   Pending: pending@mercor.com (needs activation)');
  console.log(`   Activation token for pending: ${pendingEmployee.activationToken}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
