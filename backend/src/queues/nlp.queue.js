import { Queue } from 'bullmq'
import { redis } from '../config/redis.js'

export const nlpQueue = new Queue('nlp', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 50,
    },
  },
})
