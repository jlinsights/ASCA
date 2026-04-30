---
template: analysis
feature: tests-stale-graphql-extras
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
matchRate: 100
status: completed
mergedCommit: 47305d6c
pr: 12
parentCycle: jest-clerk-esm-fix
revision: rev β
---

# tests-stale-graphql-extras — Gap Analysis

> **Match Rate: 100%** — Plan rev β 4 G 모두 충족 + route.test.ts 17 신규 RED는
> 사전 예측된 ejection (Plan §2.1 OOS).

---

## 1. Plan vs 구현 매핑

| Plan Item                                      | 구현                                                             | 일치 |
| ---------------------------------------------- | ---------------------------------------------------------------- | :--: |
| G1 — route.test.ts path fix + node env         | `'@/lib/db/drizzle'` → `'@/lib/db'` + `@jest-environment node`   |  ✅  |
| G2 — mutation.resolver mock 보강               | `test-utils.ts` `createMockDb()`에 `membershipApplications` 추가 |  ✅  |
| G3 — query.resolver auth context               | 3 위치 `createMockContext()` → `createAuthContext()`             |  ✅  |
| G4 — auth.test.ts return shape                 | `result.edges` → `result`                                        |  ✅  |
| route.test.ts 17 신규 RED ejection (Plan §2.1) | 별 사이클 `tests-stale-route-extras` 권장 명시                   |  ✅  |

---

## 2. CI 효과 (main 누적)

| 지표        | PR #10 base | PR #12 base | 차이                  |
| ----------- | ----------: | ----------: | --------------------- |
| Total tests |         506 |     **533** | +27 (route unblock)   |
| Passed      |         369 |     **385** | +16                   |
| Failed      |         137 |         148 | +11 (route 신규 노출) |

**+16 PASS** = 본 사이클 6 의도 + route.test.ts에서 추가 회복 10건. 1h 사이클로
nice ROI.

---

## 3. rev β 패턴 두 번째 검증

| 항목               | rev β (jest-clerk-esm-fix) | rev β (본 사이클)      |
| ------------------ | -------------------------- | ---------------------- |
| Plan 가설 정확도   | 100%                       | **100%**               |
| Unplanned ejection | 0                          | **0** (route는 예측됨) |
| Estimate vs actual | 1.5h vs 2h                 | **1h vs 1h (정확)**    |
| Match Rate         | 95%                        | **100%**               |

rev β 패턴이 두 번째 사이클에서도 **Match 100% + ejection 사전 예측** 달성. 패턴
안정성 검증.

---

## 4. 학습

1. **rev β 안정성 확인**: 두 사이클 연속 100%/95% 달성, ejection 사전 예측 정확
2. **suite unblock의 cascade 효과**: G1으로 route.test.ts unblock 시 17 신규
   fail 노출. 본 사이클 OOS 명시 패턴이 `tests-infra-cleanup` Risk #3 패턴과
   동일
3. **`createMockContext` vs `createAuthContext` 매트릭스**: PR #3 Clerk 강제 후
   모든 protected resolver test는 createAuthContext 필수 — 별 grep 사이클로 일괄
   정정 가능 (별 도구로 자동화 후보)
4. **production path 확인 필수**: `jest.mock('@/lib/db/drizzle', ...)`처럼
   미존재 path mock은 silent fail이 아닌 explicit suite fail로 노출 — 좋은
   default

---

## 5. 다음 사이클 권장

| 순위 | 사이클명                  | Scope                       | 추정 |
| :--: | ------------------------- | --------------------------- | ---- |
|  1   | tests-stale-route-extras  | route.test.ts 17 신규 RED   | ~2h  |
|  2   | tests-db-fixture          | Repository PG (사용자 옵션) | ~4h  |
|  3   | tests-realtime-async-fix  | Realtime timeout 27건       | 2-3h |
|  4   | tests-stale-member-extras | updateMemberLevel + 9 stale | 2h   |

본 사이클 머지로 **Tests passed 228 → 385 (+157, +69%)** 누적 효과 (4 사이클
chain).

---

## 6. 결론

**Match 100%** — Plan 4 G 모두 충족, route.test.ts 17 RED는 사전 예측 OOS. rev β
패턴 두 번째 검증 성공.

`/pdca report` 진행 가능.
