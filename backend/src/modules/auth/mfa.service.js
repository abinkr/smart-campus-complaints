import { config } from '../../config/index.js'
import { prisma } from '../../config/prisma.js'
import { UnauthorizedError } from '../../utils/ApiError.js'
import { logger } from '../../utils/logger.js'
import { sendEmailOtp, checkEmailOtp } from '../../config/twilioClient.js'
import { sendOtpEmail } from '../../services/email.service.js'
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp.util.js'

const maskEmail = (email) => {
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`
}

const isTwilioConfigured = () => {
  return !!(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN && config.TWILIO_VERIFY_SERVICE_SID)
}

export const createMfaChallenge = async (user) => {
  const expiresAt = new Date(Date.now() + config.MFA_CODE_EXPIRY_MINUTES * 60 * 1000)

  await prisma.mfaChallenge.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  })

  let verificationSid
  if (isTwilioConfigured()) {
    try {
      const verification = await sendEmailOtp(user.email)
      verificationSid = verification.sid
    } catch (err) {
      logger.error({ userId: user.id, error: err.message }, 'Failed to initiate Twilio Verify MFA')
      throw err
    }
  } else {
    const code = generateOtp()
    const codeHash = await hashOtp(code)
    verificationSid = codeHash
    await sendOtpEmail(user.email, code)
  }

  const challenge = await prisma.mfaChallenge.create({
    data: {
      userId: user.id,
      verificationSid,
      deliveryChannel: 'email',
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  })

  logger.info({ userId: user.id, mfaChallengeId: challenge.id, usingTwilio: isTwilioConfigured() }, 'Email OTP challenge issued')

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
      verificationSid: true,
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

  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date() || !challenge.verificationSid) {
    throw new UnauthorizedError('Verification code is invalid or expired')
  }

  if (challenge.attempts >= config.MFA_MAX_ATTEMPTS) {
    throw new UnauthorizedError('Too many incorrect verification code attempts')
  }

  let isValid = false

  if (isTwilioConfigured() && !challenge.verificationSid.startsWith('$2b$')) {
    isValid = await checkEmailOtp({ to: challenge.user.email, code })
  } else {
    isValid = await verifyOtp(code, challenge.verificationSid)
  }

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
