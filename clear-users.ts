import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('🗑️ Clearing existing users...');
    await prisma.user.deleteMany({});
    console.log('✅ Users cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();
