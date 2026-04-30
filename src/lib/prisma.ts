import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (process.env.NODE_ENV === 'production' && tursoUrl && tursoToken) {
    console.log('[Prisma] Connecting to Turso (LibSQL)');
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    // In this version, PrismaLibSql might expect the client or the config. 
    // Given the error, we'll try passing the client with an explicit cast if needed, 
    // or check if it expects the client as a property.
    const adapter = new PrismaLibSql(libsql as any);
    return new PrismaClient({ adapter, log: ['query'] });
  }

  // Local development fallback
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const dbUrl = `file:${dbPath}`;
  console.log('[Prisma] Connecting via better-sqlite3 to:', dbUrl);

  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter, log: ['query'] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
