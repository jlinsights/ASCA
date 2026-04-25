export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  public toJSON() {
    return {
      status: 'error',
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    }
  }

  static badRequest(message: string, code?: string) {
    return new AppError(message, 400, code)
  }

  static unauthorized(message: string = 'Unauthorized', code?: string) {
    return new AppError(message, 401, code)
  }

  static forbidden(message: string = 'Forbidden', code?: string) {
    return new AppError(message, 403, code)
  }

  static notFound(message: string = 'Not Found', code?: string) {
    return new AppError(message, 404, code)
  }

  static conflict(message: string, code?: string) {
    return new AppError(message, 409, code)
  }

  static internal(message: string = 'Internal Server Error', code?: string) {
    return new AppError(message, 500, code)
  }
}
