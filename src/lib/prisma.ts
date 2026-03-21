import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

function getPrisma(): ReturnType<typeof prismaClientSingleton> {
  const cached = globalThis.prismaGlobal;
  if (cached && typeof (cached as any).project?.findMany === 'function') {
    return cached;
  }
  const client = prismaClientSingleton();
  if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = client;
  return client;
}

export const prisma = getPrisma();
