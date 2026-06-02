import { z } from 'zod'
import { paginationSchema } from '../../utils/paginate.js'

const statusSchema = z.preprocess(
  value => (typeof value === 'string' ? value.toUpperCase() : value),
  z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
)

export const complaintIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const submitComplaintSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
})

export const complaintListQuerySchema = paginationSchema.extend({
  status: statusSchema.optional(),
  search: z.string().trim().min(1).max(200).optional(),
})

export const submitFollowUpSchema = z.object({
  message: z.string().trim().min(3).max(2000),
})
