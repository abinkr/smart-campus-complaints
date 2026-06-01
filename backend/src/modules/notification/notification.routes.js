import { Router } from 'express'
import * as controller from './notification.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { notificationIdParamSchema, notificationQuerySchema } from './notification.schema.js'

const router = Router()

router.use(authenticate, authorize('STUDENT'))

router.get('/', validate({ query: notificationQuerySchema }), asyncHandler(controller.listMine))
router.patch('/read-all', asyncHandler(controller.markAllRead))
router.patch(
  '/:id/read',
  validate({
    params: notificationIdParamSchema,
  }),
  asyncHandler(controller.markRead)
)

export default router
