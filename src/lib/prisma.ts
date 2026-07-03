import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new PrismaClient();
  }
  
  if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = WebSocket;
    neonConfig.pipelineTLS = false;
    neonConfig.fetchConnectionCache = true;
  }
  
  const adapter = new PrismaNeon(connectionString);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
