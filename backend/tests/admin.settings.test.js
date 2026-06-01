import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findUserById: vi.fn(),
  getSystemPreference: vi.fn(),
  upsertSystemPreference: vi.fn(),
  updateUser: vi.fn(),
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  emailQueue: {
    add: vi.fn(),
  },
  config: {},
}))

vi.mock('../src/modules/admin/admin.repository.js', () => ({
  findUserById: mocks.findUserById,
  getSystemPreference: mocks.getSystemPreference,
  upsertSystemPreference: mocks.upsertSystemPreference,
  updateUser: mocks.updateUser,
}))

vi.mock('../src/config/index.js', () => ({
  config: mocks.config,
}))

vi.mock('../src/utils/logger.js', () => ({
  logger: mocks.logger,
}))

vi.mock('../src/queues/email.queue.js', () => ({
  emailQueue: mocks.emailQueue,
}))

vi.mock('../src/config/redis.js', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    scan: vi.fn(),
  },
}))

vi.mock('../src/utils/cache.js', () => ({
  withCache: vi.fn((key, ttl, loader) => loader()),
  invalidateCachePattern: vi.fn(),
  invalidateCache: vi.fn(),
}))

const adminService = await import('../src/modules/admin/admin.service.js')
const { NotFoundError, ForbiddenError } = await import('../src/utils/ApiError.js')

describe('admin settings controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSettings', () => {
    it('returns the settings object including isSuperAdmin status', async () => {
      const mockUser = {
        id: 'admin-1',
        name: 'Normal Admin',
        email: 'admin@campus.edu',
        isSuperAdmin: false,
        emailInstantAlerts: true,
        emailDailyDigest: false,
        smsCriticalAlerts: true,
      }

      mocks.findUserById.mockResolvedValue(mockUser)
      mocks.getSystemPreference.mockImplementation(async (key) => {
        if (key === 'default_timezone') return { key, value: 'Europe/London' }
        if (key === 'data_retention_years') return { key, value: '5' }
        return null
      })

      const settings = await adminService.getSettings('admin-1')

      expect(settings).toEqual({
        profile: {
          name: 'Normal Admin',
          email: 'admin@campus.edu',
          role: 'Administrator',
          isSuperAdmin: false,
        },
        notifications: {
          emailInstantAlerts: true,
          emailDailyDigest: false,
          smsCriticalAlerts: true,
        },
        system: {
          defaultTimezone: 'Europe/London',
          dataRetentionPolicy: '5',
        },
      })
      expect(mocks.findUserById).toHaveBeenCalledWith('admin-1')
    })

    it('returns default fallback values for system preferences when not present in DB', async () => {
      const mockUser = {
        id: 'admin-2',
        name: 'Super Admin',
        email: 'super@campus.edu',
        isSuperAdmin: true,
        emailInstantAlerts: true,
        emailDailyDigest: true,
        smsCriticalAlerts: false,
      }

      mocks.findUserById.mockResolvedValue(mockUser)
      mocks.getSystemPreference.mockResolvedValue(null)

      const settings = await adminService.getSettings('admin-2')

      expect(settings.profile.role).toBe('Super Administrator')
      expect(settings.profile.isSuperAdmin).toBe(true)
      expect(settings.system).toEqual({
        defaultTimezone: 'Asia/Kolkata',
        dataRetentionPolicy: '3',
      })
    })

    it('throws NotFoundError if the admin user does not exist', async () => {
      mocks.findUserById.mockResolvedValue(null)

      await expect(adminService.getSettings('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateSystemSettings', () => {
    it('allows super admin to update both timezone and data retention policy', async () => {
      const mockSuperAdmin = {
        id: 'super-admin-id',
        isSuperAdmin: true,
      }

      mocks.findUserById.mockResolvedValue(mockSuperAdmin)
      mocks.getSystemPreference.mockResolvedValue({ key: 'data_retention_years', value: '3' })
      mocks.upsertSystemPreference.mockResolvedValue(null)

      const result = await adminService.updateSystemSettings('super-admin-id', {
        defaultTimezone: 'America/New_York',
        dataRetentionPolicy: '5',
      })

      expect(result).toEqual({
        defaultTimezone: 'America/New_York',
        dataRetentionPolicy: '5',
      })
      expect(mocks.upsertSystemPreference).toHaveBeenCalledWith('default_timezone', 'America/New_York')
      expect(mocks.upsertSystemPreference).toHaveBeenCalledWith('data_retention_years', '5')
    })

    it('allows normal admin to update default timezone if data retention policy is unchanged', async () => {
      const mockNormalAdmin = {
        id: 'normal-admin-id',
        isSuperAdmin: false,
      }

      mocks.findUserById.mockResolvedValue(mockNormalAdmin)
      // Current DB retention policy is '3'
      mocks.getSystemPreference.mockResolvedValue({ key: 'data_retention_years', value: '3' })
      mocks.upsertSystemPreference.mockResolvedValue(null)

      // Incoming payload retains '3'
      const result = await adminService.updateSystemSettings('normal-admin-id', {
        defaultTimezone: 'America/New_York',
        dataRetentionPolicy: '3',
      })

      expect(result).toEqual({
        defaultTimezone: 'America/New_York',
        dataRetentionPolicy: '3',
      })
      expect(mocks.upsertSystemPreference).toHaveBeenCalledWith('default_timezone', 'America/New_York')
      expect(mocks.upsertSystemPreference).toHaveBeenCalledWith('data_retention_years', '3')
    })

    it('denies normal admin from updating the data retention policy', async () => {
      const mockNormalAdmin = {
        id: 'normal-admin-id',
        isSuperAdmin: false,
      }

      mocks.findUserById.mockResolvedValue(mockNormalAdmin)
      // Current DB retention policy is '3'
      mocks.getSystemPreference.mockResolvedValue({ key: 'data_retention_years', value: '3' })

      // Incoming payload tries to change retention policy to '5'
      await expect(
        adminService.updateSystemSettings('normal-admin-id', {
          defaultTimezone: 'America/New_York',
          dataRetentionPolicy: '5',
        })
      ).rejects.toThrow(ForbiddenError)

      expect(mocks.upsertSystemPreference).not.toHaveBeenCalled()
    })

    it('uses fallback default value of 3 for retention policy if not set in DB when performing change check', async () => {
      const mockNormalAdmin = {
        id: 'normal-admin-id',
        isSuperAdmin: false,
      }

      mocks.findUserById.mockResolvedValue(mockNormalAdmin)
      // DB has no retention policy set (null)
      mocks.getSystemPreference.mockResolvedValue(null)

      // Incoming payload matches the default fallback of '3'
      const result = await adminService.updateSystemSettings('normal-admin-id', {
        defaultTimezone: 'Europe/London',
        dataRetentionPolicy: '3',
      })

      expect(result).toEqual({
        defaultTimezone: 'Europe/London',
        dataRetentionPolicy: '3',
      })
      expect(mocks.upsertSystemPreference).toHaveBeenCalledWith('default_timezone', 'Europe/London')
    })

    it('throws NotFoundError if the updating admin user does not exist', async () => {
      mocks.findUserById.mockResolvedValue(null)

      await expect(
        adminService.updateSystemSettings('non-existent', {
          defaultTimezone: 'Asia/Kolkata',
          dataRetentionPolicy: '3',
        })
      ).rejects.toThrow(NotFoundError)
    })
  })
})
