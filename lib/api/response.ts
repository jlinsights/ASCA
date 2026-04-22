import { NextResponse } from 'next/server'
import { error as logError } from '@/lib/logging'

/**
 * Standard API response structure
 */
export interface ApiResponseData<T = any> {
  success: boolean
  data?: T
  error?: ApiErrorData
  meta?: ApiMeta
  timestamp: string
}

/**
 * API error structure
 */
export interface ApiErrorData {
  message: string
  code: string
  details?: any
  timestamp: string
}

/**
 * API metadata structure
 */
export interface ApiMeta {
  pagination?: PaginationMeta
  [key: string]: any
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
  hasPrevious: boolean
}

/**
 * Standardized API Response Handler
 * Provides consistent response format across all API endpoints
 */
export class ApiResponse {
  /**
   * Success response
   */
  static success<T>(data: T, meta?: ApiMeta, statusCode: number = 200): NextResponse {
    const response: ApiResponseData<T> = {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Error response
   */
  static error(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: any
  ): NextResponse {
    const response: ApiResponseData = {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    additionalMeta?: Omit<ApiMeta, 'pagination'>
  ): NextResponse {
    const totalPages = Math.ceil(total / limit)

    const meta: ApiMeta = {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasPrevious: page > 1,
      },
      ...additionalMeta,
    }

    return this.success(data, meta)
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T, meta?: ApiMeta): NextResponse {
    return this.success(data, meta, 201)
  }

  /**
   * No content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  /**
   * Bad request response (400)
   */
  static badRequest(message: string, details?: any): NextResponse {
    return this.error(message, 'BAD_REQUEST', 400, details)
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return this.error(message, 'UNAUTHORIZED', 401)
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(message: string = 'Forbidden'): NextResponse {
    return this.error(message, 'FORBIDDEN', 403)
  }

  /**
   * Not found response (404)
   */
  static notFound(message: string = 'Resource not found'): NextResponse {
    return this.error(message, 'NOT_FOUND', 404)
  }

  /**
   * Conflict response (409)
   */
  static conflict(message: string, details?: any): NextResponse {
    return this.error(message, 'CONFLICT', 409, details)
  }

  /**
   * Validation error response (422)
   */
  static validationError(message: string, errors: any): NextResponse {
    return this.error(message, 'VALIDATION_ERROR', 422, errors)
  }

  /**
   * Rate limit exceeded response (429)
   */
  static rateLimitExceeded(
    message: string = 'Rate limit exceeded',
    retryAfter?: number
  ): NextResponse {
    const response = this.error(message, 'RATE_LIMIT_EXCEEDED', 429)

    if (retryAfter) {
      response.headers.set('Retry-After', String(retryAfter))
      response.headers.set('X-RateLimit-Reset', String(Date.now() + retryAfter * 1000))
    }

    return response
  }

  /**
   * Internal server error response (500)
   */
  static internalError(message: string = 'Internal server error', details?: any): NextResponse {
    return this.error(message, 'INTERNAL_ERROR', 500, details)
  }

  /**
   * Service unavailable response (503)
   */
  static serviceUnavailable(message: string = 'Service temporarily unavailable'): NextResponse {
    return this.error(message, 'SERVICE_UNAVAILABLE', 503)
  }

  /**
   * Safe error response - hides internal details in production
   */
  static safeError(
    message: string,
    code: string,
    statusCode: number = 500,
    error?: unknown
  ): NextResponse {
    const isDev = process.env.NODE_ENV === 'development'

    if (error) {
      logError(`[API Error] ${code}`, error instanceof Error ? error : undefined)
    }

    return ApiResponse.error(
      message,
      code,
      statusCode,
      isDev && error instanceof Error ? error.message : undefined
    )
  }
}

/**
 * Custom API Error class
 * Use this to throw errors that will be properly formatted by error handlers
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'API_ERROR',
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Error handler for API routes
 * Converts various error types into standardized API responses
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring
  logError('API Error', error instanceof Error ? error : undefined)

  // Handle ApiError
  if (error instanceof ApiError) {
    return ApiResponse.error(error.message, error.code, error.statusCode, error.details)
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return ApiResponse.validationError('Validation failed', (error as any).issues || error)
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message

    return ApiResponse.internalError(message)
  }

  // Handle unknown errors
  return ApiResponse.internalError('An unexpected error occurred')
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(reset))

  return response
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const origin = allowedOrigins[0] || '*'

  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}
