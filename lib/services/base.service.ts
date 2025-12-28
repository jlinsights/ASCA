import { z } from 'zod';
import { ApiError } from '@/lib/api/response';
import type { BaseRepository } from '@/lib/repositories/base.repository';

/**
 * Service result type for operations that can fail
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Service error structure
 */
export interface ServiceError {
  message: string;
  code: string;
  details?: any;
}

/**
 * Base Service class
 * Provides common business logic patterns for all services
 *
 * @template TRepository - The repository type
 * @template TEntity - The entity type
 * @template TCreateDTO - The creation DTO type
 * @template TUpdateDTO - The update DTO type
 */
export abstract class BaseService<
  TRepository extends BaseRepository<any, any, any>,
  TEntity = any,
  TCreateDTO = any,
  TUpdateDTO = any
> {
  /**
   * @param repository - The repository instance for data access
   */
  constructor(protected readonly repository: TRepository) {}

  /**
   * Validate data using a Zod schema
   */
  protected validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          error.format()
        );
      }
      throw error;
    }
  }

  /**
   * Throw a not found error
   */
  protected throwNotFound(resource: string, id: string): never {
    throw new ApiError(
      `${resource} not found`,
      404,
      'NOT_FOUND',
      { resource, id }
    );
  }

  /**
   * Throw a conflict error
   */
  protected throwConflict(message: string, details?: any): never {
    throw new ApiError(
      message,
      409,
      'CONFLICT',
      details
    );
  }

  /**
   * Throw a forbidden error
   */
  protected throwForbidden(message: string, details?: any): never {
    throw new ApiError(
      message,
      403,
      'FORBIDDEN',
      details
    );
  }

  /**
   * Throw an unauthorized error
   */
  protected throwUnauthorized(message: string = 'Unauthorized'): never {
    throw new ApiError(
      message,
      401,
      'UNAUTHORIZED'
    );
  }

  /**
   * Throw a bad request error
   */
  protected throwBadRequest(message: string, details?: any): never {
    throw new ApiError(
      message,
      400,
      'BAD_REQUEST',
      details
    );
  }

  /**
   * Create a success result
   */
  protected success<T>(data: T): ServiceResult<T> {
    return { success: true, data };
  }

  /**
   * Create an error result
   */
  protected error(message: string, code: string, details?: any): ServiceResult<never> {
    return {
      success: false,
      error: { message, code, details },
    };
  }

  /**
   * Check if entity exists by ID
   */
  protected async ensureExists(id: string, resourceName: string): Promise<TEntity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      this.throwNotFound(resourceName, id);
    }
    return entity as TEntity;
  }

  /**
   * Execute operation with error handling
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error(`Service error: ${errorMessage}`, error);

      throw new ApiError(
        errorMessage,
        500,
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  }

  /**
   * Log service operation
   */
  protected log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    const timestamp = new Date().toISOString();
    const logData = data ? JSON.stringify(data) : '';

    console[level](`[${timestamp}] [${this.constructor.name}] ${message}`, logData);
  }

  /**
   * Paginate results
   */
  protected paginationParams(page?: number, limit?: number) {
    return {
      page: page || 1,
      limit: Math.min(limit || 20, 100), // Max 100 items per page
    };
  }

  /**
   * Sanitize output (remove sensitive fields)
   */
  protected sanitize<T extends Record<string, any>>(
    data: T,
    fieldsToRemove: (keyof T)[]
  ): Omit<T, keyof T> {
    const sanitized = { ...data };
    fieldsToRemove.forEach((field) => {
      delete sanitized[field];
    });
    return sanitized;
  }

  /**
   * Bulk operation helper
   */
  protected async bulkOperation<TInput, TOutput>(
    items: TInput[],
    operation: (item: TInput) => Promise<TOutput>,
    options: {
      concurrency?: number;
      continueOnError?: boolean;
    } = {}
  ): Promise<{ results: TOutput[]; errors: Error[] }> {
    const { concurrency = 5, continueOnError = false } = options;
    const results: TOutput[] = [];
    const errors: Error[] = [];

    // Process in batches for concurrency control
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);

      const batchPromises = batch.map(async (item) => {
        try {
          const result = await operation(item);
          results.push(result);
        } catch (error) {
          errors.push(error as Error);
          if (!continueOnError) {
            throw error;
          }
        }
      });

      await Promise.all(batchPromises);
    }

    return { results, errors };
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));

        this.log('warn', `Retry attempt ${attempt}/${maxAttempts}`, {
          error: lastError.message,
          delay,
        });
      }
    }

    throw lastError!;
  }

  /**
   * Cache result (to be overridden with actual caching implementation)
   */
  protected async cached<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
  ): Promise<T> {
    // Default implementation just executes the operation
    // Override this in child classes to add actual caching
    return await operation();
  }
}
