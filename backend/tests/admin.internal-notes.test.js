import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findComplaintForUpdate: vi.fn(),
  createInternalNoteAndLog: vi.fn(),
  invalidateCachePattern: vi.fn(),
  emailQueue: {
    add: vi.fn(),
  },
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../src/modules/admin/admin.repository.js', () => ({
  findComplaintForUpdate: mocks.findComplaintForUpdate,
  createInternalNoteAndLog: mocks.createInternalNoteAndLog,
}))

vi.mock('../src/utils/cache.js', () => ({
  withCache: vi.fn((key, ttl, loader) => loader()),
  invalidateCachePattern: mocks.invalidateCachePattern,
}))

vi.mock('../src/queues/email.queue.js', () => ({
  emailQueue: mocks.emailQueue,
}))

vi.mock('../src/utils/logger.js', () => ({
  logger: mocks.logger,
}))

const adminService = await import('../src/modules/admin/admin.service.js')
const { NotFoundError } = await import('../src/utils/ApiError.js')

describe('admin internal notes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves an admin-only note and writes an internal complaint log', async () => {
    const complaint = {
      id: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      status: 'IN_PROGRESS',
      user: {
        email: 'student@campus.edu',
      },
    }
    const note = {
      id: '33333333-3333-3333-3333-333333333333',
      complaintId: complaint.id,
      note: 'Dispatch team assigned to inspect the site.',
      createdByAdminId: '44444444-4444-4444-4444-444444444444',
    }

    mocks.findComplaintForUpdate.mockResolvedValue(complaint)
    mocks.createInternalNoteAndLog.mockResolvedValue(note)
    mocks.invalidateCachePattern.mockResolvedValue()

    const result = await adminService.submitInternalNote(complaint.id, note.createdByAdminId, {
      note: note.note,
    })

    expect(result).toEqual(note)
    expect(mocks.createInternalNoteAndLog).toHaveBeenCalledWith(
      {
        complaintId: complaint.id,
        note: note.note,
        createdByAdminId: note.createdByAdminId,
      },
      expect.objectContaining({
        complaintId: complaint.id,
        changedBy: note.createdByAdminId,
        oldStatus: complaint.status,
        newStatus: complaint.status,
        note: note.note,
        isInternal: true,
      })
    )
    expect(mocks.invalidateCachePattern).toHaveBeenCalledWith(`complaints:user:${complaint.userId}:*`)
    expect(mocks.invalidateCachePattern).toHaveBeenCalledWith('admin:complaints:*')
  })

  it('throws when the complaint does not exist', async () => {
    mocks.findComplaintForUpdate.mockResolvedValue(null)

    await expect(
      adminService.submitInternalNote('11111111-1111-1111-1111-111111111111', 'admin-id', {
        note: 'private note',
      })
    ).rejects.toThrow(NotFoundError)

    expect(mocks.createInternalNoteAndLog).not.toHaveBeenCalled()
  })
})
