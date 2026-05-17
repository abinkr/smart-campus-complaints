import { nanoid } from 'nanoid'

export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id']?.toString() || nanoid(10)
  res.setHeader('X-Request-Id', req.id)
  next()
}
