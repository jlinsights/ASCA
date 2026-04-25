import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { log } from '@/lib/utils/logger'
import { env, isRedisConfigured, isDevelopment } from '@/lib/config/env'

interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * Redis client for production-grade rate limiting
 * Falls back to in-memory storage if Redis is not configured
 */
const redis = isRedisConfigured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// 메모리 기반 Rate Limiting (Redis 없을 때 fallback)
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

/**
 * Redis-based rate limiter (when Redis is available)
 */
function createRedisRateLimiter(config: RateLimitConfig) {
  const { maxRequests, windowMs, keyGenerator = req => getClientIdentifier(req) } = config

  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs}ms`),
    analytics: true,
    prefix: 'ratelimit',
  })

  return {
    check: async (request: NextRequest): Promise<NextResponse | null> => {
      const key = keyGenerator(request)

      try {
        const result = await limiter.limit(key)

        if (!result.success) {
          const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

          log.warn('Rate limit exceeded (Redis)', {
            key,
            limit: result.limit,
            remaining: result.remaining,
            resetIn: retryAfter,
          })

          return NextResponse.json(
            {
              success: false,
              error: 'Too Many Requests',
              message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
              retryAfter,
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': Math.floor(result.reset / 1000).toString(),
              },
            }
          )
        }

        return null // Passed rate limit check
      } catch (error) {
        log.error('Redis rate limit check failed, allowing request', error)
        return null // Allow request on error
      }
    },

    addHeaders: (response: NextResponse, request: NextRequest): NextResponse => {
      // Headers are already added in check()
      return response
    },
  }
}

/**
 * Memory-based rate limiter (fallback when Redis is not available)
 */
function createMemoryRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = req => getClientIdentifier(req),
  } = config

  return {
    check: (request: NextRequest): NextResponse | null => {
      const key = keyGenerator(request)
      const now = Date.now()
      const windowStart = now - windowMs

      // 기존 엔트리 가져오기 또는 새로 생성
      let entry = rateLimitStore.get(key)

      if (!entry || entry.resetTime <= now) {
        // 새 윈도우 시작
        entry = {
          count: 0,
          resetTime: now + windowMs,
        }
      }

      // 요청 수 증가
      entry.count++
      rateLimitStore.set(key, entry)

      // 제한 확인
      if (entry.count > maxRequests) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000)

        log.warn('Rate limit exceeded (Memory)', {
          key,
          count: entry.count,
          maxRequests,
          resetIn: remainingTime,
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${remainingTime} seconds.`,
            retryAfter: remainingTime,
          },
          {
            status: 429,
            headers: {
              'Retry-After': remainingTime.toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
            },
          }
        )
      }

      // 정상 요청 - 헤더 추가
      return null // 통과
    },

    // 응답에 Rate Limit 헤더 추가
    addHeaders: (response: NextResponse, request: NextRequest): NextResponse => {
      const key = keyGenerator(request)
      const entry = rateLimitStore.get(key)

      if (entry) {
        const remaining = Math.max(0, maxRequests - entry.count)
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
      }

      return response
    },
  }
}

/**
 * Rate limiting middleware
 * Automatically uses Redis if configured, otherwise falls back to memory
 */
export function rateLimit(config: RateLimitConfig) {
  if (redis) {
    if (!isDevelopment) {
      log.info('Using Redis-based rate limiting for production')
    }
    return createRedisRateLimiter(config)
  } else {
    if (!isDevelopment) {
      log.warn('⚠️  Using memory-based rate limiting (not recommended for production)')
    }
    return createMemoryRateLimiter(config)
  }
}

/**
 * 클라이언트 식별자 생성 (IP + User Agent 기반)
 */
function getClientIdentifier(request: NextRequest): string {
  // Vercel/Cloudflare 등에서 실제 IP 가져오기
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIP || 'unknown'

  // User Agent 해시 추가 (같은 IP에서 다른 클라이언트 구분)
  const userAgent = request.headers.get('user-agent') || ''
  const userAgentHash = simpleHash(userAgent).toString(36)

  return `${ip}:${userAgentHash}`
}

/**
 * 간단한 해시 함수
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 32bit 정수로 변환
  }
  return Math.abs(hash)
}

/**
 * 미리 정의된 Rate Limit 설정들
 */
export const RateLimitPresets = {
  // 관리자 API용 - 엄격한 제한
  strict: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1분
  },

  // 일반 API용 - 보통 제한
  moderate: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1분
  },

  // 공개 API용 - 느슨한 제한
  loose: {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1분
  },

  // 인증 시도용 - 매우 엄격
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15분
  },
}

/**
 * 메모리 정리 (주기적으로 실행 권장)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    log.debug(`Cleaned up ${cleaned} expired rate limit entries`)
  }
}

// 5분마다 정리 작업 실행
if (typeof window === 'undefined') {
  // 서버사이드에서만
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
