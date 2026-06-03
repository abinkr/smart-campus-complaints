import express from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import { addAdminClient } from './realtime.service.js'

const router = express.Router()

// SSE endpoint for admin real-time updates
router.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  (req, res) => {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    // Flush headers to establish the connection
    res.flushHeaders()

    // Send an initial heartbeat/connected event
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date() })}\n\n`)

    // Register this connection to receive broadcasts
    addAdminClient(res)
  }
)

export default router
