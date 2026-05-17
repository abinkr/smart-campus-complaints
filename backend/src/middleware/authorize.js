import { ForbiddenError } from '../utils/ApiError.js'

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Not authenticated'))
  }

  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError(`Role '${req.user.role}' is not authorized for this resource`))
  }

  next()
}
