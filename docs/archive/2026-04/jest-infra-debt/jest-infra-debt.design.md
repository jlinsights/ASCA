---
template: design
feature: jest-infra-debt
date: 2026-04-28
author: jaehong (jhlim725@gmail.com)
status: draft
planPath: docs/01-plan/features/jest-infra-debt.plan.md
---

# jest-infra-debt — Design

> **목적**: Plan의 6 Phase를 정확한 코드 변경 spec으로 확정한다. 모든 변경은
> 작은 단위, 개별 revertable, 회귀 영향 0이 목표.
>
> **Plan 후 추가 발견** (Design 단계에서 검증):
>
> 1. **`.env.example` 파일 자체가 repo에 없음** → e2e workflow의
>    `cp .env.example .env.local`이 silent fail. F5 작업 범위 확장.
> 2. **jest.setup.js가 dotenv로 `.env.test` 로드**, 그러나 `.env.test`는
>    .gitignore되어 CI에 없음. F4 root cause 확정.
> 3. **F2 mock 코드는 문법상 정상**. 실제 실패 원인은 Do 단계에서 stack trace
>    재현 필요.
> 4. **SSE 테스트는 DOM 미사용** → Approach A (per-file
>    `@jest-environment node`) 확정.

---

## 1. 아키텍처 개요

### 1.1 영향 범위

| 변경 파일                                      | 변경 종류                                    | LOC 추정 |
| ---------------------------------------------- | -------------------------------------------- | -------- |
| `jest.config.js`                               | transformIgnorePatterns 수정                 | ~3       |
| `jest.setup.js`                                | env placeholder 추가 + Web APIs 폴리필(옵션) | ~15      |
| `app/api/realtime/__tests__/sse-route.test.ts` | `@jest-environment node` docblock 추가       | ~3       |
| `lib/realtime/__tests__/sse-manager.test.ts`   | `@jest-environment node` docblock 추가       | ~3       |
| `app/api/members/[id]/__tests__/route.test.ts` | (Do 단계에서 stack trace 후 결정)            | TBD      |
| `.env.example`                                 | **신규 파일** — placeholder env vars 전체    | ~50      |
| `.env.test.example`                            | **신규 파일** — jest용 placeholder           | ~30      |
| `.gitignore`                                   | `.gstack/` 추가 (Out of Scope으로 분리 권장) | 1 (옵션) |
| **Total**                                      |                                              | ~100     |

### 1.2 데이터 흐름 (영향 없음)

본 사이클은 **테스트 인프라 + CI 환경**만 변경. 런타임 코드, 데이터 모델, API
응답 형식 무영향.

### 1.3 의존성

| 패키지                 | 버전     | 신규/기존            | 용도                                        |
| ---------------------- | -------- | -------------------- | ------------------------------------------- |
| `dotenv`               | 기존     | 기존                 | jest.setup에서 `.env.test` 로드 (변경 없음) |
| `undici`               | optional | 신규 (Approach B 시) | Web Fetch API 폴리필                        |
| `web-streams-polyfill` | optional | 신규 (Approach B 시) | ReadableStream 폴리필                       |
| **결정**               |          |                      | **Approach A 채택 → 신규 의존성 0**         |

---

## 2. Phase 1 — F1: ESM transform spec

### 2.1 변경 파일: `jest.config.js`

**Before** (line 45):

```js
transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
```

**After**:

```js
transformIgnorePatterns: [
  // ESM-only npm packages must be transformed by babel-jest
  // graphql v16 ships dual-package; deep imports may hit ESM paths
  '/node_modules/(?!(graphql|@graphql-tools|@graphql-yoga|graphql-yoga|graphql-ws)/)',
  '^.+\\.module\\.(css|sass|scss)$',
],
```

### 2.2 의사결정 근거

- `next/jest` wrapper는 `transformIgnorePatterns`을 customJestConfig에서
  override 가능
- ASCA `package.json`에는 `"graphql": "^16.12.0"`만 명시되어 있지만,
  transitive로 `@graphql-tools/*` 등이 들어올 수 있음 → 화이트리스트 광범위 설정
- 만약 Phase 1 적용 후에도 다른 `Unexpected token` 발생 시 추가 패키지를
  화이트리스트에 보강 (Plan Risk 1)

### 2.3 검증

```bash
npm run test:graphql
```

**기대**: 4 files (auth.test.ts, mutation.resolver.test.ts,
query.resolver.test.ts, route.test.ts) 모두 parse 성공. test 통과/실패는 별
문제(F2 등에 의존).

