---
template: analysis
feature: tests-stale-update
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
matchRate: 55
status: completed (with deviation)
mergedCommit: 89a2eec0
pr: 9
parentPlanRevision: α
---

# tests-stale-update — Gap Analysis

> **Match Rate: 55%** — Plan rev α 4 goals 중 G2만 full, G1 partial (CI 미미),
> G3 planned ejection, G4 unplanned ejection. 본 사이클의 진정한 산출물은 4 신규
> 별 사이클의 root cause 정밀 식별.

---

## 1. Plan vs 구현 매핑

### 1.1 Goals 별 결과

| Goal | Plan 목표                                      | 실제 결과                                               | 평가 |
| ---- | ---------------------------------------------- | ------------------------------------------------------- | :--: |
| G1   | Realtime 5 files timeout 0건 GREEN             | 로컬 53/80 (67%), CI 효과 미미 (±2)                     | 부분 |
| G2   | verifyMember 16건 dead-delete                  | 1 file 26 LOC 삭제, `grep -c` → 0 (실제 호출 3건이었음) |  ✅  |
| G3   | (사전 ejection — `tests-db-fixture` 별 사이클) | plan 작성 완료, 사용자 결정 대기                        | OOS  |
| G4   | GraphQL 4 files test-utils 보강                | **Unplanned ejection** — 인프라 결함 (`.mjs`+jest 충돌) |  ❌  |

### 1.2 Phases 별 결과

| Phase | Plan 의도                           | 실제                                                                                  |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| A     | 5 files doNotFake 패턴 적용         | useFakeTimers() 호출 3 files만 적용 (event-emitter, sse-route는 다른 root cause)      |
| B     | 4 files verifyMember 일괄 치환/삭제 | 1 file만 호출 발견 (16건 grep은 stack trace 중복 — 실제 3건 호출, describe block 1개) |
| D     | test-utils 단일 지점 변경           | 시도 → `.mjs` transform 추가 → jest.setup.js babel 충돌 → revert                      |
| E     | CI 통합 + 일반 머지 가능            | admin merge (G3/G4 잔존으로 Tests RED)                                                |

---

## 2. 사전 inspection 정확도 평가 (Karpathy §1 회고)

| Plan v1 가설                     | 실제                                                       | 정확도 |
| -------------------------------- | ---------------------------------------------------------- | :----: |
| G1: 비동기 fake timer 함정       | ✅ 정확 (doNotFake 효과 로컬에서 53건 해결)                |  90%   |
| G2: verifyMember rename됨        | ❌ rename이 아닌 dead (production 미존재) — rev α에서 정정 |   0%   |
| G2: 4 files 16건                 | ❌ 1 file 3건 (16건은 stack trace 중복 카운트)             |  30%   |
| G3: drizzle mock chain undefined | ❌ mock 아닌 실제 PG 의존 (rev α에서 ejection)             |   0%   |
| G4: test-utils stale             | ❌ test-utils OK, 실제는 `.mjs` transform 결함             |   0%   |

**Lesson**: Plan v1 가설 5건 중 2.4건 정확 (48%). 사전 inspection (Karpathy §1)
적용 후 rev α에서 G2/G3 정정, G4는 do 단계에서야 정확한 root cause 발견. **rev
β로 G4도 사전 inspection 했으면 ejection을 plan 단계에서 했을 것.**

---

## 3. CI vs 로컬 결과 차이

