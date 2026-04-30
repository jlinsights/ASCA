---
template: plan
feature: jest-clerk-esm-fix
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: tests-stale-update
  status: archived (G4 unplanned ejection)
revision: rev β (사전 mini-do로 plan 가설 검증 — Karpathy §1 적용)
---

# jest-clerk-esm-fix — Plan (rev β)

> **목적**: 부모 사이클 `tests-stale-update`의 G4 unplanned ejection 해결.
> GraphQL 4 test files (`auth`, `mutation.resolver`, `query.resolver`,
> `route`)이 `@clerk/backend` ESM-only 패키지를 babel-jest가 transform 못 해
> `Test suite failed to run` (0 tests). 본 사이클로 4 files 통째 GREEN.
>
> **Why now**: tests-stale-update 사이클이 G4를 do 단계에서야 ejection. 4 신규
> 사이클 우선순위 1위 (가장 영향 큼: ~140 GraphQL tests unblock).

---

## 1. 배경 + rev β 사전 검증 결과

### 1.1 부모 사이클의 시도와 실패

`tests-stale-update` Phase D에서 시도:

```diff
- '^.+\\.(js|jsx|ts|tsx)$'
+ '^.+\\.(js|jsx|ts|tsx|mjs)$'   ← .mjs 추가
+ transformIgnorePatterns에 @clerk 추가
```

→ jest.setup.js babel parse 충돌
(`Property declarations[0] of VariableDeclaration ...`) → 본 사이클로 ejection.

### 1.2 rev β 사전 mini-do 발견 (2 turn 이내, 30분)

**가설 1**: jest.setup.js의 JSX (`<img>`) 가 .mjs transform 추가 시 next/babel
preset cascading 충돌. → 검증: JSX 제거 (`React.createElement('img', props)`) →
babel 충돌 해결 ✅

**가설 2**: next/jest가 `transformIgnorePatterns` prepend (`(?!(geist)/)`)로
우리의 `@clerk` whitelist를 무력화 (jest patterns AND 동작). → 검증:
`npx jest --showConfig`로 확인 ✅

**가설 3**: transform 시도까지 도달해도 babel preset이
`@clerk/backend/dist/index.js`의 regex literal 처리에서
`e.charCodeAt is not a function` 충돌. → 검증: 관찰됨 ✅

**최종 해결책**: transform 시도 자체를 회피 — `@clerk/nextjs/server`를
jest.setup.js에서 mock 처리. .mjs/transformIgnorePatterns 변경 불필요.

### 1.3 검증된 fix (mini-do 결과)

```js
// jest.setup.js — 2 변경
// (1) JSX → React.createElement (line 61-67)
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    const React = require('react')
    return React.createElement('img', props)
  },
}))

// (2) Clerk mock 추가 (line 70-75)
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: null }),
  currentUser: jest.fn().mockResolvedValue(null),
  clerkClient: { users: { getUser: jest.fn() } },
}))
```

**rev β 효과**: plan 작성 전 mini-do로 가설을 모두 검증. plan은 사실상 결과
문서화.

---

## 2. 목표 (Goals — Karpathy §4)

| Goal | Test Set                                       | 현재 RED                 | Target | Verify Check                                                    |
| ---- | ---------------------------------------------- | ------------------------ | ------ | --------------------------------------------------------------- |
| G1   | GraphQL 4 files (auth, mutation, query, route) | Test suite failed to run | GREEN  | `npx jest lib/graphql/ app/api/graphql/ --no-cache` → ≥95% pass |

**검증된 결과** (mini-do): 138 passed / 6 failed / 144 total = **95.8% pass**.
잔여 6건은 logic stale, OOS.

### 2.1 Out of Scope

- 잔여 6 logic stale (toHaveLength mock mismatch 등) —
  `tests-stale-graphql-extras` 별 사이클 (P5)
- 다른 ESM-only 패키지 transform — 발생 시 동일 mock 패턴 재적용
- production code 변경 (Clerk SDK 버전 변경 금지)
- E2E test (별 사이클 `e2e-clerk-mock`)

---

## 3. Phases

