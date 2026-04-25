---
template: design
version: 1.2
feature: asca-api-security-hardening
date: 2026-04-25
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
plan_doc: docs/01-plan/features/asca-api-security-hardening.plan.md
branch: security-hardening-2026-04
---

# asca-api-security-hardening Design Document

> **Summary**: 6 보안 fix(C1·C2 + H1-H4) 코드 수준 설계 — Clerk `auth()` 서버 검증 패턴 일관 적용 + CORS 화이트리스트 + 정보누설 차단
>
> **Project**: ASCA (my-v0-project)
> **Version**: 0.1.0
> **Author**: jhlim725
> **Date**: 2026-04-25
> **Status**: Draft
> **Planning Doc**: [asca-api-security-hardening.plan.md](../../01-plan/features/asca-api-security-hardening.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 6 fix 모두 **Clerk session-cookie 기반** 통일 (Bearer token 분기 최소화)
- 기존 `getAuthUser` (`lib/auth/middleware.ts`) 패턴 100% 재사용
- 각 fix는 **단일 commit**으로 분리되어 git bisect 가능
- 인증된 정상 케이스에 대한 **회귀 zero** (기존 통합 클라이언트가 그대로 동작)
- 변경 LOC 합계 ~75줄 (테스트 제외)

### 1.2 Design Principles

- **재사용 우선**: 새 유틸리티 신설 금지, 기존 `getAuthUser`/`auth()`/`logError` 재사용
- **명시적 거부**: 인증 실패는 401/403 명시 반환, silently fail 금지
- **Fail-closed**: 환경 변수 부재 시 기본값은 가장 보수적 동작 (CORS allow nothing, prod guard throw)
- **Bisect-safe**: 각 commit은 단일 fix만 포함, lint·type-check 통과 상태 유지

---

## 2. Architecture

### 2.1 Auth Flow Diagram (변경 후)

```
Client Request (with Clerk session cookie)
    │
    ├── App Router middleware (Clerk)        ← 기존 동작 유지
    │
    ▼
Route Handler / GraphQL context / SSE handler
    │
    ├── auth() from @clerk/nextjs/server     ← 통일 진입점
    │     │
    │     ├── userId === null → 401 Unauthorized
    │     └── userId !== null → 진입
    │
    ├── (해당 시) getAuthUser() → role 확인 → 403 Forbidden
    │
    ▼
Business logic (기존 그대로)
```

### 2.2 변경 파일 의존성

| 변경 파일 | 신규 import | 기존 패턴 |
|----------|-------------|----------|
| `lib/graphql/context.ts` | `auth` from `@clerk/nextjs/server` | `lib/auth/middleware.ts` 참조 |
| `app/api/realtime/sse/route.ts` | `auth` from `@clerk/nextjs/server` | `app/api/members/[id]/route.ts` 패턴 |
| `app/api/members/[id]/route.ts` | (기존) `getAuthUser` | PUT 핸들러의 admin 분기 그대로 |
| `app/api/admin/dashboard/route.ts` | (없음) | 응답 객체에서 `message` 키만 제거 |
| `app/api/graphql/route.ts` | (없음) | env var read |
| `app/api/members/me/route.ts` | (없음) | `process.env.NODE_ENV` 분기 추가 |

### 2.3 신규 환경 변수

| 변수 | 값 형식 | 기본값 (미설정 시) | 사용처 |
|------|---------|------------------|-------|
| `ALLOWED_ORIGINS` | `https://asca.kr,https://www.asca.kr` (콤마 구분) | 빈 문자열 → CORS 모두 거부 | H3 |

---

## 3. 6 Fix 상세 설계

### 3.1 C1 — GraphQL `authenticateUser` 구현

**파일**: `lib/graphql/context.ts:101-127`

**Before** (현재):
```typescript
async function authenticateUser(authHeader: string | null): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    // TODO: Implement actual token verification
    // ...placeholder...
    return null
  } catch (error) {
    logError('Authentication error', error instanceof Error ? error : undefined)
    return null
  }
}
```

**After** (변경):
```typescript
import { auth } from '@clerk/nextjs/server'

/**
 * GraphQL context의 인증. Clerk session cookie 기반.
 * 외부 Bearer token은 본 사이클에서 미지원 (필요 시 별도 사이클).
 */
async function authenticateUser(): Promise<User | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await db.query.users.findFirst({
      where: eq(schema.users.clerk_user_id, userId),
    })
    return user ?? null
  } catch (error) {
    logError('GraphQL authentication error', error instanceof Error ? error : undefined)
    return null
  }
}
```

**호출 측 변경**: `createContext`에서 `authHeader` 대신 인자 없이 호출.

**기존 anonymous public query 영향**:
- 현재 모든 query가 사실상 anonymous (auth stub이 항상 null)
- 변경 후: 인증된 user만 정상 진입, 미인증은 user=null 그대로 → resolver-level에서 public field만 반환하도록 설계되어 있다면 영향 없음
- 만약 resolver가 user 존재를 가정하지 않는 public field만 갖고 있다면 무영향
- 만약 admin-only field가 user role을 검사하지 않고 있다면 별도 fix 필요 (M2 백로그)

**검증 시나리오**:
1. Clerk 미인증 + GraphQL 호출 → user=null context, public field만 반환
2. Clerk 인증 + GraphQL 호출 → user=찾은 user 반환, 모든 schema 접근
3. 인증 후 DB user 미존재 → user=null (회원가입 webhook 미동기화 케이스)

---

### 3.2 C2 — SSE 인증 enforce

**파일**: `app/api/realtime/sse/route.ts:20-55`

**Before** (현재):
```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventTypesParam = searchParams.get('eventTypes')
    const token = searchParams.get('token')

    const eventTypes = eventTypesParam ? eventTypesParam.split(',').map(t => t.trim()) : ['*']

    let userId: string | undefined
    if (token) {
      // TODO: Implement token verification
    }

    const sseManager = getSSEManager()
    const stream = sseManager.createStream({ eventTypes }, userId)
    return createSSEResponse(stream)
  } catch (error) { ... }
}
```

**After** (변경):
```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Clerk session 강제 (cookie 기반)
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventTypesParam = searchParams.get('eventTypes')
    const eventTypes = eventTypesParam ? eventTypesParam.split(',').map(t => t.trim()) : ['*']

    const sseManager = getSSEManager()
    const stream = sseManager.createStream({ eventTypes }, userId)
    return createSSEResponse(stream)
  } catch (error) { ... }
}
```

**Token 파라미터 제거**: 검증되지 않던 `?token=` 파라미터 완전 제거. SSE는 Clerk cookie로만 인증.

**클라이언트 영향**:
- `lib/realtime/`의 SSE 클라이언트 호출처 확인 필요 → 토큰 query 제거, 일반 fetch (with credentials) 형태로 통일
- Next.js SSE는 자동으로 cookie를 함께 전송하므로 추가 코드 없음

**검증 시나리오**:
1. 로그아웃 상태 + SSE 연결 → 401 Unauthorized
2. 로그인 상태 + SSE 연결 → 200, stream 정상
3. 만료된 session + SSE 연결 → 401 (Clerk middleware가 session 처리)

---

### 3.3 H1 — members/[id] GET IDOR 차단

**파일**: `app/api/members/[id]/route.ts:8-50`

**Before** (현재):
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = await createClient()
    const { id } = await params

    const { data: member, error } = await supabase
      .from('members')
      .select(`*, membership_level:membership_levels(*), ...`)
      .eq('id', id)
      .single()

    // ... error handling, return data ...
  } catch (error) { ... }
}
```

**After** (변경) — PUT 핸들러의 admin 분기 패턴 그대로 적용:
```typescript
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = await createClient()
    const { id } = await params

    const { data: member, error } = await supabase
      .from('members')
      .select(`*, membership_level:membership_levels(*), ...`)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: 'Failed to fetch member' }, { status: 500 })
    }

    // ⬇⬇⬇ 신규 권한 체크 (PUT과 동일 패턴)
    if (member.clerk_user_id !== userId) {
      const adminUser = await getAuthUser()
      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
      }
    }
    // ⬆⬆⬆

    return NextResponse.json({ success: true, data: member })
  } catch (error) { ... }
}
```

**검증 시나리오**:
1. 로그인 user A가 본인 member id 조회 → 200 + 본인 데이터
2. 로그인 user A가 user B의 member id 조회 → 403 권한 없음
3. 로그인 admin이 임의 member id 조회 → 200
4. 로그아웃 + 임의 member id → 401

---

### 3.4 H2 — dashboard error.message 누설 차단

**파일**: `app/api/admin/dashboard/route.ts:89-100`

**Before** (현재):
```typescript
} catch (error) {
  logError('Dashboard API error', error instanceof Error ? error : undefined)
  return NextResponse.json(
    {
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error',  // ⚠️ 누설
    },
    { status: 500 }
  )
}
```

**After** (변경):
```typescript
} catch (error) {
  logError('Dashboard API error', error instanceof Error ? error : undefined)
  return NextResponse.json(
    { success: false, error: 'Failed to fetch dashboard data' },
    { status: 500 }
  )
}
```

**클라이언트 영향**:
- 응답에서 `message` 필드 제거됨
- 클라이언트가 `error.message`를 표시하던 코드가 있다면 `error` 필드로 대체 (이미 `'Failed to fetch dashboard data'` 문자열 동일)

**검증 시나리오**:
1. 의도적으로 throw → 응답 body에 stack trace/원본 message 없음
2. `logError` 로그에는 원본 error 그대로 기록 (서버 사이드 디버깅 가능)

---

### 3.5 H3 — GraphQL CORS 화이트리스트

**파일**: `app/api/graphql/route.ts:110-127`

**Before** (현재):
```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',  // ⚠️ wildcard
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
```

**After** (변경):
```typescript
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }
  return headers
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}
```

**적용 범위**: OPTIONS만 변경. POST/GET 응답에는 별도 CORS 헤더 미설정 (브라우저 same-origin이면 불필요).

**환경 설정**:
```bash
# .env.local (development)
ALLOWED_ORIGINS=http://localhost:3000

