import { prisma } from '../../config/prisma.js'
import { emailQueue } from '../../queues/email.queue.js'
import { sendSms } from '../../services/sms.service.js'
import { logger } from '../../utils/logger.js'
import { NotFoundError } from '../../utils/ApiError.js'

const NOTIFICATION_TYPES = {
  HIGH_PRIORITY: 'HIGH_PRIORITY_COMPLAINT',
  DAILY_DIGEST: 'DAILY_DIGEST',
}

const ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  emailInstantAlerts: true,
  emailDailyDigest: true,
  smsCriticalAlerts: true,
}

const complaintSummary = (complaint) => ({
  id: complaint.id,
  title: complaint.title,
  category: complaint.category,
  priority: complaint.priority,
  status: complaint.status,
  department: complaint.department,
  createdAt: complaint.createdAt,
})

export const listNotifications = async (userId, { limit = 10 } = {}) => {
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

export const markNotificationRead = async (userId, notificationId) => {
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

export const markAllNotificationsRead = async (userId) =>
  prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

export const notifyHighPriorityComplaint = async (complaint) => {
  if (complaint.priority !== 'HIGH') {
    return
  }

  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
    },
    select: ADMIN_SELECT,
  })

  if (admins.length === 0) {
    return
  }

  const title = 'High-priority complaint filed'
  const message = `${complaint.title} needs urgent review.`
  const summary = complaintSummary(complaint)

  await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      complaintId: complaint.id,
      type: NOTIFICATION_TYPES.HIGH_PRIORITY,
      title,
      message,
    })),
    skipDuplicates: true,
  })

  const sideEffects = [
    ...admins
      .filter(admin => admin.emailInstantAlerts)
      .map(admin =>
        emailQueue.add('adminHighPriority', {
          to: admin.email,
          adminName: admin.name,
          complaint: summary,
        })
      ),
    ...admins
      .filter(admin => admin.smsCriticalAlerts && admin.phoneNumber)
      .map(admin =>
        sendSms({
          to: admin.phoneNumber,
          body: `Smart Campus urgent complaint: ${complaint.title} (#${complaint.id.slice(0, 8).toUpperCase()})`,
        })
      ),
  ]

  const results = await Promise.allSettled(sideEffects)

  for (const result of results) {
    if (result.status === 'rejected') {
      logger.warn({ err: result.reason, complaintId: complaint.id }, 'Admin alert side effect failed')
    }
  }
}

export const sendDailyDigestNotifications = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [admins, newComplaints, resolvedComplaints] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        role: 'ADMIN',
        emailDailyDigest: true,
      },
      select: ADMIN_SELECT,
    }),
    prisma.complaint.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        department: true,
        createdAt: true,
      },
    }),
    prisma.complaint.findMany({
      where: {
        resolvedAt: {
          gte: since,
        },
      },
      orderBy: {
        resolvedAt: 'desc',
      },
      take: 20,
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        department: true,
        resolvedAt: true,
      },
    }),
  ])

  if (admins.length === 0 || (newComplaints.length === 0 && resolvedComplaints.length === 0)) {
    return {
      admins: admins.length,
      newComplaints: newComplaints.length,
      resolvedComplaints: resolvedComplaints.length,
    }
  }

  const digestTitle = 'Daily complaint digest'
  const digestMessage = `${newComplaints.length} new and ${resolvedComplaints.length} resolved complaints in the last 24 hours.`

  await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      complaintId: null,
      type: NOTIFICATION_TYPES.DAILY_DIGEST,
      title: digestTitle,
      message: digestMessage,
    })),
  })

  await Promise.allSettled(
    admins.map(admin =>
      emailQueue.add('adminDailyDigest', {
        to: admin.email,
        adminName: admin.name,
        newComplaints,
        resolvedComplaints,
      })
    )
  )

  return {
    admins: admins.length,
    newComplaints: newComplaints.length,
    resolvedComplaints: resolvedComplaints.length,
  }
}
