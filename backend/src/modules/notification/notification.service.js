import { prisma } from '../../config/prisma.js'
import { NotFoundError } from '../../utils/ApiError.js'

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
}

const compact = (value) => String(value ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12)

const uniqueType = (prefix, seed = Date.now().toString(36)) =>
  `${prefix}_${compact(seed)}`.slice(0, 40)

const truncate = (value, max = 140) => {
  const text = String(value ?? '').trim()
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

export const listMyNotifications = async (userId, { limit = 10 } = {}) => {
  const take = Math.min(Math.max(Number(limit) || 10, 1), 25)

  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      include: {
        complaint: {
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
          },
        },
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    }),
  ])

  return {
    notifications,
    unreadCount,
  }
}

export const markMyNotificationRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  })

  if (!notification) {
    throw new NotFoundError('Notification not found')
  }

  if (notification.readAt) {
    return notification
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      readAt: new Date(),
    },
  })
}

export const markAllMyNotificationsRead = (userId) =>
  prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

export const notifyStudentComplaintSubmitted = (complaint) =>
  prisma.notification.create({
    data: {
      userId: complaint.userId,
      complaintId: complaint.id,
      type: 'STUDENT_COMPLAINT_SUBMITTED',
      title: 'Complaint submitted',
      message: `"${truncate(complaint.title, 80)}" was filed and is awaiting review.`,
    },
  })

export const notifyStudentStatusUpdate = (complaint, newStatus) =>
  prisma.notification.create({
    data: {
      userId: complaint.userId,
      complaintId: complaint.id,
      type: uniqueType(`STUDENT_STATUS_${newStatus}`),
      title: 'Complaint status updated',
      message: `"${truncate(complaint.title, 80)}" is now ${STATUS_LABELS[newStatus] ?? newStatus}.`,
    },
  })

export const notifyStudentPublicUpdate = (complaint, message, seed = Date.now().toString(36)) =>
  prisma.notification.create({
    data: {
      userId: complaint.userId,
      complaintId: complaint.id,
      type: uniqueType('STUDENT_PUBLIC_UPDATE', seed),
      title: 'New update on your complaint',
      message: truncate(message || `There is a new update for "${complaint.title}".`),
    },
  })
