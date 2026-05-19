import { Worker } from 'bullmq'
import axios from 'axios'
import { redis } from '../config/redis.js'
import { prisma } from '../config/prisma.js'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { emailQueue } from '../queues/email.queue.js'
import { invalidateCachePattern } from '../utils/cache.js'

const PRIORITY_MAP = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

const nlpRequestOptions = () => ({
  timeout: config.NLP_TIMEOUT_MS,
  headers: {
    'X-NLP-Secret': config.RELOAD_SECRET,
  },
})

export const nlpWorker = new Worker(
  'nlp',
  async (job) => {
    const { complaintId, text } = job.data

    let category = 'Other'
    let priority = 'MEDIUM'
    let confidence = 0

    try {
      const response = await axios.post(
        `${config.NLP_SERVICE_URL}/classify`,
        { text },
        nlpRequestOptions()
      )

      category = response.data.category ?? 'Other'
      priority = PRIORITY_MAP[response.data.priority?.toLowerCase()] ?? 'MEDIUM'
      confidence = response.data.category_confidence ?? response.data.confidence ?? 0
    } catch (err) {
      logger.warn({ err: err.message, complaintId }, 'NLP service call failed in worker')
    }

    const updated = await prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        category,
        priority,
        nlpConfidence: confidence,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    await Promise.allSettled([
      emailQueue.add(
        'confirmation',
        {
          to: updated.user.email,
          complaintId: updated.id,
          title: updated.title,
          category,
          priority,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      ),
      invalidateCachePattern('analytics:*'),
      invalidateCachePattern(`complaints:user:${updated.userId}:*`),
      invalidateCachePattern('admin:complaints:*'),
    ])

    logger.info({ complaintId, category, priority }, 'NLP classification complete')
  },
  {
    connection: redis,
    concurrency: 3,
  }
)

nlpWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'NLP job failed')
})
