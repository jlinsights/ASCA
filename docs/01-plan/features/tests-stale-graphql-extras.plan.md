---
template: plan
feature: tests-stale-graphql-extras
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: jest-clerk-esm-fix
  matchRate: 95
  status: archived
revision: rev β (mini-do로 plan 가설 100% 검증)
---

# tests-stale-graphql-extras — Plan (rev β)

> **목적**: 부모 사이클 `jest-clerk-esm-fix` 잔여 6 logic stale 해결. mini-do로
> 4 root cause 그룹 식별 후 모두 fix 완료.
>
> **Why now**: jest-clerk-esm-fix가 GraphQL 4 files suite RUN 가능하게 unblock한
> 후 발견된 6 logic stale. 본 사이클로 클린업.

---

## 1. 배경 + rev β 사전 검증 결과

### 1.1 6 fail의 4 root cause (mini-do로 정확 식별)

| Group | 파일                                                        | 건수 | Root cause                                                                |
| ----- | ----------------------------------------------------------- | :--: | ------------------------------------------------------------------------- |
| **A** | `app/api/graphql/__tests__/route.test.ts`                   |  1   | `jest.mock('@/lib/db/drizzle', ...)` — production에 `lib/db/drizzle` 없음 |
| **B** | `lib/graphql/resolvers/__tests__/mutation.resolver.test.ts` |  2   | test mock의 `db.query.membershipApplications` 정의 누락                   |
| **C** | `lib/graphql/resolvers/__tests__/query.resolver.test.ts`    |  3   | `createMockContext()` (unauth)이 `requireAuth` resolver 호출 → throw      |
| **D** | `lib/graphql/__tests__/auth.test.ts`                        |  1   | `result.edges` (connection shape) 기대, resolver는 plain array 반환       |

### 1.2 mini-do 검증 결과 (사전 적용 + 검증)

```
PASS lib/graphql/resolvers/__tests__/mutation.resolver.test.ts
PASS lib/graphql/resolvers/__tests__/query.resolver.test.ts
PASS lib/graphql/__tests__/auth.test.ts
FAIL app/api/graphql/__tests__/route.test.ts  ← suite unblock, 17 신규 fail (별 사이클)
Tests: 17 failed, 154 passed, 171 total
```

본 사이클 의도 6건 → 0 (100% 해결). route.test.ts는 G1 (`@/lib/db/drizzle` →
`@/lib/db` + `@jest-environment node` docblock)으로 suite RUN 가능. 잔여 17건은
신규 발견 — 별 사이클 ejection.

---

## 2. 목표 (Goals — Karpathy §4)

| Goal | Target                                        | Verify Check                                              |     검증 결과     |
| ---- | --------------------------------------------- | --------------------------------------------------------- | :---------------: |
| G1   | route.test.ts suite RUN (path fix + node env) | `npx jest app/api/graphql/__tests__/route` → suite 실행됨 | ✅ (27 tests run) |
| G2   | mutation.resolver 2건 GREEN                   | 동 파일 단독 PASS                                         |        ✅         |
| G3   | query.resolver 3건 GREEN                      | 동 파일 단독 PASS                                         |        ✅         |
| G4   | auth.test.ts 1건 GREEN                        | 동 파일 단독 PASS                                         |        ✅         |

### 2.1 Out of Scope (Ejection)

- **route.test.ts 잔여 17 신규 fail** — suite unblock 후 발견. 별 사이클
  `tests-stale-route-extras` (P5).

---

## 3. Phases

### Phase 1 — 4 fix 적용 (mini-do로 완료)

1. **G1**: `app/api/graphql/__tests__/route.test.ts:15` — `'@/lib/db/drizzle'` →
   `'@/lib/db'`
2. **G1 추가**: 동 파일 docblock에 `@jest-environment node` 추가 (Web API
   Request 필요)
3. **G2**: `lib/graphql/test-utils.ts:83` — `createMockDb()`에
   `membershipApplications` block 추가 (4 LOC)
4. **G3**: `lib/graphql/resolvers/__tests__/query.resolver.test.ts` 3 위치 —
   `createMockContext()` → `createAuthContext()`
5. **G4**: `lib/graphql/__tests__/auth.test.ts:196` — `result.edges` → `result`
   (resolver는 plain array 반환)

### Phase 2 — 검증

- [x] `npx jest lib/graphql/ app/api/graphql/` → 본 사이클 6건 모두 해결,
      route.test.ts 17 신규 ejection

### Phase 3 — PR + 머지

- [ ] commit (5 file 변경)
- [ ] PR 생성
- [ ] CI: 6 fail → 0 (의도), 17 신규 RED는 별 사이클

---

## 4. 비기능

- **Reversibility**: 4 fix 그룹별 별 commit 가능 (또는 단일)
- **Backward compat**: production code 무변경 (test 5 file만)
- **CI 시간**: 변화 없음

---

## 5. 위험

| Risk                                                | Likelihood | Impact | Mitigation                                         |
| --------------------------------------------------- | ---------- | ------ | -------------------------------------------------- |
| G3 createAuthContext 변경이 다른 unauth test 영향   | Low        | Low    | 3 위치만 surgical 변경, 다른 test 무관             |
| route.test.ts suite unblock으로 17 신규 RED 노출    | High       | Low    | 본 사이클 OOS 명시, 별 사이클 ejection             |
| G2 membershipApplications mock이 실 schema와 어긋남 | Low        | Medium | 다른 query.shapes와 동일 패턴 (findFirst/findMany) |

---

## 6. 일정 (rev β)

| Phase                      | 예상 | 누적    | 실제         |
| -------------------------- | ---- | ------- | ------------ |
| Mini-do (사전 식별 + 적용) | 30분 | 0:30    | ~30분 (완료) |
| Plan 사후 작성             | 15분 | 0:45    |              |
| Commit + push + PR         | 20분 | 1:05    |              |
| **총합**                   |      | **~1h** |              |

---

## 7. 다음 단계

1. commit + push + PR
2. CI 확인 → 머지
3. analyze (Match ~95% 예상 — 6/6 의도, 단 17 신규 ejection)
4. report + archive
5. **다음 사이클**: tests-stale-route-extras (17 신규 fail) 또는
   tests-db-fixture (사용자 옵션 결정)

---

## 8. 참조

- 부모: `docs/archive/2026-05/jest-clerk-esm-fix/`
- 조부모: `docs/archive/2026-04/tests-stale-update/`
- Karpathy rev β: jest-clerk-esm-fix.report.md §6.1
