import * as repo from './admin.repository.js'
import { NotFoundError } from '../../utils/ApiError.js'
import { withCache, invalidateCachePattern } from '../../utils/cache.js'
import { emailQueue } from '../../queues/email.queue.js'
import { logger } from '../../utils/logger.js'
import { streamToCSV } from '../../utils/csvExport.js'

const cacheKeyForList = (filters, pagination) =>
  `admin:complaints:${JSON.stringify({
    filters,
    page: pagination.page,
    limit: pagination.limit,
  })}`

export const getAllComplaints = (filters, pagination) =>
  withCache(cacheKeyForList(filters, pagination), 30, () => repo.findComplaints(filters, pagination))

export const updateComplaint = async (id, adminId, dto) => {
  const complaint = await repo.findComplaintForUpdate(id)

  if (!complaint) {
    throw new NotFoundError('Complaint not found')
  }

  const oldStatus = complaint.status

  const updateData = {
    status: dto.status,
    department: dto.department ?? null,
    adminNote: dto.adminNote ?? null,
    resolvedAt: dto.status === 'RESOLVED' ? complaint.resolvedAt ?? new Date() : null,
  }

  const updated = await repo.updateComplaintAndLog(id, updateData, {
    complaintId: id,
    changedBy: adminId,
    oldStatus,
    newStatus: dto.status,
    note: dto.adminNote ?? null,
  })

  Promise.allSettled([
    emailQueue.add(
      'statusUpdate',
      {
        to: complaint.user.email,
        complaint: updated,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    ),
    invalidateCachePattern('analytics:*'),
    invalidateCachePattern(`complaints:user:${complaint.userId}:*`),
    invalidateCachePattern('admin:complaints:*'),
  ]).then(results => {
    for (const result of results) {
      if (result.status === 'rejected') {
        logger.warn({ err: result.reason }, 'Post-update side effect failed')
      }
    }
  })

  return updated
}

export const exportComplaints = async (filters, res) => {
  const complaints = await repo.findComplaintsForExport(filters)

  const rows = complaints.map(complaint => ({
    ID: complaint.id,
    Title: complaint.title,
    Category: complaint.category ?? 'Uncategorized',
    Priority: complaint.priority ?? 'N/A',
    Status: complaint.status,
    Department: complaint.department ?? 'Unassigned',
    'Student Name': complaint.user.name,
    'Student Email': complaint.user.email,
    'Created At': complaint.createdAt.toISOString(),
    'Resolved At': complaint.resolvedAt?.toISOString() ?? '',
  }))

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="complaints.csv"')

  return streamToCSV(rows, res, [
    'ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Department',
    'Student Name',
    'Student Email',
    'Created At',
    'Resolved At',
  ])
}