# Vercel production
ALLOWED_ORIGINS=https://asca.kr,https://www.asca.kr
```

**검증 시나리오**:
1. `Origin: https://asca.kr` (allowed) + OPTIONS → `Access-Control-Allow-Origin: https://asca.kr`
2. `Origin: https://evil.com` (not allowed) + OPTIONS → 응답에 ACAO 헤더 없음 → 브라우저가 요청 차단
3. `Origin` 헤더 없음 + OPTIONS → ACAO 없음 (서버-서버 호출은 CORS 무관)

---

### 3.6 H4 — members/me prod 가드

**파일**: `app/api/members/me/route.ts:14-22`

**Before** (현재):
```typescript
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      // 더미 데이터 반환 (개발용)
      return NextResponse.json({
        success: true,
        data: { /* ...130줄 dummy... */ },
      })
    }
    // ...실제 로직...
  } catch (error) { ... }
}
```

**After** (변경):
```typescript
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      if (process.env.NODE_ENV === 'production') {
        // prod에서는 dummy data 절대 반환 금지
        logError(
          'Supabase client not initialized in production — check env vars',
          undefined
        )
        return NextResponse.json(
          { success: false, error: 'Service temporarily unavailable' },
          { status: 503 }
        )
      }
      // dev/test 환경에서만 dummy data 반환
      return NextResponse.json({
        success: true,
        data: { /* ...기존 dummy 그대로... */ },
      })
    }
    // ...실제 로직 그대로...
  } catch (error) { ... }
}
```