### Phase 1 — 2 변경 적용

이미 mini-do에서 적용됨. 본 사이클은 사후 문서화 + commit/PR.

1. `jest.setup.js:61-67` — JSX → React.createElement
2. `jest.setup.js:70-75` — `@clerk/nextjs/server` mock 추가

### Phase 2 — 검증

- [x] `npx jest lib/graphql/__tests__/auth.test.ts` → 56/57 (logic stale 1건)
- [x] `npx jest lib/graphql/ app/api/graphql/` → 138/144 (95.8%)
- [ ] CI Tests job — GraphQL 4 files unblock 확인

### Phase 3 — PR + 머지

- [ ] 별 브랜치 `chore/jest-clerk-esm-fix` (이미 생성됨)
- [ ] commit (jest.setup.js 2 변경)
- [ ] PR 생성
- [ ] CI 통과 (또는 admin merge — 잔여 G3/G4 외 fail은 별 사이클)

---

## 4. 비기능 요구사항

- **Reversibility**: jest.setup.js 단일 file 2 hunk
- **Backward compat**: production 무영향. test에서만 Clerk mock — 실 Clerk
  동작은 production/e2e에서 검증
- **CI 시간**: 변화 없음 (오히려 4 files 0초 fail에서 5초 pass로 늘어나지만
  negligible)

---

## 5. 위험

| Risk                                          | Likelihood | Impact | Mitigation                                              |
| --------------------------------------------- | ---------- | ------ | ------------------------------------------------------- |
| Clerk mock이 실제 Clerk 동작 차이 마스킹      | Medium     | Medium | mock은 unit test에서만. e2e는 실 Clerk session 사용     |
| 잔여 6 logic stale이 본 사이클 결과로 보임    | Low        | Low    | analyze.md에 OOS 명시                                   |
| 다른 ESM-only 패키지 발생 시 동일 패턴 재구축 | Medium     | Low    | 본 사이클의 mock 패턴이 컨벤션화 — feedback 메모리 권장 |

---

## 6. 일정 (rev β로 단축)

| Phase                     | 예상 시간 | 누적      |
| ------------------------- | --------- | --------- |
| Mini-do 사전 검증 (rev β) | 30분      | 0:30      |
| Phase 1 (이미 완료)       | -         | 0:30      |
| Phase 2 (검증)            | 5분       | 0:35      |
| Phase 3 (PR + CI)         | 30분      | 1:05      |
| Buffer                    | 25분      | 1:30      |
| **총합**                  |           | **~1.5h** |

(부모 추정 2-3h 대비 50% 단축 — rev β 효과)

---

## 7. 학습 (사전 메모)

1. **rev β 패턴 검증**: plan 작성 전 mini-do로 가설을 직접 검증하면 plan은 사후
   문서화로 압축. 본 사이클은 1.5h 추정 (부모 추정 2-3h 대비 50% 단축).
2. **next/jest `transformIgnorePatterns` 함정**: next/jest가 prepend하는
   `(?!(geist)/)` 패턴이 user override를 무력화. AND 동작.
3. **`@clerk/backend` 같은 ESM-only 패키지**: transform 시도보다 mock이
   surgical. unit test scope에서만 mock.
4. **JSX in jest.setup.js**: next/babel preset 처리에서 cascade 충돌 위험.
   createElement로 격리.

---

## 8. 다음 단계

1. 본 plan commit + push
2. `/pdca do jest-clerk-esm-fix` (이미 진행됨 — Phase 1 완료)
3. PR 생성 → 머지
4. analyze (Match Rate ~95% 예상)
5. report + archive
6. 다음 사이클: tests-db-fixture (사용자 결정) / tests-realtime-async-fix / 잔여
   stale extras

---

## 9. 참조

- 부모 사이클 (G4 ejection origin): `docs/archive/2026-04/tests-stale-update/`
- 조부모: `docs/archive/2026-04/tests-infra-cleanup/`,
  `docs/archive/2026-04/jest-infra-debt/`
- next/jest source:
  https://github.com/vercel/next.js/blob/canary/packages/next/src/build/jest/jest.ts
