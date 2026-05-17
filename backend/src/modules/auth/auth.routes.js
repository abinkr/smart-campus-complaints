import { Router } from 'express'
import * as controller from './auth.controller.js'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/authenticate.js'
import { authLimiter } from '../../middleware/rateLimiter.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  adminRegisterSchema,
  changePasswordSchema,
  loginSchema,
  studentRegisterSchema,
  verifyMfaSchema,
} from './auth.schema.js'

const router = Router()

/**
 * @openapi
 * /api/auth/student/register:
 *   post:
 *     summary: Register a student account.
 *     tags: [Auth]
 */
router.post('/student/register', authLimiter, validate({ body: studentRegisterSchema }), asyncHandler(controller.registerStudent))

/**
 * @openapi
 * /api/auth/admin/register:
 *   post:
 *     summary: Register an admin account with an admin registration key.
 *     tags: [Auth]
 */
router.post('/admin/register', authLimiter, validate({ body: adminRegisterSchema }), asyncHandler(controller.registerAdmin))

/**
 * @openapi
 * /api/auth/student/login:
 *   post:
 *     summary: Validate student password and send a MFA verification code.
 *     tags: [Auth]
 */
router.post('/student/login', authLimiter, validate({ body: loginSchema }), asyncHandler(controller.loginStudent))

/**
 * @openapi
 * /api/auth/admin/login:
 *   post:
 *     summary: Validate admin password and send a MFA verification code.
 *     tags: [Auth]
 */
router.post('/admin/login', authLimiter, validate({ body: loginSchema }), asyncHandler(controller.loginAdmin))

/**
 * @openapi
 * /api/auth/student/login/verify-mfa:
 *   post:
 *     summary: Verify student MFA code and receive an access token.
 *     tags: [Auth]
 */
router.post('/student/login/verify-mfa', authLimiter, validate({ body: verifyMfaSchema }), asyncHandler(controller.verifyStudentMfa))

/**
 * @openapi
 * /api/auth/admin/login/verify-mfa:
 *   post:
 *     summary: Verify admin MFA code and receive an access token.
 *     tags: [Auth]
 */
router.post('/admin/login/verify-mfa', authLimiter, validate({ body: verifyMfaSchema }), asyncHandler(controller.verifyAdminMfa))

router.post('/refresh', asyncHandler(controller.refresh))
router.post('/logout', authenticate, asyncHandler(controller.logout))
router.get('/me', authenticate, asyncHandler(controller.me))
router.patch(
  '/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(controller.changePassword)
)

export default router
