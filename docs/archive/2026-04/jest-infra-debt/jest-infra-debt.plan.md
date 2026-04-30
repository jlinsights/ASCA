---
template: plan
feature: jest-infra-debt
date: 2026-04-28
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: asca-security-debt
  date: 2026-04-25
  matchRate: 92
  status: blocked-by-ci (PR #3 cannot merge)
---

# jest-infra-debt — Plan

> **목적**: 보안 픽스 PR #3 (`🔐 fix(security): API 보안 부채 6건 일괄 정리`)
> 머지를 가로막는 Jest 테스트 인프라 결함 5종을 단일 사이클로 해결한다.
>
> **Why now**: 2026-04-25 보안 PDCA가 92% Match로 종료됐지만, 픽스 PR #3가 3일째
> OPEN with failing tests. 6건 취약점(C1·C2·H1-H4)이 production에 그대로 남아
> 있음. CSO 감사(2026-04-28) #3 finding이 unblocker로 지목.

---

## 1. 배경 (Context)

### 1.1 현재 상태 (2026-04-28 기준)

- **PR #3 stats**: +277,768 / -150,742 lines, **585 files changed**, OPEN since
  2026-04-25
- **CI 결과**:
  - `Tests` (CI/CD Pipeline) — **FAILURE** at "Run unit tests"
  - `Run E2E Tests (chromium)` — **FAILURE** at "Setup environment variables"
  - `Code Quality`, `Security Audit`, CodeRabbit, Vercel — SUCCESS
- **Jest 설정**: `jest.config.js` (Next.js `next/jest` wrapper, jsdom env, babel
  transform)
- **활성 PDCA (parallel)**:
  - `warning-cleanup-cycle-2` (do, in-progress) — 무관, 병행 가능
  - `asca-security-debt` (check 92% → blocked by CI) — **이 사이클이 unblock
    대상**

### 1.2 5가지 root cause (CI log: `gh api .../actions/jobs/73008106765/logs`)

| #   | 증상                                                                                           | Root cause                                                                              | 영향 파일 수                    |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| F1  | `SyntaxError: Unexpected token 'export'`                                                       | Jest `transformIgnorePatterns`가 ESM-only npm 패키지(graphql 관련) 제외 안 함           | 4 GraphQL tests                 |
| F2  | `TypeError: mockCreateClient.mockResolvedValue is not a function` ×17                          | Supabase mock helper(`__mocks__/@supabase/ssr.ts` 추정)가 `jest.fn()`이 아닌 값 export  | 1 (member [id] route test)      |
| F3  | `ReferenceError: Request / TextEncoder / ReadableStream is not defined`                        | jsdom env가 Web Streams/Fetch API 미지원, SSE/realtime 코드는 Node Web APIs 필요        | ≥2 (sse-route, sse-manager)     |
| F4  | `Invalid environment variables`                                                                | env schema validator가 import 시 throw, 테스트용 env vars CI에 없음                     | 2 (member.service / repository) |
| F5  | E2E "Setup environment variables" 실패 (`cp .env.example .env.local` 만 수행, runtime 값 없음) | `.env.example`이 placeholder만 담아 Playwright 부팅 시 Supabase/Clerk/Drizzle init 실패 | 1 (.env.example)                |

### 1.3 추가 발견 (CSO 2026-04-28 부수 finding)

- **Codecov action 미고정**: `.github/workflows/ci.yml:74` —
  `codecov/codecov-action@v3` (tag, not SHA)
- **`.gstack/` not in .gitignore**: 보안 리포트 누출 가능
- **`.claude/settings.local.json` git-tracked**: 컨벤션 위반 (별 사이클로 분리)

이 3건은 **Out of Scope** (별 PDCA 또는 hygiene PR로 분리).

---

## 2. 목표 (Goals)

### 2.1 Primary Goals (DoD)

1. **G1 — F1 해결 (ESM transform)**: `Tests` job에서 4 GraphQL test files 모두
   syntax error 없이 실행
2. **G2 — F2 해결 (Supabase mock)**: `mockCreateClient` 호출 17회 모두 mock
   함수로 동작
3. **G3 — F3 해결 (Web APIs)**: SSE/realtime 테스트가 `Request`, `TextEncoder`,
   `ReadableStream` 사용 가능
4. **G4 — F4 해결 (test env vars)**: env schema validation이 테스트 컨텍스트에서
   통과
5. **G5 — F5 해결 (E2E env bootstrap)**: Playwright 부팅까지 통과 (실제 E2E
   통과는 별 이슈)
6. **G6 — `Tests` job GREEN**: PR #3 base 동일 조건에서 CI `Tests` 체크 SUCCESS
7. **G7 — `Run E2E Tests (chromium)` job: setup step 통과**: 이후 단계 실패는 별
   사이클

### 2.2 Stretch Goals (선택, 시간 여유 시)

- **S1 — Jest config 모듈화**: `jest.config.base.js` + `jest.config.unit.js` +
  `jest.config.realtime.js` 분리, realtime은 `testEnvironment: 'node'`
- **S2 — Mock 디렉토리 표준화**: `__mocks__/` 트리 정리, mock helper docstring
  추가
- **S3 — `.env.example` template 강화**: dev/test/CI 별 placeholder 명시

### 2.3 Out of Scope

- PR #3의 보안 픽스 자체 검증 (별 사이클 `asca-security-debt` Check 단계에서
  처리)
