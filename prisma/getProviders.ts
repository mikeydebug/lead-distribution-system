import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const providers = await prisma.provider.findMany();
  console.log(providers);
}
run();
