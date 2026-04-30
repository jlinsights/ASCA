---
template: plan
feature: tests-stale-update
date: 2026-04-30
revisedDate: 2026-04-30
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: tests-infra-cleanup
  date: 2026-04-30
  matchRate: 100
  status: archived
relatedCycle:
  feature: tests-db-fixture
  status: draft (G3 ejection)
revision: Option α (G3 ejection + verifyMember dead-delete)
---

# tests-stale-update — Plan (rev α)

> **목적**: 부모 사이클 `tests-infra-cleanup` 종료 후 잔여한 Tests job stale
> test logic을 3개 root cause 그룹으로 좁혀 GREEN 회복. G1-G4를 Karpathy §4
> (test fail → pass) 형태로 정의.
>
> **Why now**: ASCA CI Tests job RED 잔존. PR #3 보안 변경(C1, C2, H1-H4) 반영
> 못 한 stale test가 직접 원인. G1+G2+G4를 본 사이클로, G3(test database
> fixture)은 별 사이클(`tests-db-fixture`)로 분리하여 인프라 변경과 logic stale
> fix를 격리.
>
> **Revision rationale (rev α)**: 사전 inspection 결과 Plan v1의 두 가설이
> 부정확: (1) verifyMember는 production에 **존재하지 않음** — rename이 아닌 dead
> → 삭제. (2) `base.repository.test.ts`는 mock 아닌 **실제 test database**를
> 사용 — root cause는 mock chain이 아닌 CI test DB 부재 → 별 사이클
> `tests-db-fixture`로 ejection.

---

## 1. 배경 (Context)

### 1.1 현재 상태 (2026-04-30 기준)

