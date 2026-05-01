---
template: analysis
feature: tests-stale-route-extras
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
matchRate: 100
status: completed
mergedCommit: 761c2e20
pr: 13
parentCycle: tests-stale-graphql-extras
revision: rev β #3
---

# tests-stale-route-extras — Gap Analysis

> **Match Rate: 100%** — Plan G1+G2 모두 충족, 잔여 9건은 사전 명시된 5 별
> 사이클 ejection.

## 1. Plan vs 구현

| Plan Item                              | 결과                     |
| -------------------------------------- | ------------------------ |
| G1 — `require('@/lib/db/drizzle')` 0건 | ✅ 15→0 (sed 1회)        |
| G2 — +8 PASS                           | ✅ CI 검증 (385→393)     |
| 잔여 9건 5 별 사이클 ejection          | ✅ Plan §1.1에 사전 정의 |

## 2. CI 효과

| 지표   | PR #12 base | PR #13 base | 차이   |
| ------ | ----------: | ----------: | ------ |
| Total  |         533 |         533 | 0      |
| Passed |         385 |     **393** | **+8** |
| Failed |         148 |         140 | -8     |

## 3. rev β #3 안정성

| 사이클                        |    Match |               Eject | Estimate  |
| ----------------------------- | -------: | ------------------: | --------- |
| #1 jest-clerk-esm-fix         |      95% |                   0 | 1.5h→2h   |
| #2 tests-stale-graphql-extras |     100% |                   0 | 1h→1h     |
| **#3 본 사이클**              | **100%** | **0** (5 사전 예측) | **1h→1h** |

→ rev β 패턴 3연속 0 unplanned ejection + Match ≥95%. 안정성 확정.

## 4. 학습

1. **단일 root cause 일괄 치환의 ROI**: 1 sed → 8 PASS (47% 잔여 fail 해결).
   PDCA 사이클 가장 작은 단위 효과.
2. **5 ejection 사전 정의 패턴**: Plan §1.1 표로 5 그룹 사전 분류 → analyze에서
   surprise 0. rev β 패턴 핵심 강점.
3. **DataLoader vs db.query mock 함정**: production resolver가 DataLoader 사용
   시 test가 `db.query.*` mock으로 우회 불가 — 별 사이클
   (`tests-route-dataloader-mock`) 필요.

## 5. 다음 사이클 권장 (5 신규 ejection 우선순위)

| 순위 | 사이클명                    | 건수 | 추정  |
| :--: | --------------------------- | ---: | ----- |
|  1   | tests-route-dataloader-mock |    3 | ~2h   |
|  2   | tests-route-schema-mock     |    3 | ~1h   |
|  3   | tests-route-error-policy    |    2 | ~1h   |
|  4   | tests-route-authz           |    1 | ~30분 |
|  5   | tests-route-auth-header     |    1 | ~30분 |

추가 large 사이클: tests-db-fixture / tests-realtime-async-fix /
tests-stale-member-extras.

## 6. 누적 효과 (6 PDCA chain)

PR #6 baseline 228 passed → 본 PR 후 **393 passed (+165, +72%)**.

## 7. 결론

Match 100%, rev β #3 안정성 검증. `/pdca report` 진행.
