/**
 * API Response Helpers Tests
 *
 * Tests for standardized API response utilities
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import {
  ApiResponse,
  ApiError,
  handleApiError,
  addRateLimitHeaders,
  addCorsHeaders,
} from '../response';

describe('API Response Helpers', () => {
  describe('ApiResponse.success', () => {
    test('should create success response with data', async () => {
      // Arrange
      const testData = { id: '1', name: 'Test' };

      // Act
      const response = ApiResponse.success(testData);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(testData);
      expect(body.timestamp).toBeDefined();
    });

    test('should create success response with metadata', async () => {
      // Arrange
      const testData = ['item1', 'item2'];
      const meta = { totalCount: 2 };

      // Act
      const response = ApiResponse.success(testData, meta);

      // Assert
      const body = await response.json();
      expect(body.meta).toEqual(meta);
    });

    test('should accept custom status code', async () => {
      // Arrange
      const testData = { id: '1' };

      // Act
      const response = ApiResponse.success(testData, undefined, 201);

      // Assert
      expect(response.status).toBe(201);
    });
  });

  describe('ApiResponse.error', () => {
    test('should create error response', async () => {
      // Arrange
      const message = 'Something went wrong';
      const code = 'ERROR_CODE';

      // Act
      const response = ApiResponse.error(message, code);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error?.message).toBe(message);
      expect(body.error?.code).toBe(code);
      expect(body.error?.timestamp).toBeDefined();
    });

    test('should include error details', async () => {
      // Arrange
      const details = { field: 'email', reason: 'invalid' };

      // Act
      const response = ApiResponse.error('Error', 'CODE', 400, details);

      // Assert
      const body = await response.json();
      expect(body.error?.details).toEqual(details);
    });

    test('should accept custom status code', async () => {
      // Act
      const response = ApiResponse.error('Not Found', 'NOT_FOUND', 404);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('ApiResponse.paginated', () => {
    test('should create paginated response', async () => {
      // Arrange
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const page = 1;
      const limit = 2;
      const total = 10;

      // Act
      const response = ApiResponse.paginated(items, page, limit, total);

      // Assert
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(items);
      expect(body.meta?.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
        hasMore: true,
        hasPrevious: false,
      });
    });

    test('should calculate pagination correctly for last page', async () => {
      // Arrange
      const items = [{ id: '1' }];
      const page = 5;
      const limit = 2;
      const total = 10;

      // Act
      const response = ApiResponse.paginated(items, page, limit, total);

      // Assert
      const body = await response.json();
      expect(body.meta?.pagination?.hasMore).toBe(false);
      expect(body.meta?.pagination?.hasPrevious).toBe(true);
      expect(body.meta?.pagination?.totalPages).toBe(5);
    });

    test('should include additional metadata', async () => {
      // Arrange
      const items = [{ id: '1' }];
      const additionalMeta = { customField: 'value' };

      // Act
      const response = ApiResponse.paginated(items, 1, 10, 1, additionalMeta);

      // Assert
      const body = await response.json();
      expect(body.meta?.customField).toBe('value');
      expect(body.meta?.pagination).toBeDefined();
    });
  });

  describe('ApiResponse.created', () => {
    test('should create 201 response', async () => {
      // Arrange
      const data = { id: '1', name: 'Created' };

      // Act
      const response = ApiResponse.created(data);

      // Assert
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });
  });

  describe('ApiResponse.noContent', () => {
    test('should create 204 response with no body', async () => {
      // Act
      const response = ApiResponse.noContent();

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe('ApiResponse.badRequest', () => {
    test('should create 400 response', async () => {
      // Act
      const response = ApiResponse.badRequest('Invalid input');

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error?.code).toBe('BAD_REQUEST');
      expect(body.error?.message).toBe('Invalid input');
    });
  });

  describe('ApiResponse.unauthorized', () => {
    test('should create 401 response', async () => {
      // Act
      const response = ApiResponse.unauthorized();

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error?.code).toBe('UNAUTHORIZED');
      expect(body.error?.message).toBe('Unauthorized');
    });

    test('should accept custom message', async () => {
      // Act
      const response = ApiResponse.unauthorized('Token expired');

      // Assert
      const body = await response.json();
      expect(body.error?.message).toBe('Token expired');
    });
  });

  describe('ApiResponse.forbidden', () => {
    test('should create 403 response', async () => {
      // Act
      const response = ApiResponse.forbidden();

      // Assert
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error?.code).toBe('FORBIDDEN');
    });
  });

  describe('ApiResponse.notFound', () => {
    test('should create 404 response', async () => {
      // Act
      const response = ApiResponse.notFound();

      // Assert
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error?.code).toBe('NOT_FOUND');
      expect(body.error?.message).toBe('Resource not found');
    });
  });

  describe('ApiResponse.conflict', () => {
    test('should create 409 response', async () => {
      // Act
      const response = ApiResponse.conflict('Duplicate entry');

      // Assert
      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error?.code).toBe('CONFLICT');
      expect(body.error?.message).toBe('Duplicate entry');
    });
  });

  describe('ApiResponse.validationError', () => {
    test('should create 422 response with validation errors', async () => {
      // Arrange
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      // Act
      const response = ApiResponse.validationError('Validation failed', errors);

      // Assert
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error?.code).toBe('VALIDATION_ERROR');
      expect(body.error?.details).toEqual(errors);
    });
  });

  describe('ApiResponse.rateLimitExceeded', () => {
    test('should create 429 response', async () => {
      // Act
      const response = ApiResponse.rateLimitExceeded();

      // Assert
      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should set rate limit headers', () => {
      // Arrange
      const retryAfter = 60;

      // Act
      const response = ApiResponse.rateLimitExceeded('Too many requests', retryAfter);

      // Assert
      expect(response.headers.get('Retry-After')).toBe('60');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('ApiResponse.internalError', () => {
    test('should create 500 response', async () => {
      // Act
      const response = ApiResponse.internalError();

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error?.code).toBe('INTERNAL_ERROR');
      expect(body.error?.message).toBe('Internal server error');
    });
  });

  describe('ApiResponse.serviceUnavailable', () => {
    test('should create 503 response', async () => {
      // Act
      const response = ApiResponse.serviceUnavailable();

      // Assert
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.error?.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('ApiError', () => {
    test('should create custom API error', () => {
      // Arrange
      const message = 'Test error';
      const statusCode = 400;
      const code = 'TEST_ERROR';
      const details = { field: 'test' };

      // Act
      const error = new ApiError(message, statusCode, code, details);

      // Assert
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.code).toBe(code);
      expect(error.details).toEqual(details);
      expect(error.name).toBe('ApiError');
    });

    test('should use default values', () => {
      // Act
      const error = new ApiError('Test error');

      // Assert
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('API_ERROR');
      expect(error.details).toBeUndefined();
    });
  });

  describe('handleApiError', () => {
    test('should handle ApiError', async () => {
      // Arrange
      const error = new ApiError('Test error', 400, 'TEST_ERROR', { field: 'test' });

      // Act
      const response = handleApiError(error);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error?.code).toBe('TEST_ERROR');
      expect(body.error?.message).toBe('Test error');
      expect(body.error?.details).toEqual({ field: 'test' });
    });

    test('should handle Zod validation errors', async () => {
      // Arrange
      const zodError = {
        issues: [
          { path: ['email'], message: 'Invalid email' },
        ],
      };

      // Act
      const response = handleApiError(zodError);

      // Assert
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error?.code).toBe('VALIDATION_ERROR');
    });

    test('should handle standard Error', async () => {
      // Arrange
      const error = new Error('Standard error');

      // Act
      const response = handleApiError(error);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error?.code).toBe('INTERNAL_ERROR');
    });

    test('should handle unknown errors', async () => {
      // Arrange
      const error = 'String error';

      // Act
      const response = handleApiError(error);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error?.message).toBe('An unexpected error occurred');
    });

    test('should mask error details in production', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const error = new Error('Detailed error message');

      // Act
      const response = handleApiError(error);

      // Assert
      const body = await response.json();
      expect(body.error?.message).toBe('Internal server error');

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('addRateLimitHeaders', () => {
    test('should add rate limit headers to response', () => {
      // Arrange
      const response = new NextResponse();
      const limit = 100;
      const remaining = 50;
      const reset = Date.now() + 3600000;

      // Act
      const result = addRateLimitHeaders(response, limit, remaining, reset);

      // Assert
      expect(result.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('50');
      expect(result.headers.get('X-RateLimit-Reset')).toBe(String(reset));
    });
  });

  describe('addCorsHeaders', () => {
    test('should add CORS headers with default origin', () => {
      // Arrange
      const response = new NextResponse();

      // Act
      const result = addCorsHeaders(response);

      // Assert
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(result.headers.get('Access-Control-Allow-Methods')).toBeDefined();
      expect(result.headers.get('Access-Control-Allow-Headers')).toBeDefined();
    });

    test('should add CORS headers with allowed origins', () => {
      // Arrange
      const response = new NextResponse();
      const allowedOrigins = ['https://example.com'];

      // Act
      const result = addCorsHeaders(response, allowedOrigins);

      // Assert
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    });
  });
});
