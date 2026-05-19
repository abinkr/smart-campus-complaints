import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { ServiceUnavailableError } from '../utils/ApiError.js'

let isSendGridConfigured = false

if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY)
  isSendGridConfigured = true
}

const smtpTransporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
})

const canSendSmtpEmail = () =>
  config.EMAIL_USER !== 'your@gmail.com' &&
  config.EMAIL_PASS !== 'your-gmail-app-password' &&
  config.EMAIL_PASS.length > 0

const createOtpMessage = (to, code) => ({
  to,
  from: config.EMAIL_FROM || 'noreply@smartcampus.com',
  subject: 'Your Smart Campus Login Verification Code',
  text: `Your verification code is: ${code}. It will expire in ${config.MFA_CODE_EXPIRY_MINUTES || 5} minutes.`,
  html: `<strong>Your verification code is: ${code}</strong><br/>It will expire in ${config.MFA_CODE_EXPIRY_MINUTES || 5} minutes.`,
})

const sendViaSmtp = async (to, code) => {
  const msg = createOtpMessage(to, code)

  await smtpTransporter.sendMail({
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
  })

  logger.info({ to }, 'SMTP OTP email sent')
}

const sendViaSendGrid = async (to, code) => {
  const msg = {
    ...createOtpMessage(to, code),
  }

  await sgMail.send(msg)
  logger.info({ to }, 'SendGrid OTP email sent')
}

export const sendOtpEmail = async (to, code) => {
  if (isSendGridConfigured) {
    try {
      await sendViaSendGrid(to, code)
      return
    } catch (error) {
      logger.error({ error, to }, 'Failed to send OTP email via SendGrid')
    }
  }

  if (canSendSmtpEmail()) {
    try {
      await sendViaSmtp(to, code)
      return
    } catch (error) {
      logger.error({ error, to }, 'Failed to send OTP email via SMTP')
    }
  }

  if (config.NODE_ENV !== 'production') {
    logger.warn('OTP email provider is not configured. Logging OTP code for development only.')
    logger.info({ to, code }, 'OTP code generated (Development Mode)')
    return
  }

  throw new ServiceUnavailableError('Could not send verification code. Please try again later.')
}

export const sendSendGridOtp = sendOtpEmail
