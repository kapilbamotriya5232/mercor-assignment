const { PrismaClient } = require('./app/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check for the specific employee
    const employee = await prisma.employee.findUnique({
      where: { email: 'kapilworkspace23@gmail.com' },
      include: { authUser: true }
    });

    if (employee) {
      console.log('👤 Employee found:');
      console.log(`  ID: ${employee.id}`);
      console.log(`  Name: ${employee.name}`);
      console.log(`  Email: ${employee.email}`);
      console.log(`  AuthUser ID: ${employee.authUserId || 'None'}`);
      console.log(`  Has AuthUser: ${employee.authUser ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Employee not found');
    }

    // Check for AuthUser with this email
    const authUser = await prisma.authUser.findUnique({
      where: { email: 'kapilworkspace23@gmail.com' },
      include: { employee: true }
    });

    if (authUser) {
      console.log('\n🔐 AuthUser found:');
      console.log(`  ID: ${authUser.id}`);
      console.log(`  Email: ${authUser.email}`);
      console.log(`  Role: ${authUser.role}`);
      console.log(`  Is Active: ${authUser.isActive}`);
      console.log(`  Has Password: ${authUser.password ? 'Yes' : 'No'}`);
      console.log(`  Linked Employee: ${authUser.employee ? 'Yes' : 'No'}`);
      if (authUser.employee) {
        console.log(`  Employee ID: ${authUser.employee.id}`);
      }
    } else {
      console.log('\n❌ AuthUser not found');
    }

    // Check activation tokens
    const activationTokens = await prisma.activationToken.findMany({
      where: { email: 'kapilworkspace23@gmail.com' }
    });

    console.log(`\n🎫 Activation tokens found: ${activationTokens.length}`);
    activationTokens.forEach((token, index) => {
      console.log(`  Token ${index + 1}:`);
      console.log(`    Used: ${token.used}`);
      console.log(`    Expires: ${token.expiresAt}`);
      console.log(`    Created: ${token.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