**클라이언트 영향**:
- prod 환경에서 Supabase init 실패 시 503 반환 (이전엔 false dummy data)
- dev 환경 동작 변경 없음

**검증 시나리오**:
1. dev + Supabase 미설정 → 200 dummy data (기존 동작)
2. prod + Supabase 정상 → 200 실제 data
3. prod + Supabase null (env 누락 시) → 503 + `logError` 기록

---

## 4. Test Plan

### 4.1 회귀 테스트 (수동, Vercel preview에서 실행)

| Stage | 시나리오 | Expected | 검증 도구 |
|-------|---------|----------|----------|
| S1 | 로그인 + GraphQL `query { me { id } }` | 200 + me data | curl with cookie |
| S1 | 로그아웃 + 동일 쿼리 | 200 + me=null (또는 schema가 막는다면 401) | curl |
| S2 | 로그인 + `EventSource('/api/realtime/sse')` | stream 정상 | 브라우저 콘솔 |
| S2 | 로그아웃 + 동일 | 401 | 브라우저 콘솔 |
| S3 | A로 로그인 + `GET /api/members/<A의 id>` | 200 | curl with cookie |
| S3 | A로 로그인 + `GET /api/members/<B의 id>` | 403 | curl |
| S3 | admin으로 로그인 + `GET /api/members/<누구의 id>` | 200 | curl |
| S4 | admin로 로그인 + 의도적 dashboard 에러 (잘못된 query) | 응답 body에 stack trace 없음 | curl + jq |
| S5 | `Origin: https://asca.kr` + OPTIONS `/api/graphql` | ACAO 헤더 = `https://asca.kr` | curl -I |
| S5 | `Origin: https://evil.com` + OPTIONS | ACAO 헤더 없음 | curl -I |
| S6 | dev + Supabase env 제거 + `GET /api/members/me` | 200 dummy | local |
| S6 | preview deploy + 일시 Supabase env 제거 + 동일 | 503 + 로그 | Vercel logs |

