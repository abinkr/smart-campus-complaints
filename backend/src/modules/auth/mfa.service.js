import { config } from '../../config/index.js'
import { prisma } from '../../config/prisma.js'
import { UnauthorizedError } from '../../utils/ApiError.js'
import { logger } from '../../utils/logger.js'
import { sendEmailOtp, checkEmailOtp } from '../../config/twilioClient.js'

const maskEmail = (email) => {
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`
}

export const createMfaChallenge = async (user) => {
  const expiresAt = new Date(Date.now() + config.MFA_CODE_EXPIRY_MINUTES * 60 * 1000)

  await prisma.mfaChallenge.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  })

  const verification = await sendEmailOtp(user.email)

  const challenge = await prisma.mfaChallenge.create({
    data: {
      userId: user.id,
      verificationSid: verification.sid,
      deliveryChannel: 'email',
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  })

  logger.info({ userId: user.id, mfaChallengeId: challenge.id }, 'Email OTP challenge issued')

  return {
    mfaToken: challenge.id,
    expiresAt: challenge.expiresAt,
    delivery: {
      channel: 'email',
      destination: maskEmail(user.email),
    },
  }
}

export const verifyMfaChallenge = async ({ mfaToken, code }) => {
  const challenge = await prisma.mfaChallenge.findUnique({
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

  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  if (challenge.attempts >= config.MFA_MAX_ATTEMPTS) {
    throw new UnauthorizedError('Too many incorrect verification code attempts')
  }

  const isValid = await checkEmailOtp({
    to: challenge.user.email,
    code,
  })

  if (!isValid) {
    await prisma.mfaChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    })

    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  await prisma.mfaChallenge.update({
    where: {
      id: challenge.id,
    },
    data: {
      consumedAt: new Date(),
    },
  })

  return challenge.user
}

export const deleteExpiredMfaChallenges = () =>
  prisma.mfaChallenge.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: new Date(),
          },
        },
        {
          consumedAt: {
            not: null,
          },
        },
      ],
    },
  })
