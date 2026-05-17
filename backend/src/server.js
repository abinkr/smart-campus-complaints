import './config/sentry.js'
import { createApp } from './app.js'
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { prisma } from './config/prisma.js'
import { redis, redisSubscriber } from './config/redis.js'
import { emailWorker } from './jobs/email.worker.js'
import { nlpWorker } from './jobs/nlp.worker.js'
import { cleanupWorker } from './jobs/cleanup.worker.js'
import { closeQueues, scheduleCleanupJobs } from './queues/index.js'

await scheduleCleanupJobs()

const app = createApp()

const server = app.listen(config.PORT, () => {
  logger.info(
    {
      port: config.PORT,
      env: config.NODE_ENV,
    },
    'Server started'
  )
})

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received')

  server.close(async () => {
    logger.info('HTTP server closed')

    await Promise.allSettled([
      emailWorker.close(),
      nlpWorker.close(),
      cleanupWorker.close(),
      closeQueues(),
      prisma.$disconnect(),
      redis.quit(),
      redisSubscriber.quit(),
    ])

    logger.info('All connections closed - exiting')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 15_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection')
  process.exit(1)
})
