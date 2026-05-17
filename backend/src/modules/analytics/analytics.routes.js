import { Router } from 'express'
import * as controller from './analytics.controller.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/summary', asyncHandler(controller.summary))
router.get('/by-category', asyncHandler(controller.byCategory))
router.get('/monthly-trend', asyncHandler(controller.monthlyTrend))
router.get('/department-perf', asyncHandler(controller.departmentPerf))
router.get('/priority-distribution', asyncHandler(controller.priorityDistribution))

export default router
