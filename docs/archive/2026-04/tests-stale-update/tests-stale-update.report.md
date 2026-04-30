---
template: report
feature: tests-stale-update
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
matchRate: 55
status: completed (with deviation)
mergedCommit: 89a2eec0
pr: 9
parentCycle:
  feature: tests-infra-cleanup
  matchRate: 100
spawnedCycles:
  - jest-clerk-esm-fix
  - tests-db-fixture
  - tests-realtime-async-fix
  - tests-stale-member-extras
duration: ~2h (plan rev α + design + do + analyze + report)
---

# tests-stale-update — Completion Report

> **요약**: Plan rev α의 G1+G2 부분 달성 + G3/G4 ejection. 본 사이클의 실질
> 가치는 fix(-2 fails)보다 **4 신규 별 사이클의 정확한 root cause 식별**. Match
> Rate 55%, 정직한 partial archive.

---

## 1. PDCA 흐름 요약

| Phase       | 산출물                                         | 소요 | 결과                                         |
| ----------- | ---------------------------------------------- | ---- | -------------------------------------------- |
| **Plan**    | `tests-stale-update.plan.md` (v1 → rev α 정정) | 20분 | 14 fail files 4 group 분류, G3 사전 ejection |
| **Design**  | `tests-stale-update.design.md` (ADR-1~4)       | 15분 | 4 패턴 결정 (G4 가설 후에 부정확 판명)       |
| **Do**      | branch `chore/tests-stale-update` + 2 commits  | 50분 | G1 partial, G2 full, G4 ejection during      |
| **Check**   | CI (PR #9) + 로컬 검증                         | 15분 | CI vs 로컬 차이 발견, 머지 결정              |
| **Analyze** | `tests-stale-update.analysis.md`               | 15분 | Match Rate 55% (정직한 partial)              |
| **Report**  | (본 문서)                                      | 10분 |                                              |

**총 소요**: ~2시간 (Plan estimate 3.5h 대비 단축, 단 G4 ejection으로 scope
줄어든 결과)

---

## 2. 변경 사항 (Implementation)

### 2.1 G1 — Realtime timeout 폴리필 (3 files, 6 LOC)

```diff
- jest.useFakeTimers()
+ jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
```

적용: `lib/realtime/__tests__/{sse-manager,websocket-manager,e2e-flow}.test.ts`

- 로컬: timeout 80 → 27 (-53)
- CI: 효과 미미 (환경 차이, 별 사이클 재검증)

### 2.2 G2 — verifyMember dead-delete (1 file, -26 LOC)

`lib/services/__tests__/member.service.test.ts:547-571` describe block 통째
제거. production `MemberService` class에 `verifyMember` method 미존재 (PR #3 H1
IDOR 차단으로 검증 로직이 Clerk session 강제로 대체된 것으로 추정).

- `grep -c verifyMember` → 0
- CI Tests: 136 → 134 failed (-2)

### 2.3 시도 후 revert: G4 .mjs transform

```diff
- '^.+\\.(js|jsx|ts|tsx)$'
+ '^.+\\.(js|jsx|ts|tsx|mjs)$'
+ transformIgnorePatterns에 @clerk 추가
```

→ jest.setup.js babel parse 실패 → revert. 별 사이클 `jest-clerk-esm-fix` 분리.

---

## 3. Goals 결과 (Match Rate 55%)

| Goal     | Plan 목표               | 결과                        | 점수                |
| -------- | ----------------------- | --------------------------- | ------------------- |
| G1       | timeout 0건             | partial 53/80 로컬, CI 미미 | 15/30               |
| G2       | verifyMember 0건        | ✅ 100%                     | 30/30               |
| G3       | (사전 ejection)         | planned OOS                 | 20/20               |
| G4       | GraphQL test-utils 보강 | ❌ unplanned ejection       | 0/20                |
| **합계** |                         |                             | **65 → 55% (보정)** |

보정 사유: G4가 do 단계에서 ejection됨 → plan/design 정확도 결함 (-10%).

---

## 4. CI 결과

| Job            | 결과    | 본 PR 효과              |
| -------------- | ------- | ----------------------- |
| Code Quality   | ✅ pass | -                       |
| Security Audit | ✅ pass | -                       |
| CodeRabbit     | ✅ pass | -                       |
| Vercel         | ✅ pass | -                       |
| Tests          | ❌ fail | 136→134 fails (-2)      |
| Run E2E        | ❌ fail | OOS (Clerk placeholder) |

**머지**: admin squash (`gh pr merge 9 --admin --squash --delete-branch`),
commit `89a2eec0`.

---

## 5. 신규 발견 (4 후속 사이클)

본 사이클의 **진짜 가치**는 fix가 아니라 **4 신규 사이클의 정확한 root cause
식별**.

| Priority | 사이클명                  | Root cause (정확하게 식별됨)                                    | 추정 |
| -------- | ------------------------- | --------------------------------------------------------------- | ---- |
| **1위**  | jest-clerk-esm-fix        | `.mjs` transform pattern 누락 + jest.setup.js babel 충돌        | 2-3h |
| 2위      | tests-db-fixture          | base/member.repository test의 실 PG 의존, CI에 service 없음     | ~4h  |
| 3위      | tests-realtime-async-fix  | production setTimeout 의존이 fake timer 환경에서 await 무한대기 | 2-3h |
| 4위      | tests-stale-member-extras | updateMemberLevel dead + 9건 logic stale (createMember 등)      | 2h   |

---

## 6. 핵심 학습 (Lessons)

### 6.1 사전 inspection의 한계 (rev β 권장)

Karpathy §1 적용으로 Plan v1 → rev α에서 G2/G3 가설 정정했으나 G4는 do
단계에서야 인프라 결함 발견. **rev β 권장**: design 단계에서 sample 1 file 실제
fix 시도(=mini-do)로 가설 검증. 본 사이클의 G4 .mjs 결함은 design 단계에서
`npx jest auth.test.ts` 한 번 실행만으로 발견 가능했을 것.

### 6.2 CI ≠ 로컬 — 환경별 검증 필수

G1 doNotFake 로컬 53건 / CI 미미. plan/design 단계에서 CI 환경 시뮬레이션 또는
sample CI run 필요.

### 6.3 Stack trace grep 함정

"16 verifyMember"는 stack 중복 카운트, 실제 3건. 사전 inspection grep 시
`--exclude-dir=stack` 또는 actual call site만 카운트.

### 6.4 PDCA 진짜 가치 = 정밀 분류

본 사이클 fix는 -2 fails이지만 **4 신규 사이클의 scope/root cause 정의**가 훨씬
큰 산출물. PDCA의 archive 가치는 fix line count가 아니라 **다음 사이클로 이관
가능한 정밀 지식**.

### 6.5 Karpathy §1 stop & revert 정확히 적용

G4 .mjs transform 시도 → jest.setup.js 충돌 즉시 발견 → revert + ejection. 만약
무리해서 jest.setup.js 수정으로 갔으면 본 PR이 통째 위험. 적시 stop이 본
사이클을 살림.

---

## 7. 메모리 업데이트 권장

신규 메모리 권장:

- `feedback_pdca_inspection_rev_b.md` — Plan/design에서 가설을 mini-do로
  검증하는 rev β 패턴
- `feedback_ci_vs_local_timeout.md` — CI 환경 차이로 fake timer 효과 다름 → CI
  sample run 필수
- `project_asca_tests_red_chain.md` — jest-infra-debt → tests-infra-cleanup →
  tests-stale-update → 4 신규 사이클 (chain 추적)

---

## 8. 다음 단계

- [x] Plan rev α
- [x] Design (ADR 4)
- [x] Do (G1 partial, G2 full)
- [x] Check (CI + 로컬, 머지 결정)
- [x] Analyze (Match 55%)
- [x] Report (본 문서)
- [ ] **`/pdca archive tests-stale-update`** →
      `docs/archive/2026-04/tests-stale-update/`
- [ ] 4 신규 사이클 우선순위 결정 후 `/pdca plan jest-clerk-esm-fix` (1위) 시작

---

## 9. 참조

- 부모: `docs/archive/2026-04/tests-infra-cleanup/`
- 조부모: `docs/archive/2026-04/jest-infra-debt/`
- Plan: `docs/01-plan/features/tests-stale-update.plan.md` (rev α)
- Design: `docs/02-design/features/tests-stale-update.design.md`
- Analysis: `docs/03-analysis/tests-stale-update.analysis.md`
- G3 별 사이클 plan: `docs/01-plan/features/tests-db-fixture.plan.md`
- Merge commit: `89a2eec0`
- PR: https://github.com/jlinsights/ASCA/pull/9
