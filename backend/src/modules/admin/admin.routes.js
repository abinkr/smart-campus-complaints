import { Router } from 'express'
import * as controller from './admin.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  adminComplaintIdParamSchema,
  adminComplaintQuerySchema,
  adminExportQuerySchema,
  updateComplaintSchema,
} from './admin.schema.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/complaints', validate({ query: adminComplaintQuerySchema }), asyncHandler(controller.getAll))
router.get('/complaints/export', validate({ query: adminExportQuerySchema }), asyncHandler(controller.exportCSV))
router.put(
  '/complaints/:id',
  validate({
    params: adminComplaintIdParamSchema,
    body: updateComplaintSchema,
  }),
  asyncHandler(controller.update)
)

export default router
