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

  await prisma.mfaChallenge.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  })

  const code = generateOtp()
  const codeHash = await hashOtp(code)

  await sendOtpEmail(user.email, code)

  const challenge = await prisma.mfaChallenge.create({
    data: {
      userId: user.id,
      codeHash,
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
    select: {
      id: true,
      userId: true,
      attempts: true,
      expiresAt: true,
      consumedAt: true,
      codeHash: true,
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

  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date() || !challenge.codeHash) {
    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  if (challenge.attempts >= config.MFA_MAX_ATTEMPTS) {
    throw new UnauthorizedError('Too many incorrect verification code attempts')
  }

  const isValid = await verifyOtp(code, challenge.codeHash)

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
