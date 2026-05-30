---
template: design
version: 1.1
feature: asca-csrf-origin-check
date: 2026-05-25
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
plan_doc: docs/01-plan/features/asca-csrf-origin-check.plan.md (rev β)
parent_cycle: asca-api-security-hardening (2026-04-25)
branch: security/csrf-origin-check
status: draft
revision_history:
  - v1.0 (2026-05-25): 초안
  - v1.1 (2026-05-25): design-validator HIGH 3건 반영
    - H1 webhook 경로 grep 실제 결과 반영 (clerk 1곳만 존재)
    - H2 middleware 콜백 순서 안전성 명시 (§3.2 주석 + §2.1 보강)
    - H3 Vercel preview 와일드카드 보안 가이드 강화 (§4.1 + §6.2)
---

# asca-csrf-origin-check Design Document

> **Summary**: Clerk SameSite=Lax 세션 쿠키에 server-side Origin/Referer 검증을
> 미들웨어 단계에 결합. `secure-api.ts` 의 거짓 CSRF 검증 4개 사이트 제거.
>
> **Project**: ASCA **Version**: 0.1.0 **Author**: jhlim725
> **Date**: 2026-05-25 **Status**: Draft
> **Plan Doc**: [asca-csrf-origin-check.plan.md](../../01-plan/features/asca-csrf-origin-check.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **거짓 보안 0**: `csrfToken.includes(slice(-8))` 검증 함수 + 옵션 + preset
  4개 참조 전부 제거.
- **OWASP 호환 1차 방어**: middleware 단계에서 mutating method 의 Origin/Referer
  헤더가 화이트리스트 호스트와 일치하는지 검사 (정확 hostname 매칭).
- **Edge runtime 호환**: `URL` + `String` ops 만 사용 (Node API/외부 라이브러리
  금지).
- **Webhook 면제**: signature 기반 검증을 쓰는 `/api/webhooks/*` 경로는 제외.
- **회귀 0**: 같은 도메인에서 출발한 모든 기존 호출은 추가 차단 없음.
- 변경 LOC 합계 ~150줄 (신규 헬퍼 + middleware patch + 테스트 제외 ~80줄).

### 1.2 Design Principles (asca-api-security-hardening 와 동일 원칙 계승)

- **재사용 우선**: 기존 `auditLogger` 인스턴스·로그 포맷·`extractSourceInfo` 재사용.
- **명시적 거부**: Origin 불일치 시 403 + 구조화 audit event, silently fail 금지.
- **Fail-closed**: production 환경에서 `NEXT_PUBLIC_APP_URL` 미설정 → middleware
  진입 시 throw (startup 실패가 silent allow 보다 안전).
- **Bisect-safe**: 각 작업 단계가 단일 commit 으로 lint·type-check GREEN.

### 1.3 환경변수 매핑 (Plan rev α → Design 정정)

| Plan 기재                                  | 실제 ASCA 환경변수                             |
| ------------------------------------------ | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` (오기재)            | `NEXT_PUBLIC_APP_URL` ← 사용                   |
| `process.env.VERCEL_URL`                   | Vercel 자동 주입 (preview 도메인)              |
| `CSRF_ALLOWED_ORIGINS` (신규)              | comma-separated, preview/staging/외부 도메인용 |

---

## 2. Architecture

### 2.1 Request Flow (변경 후)

```
Client Request (POST /api/admin/...)
   │
   ├─ headers: Origin, Referer, Cookie(__clerk_session=...)
   │
   ▼
middleware.ts (Edge runtime)
   │
   ├─ [1] csrfOriginGuard(request)            ← 신규 추가 (Clerk 이전 실행)
   │      ├─ method ∈ GET/HEAD/OPTIONS → skip → next
   │      ├─ path matches /api/webhooks/*    → skip → next
   │      ├─ isAllowedOrigin(req) === true   → next
   │      └─ false → 403 JSON + audit log + 종료
   │
   ├─ [2] clerkMiddleware(auth, req)          ← 기존 유지
   │      └─ isProtectedRoute → auth.protect()
   │
   ▼
Route Handler (createSecureAPI)
   │
   ├─ rateLimit                                ← 기존 유지
   ├─ requireAuth → requireAdminAuth           ← 기존 유지
   ├─ requiredPermissions check                ← 기존 유지
   └─ handler(context)
```

순서 핵심: **Origin guard 가 Clerk auth 보다 먼저** 실행돼야 함. 이유는 두 가지:

1. Clerk auth 가 먼저 통과되면 cross-site 요청에 대해 invalid auth 응답으로 정보
   누설(존재 vs 비존재) 가능.
2. Origin 검증 실패 audit 이 auth 실패 audit 보다 의미 있음(공격 패턴 구분).

### 2.1.1 콜백 순서 안전성 (v1.1 명시)

Next.js 14 + `@clerk/nextjs/server` 의 `clerkMiddleware` 는 **단일 middleware
래퍼**만 허용하므로 별도 middleware 체인 분리 불가. 따라서 guard 는 callback
인자 안 **첫 줄**에 위치한다.

**왜 callback 안에 두어도 "Clerk auth 이전"이 보장되는가:**

- `clerkMiddleware((auth, request) => {...})` callback 진입 시점에는 Clerk SDK
  내부에서 세션 쿠키 파싱·`Auth` 객체 구성은 완료되지만,
  redirect/401 같은 부수효과는 **`auth.protect()` 호출 시에만** 발생.
- guard 가 callback 첫 줄에서 `NextResponse.json(..., {status: 403})` 으로
  early return 하면 Clerk 의 `auth.protect()` 가 호출되지 않으므로, 사용자
  관점에서 "Clerk auth 보다 먼저 차단" 효과를 얻는다.
- Clerk 의 세션 파싱 자체는 부수효과 없는 read-only 동작이므로, guard 가
  나중에 실행되더라도 정보 누설은 발생하지 않음.

이 보장은 Clerk `@clerk/nextjs` ≥ 5.x 의 `clerkMiddleware` API 계약에
의존한다. 본 사이클 시점 실제 버전: **`@clerk/nextjs ^6.39.1`** (v1.1 sanity
검증). 메이저 업그레이드 시 재검증 필요 (T7 회귀 체크에 포함).

### 2.2 모듈 구성

```
lib/security/
├─ origin-check.ts          [NEW]  pure function 헬퍼 + env loader
├─ origin-check.test.ts     [NEW]  10 케이스 unit test
├─ audit-logger.ts          [MOD]  SecurityEvent.type union + logCSRFOriginMismatch()
├─ secure-api.ts            [MOD]  validateCSRFToken / validateCSRF 4 위치 삭제
└─ ...
middleware.ts               [MOD]  csrfOriginGuard 통합
docs/security/SECURITY_IMPLEMENTATION.md [MOD] CSRF 절 재작성
```

---

## 3. 인터페이스 명세

### 3.1 `lib/security/origin-check.ts`

```typescript
/**
 * Strict origin/referer 검증 (OWASP CSRF Prevention - Standard Header pattern).
 * Edge runtime safe (URL + string ops only).
 */
export interface OriginCheckEnv {
  appUrl: string | undefined          // process.env.NEXT_PUBLIC_APP_URL
  vercelUrl: string | undefined       // process.env.VERCEL_URL (Vercel 자동)
  allowedOrigins: string | undefined  // process.env.CSRF_ALLOWED_ORIGINS (csv)
  nodeEnv: string | undefined         // process.env.NODE_ENV
}

export interface OriginCheckResult {
  ok: boolean
  reason?: 'missing_headers' | 'invalid_url' | 'host_mismatch' | 'env_misconfigured'
  receivedOrigin?: string | null
  matchedAgainst?: string[]
}

/**
 * 메인 검증 함수.
 *
 * 정책:
 * - GET/HEAD/OPTIONS: caller 가 skip (이 함수에는 호출 자체를 안함).
 * - production + NEXT_PUBLIC_APP_URL 미설정 → throw (fail-closed).
 * - dev/test + APP_URL 미설정 → http://localhost:3000 자동 허용.
 * - Origin 헤더 우선 → 없으면 Referer 호스트 추출.
 * - 둘 다 없거나 파싱 실패 → ok=false (missing_headers / invalid_url).
 * - 화이트리스트 hostname 정확 일치 (substring 금지, port 무시).
 *
 * @throws Error 'CSRF_ENV_MISCONFIGURED' (prod + APP_URL 누락)
 */
export function checkOrigin(
  request: { headers: Headers; nextUrl?: URL },
  env: OriginCheckEnv = readEnvFromProcess()
): OriginCheckResult

/**
 * 화이트리스트 호스트 목록 구성 (export for test).
 *
 * 우선순위:
 * 1. APP_URL → 1개
 * 2. VERCEL_URL → 1개 (preview)
 * 3. CSRF_ALLOWED_ORIGINS csv → N개
 * 4. dev/test fallback → localhost:3000, 127.0.0.1:3000
 */
export function buildAllowedHosts(env: OriginCheckEnv): string[]

/**
 * NEXT_PUBLIC_APP_URL 의 hostname 만 추출 (port·scheme 무시).
 * 잘못된 URL → null (caller 가 fail-closed 처리).
 */
export function parseHostname(rawUrl: string | undefined | null): string | null

/**
 * process.env 캡처 (test 에서 mock override 가능하도록 인수 분리).
 */
function readEnvFromProcess(): OriginCheckEnv
```

### 3.2 `middleware.ts` 통합

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditLogger } from '@/lib/security/audit-logger'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const WEBHOOK_PATH = /^\/api\/webhooks\//

const isProtectedRoute = createRouteMatcher([
  // 기존 그대로
])

export default clerkMiddleware(async (auth, request) => {
  // [1] CSRF Origin guard — Clerk auth 이전 (callback 첫 줄, §2.1.1 참조)
  //
  // 안전성: Clerk SDK 가 callback 진입 전 세션 쿠키를 파싱하지만 redirect/401
  // 같은 부수효과는 auth.protect() 호출 시에만 발생. early return 으로 그
  // 호출을 차단하므로 cross-site 요청은 Clerk 영향 없이 403 종료된다.
  if (MUTATING_METHODS.has(request.method) && !WEBHOOK_PATH.test(request.nextUrl.pathname)) {
    const result = checkOrigin(request)
    if (!result.ok) {
      auditLogger.logCSRFOriginMismatch(request, result)
      return NextResponse.json(
        { success: false, error: 'CSRF origin validation failed', code: 'CSRF_ORIGIN_MISMATCH' },
        { status: 403 }
      )
    }
  }

  // [2] Clerk auth — 기존 유지
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export const config = { /* 기존 그대로 */ }
```

### 3.3 `lib/security/audit-logger.ts` 확장

```diff
 export interface SecurityEvent {
   timestamp: string
-  type: 'auth_success' | 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'admin_action'
+  type:
+    | 'auth_success'
+    | 'auth_failure'
+    | 'rate_limit'
+    | 'suspicious_activity'
+    | 'admin_action'
+    | 'csrf_origin_mismatch'
   severity: 'low' | 'medium' | 'high' | 'critical'
   // ...
 }

 export class SecurityAuditLogger {
   // ... 기존 메서드 ...

+  /**
+   * CSRF Origin 검증 실패 로그
+   */
+  public logCSRFOriginMismatch(
+    request: NextRequest,
+    result: { reason?: string; receivedOrigin?: string | null; matchedAgainst?: string[] }
+  ): void {
+    this.logEvent({
+      type: 'csrf_origin_mismatch',
+      severity: 'high',
+      source: this.extractSourceInfo(request),
+      details: {
+        reason: result.reason ?? 'unknown',
+        receivedOrigin: result.receivedOrigin ?? null,
+        matchedAgainst: result.matchedAgainst ?? [],
+      },
+    })
+  }
 }
```

### 3.4 `lib/security/secure-api.ts` 삭제 diff (요지)

```diff
 export interface SecureAPIConfig {
   requireAuth?: boolean
   rateLimitPreset?: keyof typeof RateLimitPresets
   customRateLimit?: { ... }
   requiredPermissions?: string[]
   logActions?: boolean
-  validateCSRF?: boolean
 }

 export function createSecureAPI(config: SecureAPIConfig = {}, handler: SecureAPIHandler) {
   const {
     requireAuth = true,
     rateLimitPreset = 'moderate',
     // ...
-    validateCSRF = false,
   } = config

   return async (request: NextRequest): Promise<NextResponse> => {
     try {
       // 1. Rate Limiting
       // ...

-      // 2. CSRF 검증 (POST, PUT, DELETE 요청에만)
-      if (validateCSRF && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
-        const csrfError = await validateCSRFToken(request)
-        if (csrfError) {
-          auditLogger.logSuspiciousActivity(...)
-          return csrfError
-        }
-      }
-
       // 3. 인증 확인
       // ...
     }
   }
 }

-async function validateCSRFToken(request: NextRequest): Promise<NextResponse | null> {
-  // 전체 함수 삭제 (31 lines)
-}

 export const SecurityPresets = {
   public: { ... },
   authenticated: { ... },
   admin: {
     requireAuth: true,
     rateLimitPreset: 'strict' as const,
     requiredPermissions: ['admin'],
     logActions: true,
-    validateCSRF: true,
   },
   system: {
     requireAuth: true,
     rateLimitPreset: 'strict' as const,
     requiredPermissions: ['system', 'admin'],
     logActions: true,
-    validateCSRF: true,
     customRateLimit: { ... },
   },
 }
```

---

## 4. 화이트리스트 호스트 구성 규칙

```
buildAllowedHosts(env):
  hosts = []
  if env.appUrl:
    h = parseHostname(env.appUrl); if h: hosts.push(h)
  if env.vercelUrl:
    h = parseHostname('https://' + env.vercelUrl); if h: hosts.push(h)
  if env.allowedOrigins:
    for raw in env.allowedOrigins.split(','):
      h = parseHostname(raw.trim()); if h: hosts.push(h)
  if hosts.length === 0:
    if env.nodeEnv !== 'production':
      hosts.push('localhost', '127.0.0.1')
    else:
      throw Error('CSRF_ENV_MISCONFIGURED')
  return [...new Set(hosts)]  // dedupe
```

### 4.1 매칭 규칙

- `Origin` 헤더 → `new URL(originHeader).hostname` 추출.
- `Origin` 누락 시 `Referer` 헤더 → 동일 처리.
- 추출된 hostname 이 `hosts.includes(hostname)` 인지 정확 일치 검사.
- **subdomain 자동 허용 금지** (예: `evil.app.example.com` ≠ `app.example.com`).
- **와일드카드 미지원 (v1.1 강화)**: `*.vercel.app` 같은 패턴 허용 시 같은
  preview 도메인 풀의 **다른 팀 프로젝트** 가 통과 가능. `VERCEL_URL` env 는
  Vercel 이 **자기 preview 호스트만** 주입하므로 안전, `CSRF_ALLOWED_ORIGINS`
  csv 는 명시적 호스트만 허용.
- 포트 무시 (Vercel preview 와 production 도메인 모두 443 기본).
- `null` Origin (sandbox iframe / file://) → 거부.

---

## 5. 테스트 매트릭스

### 5.1 `lib/security/origin-check.test.ts` (10 케이스)

| #   | 시나리오                                       | Origin 헤더                  | Referer 헤더            | env (APP_URL)              | 기대 result.ok | reason                |
| --- | ---------------------------------------------- | ---------------------------- | ----------------------- | -------------------------- | -------------- | --------------------- |
| 1   | 같은 도메인 production 요청                    | `https://asca.kr`            | -                       | `https://asca.kr`          | true           | -                     |
| 2   | cross-site 요청                                | `https://evil.com`           | -                       | `https://asca.kr`          | false          | host_mismatch         |
| 3   | Origin 누락, Referer fallback                  | (none)                       | `https://asca.kr/admin` | `https://asca.kr`          | true           | -                     |
| 4   | Origin 누락, Referer 도메인 불일치             | (none)                       | `https://evil.com/x`    | `https://asca.kr`          | false          | host_mismatch         |
| 5   | Origin/Referer 둘 다 누락                      | (none)                       | (none)                  | `https://asca.kr`          | false          | missing_headers       |
| 6   | Origin = `null` (sandbox iframe)               | `null`                       | -                       | `https://asca.kr`          | false          | invalid_url           |
| 7   | Vercel preview 도메인                          | `https://asca-pr-31.vercel.app` | -                    | (APP_URL 미설정, VERCEL_URL=`asca-pr-31.vercel.app`) | true | - |
| 8   | CSRF_ALLOWED_ORIGINS csv 매칭                  | `https://staging.asca.kr`    | -                       | APP_URL=`https://asca.kr`, ALLOWED=`https://staging.asca.kr,https://preview.asca.kr` | true | - |
| 9   | dev fallback (localhost)                       | `http://localhost:3000`      | -                       | (env 미설정, NODE_ENV=development) | true   | -                     |
| 10  | production env 누락 → throw                    | (any)                        | -                       | (env 미설정, NODE_ENV=production)  | -      | throws `CSRF_ENV_MISCONFIGURED` |

추가 `buildAllowedHosts` 유닛 케이스 (3 개): dedupe / order / dev fallback.

### 5.2 middleware 통합 테스트 (선택, jest-environment-edge 또는 mock)

| 시나리오                                | 메서드 | 경로                        | Origin           | 기대 응답                |
| --------------------------------------- | ------ | --------------------------- | ---------------- | ------------------------ |
| GET 같은 도메인                         | GET    | `/api/artists`              | `https://asca.kr`| Clerk 단계로 진행        |
| POST 같은 도메인                        | POST   | `/api/artists`              | `https://asca.kr`| Clerk 단계로 진행        |
| POST cross-site                         | POST   | `/api/artists`              | `https://evil.com`| 403 `CSRF_ORIGIN_MISMATCH` + audit log |
| Webhook POST (Origin 없음)              | POST   | `/api/webhooks/clerk`       | (none)           | guard skip → Clerk 단계 통과 |
| OPTIONS preflight                       | OPTIONS| `/api/admin/anything`       | `https://evil.com`| guard skip → 통과         |

### 5.3 회귀 검증

- `npm test` 전체 13 suites GREEN 유지 (Clerk 인프라 사전 실패 제외).
- `npm run lint` warnings 회귀 0.
- `npm run type-check` errors 0.
- 로컬 `npm run dev` 로 admin/contact form 등 mutating POST 정상 동작.

---

## 6. 보안 영향 분석

### 6.1 제거되는 위험 (이전 → 이후)

| 항목                            | 이전                                                | 이후                                       |
| ------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| CSRF 토큰 우회 가능성           | 세션 JWT 마지막 8자 substring 만 알면 통과         | N/A (검증 자체 제거)                       |
| Cross-site mutating 요청        | 거부 메커니즘 0 (validateCSRF 활성화 라우트 없음)  | middleware 단계 403                        |
| 거짓 보안에 의한 잘못된 안정감 | docs/PRD.md 에 "CSRF 검증" 명시                    | 실제 동작과 문서 정합                      |

### 6.2 잔존 위험 (사이클 종료 후 documented)

- **subdomain 공격**: 정확 hostname 매칭이라 `asca.kr` 와 `evil.asca.kr` 분리
  보호. v1.1 강화로 `*.vercel.app` 와일드카드는 코드 수준에서 차단됨
  (§4.1) — `VERCEL_URL` 은 자기 preview 호스트만 자동 주입하므로 다른 팀
  preview 호스트는 화이트리스트에 들어오지 않음. 단, **운영 가이드**: ASCA
  팀의 preview 도메인을 누군가가 fork 하여 같은 `vercel.app` 풀에서 띄울 가능성
  은 인정 — preview 환경에서 production admin 데이터 접근은 권장 안함 (별
  사이클 `asca-preview-admin-isolation` 후보).
- **Origin 헤더 신뢰**: 브라우저가 보내는 Origin 은 일반 클라이언트가 위조 못함
  (네트워크 레벨 공격은 HTTPS 가 차단). non-browser client (curl 등) 는 임의
  Origin 가능 → 그러나 이 경우 Clerk 세션 쿠키 자체가 없어 auth 단계에서 거부.
- **GET state-change**: GET 으로 mutating 하는 라우트가 없음을 가정. 향후 발견
  시 별 사이클로 처리 (`asca-get-mutation-audit`).
- **double-submit token 없음**: 옵션 B deferred. cross-origin 합법 호출 필요
  시점에 사이클 시작.

### 6.3 OWASP Cheat Sheet 매핑

- ✅ "Identifying Source Origin (via Origin / Referer header)" 절 충족.
- ✅ "SameSite Cookie Attribute" — Clerk 기본 Lax.
- ⏳ "Synchronizer Token Pattern" — 옵션 B deferred.
- ✅ "Disallowing simple HTTP GET as a method to change state" — 현재 코드베이스
  정합 (별 사이클 후보로 audit 만 기록).

---

## 7. 구현 순서 (do phase 입력)

```
1. T1 — origin-check.test.ts 작성 (10+3 케이스, RED)
2. T2 — origin-check.ts 구현 (GREEN)
3. T3 — audit-logger.ts SecurityEvent type 확장 + logCSRFOriginMismatch
4. T4 — middleware.ts csrfOriginGuard 통합 (TodoWrite + edge runtime 검증)
5. T5 — secure-api.ts 4개 site 거짓 검증 제거
6. T6 — docs (SECURITY_IMPLEMENTATION.md + PRD.md) 갱신
7. T7 — 통합 검증: lint·type-check·test·dev manual + security-reviewer agent
8. T8 — PR 생성 (branch: security/csrf-origin-check)
```

각 단계는 단일 commit, GREEN 상태 유지. T1+T2 는 묶음 commit 가능 (TDD pair).

---

## 8. Open Questions (Plan 미해결 / Design 에서 결정)

| #   | 질문                                                          | 결정                                                                                          |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Q1  | Plan rev α 의 `NEXT_PUBLIC_SITE_URL` ↔ 실제 `NEXT_PUBLIC_APP_URL` | **APP_URL 사용** (§1.3 정정). Plan 다음 revision 에 동기화.                              |
| Q2  | preview 도메인 화이트리스트 전략                              | **`VERCEL_URL` 자동 + `CSRF_ALLOWED_ORIGINS` 명시 csv 병행**. 와일드카드는 미지원 (보안 우선) |
| Q3  | webhook 경로 매칭 방식                                        | **prefix regex `/^\/api\/webhooks\//`**. v1.1 grep 실측: 현재 ASCA 표면 `app/api/webhooks/clerk/route.ts` 1곳만 존재, `app/api/integrations/*` 디렉토리 미존재. 향후 Toss/Stripe 추가 시 list 화 또는 regex 확장. Do T1 단계에서 webhook 경로 grep 회귀 테스트 1건 추가 |
| Q4  | dev 환경에서 localhost 외 다른 host (예: `*.local`)           | **deferred** — 발생 시 `CSRF_ALLOWED_ORIGINS` 로 처리, 코드 변경 없음                          |
| Q5  | OPTIONS preflight 처리                                        | **MUTATING_METHODS 에 미포함 → 자동 skip**. CORS preflight 는 별도 (현재 ASCA same-origin만)   |
| Q6  | csv 파싱 시 trailing slash / scheme 정규화                    | **`parseHostname` 가 URL 객체로 파싱 → hostname 만 추출, 정규화 자동**                         |

---

## 9. 참고

- OWASP CSRF Prevention Cheat Sheet (2024) — Standard Header Verification
- Clerk Cookie Settings — SameSite=Lax 기본
- Next.js 14 Middleware — Edge runtime 제약 (`URL`, `Headers`, `Request` 만 사용)
- 부모 사이클 design: `docs/02-design/features/asca-api-security-hardening.design.md`
- 신규 사이클 후보 (Plan §4 비범위 참조): `asca-csrf-double-submit`,
  `asca-admin-server-actions`, `asca-webhook-signature-audit`,
  `asca-get-mutation-audit`
