import { PrismaClient } from '@prisma/client';
import { processLead } from '../src/lib/leadEngine';

const prisma = new PrismaClient();

async function run() {
  try {
    const res = await processLead({
      name: 'Test',
      phone: '1234567890',
      city: 'Test City',
      serviceId: 1
    });
    console.log('Success:', res);
  } catch (err: any) {
    console.error('Error in processLead:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
