import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { 
  prisma?: PrismaClient;
  pgPool?: Pool;
}

const connectionString = `${process.env.DATABASE_URL}`

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({ 
    connectionString,
    max: 8, // Keep pool small to avoid exhausting Postgres connection limits
    idleTimeoutMillis: 15000, // Release idle clients after 15s
    connectionTimeoutMillis: 15000, // Increased timeout to 15s to handle slower connections/cold starts
  })
}

const pool = globalForPrisma.pgPool
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
