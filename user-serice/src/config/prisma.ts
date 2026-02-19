import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './';

const connectionString = config.DATABASE_URL;

// Ensure singleton in dev to prevent multiple instances (hot reloads)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.prisma) {
  const adapter = new PrismaPg({ connectionString });

  global.prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'], // log Prisma errors and warnings
  });
}

prisma = global.prisma;

export default prisma;
