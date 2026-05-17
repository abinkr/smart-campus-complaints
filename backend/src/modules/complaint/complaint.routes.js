import { Router } from 'express'
import * as controller from './complaint.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { uploadLimiter } from '../../middleware/rateLimiter.js'
import { uploadImage } from '../../middleware/upload.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  complaintIdParamSchema,
  complaintListQuerySchema,
  submitComplaintSchema,
} from './complaint.schema.js'

const router = Router()

/**
 * @openapi
 * /api/complaints:
 *   post:
 *     summary: Submit a complaint.
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadImage,
  validate({ body: submitComplaintSchema }),
  asyncHandler(controller.submit)
)

router.get(
  '/mine',
  authenticate,
  validate({ query: complaintListQuerySchema }),
  asyncHandler(controller.getMine)
)

router.get(
  '/:id',
  authenticate,
  validate({ params: complaintIdParamSchema }),
  asyncHandler(controller.getOne)
)

export default router
