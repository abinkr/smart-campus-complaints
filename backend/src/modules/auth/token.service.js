import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'
import ms from 'ms'
import { config } from '../../config/index.js'
import { prisma } from '../../config/prisma.js'
import { redis } from '../../config/redis.js'
import { UnauthorizedError } from '../../utils/ApiError.js'

const REFRESH_TOKEN_EXPIRY_MS = ms(config.JWT_REFRESH_EXPIRY)

if (!REFRESH_TOKEN_EXPIRY_MS) {
  throw new Error('JWT_REFRESH_EXPIRY must be a valid duration')
}

export const generateAccessToken = (payload) =>
  jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  })

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  })

export const hashToken = (token) => createHash('sha256').update(token).digest('hex')

export const generateTokenPair = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken({
    id: user.id,
  })

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  })

  return {
    accessToken,
    refreshToken,
  }
}

export const rotateRefreshToken = async (incomingRefreshToken) => {
  let decoded

  try {
    decoded = jwt.verify(incomingRefreshToken, config.JWT_REFRESH_SECRET)
  } catch {
    throw new UnauthorizedError('Invalid refresh token')
  }

  const tokenHash = hashToken(incomingRefreshToken)

  const stored = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!stored || stored.expiresAt < new Date() || stored.userId !== decoded.id) {
    if (stored) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId: stored.userId,
        },
      })
    }

    throw new UnauthorizedError('Refresh token expired or reused - please login again')
  }

  await prisma.refreshToken.delete({
    where: {
      tokenHash,
    },
  })

  return generateTokenPair(stored.user)
}

export const blacklistAccessToken = async (token, expiresIn) => {
  const expiryMs = ms(expiresIn)

  if (!expiryMs) {
    return
  }

  const expirySeconds = Math.ceil(expiryMs / 1000)
  await redis.setex(`blacklist:${token}`, expirySeconds, '1')
}

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  })
}

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: '/api/auth',
  })
}

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
  })
}
