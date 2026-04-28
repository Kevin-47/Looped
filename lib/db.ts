// import { PrismaClient } from '@/lib/generated/prisma'

// const globalForPrisma = global as unknown as { 
//     prisma: PrismaClient
// }

// const prisma = globalForPrisma.prisma || new PrismaClient()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// export default prisma

// import { PrismaClient } from '@/lib/generated/prisma'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['warn', 'error'],
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// export default prisma


import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}