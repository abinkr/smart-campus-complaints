import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createMany: vi.fn(),
  findManyUsers: vi.fn(),
  findManyNotifications: vi.fn(),
  countNotifications: vi.fn(),
  transaction: vi.fn(),
  emailQueue: {
    add: vi.fn(),
  },
  sendSms: vi.fn(),
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    $transaction: mocks.transaction,
    user: {
      findMany: mocks.findManyUsers,
    },
    notification: {
      createMany: mocks.createMany,
      findMany: mocks.findManyNotifications,
      count: mocks.countNotifications,
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    complaint: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../src/queues/email.queue.js', () => ({
  emailQueue: mocks.emailQueue,
}))

vi.mock('../src/services/sms.service.js', () => ({
  sendSms: mocks.sendSms,
}))

vi.mock('../src/utils/logger.js', () => ({
  logger: mocks.logger,
}))

const notificationService = await import('../src/modules/admin/notification.service.js')

describe('admin notification service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates in-app notifications and respects email/SMS opt-ins for high-priority complaints', async () => {
    const admins = [
      {
        id: 'admin-1',
        name: 'Email Admin',
        email: 'email@campus.edu',
        phoneNumber: null,
        emailInstantAlerts: true,
        emailDailyDigest: true,
        smsCriticalAlerts: false,
      },
      {
        id: 'admin-2',
        name: 'SMS Admin',
        email: 'sms@campus.edu',
        phoneNumber: '+919876543210',
        emailInstantAlerts: false,
        emailDailyDigest: true,
        smsCriticalAlerts: true,
      },
    ]

    const complaint = {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Electrical fire near lab',
      category: 'Electrical',
      priority: 'HIGH',
      status: 'OPEN',
      department: null,
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
    }

    mocks.findManyUsers.mockResolvedValue(admins)
    mocks.createMany.mockResolvedValue({ count: 2 })
    mocks.emailQueue.add.mockResolvedValue({})
    mocks.sendSms.mockResolvedValue(true)

    await notificationService.notifyHighPriorityComplaint(complaint)

    expect(mocks.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'admin-1',
          complaintId: complaint.id,
          type: 'HIGH_PRIORITY_COMPLAINT',
        }),
        expect.objectContaining({
          userId: 'admin-2',
          complaintId: complaint.id,
          type: 'HIGH_PRIORITY_COMPLAINT',
        }),
      ],
      skipDuplicates: true,
    })
    expect(mocks.emailQueue.add).toHaveBeenCalledTimes(1)
    expect(mocks.emailQueue.add).toHaveBeenCalledWith(
      'adminHighPriority',
      expect.objectContaining({
        to: 'email@campus.edu',
      })
    )
    expect(mocks.sendSms).toHaveBeenCalledWith({
      to: '+919876543210',
      body: expect.stringContaining('Electrical fire near lab'),
    })
  })

  it('does nothing for non-high-priority complaints', async () => {
    await notificationService.notifyHighPriorityComplaint({
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Minor plumbing issue',
      priority: 'MEDIUM',
    })

    expect(mocks.findManyUsers).not.toHaveBeenCalled()
    expect(mocks.createMany).not.toHaveBeenCalled()
    expect(mocks.emailQueue.add).not.toHaveBeenCalled()
    expect(mocks.sendSms).not.toHaveBeenCalled()
  })

  it('returns notifications with unread count', async () => {
    const notifications = [
      {
        id: 'notification-1',
        title: 'High-priority complaint filed',
        readAt: null,
      },
    ]

    mocks.transaction.mockResolvedValue([notifications, 1])

    const result = await notificationService.listNotifications('admin-1', { limit: 5 })

    expect(result).toEqual({
      notifications,
      unreadCount: 1,
    })
    expect(mocks.transaction).toHaveBeenCalled()
  })
})