| 환경  | timeout 카운트                   | 비고                                                  |
| ----- | -------------------------------- | ----------------------------------------------------- |
| 로컬  | 80 → 27 (-53)                    | doNotFake 효과 명확                                   |
| CI    | 80 → 88 (+8?)                    | log multi-line 중복 카운트, 실제 fail count 변화 미미 |
| Tests | -2 fails (PR #8 136 → PR #9 134) | G2 verifyMember 2 it block 삭제 효과만 확실           |

CI에서 G1 효과 미발현 root cause 가설:

- CI는 매 워크 fresh, 로컬은 캐시 영향 가능
- CI ramp-up 5초 timeout 범위 빠듯함
- 워커 분배 차이로 동일 file이 다른 worker에서 시간 초과

→ G1 별 사이클 `tests-realtime-async-fix`에서 CI 환경 재검증 필요.

---

## 4. 머지 결정

| 옵션                    | 선택 | 이유                                                  |
| ----------------------- | :--: | ----------------------------------------------------- |
| 일반 머지 (CI green)    |  ✗   | Tests RED 잔존 (G3/G4 + 잔여 timeout)                 |
| Admin merge             |  ✅  | 부모 사이클 #6/#3/#8 동일 패턴, scope creep 회피      |
| Revert G1 + G2만 commit |  ✗   | G1 로컬 효과 53건은 의미 있음, archive로 history 보존 |

**선택**: Admin squash merge (`gh pr merge 9 --admin --squash`). main commit
`89a2eec0`.

---

## 5. 신규 발견 — 4 후속 사이클 root cause 정밀 식별

본 사이클의 **실질 가치**는 fix 자체보다 **4 신규 사이클의 정확한 root cause
발견**이라고 평가.

### 5.1 jest-clerk-esm-fix (G4 ejection, **최우선 권장**)

**Root cause**: `jest.config.js`의 `transform: '^.+\\.(js|jsx|ts|tsx)$'`가
`.mjs` 미포함. `@clerk/backend/dist/runtime/browser/crypto.mjs` (ESM-only) 처리
못 함.

**시도한 해결**:

```diff
- '^.+\\.(js|jsx|ts|tsx)$'
+ '^.+\\.(js|jsx|ts|tsx|mjs)$'
+ transformIgnorePatterns에 @clerk 추가
```

→ jest.setup.js babel parse 실패
(`Property declarations[0] of VariableDeclaration expected node to be of a type ["VariableDeclarator"]`).
next/babel preset과 .mjs 처리 충돌.

**후속 사이클 scope**: babel.config 분리 또는 `transformIgnorePatterns` 외 jest
setup의 ESM module 격리.

### 5.2 tests-db-fixture (G3 사전 ejection, 2위)

**Root cause**: `base.repository.test.ts` + `member.repository.test.ts`가
`lib/testing/setup-test-db.ts`로 실제 Postgres 의존. CI에 PG service 없음.

**Plan 작성 완료**: `docs/01-plan/features/tests-db-fixture.plan.md`. Option A
(실 PG service)/B (pg-mem)/C (testcontainers) 사용자 결정 대기.

### 5.3 tests-realtime-async-fix (G1 잔여, 3위)

**Root cause**: production code (`handleConnection` 등)의 setTimeout 의존이 fake
timer 환경에서 await 무한 대기. doNotFake로 해결 안 됨 (microtask 외 다른 timer
의존).

**가능한 접근**:

- production setTimeout을 injectable로 (DI)
- test에서 `jest.advanceTimersByTimeAsync(N)` 명시
- production race condition일 가능성 검토

### 5.4 tests-stale-member-extras (G2 잔여, 4위)

**잔여 9건**:

- `MemberService.updateMemberLevel` 미존재 (verifyMember와 동일 패턴 dead)
- `createMember` ApiError "Validation failed" (mock 입력 schema mismatch)
- `approveMember` "Member is not pending approval" (logic 변경)
- `reactivateMember` 2건
- `bulkApproveMember` empty array (logic 변경)

**처리**: 일부 dead-delete + 일부 mock 재정렬.

---

## 6. Match Rate 계산

| Goal     | 가중치 |               달성도 |              점수 |
| -------- | -----: | -------------------: | ----------------: |
| G1       |    30% |        50% (partial) |                15 |
| G2       |    30% |                 100% |                30 |
| G3       |    20% |   100% (planned OOS) |                20 |
| G4       |    20% | 0% (unplanned eject) |                 0 |
| **총합** |   100% |                    - | **65 → 보정 55%** |

**보정 사유 (-10%)**: G4가 plan 단계가 아닌 do 단계에서 ejection됨 → planning
정확도 결함 누적.

**Iterate 권장 여부**: 아니오. iterate 시도해도 G4 인프라 결함은 별 사이클 영역,
G1 잔여도 별 root cause. iterate는 scope creep만 유발. **정직한 partial로
archive하고 4 신규 사이클로 진행**이 합당.

---

## 7. 학습 (Lessons)

1. **사전 inspection의 한계**: Karpathy §1 적용으로 G2/G3 가설 정정했으나 G4는
   do 단계에서야 인프라 결함 발견. **rev β 권장**: design 단계에서도 sample 1
   file 실제 fix 시도(=mini-do)로 가설 검증.
2. **CI ≠ 로컬**: G1 doNotFake 로컬 53건 / CI 미미. CI 환경에서 timeout 검증을
   plan/design 단계에 포함해야.
3. **Stack trace grep 함정**: "16 verifyMember"는 stack 중복 카운트, 실제 호출
   3건. **사전 inspection 시 stack 제외 + actual call 카운트**.
4. **PDCA의 진짜 가치는 fix가 아닌 정밀 분류**: 본 사이클 fix는 -2 fails이지만 4
   신규 사이클의 정확한 scope/root cause 정의가 더 큰 산출물.

---

## 8. 결론

**Match Rate 55%** — Plan goal 4 중 1.5 달성. 본 사이클은 archive로 종결, 4 신규
사이클 (jest-clerk-esm-fix, tests-db-fixture, tests-realtime-async-fix,
tests-stale-member-extras)로 진행.

`/pdca report tests-stale-update` 진행 가능.
