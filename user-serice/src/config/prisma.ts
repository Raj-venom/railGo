import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './';


declare global {
  var _prisma: PrismaClient | undefined;
}

if (!globalThis._prisma) {
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

  globalThis.prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

const prisma = globalThis._prisma!;

export default prisma;