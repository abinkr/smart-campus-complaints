import { PrismaClient } from '@prisma/client'
import { config } from './index.js'

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    errorFormat: 'minimal',
  })

if (config.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
