import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    $transaction: mocks.transaction,
    notification: {
      create: mocks.create,
      findMany: mocks.findMany,
      count: mocks.count,
      findFirst: mocks.findFirst,
      update: mocks.update,
      updateMany: mocks.updateMany,
    },
  },
}))

const notificationService = await import('../src/modules/notification/notification.service.js')
const { NotFoundError } = await import('../src/utils/ApiError.js')

describe('student notification service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists the current student notifications with unread count', async () => {
    const notifications = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Complaint status updated',
        readAt: null,
      },
    ]

    mocks.transaction.mockResolvedValue([notifications, 1])

    const result = await notificationService.listMyNotifications('student-1', { limit: 5 })

    expect(result).toEqual({
      notifications,
      unreadCount: 1,
    })
    expect(mocks.transaction).toHaveBeenCalled()
  })

  it('marks only the current student notification as read', async () => {
    const notification = {
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'student-1',
      readAt: null,
    }

    mocks.findFirst.mockResolvedValue(notification)
    mocks.update.mockResolvedValue({
      ...notification,
      readAt: new Date('2026-06-01T10:00:00.000Z'),
    })

    await notificationService.markMyNotificationRead('student-1', notification.id)

    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: {
        id: notification.id,
        userId: 'student-1',
      },
    })
    expect(mocks.update).toHaveBeenCalledWith({
      where: {
        id: notification.id,
      },
      data: {
        readAt: expect.any(Date),
      },
    })
  })

  it('rejects marking another user notification as read', async () => {
    mocks.findFirst.mockResolvedValue(null)

    await expect(
      notificationService.markMyNotificationRead('student-1', '11111111-1111-1111-1111-111111111111')
    ).rejects.toThrow(NotFoundError)

    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('creates a notification when a student complaint status changes', async () => {
    const complaint = {
      id: '22222222-2222-2222-2222-222222222222',
      userId: 'student-1',
      title: 'Fire near electrical room',
    }

    await notificationService.notifyStudentStatusUpdate(complaint, 'IN_PROGRESS')

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: complaint.userId,
        complaintId: complaint.id,
        type: expect.stringMatching(/^STUDENT_STATUS_IN_PROGRESS_/),
        title: 'Complaint status updated',
        message: '"Fire near electrical room" is now In Progress.',
      }),
    })
    expect(mocks.create.mock.calls[0][0].data.type.length).toBeLessThanOrEqual(40)
  })

  it('creates a notification for a public admin update', async () => {
    const complaint = {
      id: '33333333-3333-3333-3333-333333333333',
      userId: 'student-1',
      title: 'Water not coming',
    }

    await notificationService.notifyStudentPublicUpdate(
      complaint,
      'Maintenance team will inspect the block today.',
      '44444444-4444-4444-4444-444444444444'
    )

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: complaint.userId,
        complaintId: complaint.id,
        type: expect.stringMatching(/^STUDENT_PUBLIC_UPDATE_/),
        title: 'New update on your complaint',
        message: 'Maintenance team will inspect the block today.',
      }),
    })
  })
})
