import { redis, redisSubscriber } from '../../config/redis.js'
import { logger } from '../../utils/logger.js'

const clients = new Set()

export const addAdminClient = (res) => {
  clients.add(res)
  
  // Remove client when connection is closed
  res.on('close', () => {
    clients.delete(res)
  })
}

// Internal function to broadcast raw event string to all connected SSE clients
const broadcastToClients = (eventString) => {
  for (const client of clients) {
    try {
      client.write(`data: ${eventString}\n\n`)
    } catch (err) {
      clients.delete(client)
    }
  }
}

// Start listening to the Redis pub/sub channel for admin events
redisSubscriber.subscribe('admin-events', (err, count) => {
  if (err) {
    logger.error({ err }, 'Failed to subscribe to admin-events Redis channel')
  } else {
    logger.info(`Subscribed to admin-events channel (count: ${count})`)
  }
})

redisSubscriber.on('message', (channel, message) => {
  if (channel === 'admin-events') {
    broadcastToClients(message)
  }
})

// Public helper to publish an event that will trigger SSE on all nodes
export const broadcastAdminEvent = async (type, payload = {}) => {
  try {
    const eventString = JSON.stringify({ type, timestamp: new Date(), ...payload })
    await redis.publish('admin-events', eventString)
  } catch (err) {
    logger.error({ err }, 'Failed to publish admin event')
  }
}