- PR #3 분할 (별 작업, 본 사이클 완료 후 진행)
- Codecov action SHA 고정 (별 hygiene PR — 동일 CI 파일 수정이라 충돌 회피 위해
  분리)
- E2E test 본체 통과 (Playwright suite의 비즈니스 로직 회귀는 별 사이클)
- Jest → Vitest 마이그레이션
- Coverage threshold 변경

---

## 3. 단계별 작업 (Phases)

### Phase 1 — F1: ESM transform 처리

**파일**: `jest.config.js`

- [ ] CI 로그에서 실패한 graphql 관련 import를 추적해 ESM 패키지 식별
  - 추정: `graphql`, `@graphql-tools/*`, `graphql-yoga`, `graphql-ws` 등
- [ ] `transformIgnorePatterns`를 ESM 패키지 화이트리스트 방식으로 수정
  ```js
  transformIgnorePatterns: [
    '/node_modules/(?!(graphql|@graphql-tools|graphql-yoga|graphql-ws)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  ```
- [ ] 로컬 검증: `npm run test:graphql` 실행 → 4 files syntax error 0건

**완료 조건**: `lib/graphql/__tests__/auth.test.ts`,
`lib/graphql/resolvers/__tests__/{mutation,query}.resolver.test.ts`,
`app/api/graphql/__tests__/route.test.ts` 모두 parse 통과

---

### Phase 2 — F2: Supabase mock helper 수정

**파일**: `__mocks__/@supabase/ssr.ts` (또는
`app/api/members/[id]/__tests__/route.test.ts`의 inline mock)

- [ ] 실패 위치 정확히 식별 (`grep -rn "mockCreateClient" .` + jest stack trace)
- [ ] `mockCreateClient`를 `jest.fn()` factory로 교체:
  ```ts
  // BEFORE (broken)
  export const mockCreateClient = {} // or some value
  // AFTER
  export const mockCreateClient = jest.fn()
  ```
- [ ] 테스트 파일에서 `mockCreateClient.mockResolvedValue(...)` 호출 17건 모두
      정상 동작
- [ ] 로컬 검증: `npm test -- members/\\[id\\]/__tests__/route.test.ts`

**완료 조건**: TypeError 17건 → 0건

---

### Phase 3 — F3: Web APIs polyfill

**파일**: `jest.setup.js` + (옵션) per-file `@jest-environment node`

**Approach A (권장)**: SSE/realtime 테스트만 Node env 사용

