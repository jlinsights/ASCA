import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, handleApiError } from '@/lib/api/response';
import { info } from '@/lib/logging';
import { z } from 'zod';

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse | null>;

/**
 * API Handler type
 */
export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return async (request: NextRequest, context?: any) => {
    for (const middleware of middlewares) {
      const result = await middleware(request, context);
      if (result) {
        return result; // Middleware returned a response, stop chain
      }
    }
    return null; // All middleware passed
  };
}

/**
 * Wrap an API handler with middleware
 */
export function withMiddleware(
  handler: ApiHandler,
  ...middlewares: MiddlewareFunction[]
): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    // Run middleware chain
    const middlewareResult = await composeMiddleware(...middlewares)(request, context);

    if (middlewareResult) {
      return middlewareResult; // Middleware returned early response
    }

    // Run actual handler
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Authentication middleware
 * Checks if user is authenticated
 */
export function withAuth(getUserId?: (request: NextRequest) => string | null): MiddlewareFunction {
  return async (request: NextRequest, context?: any) => {
    // Get user ID from request (customize based on your auth system)
    const userId = getUserId
      ? getUserId(request)
      : request.headers.get('x-user-id');

    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Attach user ID to context for use in handler
    if (context) {
      context.userId = userId;
    }

    return null; // Authentication passed
  };
}

/**
 * Permission middleware
 * Checks if user has required permissions
 */
export function withPermission(
  requiredPermission: string,
  checkPermission?: (userId: string, permission: string) => Promise<boolean>
): MiddlewareFunction {
  return async (request: NextRequest, context?: any) => {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check permission (customize based on your permission system)
    const hasPermission = checkPermission
      ? await checkPermission(userId, requiredPermission)
      : true; // Default: allow if no check function provided

    if (!hasPermission) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    return null; // Permission check passed
  };
}

/**
 * Request validation middleware
 * Validates request body or query params using Zod schema
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  target: 'body' | 'query' = 'body'
): MiddlewareFunction {
  return async (request: NextRequest, context?: any) => {
    try {
      let data: any;

      if (target === 'body') {
        data = await request.json();
      } else {
        const { searchParams } = new URL(request.url);
        data = Object.fromEntries(searchParams.entries());
      }

      const validatedData = schema.parse(data);

      // Attach validated data to context
      if (context) {
        context.validatedData = validatedData;
      }

      return null; // Validation passed
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.validationError('Invalid request data', error.format());
      }
      return handleApiError(error);
    }
  };
}

/**
 * Request logging middleware
 * Logs all incoming requests
 */
export function withLogging(): MiddlewareFunction {
  return async (request: NextRequest) => {
    const start = Date.now();
    const { method, url } = request;
    const timestamp = new Date().toISOString();

    info(`[${timestamp}] ${method} ${url} - Started`);

    // Continue to next middleware/handler
    // Note: This doesn't log response time as it doesn't have access to response
    // For full request/response logging, use Next.js middleware

    return null;
  };
}

/**
 * CORS middleware
 * Adds CORS headers to response
 */
export function withCORS(allowedOrigins: string[] = ['*']): MiddlewareFunction {
  return async (request: NextRequest) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });

      response.headers.set(
        'Access-Control-Allow-Origin',
        allowedOrigins[0] || '*'
      );
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS, PATCH'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-API-Key, X-User-ID'
      );
      response.headers.set('Access-Control-Max-Age', '86400');

      return response;
    }

    return null; // Not a preflight request, continue
  };
}

/**
 * Error boundary middleware
 * Catches and formats errors
 */
export function withErrorBoundary(): MiddlewareFunction {
  return async (request: NextRequest, context?: any) => {
    // This middleware doesn't do anything itself
    // It's meant to be used with withMiddleware which handles errors
    return null;
  };
}

/**
 * Method guard middleware
 * Ensures request uses allowed HTTP methods
 */
export function withMethods(...allowedMethods: string[]): MiddlewareFunction {
  return async (request: NextRequest) => {
    if (!allowedMethods.includes(request.method)) {
      return ApiResponse.error(
        `Method ${request.method} not allowed`,
        'METHOD_NOT_ALLOWED',
        405
      );
    }

    return null; // Method is allowed
  };
}

/**
 * Content type validation middleware
 * Ensures request has correct Content-Type header
 */
export function withContentType(contentType: string = 'application/json'): MiddlewareFunction {
  return async (request: NextRequest) => {
    const requestContentType = request.headers.get('content-type');

    if (request.method !== 'GET' && request.method !== 'DELETE') {
      if (!requestContentType?.includes(contentType)) {
        return ApiResponse.badRequest(
          `Content-Type must be ${contentType}`,
          { received: requestContentType }
        );
      }
    }

    return null; // Content-Type is valid
  };
}

/**
 * Example: Complete API route with all middleware
 */
/*
export const GET = withMiddleware(
  async (request: NextRequest) => {
    // Your handler logic here
    return ApiResponse.success({ message: 'Hello, World!' });
  },
  withLogging(),
  withAuth(),
  withMethods('GET'),
  withCORS()
);

export const POST = withMiddleware(
  async (request: NextRequest, context) => {
    // Access validated data from context
    const data = context.validatedData;

    // Your handler logic here
    return ApiResponse.created(data);
  },
  withLogging(),
  withAuth(),
  withPermission('members:create'),
  withMethods('POST'),
  withContentType('application/json'),
  withValidation(createMemberSchema, 'body'),
  withCORS()
);
*/
