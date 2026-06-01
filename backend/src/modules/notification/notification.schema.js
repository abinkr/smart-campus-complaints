import { z } from 'zod'

export const notificationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(25).optional().default(10),
})

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
})
