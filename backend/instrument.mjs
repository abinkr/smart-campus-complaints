import { config as dotenvConfig } from 'dotenv'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

dotenvConfig({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  quiet: true,
})

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    'https://910bcd4754a0ae64454a10e052fdf248@o4511417756155904.ingest.us.sentry.io/4511417759432704',
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