### 4.2 자동화 테스트 (선택, 별도 사이클)

본 사이클은 **수동 회귀**만 enforce. 자동화 통합 테스트(Playwright/supertest)는 P2 백로그.

---

## 5. Implementation Order (Stage S1-S7)

| Stage | Commit message prefix | 변경 파일 | 검증 방법 | 예상 시간 |
|-------|----------------------|----------|----------|----------|
| S1 | `🔐 fix(security): C1 GraphQL Clerk auth` | `lib/graphql/context.ts` | curl + GraphQL playground | 30 min |
| S2 | `🔐 fix(security): C2 SSE Clerk auth` | `app/api/realtime/sse/route.ts` | EventSource 테스트 | 20 min |
| S3 | `🔐 fix(security): H1 members IDOR` | `app/api/members/[id]/route.ts` | curl 다른 user UUID | 20 min |
| S4 | `🔐 fix(security): H2 dashboard error leak` | `app/api/admin/dashboard/route.ts` | 의도적 에러 + body 점검 | 10 min |
| S5 | `🔐 fix(security): H3 GraphQL CORS allowlist` | `app/api/graphql/route.ts` | curl with Origin | 30 min |
| S6 | `🔐 fix(security): H4 members/me prod guard` | `app/api/members/me/route.ts` | NODE_ENV 분기 검증 | 15 min |
| S7 | `🔐 chore: security hardening verification` | (없음, lint/build/preview) | CI + Vercel preview | 30 min |

**총 예상**: ~155분 (~2.5시간) + Vercel preview 회귀 30분 = **3시간 내**

---

## 6. Error Handling

### 6.1 표준 에러 응답 (이번 사이클에서 통일하는 형식)

```json
// 401 Unauthorized
{ "success": false, "error": "Unauthorized" }

// 403 Forbidden
{ "success": false, "error": "권한이 없습니다" }

// 500 Internal Error
{ "success": false, "error": "Failed to fetch <resource>" }

// 503 Service Unavailable (prod에서 supabase 미초기화)
{ "success": false, "error": "Service temporarily unavailable" }
```

⚠️ **금지**: 응답 body에 `error.message`, stack trace, internal field name 포함 금지. 모든 디버깅 정보는 `logError`로만.

---

## 7. Security Considerations

- [x] 인증/인가 강화 (C1·C2·H1)
- [x] 정보 누설 차단 (H2·H4)
- [x] CORS 화이트리스트 (H3)
- [ ] Rate limiting — 본 사이클 out of scope (M3 백로그)
- [ ] HTTPS enforcement (HSTS) — 별도 사이클
- [ ] CSP 강화 — 별도 사이클

---

## 8. Clean Architecture

본 사이클은 신규 모듈 도입 없음. 모든 변경은 **infrastructure layer** (`app/api/`, `lib/graphql/`) 내부의 patch.

| Layer | 변경 |
|-------|------|
| Presentation | 없음 |
| Application | 없음 |
| Domain | 없음 |
| Infrastructure | 6 파일 patch (위 §3 참조) |

---

## 9. Coding Convention Reference

- Naming: 기존 ASCA 컨벤션 유지 (camelCase 함수, PascalCase 타입)
- Import order: external → `@/` → relative → type → styles (이미 일관)
- 에러 처리: `logError` 통일, catch에 반드시 호출
- 한국어 메시지: 사용자 노출 메시지는 한국어 ("권한이 없습니다") — 기존 patterns 유지

---

## 10. Next Steps

1. [ ] Design 검토·승인
2. [ ] Plan + Design commit (security branch에 추가)
3. [ ] `/pdca do asca-api-security-hardening` — Stage S1~S7 순차 구현
4. [ ] `/pdca analyze asca-api-security-hardening` — Gap 분석
5. [ ] PR 생성 (`security-hardening-2026-04` → `main`), Vercel preview 회귀
6. [ ] merge + production 모니터링 (1시간 canary)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-25 | Initial draft (6 fix before/after + test plan) | jhlim725 |
