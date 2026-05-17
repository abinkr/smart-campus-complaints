import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { config } from './index.js'

if (config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

export { Sentry }