- [ ] `app/api/realtime/__tests__/sse-route.test.ts` 상단에:
  ```ts
  /**
   * @jest-environment node
   */
  ```
- [ ] `lib/realtime/__tests__/sse-manager.test.ts` 동일 처리
- [ ] (선택) Stretch S1으로 testEnvironment 분리 config 도입

**Approach B (대안)**: jest.setup.js에 polyfill

- [ ] `npm i -D undici web-streams-polyfill` (이미 있으면 skip)
- [ ] `jest.setup.js`에 추가:
  ```js
  if (typeof globalThis.TextEncoder === 'undefined') {
    Object.assign(globalThis, require('node:util'))
  }
  if (typeof globalThis.ReadableStream === 'undefined') {
    Object.assign(globalThis, require('node:stream/web'))
  }
  if (typeof globalThis.Request === 'undefined') {
    const { Request, Response, Headers, fetch } = require('undici')
    Object.assign(globalThis, { Request, Response, Headers, fetch })
  }
  ```

**선택 기준**: SSE 테스트가 jsdom의 DOM을 안 쓰면 Approach A가 깔끔. DOM 쓰면 B.

**완료 조건**: `npm run test:realtime` ReferenceError 0건

---

### Phase 4 — F4: Test env vars

**파일**: `jest.setup.js` (또는 `.env.test` template)

- [ ] `.env.test` (gitignored) 또는 `jest.setup.js`에 schema 통과용 placeholder
      정의
  ```js
  // jest.setup.js (top)
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??=
    'test-anon-key-' + 'x'.repeat(40)
  process.env.SUPABASE_SERVICE_ROLE_KEY ??=
    'test-service-role-' + 'x'.repeat(40)
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test'
  // ... etc per env schema
  ```
- [ ] CI에 secrets 추가 옵션도 검토 (실제 staging 값 노출 위험 → placeholder
      권장)
- [ ] 로컬 검증: `npm run test:ci` 시 `Invalid environment variables` 에러 0건

**완료 조건**: `lib/services/__tests__/member.service.test.ts`,
`lib/repositories/__tests__/member.repository.test.ts` 통과

---

### Phase 5 — F5: E2E env bootstrap

**파일**: `.env.example` + `.github/workflows/e2e-tests.yml`

- [ ] `.env.example`에 Playwright 부팅 가능한 placeholder 추가 (Phase 4와 동일
      값)
- [ ] (옵션) `.env.e2e.example` 별도 파일로 분리해 dev .env.example 오염 방지
- [ ] e2e-tests.yml `Setup environment variables` 단계가
      `cp .env.example .env.local` 후 부팅 통과 확인
- [ ] 본 사이클은 setup 단계까지만 GREEN 목표 (실제 Playwright suite 통과는 별
      사이클)

**완료 조건**: `Run E2E Tests (chromium)` job이 "Setup environment variables"
step 통과 (이후 단계 실패는 허용)

---

### Phase 6 — CI 통합 검증 (G6, G7)

- [ ] 별 브랜치 `infra/jest-fix-2026-04-28` 생성
- [ ] Phase 1-5 변경 commit + push
- [ ] PR 생성 (small, focused: ~5-10 files, <200 lines)
- [ ] CI 결과 확인: `Tests` job GREEN, `E2E setup` step pass
- [ ] PR 머지 후 PR #3에서 `git rebase main` → CI 재실행 → GREEN 확인

**완료 조건**: PR #3의 CI `Tests` 및 `Setup environment variables` SUCCESS

---

## 4. 비기능 요구사항 (Non-Functional)

- **Reversibility**: 각 Phase 변경은 단일 commit, 개별 revert 가능
- **Backward compat**: 기존 통과하는 테스트 회귀 없음 (전체 `npm run test:ci`
  통과)
- **Coverage**: jest coverage threshold (70%) 유지 — 본 사이클은 config 변경이라
  coverage 영향 적음
