/**
 * Environment Configuration Tests
 *
 * Tests for environment variable validation and utility functions
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'

describe('Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('Environment Validation', () => {
    test('should validate required environment variables', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }

      // Act & Assert - Should not throw
      expect(() => {
        const { env } = require('../env')
        expect(env).toBeDefined()
        expect(env.NODE_ENV).toBe('test')
        expect(env.DATABASE_URL).toBe('postgresql://localhost:5432/test')
      }).not.toThrow()
    })

    test('should fail validation when required variables are missing', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'test',
        // Missing DATABASE_URL
      }

      // Act & Assert
      expect(() => {
        require('../env')
      }).toThrow()
    })

    test('should use default values for optional variables', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }

      // Act
      const { env } = require('../env')

      // Assert
      expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
      expect(env.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe('/sign-in')
      expect(env.NEXT_PUBLIC_CLERK_SIGN_UP_URL).toBe('/sign-up')
    })

    test('should validate URL formats', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        NEXT_PUBLIC_SUPABASE_URL: 'invalid-url', // Invalid URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }

      // Act & Assert
      expect(() => {
        require('../env')
      }).toThrow()
    })

    test('should validate NODE_ENV enum values', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'invalid' as any, // Invalid NODE_ENV
        DATABASE_URL: 'postgresql://localhost:5432/test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }

      // Act & Assert
      expect(() => {
        require('../env')
      }).toThrow()
    })
  })

  describe('Environment Utility Functions', () => {
    beforeEach(() => {
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }
    })

    test('isProduction should return false in test environment', () => {
      const { isProduction } = require('../env')
      expect(isProduction).toBe(false)
    })

    test('isDevelopment should return false in test environment', () => {
      const { isDevelopment } = require('../env')
      expect(isDevelopment).toBe(false)
    })

    test('isTest should return true in test environment', () => {
      const { isTest } = require('../env')
      expect(isTest).toBe(true)
    })

    test('isRedisConfigured should return false when Redis variables are missing', () => {
      const { isRedisConfigured } = require('../env')
      expect(isRedisConfigured).toBe(false)
    })

    test('isRedisConfigured should return true when Redis variables are present', () => {
      // Arrange
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.com'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      // Act
      jest.resetModules()
      const { isRedisConfigured } = require('../env')

      // Assert
      expect(isRedisConfigured).toBe(true)
    })

    test('getAppUrl should return NEXT_PUBLIC_APP_URL when set', () => {
      // Arrange
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

      // Act
      jest.resetModules()
      const { getAppUrl } = require('../env')

      // Assert
      expect(getAppUrl()).toBe('https://example.com')
    })

    test('getAppUrl should use VERCEL_URL when available', () => {
      // Arrange
      process.env.VERCEL_URL = 'example.vercel.app'

      // Act
      jest.resetModules()
      const { getAppUrl } = require('../env')

      // Assert
      expect(getAppUrl()).toBe('https://example.vercel.app')
    })

    test('getAppUrl should fall back to localhost when no URL is set', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_APP_URL
      delete process.env.VERCEL_URL

      // Act
      jest.resetModules()
      const { getAppUrl } = require('../env')

      // Assert
      expect(getAppUrl()).toBe('http://localhost:3000')
    })

    test('getDatabaseUrl should return DATABASE_URL', () => {
      const { getDatabaseUrl } = require('../env')
      expect(getDatabaseUrl()).toBe('postgresql://localhost:5432/test')
    })

    test('getReplicaDatabaseUrl should return undefined when not set', () => {
      const { getReplicaDatabaseUrl } = require('../env')
      expect(getReplicaDatabaseUrl()).toBeUndefined()
    })

    test('getReplicaDatabaseUrl should return replica URL when set', () => {
      // Arrange
      process.env.DATABASE_REPLICA_URL = 'postgresql://replica:5432/test'

      // Act
      jest.resetModules()
      const { getReplicaDatabaseUrl } = require('../env')

      // Assert
      expect(getReplicaDatabaseUrl()).toBe('postgresql://replica:5432/test')
    })
  })

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env = {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://production:5432/prod',
        NEXT_PUBLIC_SUPABASE_URL: 'https://prod.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'prod-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_xxx',
        CLERK_SECRET_KEY: 'sk_live_xxx',
      }
    })

    test('isProduction should return true in production environment', () => {
      const { isProduction } = require('../env')
      expect(isProduction).toBe(true)
    })

    test('isDevelopment should return false in production environment', () => {
      const { isDevelopment } = require('../env')
      expect(isDevelopment).toBe(false)
    })

    test('isTest should return false in production environment', () => {
      const { isTest } = require('../env')
      expect(isTest).toBe(false)
    })
  })

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_SUPABASE_URL: 'https://dev.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dev-anon-key',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_xxx',
        CLERK_SECRET_KEY: 'sk_test_xxx',
      }
    })

    test('isProduction should return false in development environment', () => {
      const { isProduction } = require('../env')
      expect(isProduction).toBe(false)
    })

    test('isDevelopment should return true in development environment', () => {
      const { isDevelopment } = require('../env')
      expect(isDevelopment).toBe(true)
    })

    test('isTest should return false in development environment', () => {
      const { isTest } = require('../env')
      expect(isTest).toBe(false)
    })
  })
})
