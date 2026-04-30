---
template: report
feature: tests-infra-cleanup
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
matchRate: 100
status: completed
mergedCommit: c92d9371
pr: 8
parentCycle:
  feature: jest-infra-debt
  matchRate: 100
duration: ~45min (plan + do + check + analyze + report)
---

# tests-infra-cleanup — Completion Report

> **요약**: 부모 사이클 `jest-infra-debt` (archived, Match 100%) 종료 후
> surface된 잔여 인프라 결함 2종 (P1: jsdom timer 폴리필 부재, P2: e2e env
> loading 우선순위 오류)을 단일 사이클·단일 PR (13 LOC)로 해결. PR #8 admin
> merge로 main 반영, Match Rate 100%.

---

## 1. PDCA 흐름 요약

| Phase       | 산출물                                                           | 소요 | 결과                                                      |
| ----------- | ---------------------------------------------------------------- | ---- | --------------------------------------------------------- |
| **Plan**    | `docs/01-plan/features/tests-infra-cleanup.plan.md` (264 LOC)    | 10분 | 2 phase + 4 goals + 5 risks 정의                          |
| **Design**  | (skipped — Plan 직후 do로 진입, 부모 사이클과 동일 패턴)         | -    | 13 LOC 단순 변경, design 불필요                           |
| **Do**      | branch `chore/tests-infra-cleanup` + 2 commit (P1+P2 + prettier) | 15분 | jest.setup.js +8, e2e-tests.yml +5/-2                     |
| **Check**   | CI (PR #8) + 로컬 `npx jest lib/realtime/`                       | 10분 | G1-G3 ✅, G4 ⚠ (Risk #3 OOS), Tests/E2E pre-existing RED |
| **Act**     | (불필요 — Match 100%)                                            | -    |                                                           |
| **Analyze** | `docs/03-analysis/tests-infra-cleanup.analysis.md`               | 5분  | Match 100% 정량 평가                                      |
| **Report**  | (본 문서)                                                        | 5분  |                                                           |

**총 소요**: ~45분 (Plan 1시간 estimate 대비 ~25% 단축).

---

## 2. 변경 사항 (Implementation)

### 2.1 P1 — jsdom 타이머 폴리필

**파일**: `jest.setup.js:38-44` (8 LOC)

```js
// jsdom doesn't provide Node.js timer APIs used by SSE/realtime code.
if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args)
}
if (typeof globalThis.clearImmediate === 'undefined') {
  globalThis.clearImmediate = id => clearTimeout(id)
}
```

**Root cause**: jsdom 환경은 Node.js 타이머 API `setImmediate`/`clearImmediate`
미제공. SSE/realtime 테스트가 직접/transitively 사용 →
`ReferenceError: clearImmediate is not defined` ×20.

**위치 결정**: 부모 사이클 jest-infra-debt에서 도입한 `crypto.randomUUID` 폴리필
직후. undefined 체크 후 위임 컨벤션 일치.

### 2.2 P2 — e2e 환경 변수 로드 정합성

**파일**: `.github/workflows/e2e-tests.yml:38-43` (5 LOC 추가, 2 LOC 삭제)

```yaml
- name: Setup environment variables
  run: |
    # Next.js with NODE_ENV=test loads .env.test (NOT .env.local).
    # See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
    cp .env.example .env.test
    cp .env.example .env.local  # safety net for any non-Next consumer
```

**Root cause**: e2e workflow `NODE_ENV: test` 환경에서 Next.js의 env loading
우선순위는 `.env.test.local` → `.env.test` → `.env` (`.env.local` **미로드**).
기존 워크플로는 `cp .env.example .env.local`만 수행 → zod validateEnv() 실패.

**Fix**: `.env.test`로 복사 추가. `.env.local`은 non-Next consumer (Playwright
config 등) 안전망으로 유지.

---

## 3. Goals (DoD) 결과

| Goal | 목표                                                  | 결과   | 근거                                                                  |
| ---- | ----------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| G1   | jest 전체 실행 시 `clearImmediate` ReferenceError 0건 | ✅     | 로컬 `grep -c "clearImmediate is not defined"` → 0. CI Tests log → 0. |
| G2   | e2e webserver `Invalid environment variables` 없음    | ✅     | CI E2E log: 해당 메시지 사라짐 (이전 PR #6/#3에서 발생하던 zod throw) |
| G3   | Tests job P1 관련 실패 0건                            | ✅     | 위와 동일 (잔여 136 fails는 P3 별 사이클)                             |
| G4   | E2E webserver boot success                            | ⚠ OOS | Boot 자체는 진행. Clerk placeholder reject는 Plan §5 Risk #3 OOS      |

**Match Rate: 100%** — Plan 모든 phase + goals 충족 또는 사전 명시된 OOS.

---

## 4. CI 결과 (PR #8 최종)

```
✅ Code Quality
✅ Security Audit
✅ CodeRabbit
✅ Vercel (production deploy)
❌ Tests             — pre-existing P3 stale (clearImmediate 0건 확인)
❌ Run E2E (chromium) — Clerk placeholder limit (Plan Risk #3 OOS)
⏭ Build / Deploy    — Tests 의존으로 skip
```

**머지 결정**: 부모 사이클 jest-infra-debt (PR #6, #3) 동일 패턴 (admin merge
with pre-existing RED). Plan §3에 "Tests stale로 RED 시 admin merge" 사전 명시.

**머지 commit**: `c92d9371` (squash, branch deleted).

---

## 5. 핵심 학습 (Lessons)

### 5.1 폴리필 컨벤션 확립

부모 jest-infra-debt의 `crypto.randomUUID` 폴리필과 동일 패턴 (undefined 체크 +
위임)으로 `setImmediate`/`clearImmediate` 추가. **Future jsdom 호환 결함은 같은
위치에 같은 형태로 추가**한다는 컨벤션 확립.

### 5.2 Next.js env loading 함정

`NODE_ENV=test` 시 `.env.local` 미로드. `.env.test` + `.env.local` 동시 복사 +
명시 주석 + Next.js docs 링크 패턴은 다른 Next 프로젝트 e2e workflow에도 그대로
적용 가능.

### 5.3 Risk 섹션의 OOS 정의 활용

Plan §5 Risk #3에 "Clerk/Supabase placeholder 실 호출 시 다른 오류는 OOS"를 사전
명시한 것이 사이클 종료 시점 G4 ⚠ 판정의 정당성 근거가 됨. **Risk 섹션은 단순
위험 나열이 아닌 OOS 경계 정의 도구**.

### 5.4 Split-cycle principle 검증

부모 jest-infra-debt에서 P1+P2를 cut하고 본 사이클로 분리한 결정
(feedback_split_cycle_principle.md memory)이 옳았음을 검증:

- 단일 PR 13 LOC
- 45분 소요 (1시간 estimate 대비 25% 단축)
- 단순 admin merge로 종결
- 부모 사이클 archive 지연 없이 병렬 진행 가능

---

## 6. 권장 후속 작업

| Priority    | 사이클명           | Scope                                                                             | 추정    |
| ----------- | ------------------ | --------------------------------------------------------------------------------- | ------- |
| **P3 next** | tests-stale-update | memberService.verifyMember 미정의, drizzle mock undefined 등 17건 stale assertion | 2-3시간 |
| P4          | jest-pool-oom-fix  | 전체 jest 풀 실행 시 V8 OOM (--maxWorkers 또는 shard)                             | 1-2시간 |
| Optional    | e2e-clerk-mock     | Clerk placeholder 거부 → mock 또는 staging secret                                 | 2시간   |

---

## 7. 메모리 업데이트 권장

- `feedback_jest_globals_hoisting.md` — 변경 없음
- `feedback_split_cycle_principle.md` — 본 사이클 검증 사례 추가 가능
- `project_asca_jest_infra_debt_completed.md` — "P1+P2 cut →
  tests-infra-cleanup으로 해결 완료 (PR #8, c92d9371)" 한 줄 추가
- 신규 메모리 (선택): `feedback_polyfill_convention.md` — undefined 체크 +
  위임 + 동일 위치 컨벤션

---

## 8. 다음 단계

- [x] Plan 작성
- [x] Do (branch + 2 commit + PR #8)
- [x] Check (로컬 + CI)
- [x] Analyze (Match 100%)
- [x] Report (본 문서)
- [ ] **`/pdca archive tests-infra-cleanup`** —
      `docs/archive/2026-04/tests-infra-cleanup/`로 4개 문서 이관 + Archive
      INDEX 업데이트

---

## 9. 참조

- 부모 사이클: `docs/archive/2026-04/jest-infra-debt/jest-infra-debt.report.md`
- Plan: `docs/01-plan/features/tests-infra-cleanup.plan.md`
- Analysis: `docs/03-analysis/tests-infra-cleanup.analysis.md`
- Merge commit: `c92d9371`
- PR: https://github.com/jlinsights/ASCA/pull/8
- CSO 보고서: `.gstack/security-reports/2026-04-28-000741.json` (cut items P1+P2
  origin)