---

## 3. Phase 2 — F2: Supabase mock 디버깅 spec

### 3.1 현 상태 분석

`app/api/members/[id]/__tests__/route.test.ts`는 mock을 **올바르게** 작성:

- L8-11:
  `jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))`
- L29: `import { createClient } from '@/lib/supabase/server'`
- L32:
  `const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>`
- L52, 238, 508: `mockCreateClient.mockResolvedValue(mockSupabase)`

**가설**:

- (H1) F4(env validation) 미해결 시 jest.setup.js 시점에 throw → mock factory
  적용 안 됨
- (H2) `@/` path alias가 jest.config.js의 moduleNameMapper와 실제
  tsconfig.json에서 다르게 해석
- (H3) ESM/CJS interop 이슈 — `createClient` named export가 default export로
  wrapping

### 3.2 Do 단계 진단 명령

```bash
# 로컬에서 실패 재현 + 스택 추적
DATABASE_URL="" npm test -- app/api/members/\\[id\\]/__tests__/route.test.ts --verbose 2>&1 | head -80
```

### 3.3 가설별 fix spec

| 가설 | 확인 방법                                                                                     | 수정                                                                 |
| ---- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| H1   | F1+F4 적용 후 재실행, 통과하면 H1                                                             | 수정 불필요 (F4 수정으로 자동 해결)                                  |
| H2   | `cat tsconfig.json                                                                            | jq '.compilerOptions.paths'`vs`jest.config.js moduleNameMapper` 비교 | jest moduleNameMapper에 `'^@/lib/supabase/(.*)$': '<rootDir>/lib/supabase/$1'` 명시 추가 |
| H3   | `node -e "const m = require('@/lib/supabase/server'); console.log(typeof m, Object.keys(m))"` | mock factory에 `__esModule: true` 추가                               |

### 3.4 변경 (H1 우선 가정 → 본 phase는 코드 변경 없음, F1+F4 의존)

**가설 H1이 맞으면**: 본 phase는 spec만 작성, 코드 변경 0. **틀리면**: H2/H3
차례대로 시도.

---

## 4. Phase 3 — F3: Web APIs (Approach A 확정)

### 4.1 변경 파일 1: `app/api/realtime/__tests__/sse-route.test.ts`

**Before** (line 1-13):

```ts
/**
 * SSE API Route Integration Tests
 *
 * Comprehensive tests for the Server-Sent Events API endpoint.
 * ...
 */

import { NextRequest } from 'next/server'
```

**After**:

```ts
/**
 * SSE API Route Integration Tests
 *
 * @jest-environment node
 *
 * Comprehensive tests for the Server-Sent Events API endpoint.
 * ...
 */

import { NextRequest } from 'next/server'
```

### 4.2 변경 파일 2: `lib/realtime/__tests__/sse-manager.test.ts`

**Before** (line 1-15):

```ts
/**
 * SSE Manager Tests
 *
 * Comprehensive tests for Server-Sent Events management.
 * ...
 */

import {
  createSSEManager,
  ...
```

**After**:

```ts
/**
 * SSE Manager Tests
 *
 * @jest-environment node
 *
 * Comprehensive tests for Server-Sent Events management.
 * ...
 */
```

### 4.3 의사결정: Approach A vs B

|                         | A (per-file node env) | B (global polyfill)           |
| ----------------------- | --------------------- | ----------------------------- |
| 영향 파일               | 2개                   | jest.setup.js 1개             |
| 의존성 추가             | 0                     | undici + web-streams-polyfill |
| 회귀 위험               | 0                     | jsdom 다른 테스트와 충돌 가능 |
| 향후 SSE 테스트 추가 시 | docblock 1줄 추가     | 자동 적용                     |
| **선택**                | **A 채택**            | (보류)                        |

**근거**: SSE 테스트는 DOM API 미사용 (확인됨), Node env로 충분. Approach B는
jsdom 글로벌 오염 위험 + 의존성 부담.

### 4.4 검증

```bash
npm run test:realtime
```

**기대**: `Request / TextEncoder / ReadableStream is not defined` ReferenceError
0건.

---

## 5. Phase 4 — F4: Test env vars (jest.setup.js 강화)

### 5.1 변경 파일: `jest.setup.js`

**현재 line 4-7**:

```js
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.test') })
```

**After** — dotenv 호출 직후 placeholder fallback 추가:

```js
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.test') })

// Test env placeholders — schema 통과용. 실제 값은 .env.test에서 override.
// CI에서 .env.test 부재 시에도 lib/config/env.ts validateEnv() 통과 보장.
const TEST_ENV_DEFAULTS = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/asca_test',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-' + 'x'.repeat(64),
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-' + 'x'.repeat(64),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_' + 'x'.repeat(40),
  CLERK_SECRET_KEY: 'sk_test_' + 'x'.repeat(40),
}
for (const [key, value] of Object.entries(TEST_ENV_DEFAULTS)) {
  process.env[key] = process.env[key] ?? value
}
```

### 5.2 의사결정 근거

- `??=` 대신 `?? value` 패턴 사용 — `.env.test`에 실값이 있으면 보존
- placeholder 길이는 zod schema의 `.min(40)` 등 길이 검증 통과 충족
- `pk_test_` / `sk_test_` prefix는 Clerk 형식 모방 (validation 통과 목적)
- 절대 실제 운영 값을 placeholder로 사용 금지 → 보안 사고 방지

### 5.3 검증

```bash
# .env.test 없는 상태에서:
mv .env.test .env.test.bak 2>/dev/null
npm test -- lib/services/__tests__/member.service.test.ts lib/repositories/__tests__/member.repository.test.ts
mv .env.test.bak .env.test 2>/dev/null
```

**기대**: `Invalid environment variables` 에러 0건. 테스트 자체 통과 여부는 별
문제(테스트 로직).

---

## 6. Phase 5 — F5: E2E env bootstrap (`.env.example` 신규 생성)

### 6.1 사전 발견: `.env.example` 파일 없음

`.github/workflows/e2e-tests.yml`의 `Setup environment variables` step:

```yaml
run: |
  cp .env.example .env.local
```

→ `.env.example`이 repo에 없으므로 `cp` 실패 → step 실패 → E2E job 실패.

### 6.2 변경 파일: `.env.example` (**신규 생성**)

```bash
# ASCA Environment Variables Template
# Copy to .env.local and fill in real values for local development.
# CI uses placeholder values (see jest.setup.js / e2e-tests.yml).

# === Required ===

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/asca_dev"

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Clerk Authentication (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key"
CLERK_SECRET_KEY="sk_test_your_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# === Optional ===

# Redis for rate limiting (Upstash)
# UPSTASH_REDIS_REST_URL="https://YOUR.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="your-token"

# API Security (32+ chars)
# API_SECRET_KEY="your-32-character-secret-key-here"

# Airtable sync
# AIRTABLE_API_KEY="key..."
# AIRTABLE_BASE_ID="app..."
```

### 6.3 e2e-tests.yml 검토 (변경 불필요)

현재 step:

```yaml
- name: Setup environment variables
  run: |
    cp .env.example .env.local
    # Add any additional environment variables needed for testing
```

`.env.example` 신규 생성으로 `cp`가 성공. Playwright는 `.env.local`을 읽고
placeholder로 부팅 시도.

- 부팅까지는 통과 (zod schema)
- Supabase/Clerk 실제 호출 시점에서 실패 가능 → 본 사이클 범위 외 (Plan Out of
  Scope)

### 6.4 검증

```bash
# 로컬:
cp .env.example .env.local.test  # 충돌 방지용 임시 이름
diff .env.example .env.local.test  # 동일성 확인
rm .env.local.test

# CI:
PR push 후 e2e-tests.yml의 Setup step SUCCESS 확인
```

---

## 7. Phase 6 — CI 통합 검증

### 7.1 작업 순서

```
1. git checkout -b infra/jest-fix-2026-04-28
2. Phase 1 commit: "fix(jest): transform graphql ESM packages (F1)"
3. Phase 3 commit: "test(realtime): node env for SSE tests (F3)"
4. Phase 4 commit: "test(jest): env placeholders for CI (F4)"
5. Phase 5 commit: "chore(env): add .env.example template (F5)"
6. Phase 2 commit (조건부): F1+F4 후 mock 재현 시도, 필요 시 추가 commit
7. git push -u origin infra/jest-fix-2026-04-28
8. gh pr create --title "fix(jest): unblock PR #3 — 5 infra fixes (F1-F5)" \
     --body "Closes blocker for #3. See docs/01-plan/features/jest-infra-debt.plan.md"
9. CI 결과 확인 → Tests GREEN, E2E setup SUCCESS
10. Merge → PR #3 rebase main → CI 재실행 → 통과 확인
```

### 7.2 PR description template

