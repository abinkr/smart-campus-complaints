import { config } from './index.js'
import { ServiceUnavailableError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'

const assertTwilioVerifyConfigured = () => {
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_VERIFY_SERVICE_SID) {
    throw new ServiceUnavailableError('OTP delivery is not configured')
  }
}

const getAuthHeader = () => {
  assertTwilioVerifyConfigured()
  const credentials = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString('base64')
  return `Basic ${credentials}`
}

const twilioVerifyRequest = async (path, form) => {
  const response = await fetch(`https://verify.twilio.com/v2/Services/${config.TWILIO_VERIFY_SERVICE_SID}${path}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(form),
    signal: AbortSignal.timeout(config.TWILIO_TIMEOUT_MS),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Twilio Verify request failed')
    error.status = response.status
    error.code = data.code
    error.moreInfo = data.more_info
    throw error
  }

  return data
}

export const sendEmailOtp = async (to) => {
  try {
    const verification = await twilioVerifyRequest('/Verifications', {
      To: to,
      Channel: 'email',
    })

    return {
      sid: verification.sid,
      status: verification.status,
    }
  } catch (err) {
    if (err instanceof ServiceUnavailableError) {
      throw err
    }

    if (err.code === 60223) {
      logger.error(
        {
          twilioStatus: err.status,
          twilioCode: err.code,
          moreInfo: err.moreInfo,
        },
        'Twilio Verify email channel is disabled'
      )

      throw new ServiceUnavailableError(
        'Twilio Verify email channel is disabled. Enable Email in your Twilio Verify Service settings.'
      )
    }

    logger.error(
      {
        twilioStatus: err.status,
        twilioCode: err.code,
        message: err.message,
        moreInfo: err.moreInfo,
      },
      'Twilio failed to send OTP'
    )

    throw new ServiceUnavailableError('Could not send verification code. Please try again later.')
  }
}

export const checkEmailOtp = async ({ to, code }) => {
  try {
    const verificationCheck = await twilioVerifyRequest('/VerificationCheck', {
      To: to,
      Code: code,
    })

    return verificationCheck.status === 'approved'
  } catch (err) {
    if (err instanceof ServiceUnavailableError) {
      throw err
    }

    if (err.status >= 500 || err.name === 'TimeoutError') {
      logger.error(
        {
          twilioStatus: err.status,
          twilioCode: err.code,
          message: err.message,
          moreInfo: err.moreInfo,
        },
        'Twilio OTP verification unavailable'
      )

      throw new ServiceUnavailableError('Could not verify code. Please try again later.')
    }

    logger.warn(
      {
        twilioStatus: err.status,
        twilioCode: err.code,
      },
      'Twilio rejected OTP verification'
    )

    return false
  }
}
