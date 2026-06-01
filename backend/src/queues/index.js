import { emailQueue } from './email.queue.js'
import { nlpQueue } from './nlp.queue.js'
import { cleanupQueue, scheduleCleanupJobs } from './cleanup.queue.js'
import { notificationQueue, scheduleNotificationJobs } from './notification.queue.js'

export { emailQueue, nlpQueue, cleanupQueue, notificationQueue, scheduleCleanupJobs, scheduleNotificationJobs }

export const closeQueues = () =>
  Promise.allSettled([
    emailQueue.close(),
    nlpQueue.close(),
    cleanupQueue.close(),
    notificationQueue.close(),
  ])
