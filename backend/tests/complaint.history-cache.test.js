import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createComplaint: vi.fn(),
  createComplaintLog: vi.fn(),
  createFollowUpAndLog: vi.fn(),
  findComplaintById: vi.fn(),
  findComplaintsByUser: vi.fn(),
  findComplaintHistoryByUser: vi.fn(),
  invalidateCachePattern: vi.fn(),
  withCache: vi.fn((key, ttl, loader) => loader()),
}))

vi.mock('../src/modules/complaint/complaint.repository.js', () => ({
  createComplaint: mocks.createComplaint,
  createComplaintLog: mocks.createComplaintLog,
  createFollowUpAndLog: mocks.createFollowUpAndLog,
  findComplaintById: mocks.findComplaintById,
  findComplaintsByUser: mocks.findComplaintsByUser,
  findComplaintHistoryByUser: mocks.findComplaintHistoryByUser,
}))

vi.mock('../src/utils/cache.js', () => ({
  invalidateCachePattern: mocks.invalidateCachePattern,
  withCache: mocks.withCache,
}))

vi.mock('../src/config/index.js', () => ({
  config: {
    NLP_SERVICE_URL: 'http://localhost:8000',
    NLP_TIMEOUT_MS: 1000,
    RELOAD_SECRET: 'test',
  },
}))

vi.mock('../src/config/cloudinary.js', () => ({
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../src/queues/email.queue.js', () => ({
  emailQueue: {
    add: vi.fn(),
  },
}))

vi.mock('../src/queues/nlp.queue.js', () => ({
  nlpQueue: {
    add: vi.fn(),
  },
}))

vi.mock('../src/modules/admin/notification.service.js', () => ({
  notifyHighPriorityComplaint: vi.fn(),
}))

vi.mock('../src/modules/notification/notification.service.js', () => ({
  notifyStudentComplaintSubmitted: vi.fn(),
}))

vi.mock('../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

const service = await import('../src/modules/complaint/complaint.service.js')

describe('student complaint cache separation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.withCache.mockImplementation((key, ttl, loader) => loader())
    mocks.findComplaintsByUser.mockResolvedValue({ data: [], total: 0 })
    mocks.findComplaintHistoryByUser.mockResolvedValue({ data: [], total: 0 })
  })

  it('keeps dashboard list cache independent from accidental search input', async () => {
    await service.getMyComplaints('11111111-1111-1111-1111-111111111111', {
      status: 'OPEN',
      search: 'fire',
      page: 1,
      limit: 6,
    })

    const cacheKey = mocks.withCache.mock.calls[0][0]

    expect(cacheKey).toContain(':mine:')
    expect(cacheKey).not.toContain('fire')
    expect(mocks.findComplaintsByUser).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      {
        status: 'OPEN',
        page: 1,
        limit: 6,
      }
    )
  })

  it('includes history search filters in the history cache namespace', async () => {
    await service.getComplaintHistory('11111111-1111-1111-1111-111111111111', {
      status: 'OPEN',
      search: 'fire',
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    const cacheKey = mocks.withCache.mock.calls[0][0]

    expect(cacheKey).toContain(':history:')
    expect(cacheKey).toContain('"search":"fire"')
    expect(cacheKey).toContain('"status":"OPEN"')
    expect(mocks.findComplaintHistoryByUser).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      {
        status: 'OPEN',
        search: 'fire',
        page: 1,
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    )
  })
})
