import sgMail from '@sendgrid/mail'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { ServiceUnavailableError } from '../utils/ApiError.js'

let isConfigured = false

if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY)
  isConfigured = true
}

export const sendSendGridOtp = async (to, code) => {
  if (!isConfigured) {
    logger.warn('SendGrid API key not configured. OTP sending skipped. Please configure SENDGRID_API_KEY.')
    // In dev environment without a key, you might want to log the code so you can still test
    if (config.NODE_ENV !== 'production') {
      logger.info({ to, code }, 'OTP code generated (Development Mode)')
    }
    return
  }

  const msg = {
    to,
    from: config.EMAIL_FROM || 'noreply@smartcampus.com',
    subject: 'Your Smart Campus Login Verification Code',
    text: `Your verification code is: ${code}. It will expire in ${config.MFA_CODE_EXPIRY_MINUTES || 5} minutes.`,
    html: `<strong>Your verification code is: ${code}</strong><br/>It will expire in ${config.MFA_CODE_EXPIRY_MINUTES || 5} minutes.`,
  }

  try {
    await sgMail.send(msg)
    logger.info({ to }, 'SendGrid OTP email sent')
  } catch (error) {
    logger.error({ error, to }, 'Failed to send OTP email via SendGrid')
    throw new ServiceUnavailableError('Could not send verification code. Please try again later.')
  }
}
