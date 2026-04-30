---
template: design
feature: tests-stale-update
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
status: draft
parentPlan:
  feature: tests-stale-update
  revision: α
---

# tests-stale-update — Design

> **목적**: Plan rev α의 G1/G2/G4 패턴 결정 + ADR. test-only 변경이라
> architecture 영향 없음 — design은 "패턴 + 적용 규칙" 정의에 집중.

---

## 1. 결정 요약 (TL;DR)

| Goal | 패턴                                                                             | 핵심 결정                                                          |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| G1   | `jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })` + async safe | microtask는 real, timer만 fake → `await x.shutdown()` 정상 resolve |
| G2   | `describe('verifyMember', ...)` block 통째 삭제                                  | 16건 inline 수정 아닌 group 단위 surgical 제거                     |
| G4   | `lib/graphql/test-utils` 의 mock context shape를 현행 GraphQLContext에 정렬      | test 파일 직접 수정 아닌 utils 단일 지점 보강 → 4 files 자동 회복  |

---

## 2. G1 — Realtime timeout 패턴 결정

### 2.1 문제 재정의

```ts
// 현재 sse-manager.test.ts
beforeEach(() => {
  jest.useFakeTimers() // 모든 timer + microtask + nextTick fake
  manager = createSSEManager()
})

afterEach(async () => {
  await manager.shutdown() // ← 5초 timeout. fake timer가 microtask까지 잡아 promise resolve 못 함
  jest.useRealTimers()
})
```

### 2.2 두 가지 해결 패턴 (ADR)

**Option A — `doNotFake` 옵션 추가**

```ts
beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
  manager = createSSEManager()
})
```

- 장점: 1줄 변경, 기존 timer 어드밴스 코드 재사용 가능
- 단점: jest 27+ 필수 (확인됨, ASCA jest 29.7 사용)

**Option B — `await jest.advanceTimersByTimeAsync(N)` 패턴**

```ts
afterEach(async () => {
  jest.advanceTimersByTimeAsync(0) // microtask flush
  await manager.shutdown()
  jest.useRealTimers()
})
```

- 장점: 명시적 control
- 단점: timer advance 호출 추가 필요, 기존 sync `runAllTimers` 사용처 영향

### 2.3 결정 — **Option A 채택**

**Why**: 변경 surface 최소 (Karpathy §3 surgical). 5 files 모두 `beforeEach`의
`useFakeTimers()` 한 줄만 수정. Option B는 `afterEach` 외에도 individual test의
timer 호출까지 검토 필요 → 변경 폭 큼.

**How to apply**: 5 files의 `jest.useFakeTimers()` →
`jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })`. 회귀 의심
시 Option B로 fallback.

### 2.4 적용 대상 (5 files)

```
lib/realtime/__tests__/sse-manager.test.ts        ← 패턴 검증 first
lib/realtime/__tests__/event-emitter.test.ts
lib/realtime/__tests__/websocket-manager.test.ts
lib/realtime/__tests__/e2e-flow.test.ts
app/api/realtime/__tests__/sse-route.test.ts
```

---

## 3. G2 — verifyMember dead-delete 패턴

### 3.1 적용 단위

`describe('verifyMember', () => { ... })` block 통째 (group 단위). it 단위
삭제하면 빈 describe 잔존.

### 3.2 4 files 처리 매핑

| File                                                    | 추정 변경                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `lib/services/__tests__/member.service.test.ts:547-572` | `describe('verifyMember', ...)` block 1개 삭제 (~26 LOC)   |
| `lib/services/__tests__/member-service.test.ts`         | `verifyMember` 호출 it block (인라인 grep으로 확인) 삭제   |
| `app/api/members/[id]/__tests__/route.test.ts`          | route handler가 verifyMember 호출하는 케이스 삭제          |
| `lib/repositories/__tests__/member.repository.test.ts`  | (G3 ejection — 본 사이클 외, 별 사이클에서 dead 함께 처리) |

### 3.3 결정 — **G2는 3 files만** (member.repository는 G3 사이클로 위임)

`member.repository.test.ts`는 G3 ejection 대상 (실제 DB 의존). verifyMember 호출
부분도 G3 사이클에서 함께 처리하는 게 surgical.

### 3.4 검증

```bash
npx jest lib/services/__tests__/member app/api/members/ --silent 2>&1 | grep -c verifyMember  # → 0
```

---

## 4. G4 — GraphQL test-utils 패턴

### 4.1 의심 위치

`lib/graphql/test-utils` 의 다음 함수들:

```ts
createMockContext() // unauth context
createAuthContext() // authed context
createAdminContext() // admin context
createMockUser() // mock user
expectAuthError() // assertion helper
expectAuthzError() // assertion helper
```

### 4.2 점검 절차

