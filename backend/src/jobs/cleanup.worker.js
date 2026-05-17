import { Worker } from 'bullmq'
import { redis } from '../config/redis.js'
import { prisma } from '../config/prisma.js'
import { logger } from '../utils/logger.js'
import { deleteExpiredMfaChallenges } from '../modules/auth/mfa.service.js'

export const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    if (job.name !== 'expiredRefreshTokens') {
      logger.warn({ jobName: job.name }, 'Unknown cleanup job')
      return
    }

    const [refreshTokens, mfaChallenges] = await Promise.all([
      prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      deleteExpiredMfaChallenges(),
    ])

    logger.info(
      {
        refreshTokens: refreshTokens.count,
        mfaChallenges: mfaChallenges.count,
      },
      'Expired auth artifacts removed'
    )
  },
  {
    connection: redis,
    concurrency: 1,
  }
)

cleanupWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Cleanup job failed')
})
