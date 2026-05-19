import { config } from '../../config/index.js'
import { prisma } from '../../config/prisma.js'
import { UnauthorizedError } from '../../utils/ApiError.js'
import { logger } from '../../utils/logger.js'
import { sendOtpEmail } from '../../services/email.service.js'
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp.util.js'

const maskEmail = (email) => {
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`
}

export const createMfaChallenge = async (user) => {
  const expiresAt = new Date(Date.now() + config.MFA_CODE_EXPIRY_MINUTES * 60 * 1000)

  await prisma.emailOtp.deleteMany({
    where: {
      userId: user.id,
    },
  })

  const code = generateOtp()
  const otpHash = await hashOtp(code)

  await sendOtpEmail(user.email, code)

  const otpRecord = await prisma.emailOtp.create({
    data: {
      userId: user.id,
      otpHash,
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  })

  logger.info({ userId: user.id, otpId: otpRecord.id }, 'Email OTP challenge issued')

  return {
    mfaToken: otpRecord.id,
    expiresAt: otpRecord.expiresAt,
    delivery: {
      channel: 'email',
      destination: maskEmail(user.email),
    },
  }
}

export const verifyMfaChallenge = async ({ mfaToken, code }) => {
  const otpRecord = await prisma.emailOtp.findUnique({
    where: {
      id: mfaToken,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  if (otpRecord.attempts >= config.MFA_MAX_ATTEMPTS) {
    throw new UnauthorizedError('Too many incorrect verification code attempts')
  }

  const isValid = await verifyOtp(code, otpRecord.otpHash)

  if (!isValid) {
    await prisma.emailOtp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    })

    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  await prisma.emailOtp.delete({
    where: {
      id: otpRecord.id,
    },
  })

  return otpRecord.user
}

export const deleteExpiredMfaChallenges = () =>
  prisma.emailOtp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
