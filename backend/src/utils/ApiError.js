export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.errors = errors
    this.name = this.constructor.name

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message, errors = []) {
    super(400, message, errors)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message) {
    super(401, message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message) {
    super(403, message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message) {
    super(404, message)
  }
}

export class ConflictError extends ApiError {
  constructor(message) {
    super(409, message)
  }
}

export class UnprocessableError extends ApiError {
  constructor(message, errors = []) {
    super(422, message, errors)
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message) {
    super(429, message)
  }
}

export class LockedError extends ApiError {
  constructor(message) {
    super(423, message)
  }
}

export class InternalError extends ApiError {
  constructor(message) {
    super(500, message)
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message) {
    super(503, message)
  }
}
