---
template: plan
feature: tests-infra-cleanup
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: jest-infra-debt
  date: 2026-04-29
  matchRate: 100
  status: archived
---

# tests-infra-cleanup — Plan

> **목적**: jest-infra-debt PDCA 종료 후 surface된 잔여 인프라 결함 2종(P1 jsdom
> polyfill, P2 E2E env validation)을 단일 사이클로 해결하여 ASCA CI를 GREEN으로
> 만든다.
>
> **Why now**: 보안 PDCA (PR #3) admin merge로 production 보호는 완료. 이제 CI
> 신뢰도 회복이 다음 큰 레버리지. 두 fix 모두 1줄 ~ 한 줄 단위로 작아 단일 PR이
> 적합 (Codecov SHA pin과 동일 패턴). CSO 2026-04-28 cut item P1+P2 통합.

---

## 1. 배경 (Context)

### 1.1 현재 상태 (2026-04-30 기준)

- **main HEAD**: `db121922` (post-jest-infra-debt archive + Codecov SHA pin)
- **CI 상태 (PR #6, #3, #7 모두 동일 패턴)**:
  - ✅ Code Quality, Security Audit, CodeRabbit, Vercel
  - ❌ **Tests** (jest unit + GraphQL): 14 failed / 7 pass =
    `clearImmediate is not defined` ×20 + memberService stale × ~17
  - ❌ **Run E2E Tests (chromium)**: Next.js dev server boot 실패
    (`Invalid environment variables` zod throw)
- **활성 PDCA (parallel)**:
  - `warning-cleanup-cycle-2` (do, in-progress) — 무관
  - `jest-infra-debt` (archived) — 본 사이클의 부모
  - `asca-api-security-hardening` (PR #3 본체, completed) — 트리거 사이클

### 1.2 P1 root cause (PR #6/#3/#7 CI logs)

```
ReferenceError: clearImmediate is not defined  (×20)
```

- jsdom 환경은 Node.js 타이머 API `clearImmediate` / `setImmediate`를 제공하지
  않음
- SSE/realtime 테스트 일부 (특히 `lib/realtime/__tests__/` 하위)가 이 API를 직접
  또는 transitively 사용
- jest-infra-debt에서 `@jest-environment node` docblock 추가한 2개 파일은 통과,
  나머지 파일들은 jsdom 환경 그대로 → 폴리필 필요

### 1.3 P2 root cause (PR #3 E2E log L02:44:43-49)

```
[WebServer] ❌ Invalid environment variables:
{
  "DATABASE_URL": { "_errors": ["Required"] },
  "NEXT_PUBLIC_SUPABASE_URL": { ... },
  ...
}
```

- `.github/workflows/e2e-tests.yml` 환경: `NODE_ENV: test`
- Next.js env loading 우선순위 (NODE_ENV=test): `.env.test.local` → `.env.test`
  → `.env` (**`.env.local` 미로드**)
- Workflow는 `cp .env.example .env.local` 실행 → `.env.local`에는 placeholder가
  있지만 Next.js는 무시
- Result: `lib/config/env.ts` `validateEnv()` zod safeParse 실패 → 503

### 1.4 jest-infra-debt에서 cut된 이유

- jest-infra-debt 범위(F1-F5)는 jest config + mock + Web APIs + env
  placeholder + .env.example 신규 5종
- P1, P2는 그 사이클 후 surface된 추가 이슈 (test가 실제 실행되어야 보이는 것)
- Split-cycle principle 적용 — 본 사이클로 분리

---

## 2. 목표 (Goals)

### 2.1 Primary Goals (DoD)

1. **G1 — P1 해결**: jest 전체 테스트 실행 시
   `ReferenceError: clearImmediate is not defined` 0건
2. **G2 — P2 해결**: e2e workflow의 Next.js dev server가
   `Invalid environment variables` 없이 부팅 (test:e2e:ci `webServer` startup
   SUCCESS)
3. **G3 — Tests job 진전**: PR base 동일 조건에서 `Tests` 체크가 P1 관련 실패
   0건 (잔여 ~17건은 P3 stale tests, 별 사이클)
4. **G4 — E2E Setup 통과**: `Run E2E Tests (chromium)` job이 webserver 부팅까지
   성공 (실제 Playwright 시나리오 통과는 별 사이클)

### 2.2 Stretch Goals (선택)

- **S1**: jest.setup.js에서 setImmediate도 폴리필 (clearImmediate와 함께)
- **S2**: e2e-tests.yml에 secrets 사용 옵션 문서화 (placeholder vs 실 staging 값
  trade-off)

### 2.3 Out of Scope

- Tests job의 stale test logic 17건 (memberService.verifyMember 등) — **P3 별
  사이클** `tests-stale-update`
- Node V8 OOM (전체 jest 풀 실행) — **P4 별 사이클**
- E2E test 본체(Playwright suite) 비즈니스 시나리오 통과
- jest jsdom → node 전체 마이그레이션
- Playwright 실 staging 값 사용

---

## 3. 단계별 작업 (Phases)

### Phase 1 — P1: clearImmediate/setImmediate 폴리필

**파일**: `jest.setup.js`

- [ ] `crypto.randomUUID` 폴리필 직후 (또는 ENV 폴리필 직후)에 추가:
  ```js
  // jsdom doesn't provide Node.js timer APIs used by SSE/realtime code.
  if (typeof globalThis.setImmediate === 'undefined') {
    globalThis.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args)
  }
  if (typeof globalThis.clearImmediate === 'undefined') {
    globalThis.clearImmediate = id => clearTimeout(id)
  }
  ```
- [ ] 로컬 검증: `npm run test:realtime` `ReferenceError: clearImmediate` 0건
- [ ] 회귀 검증: 다른 jest 테스트 영향 없음 (단순 globalThis 추가)

**완료 조건**: G1 충족 — 전체 unit suite에서 `clearImmediate` ReferenceError 0건

---

### Phase 2 — P2: e2e-tests.yml `.env.example` → `.env.test` 복사

**파일**: `.github/workflows/e2e-tests.yml`

**Before** (`Setup environment variables` step):

```yaml
- name: Setup environment variables
  run: |
    cp .env.example .env.local
    # Add any additional environment variables needed for testing
```

**After**:

```yaml
- name: Setup environment variables
  run: |
    # Next.js with NODE_ENV=test loads .env.test (NOT .env.local).
    # See: https://nextjs.org/docs/.../environment-variables
    cp .env.example .env.test
    cp .env.example .env.local  # safety net for any non-Next consumer
```

**선택 (S2)**: `.env.example` placeholder 값이 실제로 zod schema를 통과하는지
검증

- DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL 등의 형식 다시 점검
- 필요 시 `https://YOUR_PROJECT.supabase.co` 같이 형식상 통과하는 placeholder
  사용 (이미 확인됨)

**완료 조건**: G2, G4 충족 — webserver boot success, env validation passes

---

### Phase 3 — CI 통합 검증

- [ ] 별 브랜치 `chore/tests-infra-cleanup`
- [ ] Phase 1 + 2 단일 commit (or 2 commits)
- [ ] PR 생성 (~5 lines diff)
- [ ] CI 결과 확인:
  - Tests: clearImmediate ReferenceError 0건 (잔여 stale tests는 별 사이클)
  - E2E: Setup environment variables step + webserver boot SUCCESS
- [ ] 일반 머지 (CI 통과 시) 또는 admin merge (Tests stale로 RED 시)

**완료 조건**: G3, G4 충족

---

## 4. 비기능 요구사항 (Non-Functional)

- **Reversibility**: 각 Phase 변경은 단일 commit, 개별 revert 가능
- **Backward compat**: 기존 통과하는 테스트 회귀 없음
- **Coverage**: 본 사이클은 setup 변경이라 영향 없음
- **CI 시간**: 변화 없음

---

## 5. 위험 (Risks)

| Risk                                                                              | Likelihood | Impact | Mitigation                                                             |
| --------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| setImmediate 폴리필이 jsdom 일부 다른 테스트와 충돌                               | Low        | Low    | undefined 체크 후 추가, 기존 globalThis 보존                           |
| `.env.test`와 `.env.local` 동시 복사로 dev 환경에서 `.env.test` 의도치 않게 생성  | Low        | Low    | CI 전용 (`runs-on: ubuntu-latest`), 로컬 dev 영향 없음                 |
| Next.js가 placeholder env로도 실 Supabase 호출 시도 → API 호출 시점에서 다른 오류 | Medium     | Low    | 본 사이클은 booting까지 목표. 실 호출은 Out of Scope (P3 등 별 사이클) |
| Tests job의 stale tests가 이번 변경으로 갑자기 통과 (false positive)              | Very Low   | Low    | 가능성 낮음 — clearImmediate 폴리필이 mock 동작을 바꾸지 않음          |

---

## 6. 검증 (Verification)

### 6.1 로컬 검증 명령

```bash
# Phase 1
npm test -- lib/realtime/__tests__/ 2>&1 | grep -c "clearImmediate is not defined"  # → 0

# Phase 2 (시뮬레이션)
NODE_ENV=test cp .env.example .env.test
npm run dev  # Next.js boot 확인 (Invalid env 0건)

# 종합
npm run test:ci  # 전체 unit + coverage
```

### 6.2 CI 검증

- 브랜치 push 후 GitHub Actions:
  - `Tests` job — clearImmediate ReferenceError 0건 (잔여 stale tests는 별
    사이클)
  - `Run E2E Tests (chromium)` — webserver boot success

### 6.3 Match Rate 측정 (Check phase)

- gap-detector agent로 Plan vs 구현 비교
- 목표: ≥90%

---

## 7. 일정 (Estimate)

| Phase                             | 예상 시간                      | 누적 |
| --------------------------------- | ------------------------------ | ---- |
| Phase 1 (clearImmediate polyfill) | 5분                            | 0:05 |
| Phase 2 (.env.test copy)          | 5분                            | 0:10 |
| Phase 3 (CI 통합 검증, PR)        | 30분 (PR 작성 + CI 대기 ~10분) | 0:40 |
| Buffer                            | 20분                           | 1:00 |
| **총합**                          | **~1시간**                     |      |

---

## 8. 다음 단계

1. 본 Plan 검토 후 **`/pdca design tests-infra-cleanup`** (간단해서 design
   생략하고 do로 가도 됨)
2. **`/pdca do tests-infra-cleanup`** — 별 브랜치 + 2 phase 적용
3. PR 생성 + 머지 (admin override 불필요 예상)
4. Archive

---

## 9. 참조

- 부모 사이클: `docs/archive/2026-04/jest-infra-debt/jest-infra-debt.report.md`
- CSO 보고서: `.gstack/security-reports/2026-04-28-000741.json` (cut items
  P1+P2)
- 학습 메모리: `feedback_jest_globals_hoisting.md` (P0와 동일 패턴 — 작은 PR
  우선)
- 메모리: `project_asca_jest_infra_debt_completed.md` (P1+P2 cut 명시)
