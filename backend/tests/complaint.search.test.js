import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
  queryRaw: vi.fn(),
}))

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    $transaction: mocks.transaction,
    $queryRaw: mocks.queryRaw,
    complaint: {
      findMany: mocks.findMany,
      count: mocks.count,
    },
  },
}))

const repo = await import('../src/modules/complaint/complaint.repository.js')
const { complaintHistoryQuerySchema, complaintListQuerySchema } = await import('../src/modules/complaint/complaint.schema.js')

describe('student complaint history search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps dashboard complaint list schema separate from search filters', () => {
    const result = complaintListQuerySchema.parse({
      search: '  electrical  ',
      page: '1',
      limit: '6',
    })

    expect(result).toEqual({
      page: 1,
      limit: 6,
    })
  })

  it('accepts trimmed search filters in the student history schema', () => {
    const result = complaintHistoryQuerySchema.parse({
      search: '  electrical  ',
      priority: 'high',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: '1',
      limit: '6',
    })

    expect(result).toEqual({
      search: 'electrical',
      priority: 'HIGH',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 6,
    })
  })

  it('keeps description in the default complaint summary list', async () => {
    mocks.findMany.mockReturnValue('findManyCall')
    mocks.count.mockReturnValue('countCall')
    mocks.transaction.mockResolvedValue([[], 0])

    await repo.findComplaintsByUser('11111111-1111-1111-1111-111111111111', {
      status: 'OPEN',
      page: 1,
      limit: 6,
    })

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          description: true,
        }),
      })
    )
  })

  it('uses full-history backend search before pagination, including partial ID matching', async () => {
    const complaint = {
      id: 'f35bf067-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      title: 'Fire near electrical room',
      description: 'Smoke near the electrical room entrance.',
      category: 'Electrical',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    }

    mocks.queryRaw
      .mockResolvedValueOnce([complaint])
      .mockResolvedValueOnce([{ count: 1 }])

    const result = await repo.findComplaintHistoryByUser(complaint.userId, {
      status: 'OPEN',
      search: 'F35BF067',
      page: 1,
      limit: 6,
    })

    expect(result).toEqual({
      data: [complaint],
      total: 1,
    })
    expect(mocks.queryRaw).toHaveBeenCalledTimes(2)
    expect(mocks.queryRaw.mock.calls[0][0].strings.join('')).toContain('c.id::text ILIKE')
    expect(mocks.queryRaw.mock.calls[0][0].strings.join('')).toContain('u.name')
    expect(mocks.queryRaw.mock.calls[0][0].strings.join('')).toContain('c.priority::text')
    expect(mocks.queryRaw.mock.calls[0][0].strings.join('')).toContain('LIMIT')
    expect(mocks.findMany).not.toHaveBeenCalled()
  })
})
