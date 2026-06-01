import axios from 'axios'
import { config } from '../../config/index.js'
import { uploadToCloudinary } from '../../config/cloudinary.js'
import * as repo from './complaint.repository.js'
import { emailQueue } from '../../queues/email.queue.js'
import { nlpQueue } from '../../queues/nlp.queue.js'
import { notifyHighPriorityComplaint } from '../admin/notification.service.js'
import { notifyStudentComplaintSubmitted } from '../notification/notification.service.js'
import { ForbiddenError, NotFoundError } from '../../utils/ApiError.js'
import { invalidateCachePattern, withCache } from '../../utils/cache.js'
import { logger } from '../../utils/logger.js'
import { applyClassificationOverrides, classifyComplaintText } from './nlp.classifier.js'

const STATUS_EXPLANATIONS = {
  open: "Your concern has been logged and is awaiting administrative triage.",
  in_progress: "Our team is actively investigating the concern and coordinating resolution.",
  resolved: "The concern has been addressed and marked as resolved. You can review the details below."
}

const nlpRequestOptions = () => ({
  timeout: config.NLP_TIMEOUT_MS,
  headers: {
    'X-NLP-Secret': config.RELOAD_SECRET,
  },
})

export const callNlpService = async (text) => {
  try {
    const response = await axios.post(
      `${config.NLP_SERVICE_URL}/classify`,
      { text },
      nlpRequestOptions()
    )

    return applyClassificationOverrides(text, response.data)
  } catch (err) {
    logger.warn({ err: err.message }, 'NLP service unavailable - using fallback')

    return classifyComplaintText(text)
  }
}

const logRejectedSideEffects = (results) => {
  for (const result of results) {
    if (result.status === 'rejected') {
      logger.warn({ err: result.reason }, 'Complaint post-submit side effect failed')
    }
  }
}

export const submitComplaint = async (userId, body, file) => {
  let imageUrl = null
  const text = `${body.title ?? ''} ${body.description ?? ''}`.trim()
  const initialClassification = classifyComplaintText(text)

  if (file) {
    const result = await uploadToCloudinary(file.buffer, 'campus-complaints')
    imageUrl = result.secure_url
  }

  const complaint = await repo.createComplaint({
    userId,
    title: body.title,
    description: body.description,
    imageUrl,
    category: initialClassification.category,
    priority: initialClassification.priority,
    nlpConfidence: initialClassification.confidence,
    status: 'OPEN',
  })

  await repo.createComplaintLog({
    complaintId: complaint.id,
    changedBy: null,
    oldStatus: null,
    newStatus: 'OPEN',
    note: 'Complaint submitted',
    isInternal: false,
  })

  Promise.allSettled([
    nlpQueue.add(
      'classify',
      {
        complaintId: complaint.id,
        text,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    ),
    emailQueue.add('confirmation', {
      to: complaint.user?.email,
      complaintId: complaint.id,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
    }),
    notifyHighPriorityComplaint(complaint),
    notifyStudentComplaintSubmitted(complaint),
    invalidateCachePattern(`complaints:user:${userId}:*`),
    invalidateCachePattern('admin:complaints:*'),
    invalidateCachePattern('analytics:*'),
  ]).then(logRejectedSideEffects)

  return complaint
}

export const getMyComplaints = async (userId, query) =>
  withCache(
    `complaints:user:${userId}:status:${query.status ?? 'all'}:page:${query.page}:limit:${query.limit}`,
    60,
    () => repo.findComplaintsByUser(userId, query)
  )

export const getComplaintById = async (id, requestingUser) => {
  const complaint = await repo.findComplaintById(id)

  if (!complaint) {
    throw new NotFoundError('Complaint not found')
  }

  const isOwner = complaint.userId === requestingUser.id
  const isAdmin = requestingUser.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Access denied')
  }

  const statusMeaning = STATUS_EXPLANATIONS[complaint.status.toLowerCase()] || STATUS_EXPLANATIONS.open

  if (isAdmin) {
    return {
      ...complaint,
      statusMeaning,
      student: complaint.user,
      publicUpdates: complaint.publicUpdates,
      internalNotes: complaint.internalNotes,
      studentFollowUps: complaint.studentFollowUps,
      timeline: complaint.logs,
      logs: complaint.logs,
      complaint: {
        id: complaint.id,
        userId: complaint.userId,
        title: complaint.title,
        description: complaint.description,
        imageUrl: complaint.imageUrl,
        category: complaint.category,
        priority: complaint.priority,
        nlpConfidence: complaint.nlpConfidence,
        status: complaint.status,
        department: complaint.department,
        adminNote: complaint.adminNote,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolvedAt: complaint.resolvedAt,
        statusMeaning,
      }
    }
  }

  const safeLogs = complaint.logs.filter(l => !l.isInternal)
  return {
    ...complaint,
    statusMeaning,
    logs: safeLogs,
    timeline: safeLogs,
    publicUpdates: complaint.publicUpdates,
    studentFollowUps: complaint.studentFollowUps,
    internalNotes: [],
    complaint: {
      id: complaint.id,
      userId: complaint.userId,
      title: complaint.title,
      description: complaint.description,
      imageUrl: complaint.imageUrl,
      category: complaint.category,
      priority: complaint.priority,
      nlpConfidence: complaint.nlpConfidence,
      status: complaint.status,
      department: complaint.department,
      adminNote: complaint.adminNote,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      resolvedAt: complaint.resolvedAt,
      statusMeaning,
    }
  }
}

export const submitFollowUp = async (complaintId, studentId, body) => {
  const complaint = await repo.findComplaintById(complaintId)

  if (!complaint) {
    throw new NotFoundError('Complaint not found')
  }

  if (complaint.userId !== studentId) {
    throw new ForbiddenError('Access denied')
  }

  const oldStatus = complaint.status

  const followUp = await repo.createFollowUpAndLog(
    {
      complaintId,
      studentId,
      message: body.message,
    },
    {
      complaintId,
      changedBy: studentId,
      oldStatus,
      newStatus: 'OPEN',
      note: body.message,
      isInternal: false,
    }
  )

  Promise.allSettled([
    invalidateCachePattern(`complaints:user:${studentId}:*`),
    invalidateCachePattern('admin:complaints:*'),
    invalidateCachePattern('analytics:*'),
  ])

  return followUp
}
