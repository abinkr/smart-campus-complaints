import { ZodError } from 'zod'
import { UnprocessableError } from '../utils/ApiError.js'

export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body)
    }

    if (schemas.query) {
      req.query = schemas.query.parse(req.query)
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params)
    }

    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code,
      }))

      return next(new UnprocessableError('Validation failed', errors))
    }

    next(err)
  }
}
