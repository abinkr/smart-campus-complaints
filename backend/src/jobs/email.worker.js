import { Worker } from 'bullmq'
import nodemailer from 'nodemailer'
import { redis } from '../config/redis.js'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
})

const canSendEmail = () =>
  config.EMAIL_USER !== 'your@gmail.com' &&
  config.EMAIL_PASS !== 'your-gmail-app-password' &&
  config.EMAIL_PASS.length > 0

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const TEMPLATES = {
  welcome: (data) => ({
    subject: 'Welcome to Smart Campus',
    html: `<h2>Hi ${escapeHtml(data.name)},</h2><p>Your account has been created successfully.</p>`,
  }),

  statusUpdate: (data) => ({
    subject: `Complaint Update - #${data.complaint.id.slice(0, 8).toUpperCase()}`,
    html: `
      <h2>Your complaint status has been updated.</h2>
      <p><strong>Title:</strong> ${escapeHtml(data.complaint.title)}</p>
      <p><strong>New Status:</strong> ${escapeHtml(data.complaint.status)}</p>
      <p><strong>Department:</strong> ${escapeHtml(data.complaint.department ?? 'Unassigned')}</p>
      ${data.complaint.adminNote ? `<p><strong>Note:</strong> ${escapeHtml(data.complaint.adminNote)}</p>` : ''}
    `,
  }),

  confirmation: (data) => ({
    subject: `Complaint Received - #${data.complaintId.slice(0, 8).toUpperCase()}`,
    html: `
      <h2>We received your complaint.</h2>
      <p><strong>Title:</strong> ${escapeHtml(data.title)}</p>
      <p><strong>Category:</strong> ${escapeHtml(data.category ?? 'Pending')}</p>
      <p><strong>Priority:</strong> ${escapeHtml(data.priority ?? 'Pending')}</p>
      <p>Track your complaint for future status updates.</p>
    `,
  }),
}

export const emailWorker = new Worker(
  'email',
  async (job) => {
    const template = TEMPLATES[job.name]

    if (!template) {
      logger.warn({ jobName: job.name }, 'Unknown email template')
      return
    }

    const { subject, html } = template(job.data)

    if (!canSendEmail()) {
      logger.warn(
        {
          jobName: job.name,
          to: job.data.to,
        },
        'Email credentials are not configured - skipping email delivery'
      )
      return
    }

    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to: job.data.to,
      subject,
      html,
    })

    logger.info({ jobName: job.name, to: job.data.to }, 'Email sent')
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Email job failed')
})
