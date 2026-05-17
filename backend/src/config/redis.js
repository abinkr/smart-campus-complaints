import { Redis } from 'ioredis'
import { config } from './index.js'
import { logger } from '../utils/logger.js'

const createRedisClient = () => {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis connection failed after 10 retries')
        return null
      }
      return Math.min(times * 100, 3000)
    },
  })

  client.on('connect', () => logger.info('Redis connected'))
  client.on('error', (err) => logger.error({ err }, 'Redis error'))
  client.on('close', () => logger.warn('Redis connection closed'))

  return client
}

export const redis = createRedisClient()
export const redisSubscriber = createRedisClient()
