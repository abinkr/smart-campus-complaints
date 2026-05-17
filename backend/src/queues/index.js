import { emailQueue } from './email.queue.js'
import { nlpQueue } from './nlp.queue.js'
import { cleanupQueue, scheduleCleanupJobs } from './cleanup.queue.js'

export { emailQueue, nlpQueue, cleanupQueue, scheduleCleanupJobs }

export const closeQueues = () =>
  Promise.allSettled([
    emailQueue.close(),
    nlpQueue.close(),
    cleanupQueue.close(),
  ])
