/**
 * Origin/Referer 검증 헬퍼 단위 테스트
 *
 * Design 문서: docs/02-design/features/asca-csrf-origin-check.design.md §5.1
 * Plan: docs/01-plan/features/asca-csrf-origin-check.plan.md (rev β)
 */

import { describe, test, expect } from '@jest/globals'
import {
  checkOrigin,
  buildAllowedHosts,
  parseHostname,
  type OriginCheckEnv,
} from '@/lib/security/origin-check'

const APP_URL_PROD = 'https://asca.kr'

function makeRequest(init: { origin?: string | null; referer?: string | null }): {
  headers: Headers
  nextUrl?: URL
} {
  const headers = new Headers()
  if (init.origin !== undefined && init.origin !== null) {
    headers.set('origin', init.origin)
  } else if (init.origin === null) {
    headers.set('origin', 'null')
  }
  if (init.referer) headers.set('referer', init.referer)
  return { headers }
}

const ENV_PROD: OriginCheckEnv = {
  appUrl: APP_URL_PROD,
  vercelUrl: undefined,
  allowedOrigins: undefined,
  nodeEnv: 'production',
}

describe('checkOrigin — 10 시나리오 (design §5.1)', () => {
  test('1. 같은 도메인 production 요청 → ok=true', () => {
    const req = makeRequest({ origin: 'https://asca.kr' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(true)
  })

  test('2. cross-site 요청 → ok=false, reason=host_mismatch', () => {
    const req = makeRequest({ origin: 'https://evil.com' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('host_mismatch')
    expect(result.receivedOrigin).toBe('https://evil.com')
    expect(result.matchedAgainst).toContain('asca.kr')
  })

  test('3. Origin 누락 + Referer fallback (도메인 일치) → ok=true', () => {
    const req = makeRequest({ referer: 'https://asca.kr/admin' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(true)
  })

  test('4. Origin 누락 + Referer 도메인 불일치 → host_mismatch', () => {
    const req = makeRequest({ referer: 'https://evil.com/x' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('host_mismatch')
  })

  test('5. Origin/Referer 둘 다 누락 → missing_headers', () => {
    const req = makeRequest({})
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing_headers')
  })

  test('6. Origin = "null" (sandbox iframe) → invalid_url', () => {
    const req = makeRequest({ origin: 'null' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('invalid_url')
  })

  test('7. Vercel preview 도메인 + VERCEL_URL 자동 주입 → ok=true', () => {
    const req = makeRequest({ origin: 'https://asca-pr-31.vercel.app' })
    const env: OriginCheckEnv = {
      appUrl: undefined,
      vercelUrl: 'asca-pr-31.vercel.app',
      allowedOrigins: undefined,
      nodeEnv: 'production',
    }
    const result = checkOrigin(req, env)
    expect(result.ok).toBe(true)
  })

  test('8. CSRF_ALLOWED_ORIGINS csv 매칭 → ok=true', () => {
    const req = makeRequest({ origin: 'https://staging.asca.kr' })
    const env: OriginCheckEnv = {
      appUrl: APP_URL_PROD,
      vercelUrl: undefined,
      allowedOrigins: 'https://staging.asca.kr,https://preview.asca.kr',
      nodeEnv: 'production',
    }
    const result = checkOrigin(req, env)
    expect(result.ok).toBe(true)
  })

  test('9. dev fallback (env 미설정 + NODE_ENV=development) → localhost ok', () => {
    const req = makeRequest({ origin: 'http://localhost:3000' })
    const env: OriginCheckEnv = {
      appUrl: undefined,
      vercelUrl: undefined,
      allowedOrigins: undefined,
      nodeEnv: 'development',
    }
    const result = checkOrigin(req, env)
    expect(result.ok).toBe(true)
  })

  test('10. production + env 누락 → throws CSRF_ENV_MISCONFIGURED', () => {
    const req = makeRequest({ origin: 'https://asca.kr' })
    const env: OriginCheckEnv = {
      appUrl: undefined,
      vercelUrl: undefined,
      allowedOrigins: undefined,
      nodeEnv: 'production',
    }
    expect(() => checkOrigin(req, env)).toThrow('CSRF_ENV_MISCONFIGURED')
  })

  test('11. production http Origin (enforceHttps default true) → scheme_mismatch', () => {
    const req = makeRequest({ origin: 'http://asca.kr' })
    const result = checkOrigin(req, ENV_PROD)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('scheme_mismatch')
    expect(result.receivedOrigin).toBe('http://asca.kr')
  })

  test('12. production http Origin + enforceHttps:false (opt-out) → ok', () => {
    const req = makeRequest({ origin: 'http://asca.kr' })
    const env: OriginCheckEnv = { ...ENV_PROD, enforceHttps: false }
    const result = checkOrigin(req, env)
    expect(result.ok).toBe(true)
  })
})

describe('buildAllowedHosts — 3 추가 케이스', () => {
  test('dedupe: 동일 hostname 중복 제거', () => {
    const env: OriginCheckEnv = {
      appUrl: 'https://asca.kr',
      vercelUrl: undefined,
      allowedOrigins: 'https://asca.kr,https://staging.asca.kr',
      nodeEnv: 'production',
    }
    const hosts = buildAllowedHosts(env)
    expect(hosts.filter(h => h === 'asca.kr').length).toBe(1)
    expect(hosts).toContain('staging.asca.kr')
  })

  test('order: APP_URL → VERCEL_URL → allowedOrigins 순서 유지', () => {
    const env: OriginCheckEnv = {
      appUrl: 'https://asca.kr',
      vercelUrl: 'asca-pr-1.vercel.app',
      allowedOrigins: 'https://preview.asca.kr',
      nodeEnv: 'production',
    }
    const hosts = buildAllowedHosts(env)
    expect(hosts[0]).toBe('asca.kr')
    expect(hosts[1]).toBe('asca-pr-1.vercel.app')
    expect(hosts[2]).toBe('preview.asca.kr')
  })

  test('dev fallback: env 모두 미설정 + dev → localhost + 127.0.0.1', () => {
    const env: OriginCheckEnv = {
      appUrl: undefined,
      vercelUrl: undefined,
      allowedOrigins: undefined,
      nodeEnv: 'development',
    }
    const hosts = buildAllowedHosts(env)
    expect(hosts).toContain('localhost')
    expect(hosts).toContain('127.0.0.1')
  })
})

describe('parseHostname — 엣지 케이스', () => {
  test('정상 URL → hostname 추출', () => {
    expect(parseHostname('https://asca.kr/path')).toBe('asca.kr')
    expect(parseHostname('http://localhost:3000')).toBe('localhost')
  })

  test('null / undefined / 빈 문자열 → null', () => {
    expect(parseHostname(null)).toBeNull()
    expect(parseHostname(undefined)).toBeNull()
    expect(parseHostname('')).toBeNull()
  })

  test('잘못된 URL → null', () => {
    expect(parseHostname('not-a-url')).toBeNull()
    expect(parseHostname('null')).toBeNull()
  })
})
