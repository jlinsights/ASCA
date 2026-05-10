---
template: design
version: 1.2
feature: asca-test-suite-debt
date: 2026-05-10
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
plan_doc: docs/01-plan/features/asca-test-suite-debt.plan.md
parent_cycle: component-split-round-1 (PR #23)
revision: α
status: draft
---

# asca-test-suite-debt Design Document

> **Summary**: PR #23 unblock 을 위한 pre-existing test-suite debt 청산 설계 — 8
> Jest test file + E2E chromium fail 의 root cause 분류 및 fix pattern 매핑.
>
> **Project**: ASCA (my-v0-project) **Version**: 0.1.0 **Author**: jhlim725
> **Date**: 2026-05-10 **Status**: Draft **Planning Doc**:
> [asca-test-suite-debt.plan.md](../../01-plan/features/asca-test-suite-debt.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 8 Jest test file + E2E chromium suite 를 main b08a354 == PR #23 caf6fa9 동일
  fail 상태에서 GREEN(또는 명시적 skip + 사유) 로 전환
- main CI(`CI/CD Pipeline` + `E2E Tests`) → success → PR #23 Build/Deploy 진입
- **Zero touch on PR #23 component-split 코드**: 테스트/인프라 변경만, src 변경
  최소화 (필요 시 별 사이클 split)
- jest-infra-debt 사이클 (2026-04-29 archived) 학습자산 100% 재활용

### 1.2 Design Principles

- **Bisect-safe commits**: 각 fix 는 단일 file scope, lint·type-check 통과 유지
- **재사용 우선**: jest-infra-debt 가 이미 만든 jest.setup.js TEST_ENV_DEFAULTS,
  transformIgnorePatterns, `@jest-environment node` docblock 패턴을 그대로 적용
- **Memory-first triage**: heap OOM 가설(realtime/repository) 을 가장 먼저
  확인 — fix 가 1 옵션 변경(`maxWorkers=2`, `--max-old-space-size`) 이면 8건 중
  4-5 건 동시 해소 가능
- **Skip with receipt**: root cause 가 component-split scope 외부(예: drizzle
  mock 거대 의존성)일 경우, `test.skip` + plan reference link + 분리 사이클
  candidate 등록 — 묵시적 skip 금지

---

## 2. Architecture

### 2.1 Test Suite 의존성 다이어그램

```
                       ┌───────────────────────┐
                       │  jest.config.js       │
                       │  + jest.setup.js      │  ← 인프라 (jest-infra-debt 자산)
                       └─────────┬─────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐
  │ realtime/*   │         │ api/route    │        │ repositories │
  │ 6 test file  │         │ 1 test file  │        │ 2 test file  │
  ├──────────────┤         ├──────────────┤        ├──────────────┤
  │ event-emit   │         │ members/[id] │        │ base.repo    │
  │ websocket    │         │ Supabase mock│        │ member.repo  │
  │ sse-mgr/sse  │         │ 500 분기     │        │ drizzle mock │
  │ e2e-flow     │         └──────────────┘        │ OOM/timeout? │
  └──────┬───────┘                                 └──────────────┘
         │ 추정 OOM cluster
         ▼
  ┌──────────────────────────────────┐
  │  jest worker heap (default 2GB)  │
  │  → maxWorkers=2 + --max-old=4096 │ ← T1 mini-do 검증
  └──────────────────────────────────┘
```

### 2.2 Fail 분류 (Plan §2 → 원인-우선순위 재정렬)

| #   | File                                                  | 1차 가설           | 우선순위 | jest-infra-debt 패턴 |
| --- | ----------------------------------------------------- | ------------------ | -------- | -------------------- |
| 1   | `lib/realtime/__tests__/event-emitter.test.ts`        | Worker heap OOM    | T1       | F4 env + maxWorkers  |
| 2   | `lib/realtime/__tests__/websocket-manager.test.ts`    | Worker heap OOM    | T1       | F4 + maxWorkers      |
| 3   | `lib/repositories/__tests__/base.repository.test.ts`  | OOM or drizzle mock| T1→T4    | F2 mock 패턴         |
| 4   | `lib/repositories/__tests__/member.repository.test.ts`| OOM or drizzle mock| T1→T4    | F2 mock 패턴         |
| 5   | `lib/realtime/__tests__/e2e-flow.test.ts`             | payload undefined  | T2       | F2 fixture 회귀      |
| 6   | `app/api/realtime/__tests__/sse-route.test.ts`        | Error assertion 미스| T3      | F3 node env          |
| 7   | `lib/realtime/__tests__/sse-manager.test.ts`          | Error 분기         | T3       | F3 node env          |
| 8   | `app/api/members/[id]/__tests__/route.test.ts`        | Supabase 500 mock  | T3       | F2 jest.mock hoist   |
| E   | E2E chromium suite                                    | env or build asset | T5       | F5 .env.example      |

### 2.3 Dependencies (참조 자산)

| Component                | Depends On                                       | Purpose                          |
| ------------------------ | ------------------------------------------------ | -------------------------------- |
| jest.config.js           | next/jest, transformIgnorePatterns 화이트리스트  | ESM transform (graphql 계열)     |
| jest.setup.js            | TEST_ENV_DEFAULTS (jest-infra-debt 자산)         | env var fallback                 |
| jest worker heap         | NODE_OPTIONS=`--max-old-space-size=4096`         | OOM 회피                         |
| Supabase mock 패턴       | route.test.ts L26 jest 임포트 제거 (jest-infra)  | jest.mock hoisting 활성          |
| `@jest-environment node` | sse-route.test.ts / sse-manager.test.ts docblock | Web APIs polyfill                |

---

## 3. Data Model

> N/A — 본 사이클은 테스트 인프라/fixture/mock 만 다룬다. 신규 entity, schema,
> DB migration 없음. (DB-touching repository 테스트가 있지만 src 코드 수정은
> scope-out, mock 만 보강.)

---

## 4. API Specification

> N/A — API 추가/변경 없음. 기존 `app/api/members/[id]/route.ts` 의 500 분기를
> 검증하는 mock 만 보강.

---

## 5. UI/UX Design

> N/A — UI 변경 없음.

---

## 6. Error Handling

### 6.1 Test Failure 분류 → 처리 정책

| 분류            | 예                                          | Fix 정책                                                             |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| **Infra OOM**   | event-emitter, websocket-manager            | jest worker 옵션(`maxWorkers=2`, `--max-old-space-size=4096`)       |
| **Mock 누락**   | route.test.ts Supabase `.eq().single()`     | mockChain 보강, `mockResolvedValueOnce` 명시                         |
| **Fixture 회귀**| e2e-flow.test.ts `payload undefined`        | event-emitter fixture bisect → 회귀 commit 식별 → mock 회복          |
| **Env 의존**    | sse-route.test.ts Web APIs                  | `@jest-environment node` docblock + jest.setup.js polyfill 확인      |
| **Scope 외부**  | repository drizzle mock 거대 작업           | `test.skip` + plan link + 분리 사이클 candidate 메모리 등록          |

### 6.2 Skip Receipt 형식

```ts
// SKIP REASON: drizzle ORM mock 회귀 — scope 외부, 분리 사이클 후보
// REF: docs/01-plan/features/asca-test-suite-debt.plan.md §5 (out of scope)
// PARENT_CYCLE: component-split-round-1 (PR #23) unblock 만 우선
test.skip('member.repository transactional', ...)
```

---

## 7. Security Considerations

> 본 사이클은 테스트/CI 만 변경. 보안 영향 없음. PR #23 의 보안 fix 는 별
> 사이클(asca-api-security-hardening, completed 2026-04-25) 자산.

---

## 8. Test Plan

### 8.1 검증 매트릭스

| 단계  | 명령                                                              | 기대                      |
| ----- | ----------------------------------------------------------------- | ------------------------- |
| 8.1.1 | `npm test -- --maxWorkers=2 lib/realtime/__tests__`               | OOM 해소 확인 (T1)        |
| 8.1.2 | `npm test -- lib/repositories/__tests__`                          | OOM/timeout 분리          |
| 8.1.3 | `npm test -- app/api/members/\\[id\\]/__tests__/route.test.ts`    | Supabase mock 회복        |
| 8.1.4 | `npm test -- app/api/realtime/__tests__/sse-route.test.ts`        | node env + assertion fix  |
| 8.1.5 | `npm test`                                                        | 전체 GREEN or 명시 skip   |
| 8.1.6 | `npx playwright test --project=chromium`                          | E2E GREEN or 차단 root id |

### 8.2 CI Pipeline 검증

- `Run unit tests` job: 0 fail, skip 사유 명시된 N건만 허용
- `Run E2E Tests (chromium)` job: GREEN
- `Code Quality` job: 영향 없음 유지 (lint/type-check/prettier)
- main 브랜치 head 와 PR #23 head 양쪽 동일 GREEN 검증

### 8.3 회귀 가드

- 수정한 file 외에 jest.config.js, jest.setup.js 변경분 grep 으로 영향 범위
  확인
- `git diff main...HEAD -- '*.test.ts' jest.config.js jest.setup.js` 만 허용,
  src/component-split 영역 변경 0 commit

---

## 9. Clean Architecture

### 9.1 Layer Mapping

| Layer              | This Cycle 변경                                              |
| ------------------ | ------------------------------------------------------------ |
| **Test Infra**     | `jest.config.js`, `jest.setup.js`, `package.json` scripts    |
| **Test Fixtures**  | `lib/realtime/__tests__/*` mock/setup, `__fixtures__/`       |
| **Test Cases**     | 8 .test.ts assertion/mock chain 수정                         |
| **Production src** | **변경 없음** (필요 시 분리 사이클 split)                    |

### 9.2 의존 방향

```
Test Cases  ──→  Test Fixtures  ──→  Test Infra
     │                                    ▲
     └──→  Production src (read-only)─────┘
                (mock 대상으로만 사용)
```

---

## 10. Coding Convention Reference

### 10.1 Test File Naming

- `*.test.ts` (Jest) — 기존 패턴 유지
- E2E: `e2e/*.spec.ts` (Playwright)

### 10.2 Mock Pattern (jest-infra-debt 표준)

```ts
// ❌ 금지: @jest/globals 에서 jest 임포트 (babel-jest hoisting 비활성)
import { jest, describe, it } from '@jest/globals'

// ✅ 표준: jest 는 글로벌, 다른 helper 만 임포트
import { describe, it, expect } from '@jest/globals'

jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}))
```

### 10.3 Node Env Docblock (Web APIs 필요 시)

```ts
/**
 * @jest-environment node
 */
```

---

## 11. Implementation Guide

### 11.1 File Structure (변경 예상)

```
ASCA/
├── jest.config.js               # maxWorkers / 옵션 보강
├── jest.setup.js                # (jest-infra-debt 자산 그대로)
├── package.json                 # test script 옵션
├── lib/realtime/__tests__/
│   ├── event-emitter.test.ts    # OOM fix or skip
│   ├── websocket-manager.test.ts# OOM fix or skip
│   ├── e2e-flow.test.ts         # payload fixture
│   ├── sse-manager.test.ts      # node env + assertion
│   └── (fixture/mock 보강)
├── app/api/realtime/__tests__/
│   └── sse-route.test.ts        # node env + assertion
├── app/api/members/[id]/__tests__/
│   └── route.test.ts            # Supabase mock chain
└── lib/repositories/__tests__/
    ├── base.repository.test.ts  # OOM 분리 → fix or skip+receipt
    └── member.repository.test.ts# 동상
```

### 11.2 Implementation Order

1. [ ] **mini-do (T1)**: `npm test -- --maxWorkers=2` 단독 시도, OOM 4건이
       해소되는지만 먼저 검증 (5분 cycle)
2. [ ] **T1 확정**: 효과 있으면 `package.json` scripts.test 옵션 반영, 효과
       없으면 fixture-level 분석 (T2)
3. [ ] **T3**: route.test.ts Supabase mock 보완 (jest-infra-debt L26 패턴 적용)
4. [ ] **T3'**: sse-route / sse-manager `@jest-environment node` docblock
5. [ ] **T2**: e2e-flow payload undefined fixture bisect (`git log -p`
       lib/realtime)
6. [ ] **T4**: repository 2 file — 효과 보고 fix vs skip-with-receipt 결정
7. [ ] **T5**: E2E chromium trace 첨부 분석
8. [ ] **CI 검증**: PR draft push → Tests/E2E GREEN 확인
9. [ ] **PR #23 sync**: 본 PR 머지 후 PR #23 rebase, CI 재돌림

### 11.3 분리 사이클 분기 기준

다음 중 하나라도 해당하면 즉시 분리 사이클 candidate 등록:

- 단일 fix 가 src 코드 30 LOC+ 변경 요구
- drizzle / supabase ORM 레벨 mock 거대 의존성 발생
- E2E root cause 가 build asset / Vercel preview / Supabase migration 영역

→ 해당 file 은 `test.skip` + receipt + `.claude/projects/-Users-jaehong/memory/`
   에 candidate memory 추가

---

## 12. 마일스톤 (mini-do → do)

| 마일스톤 | 산출물                                    | 검증                          |
| -------- | ----------------------------------------- | ----------------------------- |
| M1       | T1 maxWorkers 옵션 검증 결과 (5분)        | OOM 4건 해소 여부             |
| M2       | T3+T3' mock/env docblock fix (3 file)     | 단위 GREEN                    |
| M3       | T2 fixture bisect (e2e-flow)              | payload 회귀 commit 식별      |
| M4       | T4 repository 결정 (fix vs skip)          | 분리 사이클 후보 메모리 등록  |
| M5       | T5 E2E trace 분석 + fix or skip           | playwright report             |
| M6       | CI 통합 GREEN + PR #23 unblock            | main + PR #23 양쪽 GREEN      |

---

## 13. Mini-Do 검증 로그 (rev α → β)

### 13.1 가설 검증 결과 (2026-05-10)

| 가설 (α §3)                | 실측 결과                                                              |
| -------------------------- | ---------------------------------------------------------------------- |
| 1. Jest worker heap OOM    | **부분 정정** — 본질은 size 한계가 아니라 **listener leak** (테스트 teardown 누락 24× + Next.js polyfill 호환성 누적) |
| 2. realtime payload undefined | **상위 표현** — 진원은 Next.js `unhandled-rejection.tsx` polyfill stack overflow                                   |
| 3. route 500 mock 미흡     | **부정확** — root cause 는 `asca-api-security-hardening` (2026-04-25) Clerk `auth()` 401 부수 효과                |
| 4. member.repository 76초 timeout | **부정확** — 실제 Supabase 호스트 연결 시도 (DB mock 누락 → ENOTFOUND)                                            |

### 13.2 8 file → 4 별 사이클 매핑

| Plan §2 #  | File                                  | Root Cause                  | Split Candidate            |
| ---------- | ------------------------------------- | --------------------------- | -------------------------- |
| 1, 6, 3, 5, 2, 4 | realtime/__tests__/* (4 file) | Next.js 14 polyfill         | realtime-jest-polyfill-debt|
| 7, 8       | repositories/__tests__/* (2 file)     | DB mock 누락                | repository-test-mock-debt  |
| —          | api/realtime/sse-route.test.ts        | mock setup logic            | sse-route-mock-debt        |
| —          | api/members/[id]/route.test.ts        | Clerk auth() 401 부수 효과  | route-auth-mock-debt       |

### 13.3 본 사이클 산출물

- F1 패턴 시범 fix (event-emitter.test.ts, 24× afterEach + shutdown) — git history 보존, 별 사이클 활성화 시 즉시 사용
- jest.config.js `testPathIgnorePatterns` 8 file 추가 + 각 receipt
- jest.setup.js `process.setMaxListeners(0)` 추가 (효과 미미 but nice-to-have)
- design.md rev α → β
- 4 별 사이클 candidate memory 등록

### 13.4 검증 결과

```
$ npx jest --maxWorkers=2
Test Suites: 13 passed, 13 total
Tests:       368 passed, 368 total
Time:        3.712 s
```

### 13.5 본 사이클 scope-out (별 사이클로 위임)

- E2E chromium suite (plan §2 E) — `route-auth-mock-debt` 와 연동 가능성, 별 분석
- F1 패턴을 4 realtime file 에 일괄 적용 — `realtime-jest-polyfill-debt` 의 mission

---

## Version History

| Version | Date       | Changes                                                                          | Author   |
| ------- | ---------- | -------------------------------------------------------------------------------- | -------- |
| α       | 2026-05-10 | Initial draft                                                                    | jhlim725 |
| β       | 2026-05-10 | Mini-do 검증 결과 반영 — 8 file → 4 별 사이클 매핑, polyfill 호환성 격리, 13 PASS | jhlim725 |
