---
template: analysis
feature: tests-route-dataloader-mock
date: 2026-05-01
matchRate: 95
status: completed
mergedCommit: 37ab759e
pr: 14
parentCycle: tests-stale-route-extras
revision: rev β #4
---

# tests-route-dataloader-mock — Gap Analysis

> **Match 95%** — G1+G2 모두 충족. CI 효과(+2)는 mini-do(+4)보다 작음 (다른 test
> cross-affecting 가능).

## 1. Plan vs 구현

| Goal                                                   | 결과         |
| ------------------------------------------------------ | ------------ |
| G1 Query Operations 3 GREEN (user/members/exhibitions) | ✅           |
| G2 9 fail → ≤7 fail                                    | ✅ (7 fail)  |
| 잔여 4 별 사이클 ejection (Plan §2.1)                  | ✅ 사전 정의 |

## 2. CI vs mini-do 차이

| 환경           |            passed | failed | net 효과 |
| -------------- | ----------------: | -----: | -------- |
| Mini-do (단독) | 9→7 fail (4 PASS) |     -4 | +4       |
| CI (전체)      |           393→395 |     -2 | **+2**   |

**가설**: mini-do는 4 PASS이지만 CI 전체 실행에서 다른 test가 영향받음 (worker
분배, mock isolation 등). 정확한 root cause는 본 사이클 OOS — 별 사이클
`tests-ci-isolation` 후보.

Match Rate 보정: G1 100% (의도 fix 정확), 단 CI 효과 절반 → 95%.

## 3. rev β #4 안정성

| 사이클                        |   Match | Eject | mini-do→CI 일치 |
| ----------------------------- | ------: | ----: | --------------- |
| #1 jest-clerk-esm-fix         |     95% |     0 | 정확            |
| #2 tests-stale-graphql-extras |    100% |     0 | 정확            |
| #3 tests-stale-route-extras   |    100% |     0 | 정확            |
| **#4 본 사이클**              | **95%** | **0** | **부분 (4→2)**  |

rev β 4연속 0 unplanned ejection. mini-do→CI 일치 패턴 첫 변동 — 향후 rev β γ
검토 (CI에서 mini-do 시뮬레이션).

## 4. 누적 효과 (7 PDCA chain)

passed 228 → 395 (+167, +73%). chain 효과 지속.

## 5. 다음 사이클 권장 (잔여 4 그룹 + 큰 사이클)

| 순위 | 사이클명                           | 건수 | 추정            |
| :--: | ---------------------------------- | ---: | --------------- |
|  1   | tests-route-error-policy           |    3 | ~1h             |
|  2   | tests-route-schema-mock (mutation) |    2 | ~1h             |
|  3   | tests-route-authz                  |    1 | ~30분           |
|  4   | tests-route-auth-header            |    1 | ~30분           |
|  5   | tests-db-fixture                   |   28 | ~4h (옵션 결정) |
|  6   | tests-realtime-async-fix           |   27 | 2-3h            |

## 6. 결론

Match 95%, rev β #4 안정성 검증 (CI 부분 차이 제외). `/pdca report` 진행.