- **CI 시간**: Tests job 3분 이내 (현재와 동일)

---

## 5. 위험 (Risks)

| Risk                                                                            | Likelihood | Impact | Mitigation                                                                                  |
| ------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------- |
| ESM whitelist 누락 패키지가 추가로 발견                                         | Medium     | Low    | Phase 1에서 1차 시도 후 추가 패키지 발견 시 whitelist 보강                                  |
| Web APIs polyfill이 jsdom 다른 테스트와 충돌                                    | Low        | Medium | Approach A(per-file Node env) 우선 선택, 충돌 zero                                          |
| placeholder env vars로 일부 통합 테스트가 의도치 않게 외부 호출                 | Low        | Medium | env vars가 schema 통과만 하면 되고, 실제 Supabase 호출은 mock 처리 (이미 PR #3에 mock 있음) |
| PR #3가 base에서 너무 멀어져 rebase 충돌 폭증                                   | Medium     | High   | 본 사이클 PR은 작게(~10 files) 유지, PR #3 author가 즉시 rebase                             |
| F2의 mock helper가 `__mocks__/`가 아니라 inline mock인 경우 위치 추적 시간 소요 | Medium     | Low    | Phase 2 첫 step에서 grep으로 정확히 식별                                                    |

---

## 6. 검증 (Verification)

### 6.1 로컬 검증 명령

```bash
# Phase별
npm run test:graphql        # Phase 1
npm test -- members/\\[id\\]  # Phase 2
npm run test:realtime       # Phase 3
npm test -- member.service member.repository  # Phase 4

# 종합
npm run test:ci             # 전체 unit + coverage
npm run test:e2e -- --project=chromium --grep="@smoke"  # Playwright 부팅 확인
```

### 6.2 CI 검증

- 브랜치 push 후 GitHub Actions `Tests` 체크 SUCCESS
- PR #3 rebase 후 `Tests` + `Setup environment variables` SUCCESS

### 6.3 Match Rate 측정 (Check phase)

- gap-detector agent로 Plan vs 구현 비교
- 목표: ≥90%

---

## 7. 일정 (Estimate)

| Phase                                          | 예상 시간              | 누적 |
| ---------------------------------------------- | ---------------------- | ---- |
| Phase 1 (ESM)                                  | 30분                   | 0:30 |
| Phase 2 (mock)                                 | 30분                   | 1:00 |
| Phase 3 (Web APIs)                             | 45분                   | 1:45 |
| Phase 4 (env vars)                             | 30분                   | 2:15 |
| Phase 5 (E2E env)                              | 20분                   | 2:35 |
| Phase 6 (CI 통합)                              | 1-2시간 (CI 대기 포함) | 4:35 |
| Buffer (예상 못 한 ESM 패키지, mock 위치 추적) | 1시간                  | 5:35 |
| **총합**                                       | **~5-6시간**           |      |

CSO 감사 추정치(4-6시간)와 정합.

---

## 8. 다음 단계 (Next Step)

1. 이 Plan 검토 후 **`/pdca design jest-infra-debt`** 실행
2. Design 단계에서 각 Phase의 정확한 코드 변경 spec 작성
3. Design 완료 후 Do (구현) → Check (gap-detector) → Report

---

## 9. 참조

- CSO 감사 리포트: `.gstack/security-reports/2026-04-28-000741.json` (Finding
  #3)
- 실패한 CI run logs:
  - Tests:
    `https://github.com/jlinsights/ASCA/actions/runs/24930794275/job/73008106765`
  - E2E:
    `https://github.com/jlinsights/ASCA/actions/runs/24930794268/job/73008106775`
- 관련 PR: `https://github.com/jlinsights/ASCA/pull/3`
- 메모리: `project_asca_security_debt.md` (2026-04-25 PDCA 결과)
- 이전 사이클: `docs/archive/2026-04/asca-design-system-finalize/` (PDCA 사이클
  패턴 참조)
