import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import mongoSanitize from 'express-mongo-sanitize'
import { Sentry } from './config/sentry.js'

import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestId } from './middleware/requestId.js'
import { notFound } from './middleware/notFound.js'
import { swaggerSpec, swaggerUi } from './config/swagger.js'

import authRoutes from './modules/auth/auth.routes.js'
import complaintRoutes from './modules/complaint/complaint.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import analyticsRoutes from './modules/analytics/analytics.routes.js'

const getAllowedOrigins = () => {
  const origins = new Set(
    [config.CLIENT_URL, config.STUDENT_CLIENT_URL, config.ADMIN_CLIENT_URL].filter(Boolean)
  )

  if (config.NODE_ENV !== 'production') {
    for (const origin of [...origins]) {
      const clientUrl = new URL(origin)
      const alternateHost = clientUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost'
      origins.add(`${clientUrl.protocol}//${alternateHost}${clientUrl.port ? `:${clientUrl.port}` : ''}`)
    }
  }

  return origins
}

export const createApp = () => {
  const app = express()
  const allowedOrigins = getAllowedOrigins()

  if (typeof Sentry.setupExpressErrorHandler === 'function') {
    Sentry.setupExpressErrorHandler(app)
  }

  app.set('trust proxy', 1)

  app.use(requestId)

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      xssFilter: true,
      noSniff: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
    })
  )

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true)
        }

        return callback(null, false)
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  )

  app.use(express.json({ limit: '10kb' }))
  app.use(
    express.urlencoded({
      extended: true,
      limit: '10kb',
    })
  )
  app.use(cookieParser())
  app.use(mongoSanitize())
  app.use(hpp())
  app.use(compression())
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
      genReqId: (req) => req.id,
    })
  )

  app.use(generalLimiter)

  app.get('/health', (req, res) =>
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      requestId: req.id,
    })
  )

  if (config.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  }

  app.use('/api/auth', authRoutes)
  app.use('/api/complaints', complaintRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/analytics', analyticsRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