1. **Step**: 현행 `lib/graphql/context.ts` 의 `GraphQLContext` 타입 정의 확인
2. **Step**: PR #3 commit `8bc78888` (C1 Clerk session 강제) diff 분석 → context
   shape 변경 식별
3. **Step**: test-utils가 변경된 shape 반영 못 한 필드 식별
4. **Step**: utils에 누락 필드 추가 (단일 지점 변경 → 4 test files 자동 회복)

### 4.3 결정 — **utils 단일 지점 변경 우선**

**Why**: 4 files 직접 수정은 변경 surface 큼. utils 1 파일 보강이 surgical
(Karpathy §3). utils 변경으로 회복 안 되는 잔여 case만 개별 test 수정.

### 4.4 적용 대상

```
lib/graphql/test-utils.ts           ← 단일 지점 변경
lib/graphql/__tests__/auth.test.ts  ← 검증
lib/graphql/resolvers/__tests__/mutation.resolver.test.ts
lib/graphql/resolvers/__tests__/query.resolver.test.ts
app/api/graphql/__tests__/route.test.ts
```

---

## 5. ADR 모음

### ADR-1: G1 패턴은 `doNotFake` 옵션 (Option A)

- **Context**: fake timer가 microtask/nextTick까지 잡아 `await ...shutdown()`
  resolve 실패
- **Decision**: `useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })`
  (1줄 변경)
- **Consequences**: 5 files 모두 동일 패턴, jest 29.7 보장됨
- **Alternative considered**: Option B (`advanceTimersByTimeAsync`) — 변경 폭
  커서 reject

### ADR-2: G2는 dead-delete (production 신설 안 함)

- **Context**: `verifyMember` production 미존재. 16건 test가 미존재 method 호출
- **Decision**: test 삭제 (production 변경은 별 보안 PDCA로 위임)
- **Consequences**: test count 16 감소, coverage 무영향 (이미 uncovered)
- **Alternative considered**: `verifyMember` production 신설 — Plan §4 위반 +
  보안 의도 불명, reject

### ADR-3: G3 ejection (별 사이클 `tests-db-fixture`)

- **Context**: `base/member.repository.test.ts`는 mock 아닌 실제 Postgres 의존.
  CI에 test DB 부재가 root cause
- **Decision**: 본 사이클 OOS, 별 사이클로 분리
- **Consequences**: 본 사이클 머지 후 Tests job 일부 RED 잔존 (G3 사이클
  머지까지)
- **Alternative considered**: pg-mem 도입을 본 사이클에 통합 — scope 확대로
  reject

### ADR-4: G4는 utils 단일 지점 변경

- **Context**: 4 test files 모두 `lib/graphql/test-utils` 헬퍼 사용
- **Decision**: utils 1 파일 보강 → 4 test files 자동 회복 시도
- **Consequences**: 변경 surface 최소. 잔여 case만 개별 수정
- **Alternative considered**: 4 files 직접 수정 — 변경 폭 4배, reject

---

## 6. 검증 plan (Karpathy §4)

| Phase | 적용 후 verify                                                                       |
| ----- | ------------------------------------------------------------------------------------ |
| A1    | `npx jest lib/realtime/__tests__/sse-manager --silent && echo A1_PASS`               |
| A2    | `grep -c "Exceeded timeout"` → 0 (5 files 전체)                                      |
| B1    | `grep -nE "describe\('verifyMember'" lib/services/__tests__/ app/api/members/` → 0건 |
| B2    | `grep -c verifyMember` → 0 (3 files)                                                 |
| D1    | utils diff 명세 commit message에 기록                                                |
| D2    | `npx jest lib/graphql/__tests__/auth --silent && echo D2_PASS`                       |
| D3    | `npx jest lib/graphql/ app/api/graphql/ --silent && echo G4_PASS`                    |
| E     | CI: G1+G2+G4 GREEN, G3 RED (ejection)                                                |

---

## 7. 위험 (design 단계 추가 발견)

| Risk                                                             | 추가 사항                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| G1 `doNotFake` 옵션이 production async race condition 마스킹     | Phase A 1단계 stack에서 production code 의심 발견 시 별 사이클 제기 |
| G2 dead-delete가 향후 verifyMember 신설 시 test scaffolding 손실 | analyze.md에 "verifyMember 신설 시 test 재작성 필요" 메모 기록      |
| G4 utils 단일 변경으로 4 files 회복 안 될 경우 추가 patch        | utils 변경 후 4 files 단독 PASS 미달 시 individual fix 추가         |

---

## 8. 참조

- Plan rev α: `docs/01-plan/features/tests-stale-update.plan.md`
- G3 ejection 사이클: `docs/01-plan/features/tests-db-fixture.plan.md`
- jest fake timers docs:
  https://jestjs.io/docs/jest-object#jestusefaketimersfaketimersconfig
