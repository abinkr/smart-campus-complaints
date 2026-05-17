import { redis } from '../config/redis.js'
import { logger } from './logger.js'

export const withCache = async (key, ttlSeconds, loader) => {
  try {
    const cached = await redis.get(key)

    if (cached) {
      logger.debug({ key }, 'Cache hit')
      return JSON.parse(cached)
    }
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed - falling through to DB')
  }

  const data = await loader()

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data))
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed')
  }

  return data
}

export const invalidateCache = async (...keys) => {
  if (keys.length === 0) {
    return
  }

  try {
    await redis.del(...keys)
    logger.debug({ keys }, 'Cache invalidated')
  } catch (err) {
    logger.warn({ err, keys }, 'Cache invalidation failed')
  }
}

export const invalidateCachePattern = async (pattern) => {
  try {
    const keys = []
    let cursor = '0'

    do {
      const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      keys.push(...batch)
    } while (cursor !== '0')

    if (keys.length > 0) {
      await redis.del(...keys)
      logger.debug({ pattern, count: keys.length }, 'Cache pattern invalidated')
    }
  } catch (err) {
    logger.warn({ err, pattern }, 'Cache pattern invalidation failed')
  }
}
