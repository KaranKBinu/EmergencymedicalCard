// Updated: 2026-04-30T08:35:00Z
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // PrismaBetterSqlite3 expects { url: 'file:path' } — it creates the Database internally
  // It strips the 'file:' prefix itself, so we just need a plain file path
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const dbUrl = `file:${dbPath}`;
  console.log('[Prisma] Connecting via better-sqlite3 to:', dbUrl);

  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter, log: ['query'] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Deep Cache Refresh Salt: 992288
// Timestamp: 2026-04-30T09:35:00Z

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