```markdown
## Summary

Unblocks PR #3 (`🔐 fix(security): API 보안 부채 6건 일괄 정리`) by fixing 5
Jest infrastructure issues.

CSO 2026-04-28 audit Finding #3 unblocker.

## Changes

- F1: jest.config.js — whitelist graphql/\* in transformIgnorePatterns
- F3: SSE/realtime tests use `@jest-environment node`
- F4: jest.setup.js — env placeholder fallbacks
- F5: .env.example created (was missing)

## Test plan

- [x] `npm run test:graphql` — 4 files parse
- [x] `npm run test:realtime` — no Web API errors
- [x] `npm test -- member.service member.repository` — env validation passes
- [ ] CI: Tests job GREEN
- [ ] CI: E2E Setup step SUCCESS

## References

- Plan: `docs/01-plan/features/jest-infra-debt.plan.md`
- Design: `docs/02-design/features/jest-infra-debt.design.md`
- CSO report: `.gstack/security-reports/2026-04-28-000741.json`
- Blocked PR: #3
```

---

## 8. 회귀 검증 매트릭스

| 테스트 카테고리             | 본 사이클 영향            | 검증 방법                                                           |
| --------------------------- | ------------------------- | ------------------------------------------------------------------- |
| 기존 통과 unit tests        | 무영향 (jsdom 유지)       | `npm run test:ci` 통과 건수 ≥ 변경 전                               |
| 기존 통과 GraphQL tests     | F1로 더 많이 통과         | parse error 0건                                                     |
| 기존 통과 realtime tests    | F3로 통과 가능            | ReferenceError 0건                                                  |
| Coverage threshold (70%)    | config 변경이라 영향 적음 | `npm run test:coverage`                                             |
| Type-check (`tsc --noEmit`) | 무영향                    | `npm run type-check`                                                |
| Lint                        | 무영향                    | `npm run lint`                                                      |
| Design lint/diff/wcag       | 무영향                    | `npm run design:lint && npm run design:diff && npm run design:wcag` |

---

## 9. 위험 재평가 (Plan §5 업데이트)

| Risk                                                                    | Likelihood (Plan) | Likelihood (Design) | 비고                                        |
| ----------------------------------------------------------------------- | ----------------- | ------------------- | ------------------------------------------- |
| ESM whitelist 누락 패키지                                               | Medium            | **Low**             | graphql만 사용, transitive 추가 가능성 낮음 |
| Web APIs polyfill 충돌                                                  | Low               | **N/A**             | Approach A로 회피                           |
| placeholder env vars의 외부 호출                                        | Low               | **Low**             | 로컬 placeholder는 unreachable URL          |
| PR #3 rebase 충돌                                                       | Medium            | **Medium**          | 변경 파일 6개로 작아 충돌 적음              |
| F2 mock 위치 추적                                                       | Medium            | **Low**             | inline mock으로 식별 완료, F1+F4 의존       |
| **신규**: `.env.example` 신규 파일이 다른 도구(.dotenv-vault 등)와 충돌 | —                 | **Low**             | 일반 dotenv 표준 형식                       |

---

## 10. Out of Scope (재확인)

- PR #3 보안 픽스 검증 → 별 사이클 (`asca-security-debt` Check 단계)
- PR #3 분할 → 본 사이클 머지 후 별 작업
- Codecov action SHA 고정 → 별 hygiene PR
- `.gstack/` gitignore → 별 작업 (1줄 변경, 본 PR에 묶어도 무방하나 분리 원칙
  준수)
- E2E test 본체 통과
- Jest → Vitest 마이그레이션
- Coverage threshold 변경

---

## 11. 다음 단계

1. Design 검토 후 **`/pdca do jest-infra-debt`** 실행
2. Do 단계 시작 시 첫 작업: **Phase 2 가설 H1 검증** (F1+F4 적용 후 mock 재현
   시도)
3. 모든 Phase 완료 → **`/pdca analyze jest-infra-debt`** (gap-detector)
4. Match Rate ≥ 90% 시 → **`/pdca report jest-infra-debt`**
5. Report 후 → PR 생성 → CI 통과 확인 → 머지 → PR #3 rebase

---

## 12. Self-review 체크리스트

- [x] Plan §3의 모든 Phase에 대해 정확한 코드 변경 spec 작성
- [x] 각 변경의 Before/After 명시
- [x] 의존성 추가 0 (Approach A 선택)
- [x] PR description / commit 메시지 템플릿 포함
- [x] 회귀 검증 매트릭스 명시
- [x] 위험 재평가 후 Likelihood 조정
- [x] Out of Scope 재확인
- [x] Plan에서 발견된 추가 사실(.env.example 부재 등) 반영