- **main HEAD**: `7605f527` (tests-infra-cleanup archive)
- **Tests job 결과 (PR #8)**: `136 failed / 228 passed / 364 total` 14 fail 파일

### 1.2 Root cause 그룹 (사전 inspection 반영)

| Group | Pattern                  | Count | 파일                                                                                                                                                                                 | 처리                                       |
| ----- | ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **A** | `Exceeded timeout`       | 80    | `lib/realtime/__tests__/{e2e-flow,event-emitter,sse-manager,websocket-manager}.test.ts` + `app/api/realtime/__tests__/sse-route.test.ts` (5 files)                                   | **본 사이클 G1**                           |
| **B** | `verifyMember` (dead)    | 16    | `lib/services/__tests__/{member.service,member-service}.test.ts` + `app/api/members/[id]/__tests__/route.test.ts` + `lib/repositories/__tests__/member.repository.test.ts` (4 files) | **본 사이클 G2** (dead-delete)             |
| **C** | test DB 부재 (Postgres)  | 12+4  | `lib/repositories/__tests__/{base,member}.repository.test.ts` (2 files)                                                                                                              | **별 사이클 `tests-db-fixture` (ejected)** |
| **D** | GraphQL test-utils stale | ~28   | `lib/graphql/__tests__/auth.test.ts` + `resolvers/__tests__/{mutation,query}.resolver.test.ts` + `app/api/graphql/__tests__/route.test.ts` (4 files)                                 | **본 사이클 G4**                           |

### 1.3 사전 inspection 발견 (Karpathy §1 적용)

#### G2 finding — verifyMember는 dead

```bash
$ grep -rE "verifyMember" lib/services/ app/api/members/ | grep -v test
(empty)
```

`MemberService` class에 `verifyMember` method 없음. test 16건이 미존재 method
호출. 처리 결정: **dead test 삭제**. 이유:

- PR #3 H1 (members/[id] IDOR 차단) 보안 강화 후 회원 검증 로직이 다른
  경로(Clerk session 강제)로 대체된 것으로 추정.
- production code 변경 금지 원칙 (Plan §4) 준수.
- 만약 verifyMember가 의도된 기능이라면 별 보안 PDCA로 신설 (본 사이클은
  test-only 인프라).

#### G3 finding — Plan v1 가설 완전 부정확 → ejection

`base.repository.test.ts`는 `testDatabaseHelpers`, `getTestPool` from
`lib/testing/setup-test-db.ts`를 사용한 **실제 Postgres** 의존 통합 테스트.
따라서 root cause는:

- mock chain undefined (Plan v1 가설) — **부정확**
- 실제 root cause: CI에 Postgres test container 부재 → connection 실패 →
  TypeError

→ test 코드가 아닌 **인프라 변경** (CI postgres service 또는 pg-mem 도입). 본
사이클 scope 외 → 별 사이클 `tests-db-fixture` 분리.

#### G1 finding — fake timer + async 함정

`sse-manager.test.ts`는 이미 `jest.useFakeTimers()` + `@jest-environment node`
적용. timeout 원인은 mock 부재가 아니라 fake timer 환경에서
`await manager.shutdown()` 등 비동기가 resolve 안 되는 패턴. 해결:
`doNotFake: ['queueMicrotask', 'nextTick']` 또는
`await jest.advanceTimersByTimeAsync(...)` 패턴.

#### G4 finding — test-utils 의심

`lib/graphql/__tests__/auth.test.ts`는 `lib/graphql/test-utils` 의
`createMockContext`/`createAuthContext`/`createMockUser` 등 헬퍼 사용. PR #3 C1
(Clerk session 강제) 후 GraphQLContext shape이 변경되었을 가능성. test-utils
점검이 핵심.

---

## 2. 목표 (Goals — Karpathy §4 형태)

### 2.1 Primary Goals (DoD)

| Goal | Test Set                           | 현재 상태                | Target              | Verify Check                                                                                                                              |
| ---- | ---------------------------------- | ------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| G1   | Realtime 5 files (timeout 80건)    | RED (`Exceeded timeout`) | GREEN               | `npx jest lib/realtime/ app/api/realtime/ --silent 2>&1 \| grep -c "Exceeded timeout"` → **0**                                            |
| G2   | Member 4 files (verifyMember 16건) | RED (`TypeError`)        | GREEN (dead-delete) | `npx jest lib/services/__tests__/member lib/repositories/__tests__/member app/api/members/ --silent 2>&1 \| grep -c verifyMember` → **0** |
| G4   | GraphQL 4 files                    | RED                      | GREEN               | `npx jest lib/graphql/ app/api/graphql/ --silent && echo G4_PASS`                                                                         |

### 2.2 종합 Verify (모든 G 충족 + G3 ejection 인지)

```bash
# 본 사이클 종료 시
npm run test:ci 2>&1 | tail -5  # → G1+G2+G4 GREEN, G3 잔여 (별 사이클)
```

### 2.3 Out of Scope (Option α 결정)

- **G3 — `tests-db-fixture` 별 사이클**: `base.repository.test.ts` +
  `member.repository.test.ts`의 Postgres 의존 (test DB 인프라 결정 동반)
- E2E test 본체 (Playwright suite) — `e2e-clerk-mock` 별 사이클
- Node V8 OOM (`jest-pool-oom-fix` 별 사이클)
- 신규 test 추가
- production code 변경 (PR #3 보안 fix 신성불가침, verifyMember 신설도 별 보안
  PDCA)
- jsdom → node 전체 마이그레이션

---

## 3. 단계별 작업 (Phases)

### Phase A — G1: Realtime timeout (5 files)

1. **Step**: `sse-manager.test.ts` 단일 파일에서 timeout 1건 stack 분석 → fake
   timer + async resolve 함정 확인 → **verify**: stack의 source line 명시
2. **Step**: 패턴 적용
   (`jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })` 또는
   `await jest.advanceTimersByTimeAsync(...)`) → **verify**:
   `npx jest lib/realtime/__tests__/sse-manager` PASS
3. **Step**: 나머지 4 files에 동일 패턴 적용 → **verify**:
   `grep -c "Exceeded timeout"` → 0

### Phase B — G2: verifyMember dead-delete (4 files)

1. **Step**: 4 files에서 `verifyMember` 호출 위치 확인
   (`grep -nE "verifyMember"`) → **verify**: 16건 위치 list
2. **Step**: 해당 `describe('verifyMember', ...)` 또는 `it(...)` block 통째 제거
   (Karpathy §3 surgical — verify 외 line 미변경) → **verify**:
   `grep -c verifyMember` → 0
3. **Step**: 4 files 단독 PASS → **verify**:
   `npx jest lib/services/__tests__/member lib/repositories/__tests__/member app/api/members/ --silent`

### Phase D — G4: GraphQL test-utils 점검

1. **Step**: `lib/graphql/test-utils` 의
   `createMockContext`/`createAuthContext`/`createMockUser` 현 정의 확인 → 현행
   `GraphQLContext` shape과 diff → **verify**: 누락 필드 list
2. **Step**: PR #3 C1 (8bc78888), H3 (dc7b03b1) 변경 commit으로 GraphQLContext
   진화 확인 → test-utils에 누락 mock 보강 → **verify**:
   `npx jest lib/graphql/__tests__/auth` PASS
3. **Step**: 나머지 3 files PASS → **verify**: G4 verify check PASS

### Phase E — CI 통합 검증

- [ ] 별 브랜치 `chore/tests-stale-update`
- [ ] G1, G2, G4 phase별 commit (revertability)
- [ ] PR 생성
- [ ] CI 결과: Tests job 잔여 G3(~16건)만 RED, G1+G2+G4는 GREEN
- [ ] 머지 옵션: 일반 머지(잔여 G3 admin) or admin merge (G3 사이클 전까지 RED
      유지)

---

## 4. 비기능 요구사항 (Non-Functional)

- **Reversibility**: G1, G2, G4를 별 commit으로 분리 (group별 revert 가능)
- **Backward compat**: production code 변경 금지 (test, test-utils만 변경)
- **Coverage**: G2에서 16건 test 삭제로 약간 감소. dead test이므로 실제 coverage
  영향 없음 (uncovered 이미)
- **CI 시간**: G1 timeout 해결로 약간 단축 (현재 80건 × 5초 = 400초 낭비 제거)

---

## 5. 위험 (Risks)

| Risk                                                                       | Likelihood | Impact | Mitigation                                                               |
| -------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------ |
| G1 fake timer pattern이 다른 timer 의존 테스트 부수 효과                   | Low        | Medium | Phase A 1단계 single file로 검증 후 확장                                 |
| G2 dead test 삭제가 실제 의도된 회원 검증 기능 누락 신호일 가능성          | Medium     | Medium | 별 보안 PDCA로 verifyMember 신설 권장 메모 (analyze.md에 기록)           |
| G4 test-utils 변경이 다른 GraphQL test 영향                                | Low        | Low    | utils는 test scope이라 production 무영향. test 회귀는 npm test로 검증    |
| G3 ejection으로 본 사이클 머지 시 Tests job RED 유지                       | High       | Low    | admin merge 또는 G3 사이클 머지까지 대기. Plan §3 Phase E에 옵션 명시    |
| 80 timeout 중 일부가 test logic 결함이 아닌 production race condition 노출 | Low        | High   | Phase A 1단계 stack 분석 시 production code 의심 발견하면 별 사이클 제기 |

---

## 6. 검증 (Verification)

### 6.1 로컬 검증 명령

```bash
# G1
npx jest lib/realtime/ app/api/realtime/ --silent 2>&1 | grep -c "Exceeded timeout"  # → 0

# G2
npx jest lib/services/__tests__/member lib/repositories/__tests__/member app/api/members/ --silent 2>&1 | grep -c verifyMember  # → 0

# G4
npx jest lib/graphql/ app/api/graphql/ --silent && echo G4_PASS

# 종합 (G3 ejected, 잔여 RED OK)
npm run test:ci 2>&1 | tail -5
```

### 6.2 CI 검증

- 브랜치 push 후 GitHub Actions:
  - `Tests` job — G1+G2+G4 GREEN, G3(~16건)만 잔여 RED (별 사이클 종료까지 OK)
  - `Build` job — Tests RED 시 skip, G3 사이클 머지 후 GREEN

### 6.3 Match Rate 측정 (Check phase)

- gap-detector 또는 직접 평가
- 목표: ≥90%

---

## 7. 일정 (Estimate — Option α)

| Phase                          | 예상 시간 | 누적      |
| ------------------------------ | --------- | --------- |
| Phase A (G1 timeout 5 files)   | 1.5h      | 1:30      |
| Phase B (G2 verifyMember 삭제) | 0.5h      | 2:00      |
| Phase D (G4 GraphQL utils)     | 1.0h      | 3:00      |
| Phase E (PR + CI)              | 0.5h      | 3:30      |
| Buffer                         | 0.5h      | 4:00      |
| **총합**                       |           | **~3.5h** |

(rev α 적용으로 v1의 5h → 3.5h 단축)

---

## 8. 다음 단계

1. `/pdca design tests-stale-update` (rev α 기반, 패턴 결정)
2. `/pdca do tests-stale-update`
3. PR 생성 → 머지 (G3 사이클과 조정)
4. Archive
5. **별 사이클**: `/pdca plan tests-db-fixture` (G3, Postgres test container
   또는 pg-mem 결정)

---

## 9. 참조

- 부모 사이클:
  `docs/archive/2026-04/tests-infra-cleanup/tests-infra-cleanup.report.md`
- G3 별 사이클 plan: `docs/01-plan/features/tests-db-fixture.plan.md`
- 보안 PR commits: 8bc78888 (C1), 359160c5 (C2), 1286ed82 (H1), dc7b03b1 (H3)
- Karpathy §1 적용: 사전 inspection으로 Plan v1 가설 2건 정정
