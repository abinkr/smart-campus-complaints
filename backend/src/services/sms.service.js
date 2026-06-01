import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

const isSmsConfigured = () =>
  Boolean(
    config.TWILIO_ACCOUNT_SID &&
    config.TWILIO_AUTH_TOKEN &&
    (config.TWILIO_MESSAGING_SERVICE_SID || config.TWILIO_FROM_PHONE)
  )

const getAuthHeader = () => {
  const credentials = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString('base64')
  return `Basic ${credentials}`
}

export const sendSms = async ({ to, body }) => {
  if (!to) {
    logger.warn('SMS recipient is missing - skipping delivery')
    return false
  }

  if (!isSmsConfigured()) {
    logger.warn({ to }, 'Twilio SMS is not configured - skipping SMS delivery')
    return false
  }

  const form = new URLSearchParams({
    To: to,
    Body: body,
  })

  if (config.TWILIO_MESSAGING_SERVICE_SID) {
    form.set('MessagingServiceSid', config.TWILIO_MESSAGING_SERVICE_SID)
  } else {
    form.set('From', config.TWILIO_FROM_PHONE)
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: form,
      signal: AbortSignal.timeout(config.TWILIO_TIMEOUT_MS),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    logger.error(
      {
        to,
        twilioStatus: response.status,
        twilioCode: data.code,
        message: data.message,
      },
      'Twilio SMS delivery failed'
    )
    return false
  }

  logger.info({ to, sid: data.sid }, 'SMS sent')
  return true
}
