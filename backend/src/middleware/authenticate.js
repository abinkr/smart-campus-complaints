import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { redis } from '../config/redis.js'
import { UnauthorizedError } from '../utils/ApiError.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header')
    }

    const token = authHeader.slice('Bearer '.length).trim()

    if (!token) {
      throw new UnauthorizedError('Missing or malformed Authorization header')
    }

    const isBlacklisted = await redis.get(`blacklist:${token}`)

    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked')
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET)

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }
    req.token = token

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'))
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid access token'))
    }

    next(err)
  }
}
