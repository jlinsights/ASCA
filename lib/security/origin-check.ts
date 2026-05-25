/**
 * CSRF Origin/Referer 검증 헬퍼 (OWASP Standard Header Verification 패턴).
 *
 * Edge runtime safe — `URL`, `Headers`, `String` 만 사용. Node API 의존 없음.
 *
 * 설계 문서: docs/02-design/features/asca-csrf-origin-check.design.md
 * Plan: docs/01-plan/features/asca-csrf-origin-check.plan.md (rev β)
 */

export interface OriginCheckEnv {
  appUrl: string | undefined
  vercelUrl: string | undefined
  allowedOrigins: string | undefined
  nodeEnv: string | undefined
}

export interface OriginCheckResult {
  ok: boolean
  reason?: 'missing_headers' | 'invalid_url' | 'host_mismatch' | 'env_misconfigured'
  receivedOrigin?: string | null
  matchedAgainst?: string[]
}

interface RequestLike {
  headers: Headers
}

/**
 * 잘못된 URL 또는 빈 입력 → null. parseHostname('null') 도 null (sandbox iframe).
 */
export function parseHostname(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || rawUrl === 'null') return null
  try {
    return new URL(rawUrl).hostname
  } catch {
    return null
  }
}

/**
 * 화이트리스트 호스트 목록 구성.
 *
 * 우선순위: APP_URL → VERCEL_URL → CSRF_ALLOWED_ORIGINS csv.
 * 비어있으면 dev/test 는 localhost 자동, production 은 throw.
 */
export function buildAllowedHosts(env: OriginCheckEnv): string[] {
  const hosts: string[] = []

  const appHost = parseHostname(env.appUrl)
  if (appHost) hosts.push(appHost)

  if (env.vercelUrl) {
    const vercelHost = parseHostname(`https://${env.vercelUrl}`)
    if (vercelHost) hosts.push(vercelHost)
  }

  if (env.allowedOrigins) {
    for (const raw of env.allowedOrigins.split(',')) {
      const h = parseHostname(raw.trim())
      if (h) hosts.push(h)
    }
  }

  if (hosts.length === 0) {
    if (env.nodeEnv !== 'production') {
      hosts.push('localhost', '127.0.0.1')
    } else {
      throw new Error('CSRF_ENV_MISCONFIGURED')
    }
  }

  return Array.from(new Set(hosts))
}

/**
 * Origin/Referer 헤더 검증. caller 는 mutating method 일 때만 호출.
 *
 * @throws Error('CSRF_ENV_MISCONFIGURED') production + env 미설정
 */
export function checkOrigin(
  request: RequestLike,
  env: OriginCheckEnv = readEnvFromProcess()
): OriginCheckResult {
  const allowedHosts = buildAllowedHosts(env)

  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')

  let candidateUrl: string | null = null
  if (originHeader !== null) {
    candidateUrl = originHeader
  } else if (refererHeader !== null) {
    candidateUrl = refererHeader
  }

  if (candidateUrl === null) {
    return {
      ok: false,
      reason: 'missing_headers',
      receivedOrigin: null,
      matchedAgainst: allowedHosts,
    }
  }

  if (candidateUrl === 'null') {
    return {
      ok: false,
      reason: 'invalid_url',
      receivedOrigin: candidateUrl,
      matchedAgainst: allowedHosts,
    }
  }

  const hostname = parseHostname(candidateUrl)
  if (hostname === null) {
    return {
      ok: false,
      reason: 'invalid_url',
      receivedOrigin: candidateUrl,
      matchedAgainst: allowedHosts,
    }
  }

  if (!allowedHosts.includes(hostname)) {
    return {
      ok: false,
      reason: 'host_mismatch',
      receivedOrigin: candidateUrl,
      matchedAgainst: allowedHosts,
    }
  }

  return { ok: true }
}

/**
 * process.env 캡처. test 에서는 env 인수를 직접 주입.
 */
function readEnvFromProcess(): OriginCheckEnv {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelUrl: process.env.VERCEL_URL,
    allowedOrigins: process.env.CSRF_ALLOWED_ORIGINS,
    nodeEnv: process.env.NODE_ENV,
  }
}
