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
  publicUpdateSchema,
  internalNoteSchema,
  patchStatusSchema,
  patchAssignmentSchema,
  patchPrioritySchema,
  profileUpdateSchema,
  notificationPrefsSchema,
  systemPrefsSchema,
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

router.post(
  '/complaints/:id/public-updates',
  validate({
    params: adminComplaintIdParamSchema,
    body: publicUpdateSchema,
  }),
  asyncHandler(controller.addPublicUpdate)
)

router.post(
  '/complaints/:id/internal-notes',
  validate({
    params: adminComplaintIdParamSchema,
    body: internalNoteSchema,
  }),
  asyncHandler(controller.addInternalNote)
)

router.patch(
  '/complaints/:id/status',
  validate({
    params: adminComplaintIdParamSchema,
    body: patchStatusSchema,
  }),
  asyncHandler(controller.updateStatus)
)

router.patch(
  '/complaints/:id/assignment',
  validate({
    params: adminComplaintIdParamSchema,
    body: patchAssignmentSchema,
  }),
  asyncHandler(controller.updateAssignment)
)

router.patch(
  '/complaints/:id/priority',
  validate({
    params: adminComplaintIdParamSchema,
    body: patchPrioritySchema,
  }),
  asyncHandler(controller.updatePriority)
)

router.get('/settings', asyncHandler(controller.loadSettings))

router.put(
  '/settings/profile',
  validate({
    body: profileUpdateSchema,
  }),
  asyncHandler(controller.saveProfileSettings)
)

router.put(
  '/settings/notifications',
  validate({
    body: notificationPrefsSchema,
  }),
  asyncHandler(controller.saveNotificationSettings)
)

router.put(
  '/settings/system',
  validate({
    body: systemPrefsSchema,
  }),
  asyncHandler(controller.saveSystemSettings)
)

export default router
