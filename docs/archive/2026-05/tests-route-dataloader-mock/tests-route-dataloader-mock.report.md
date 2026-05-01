---
template: report
feature: tests-route-dataloader-mock
date: 2026-05-01
matchRate: 95
status: completed
mergedCommit: 37ab759e
pr: 14
parentCycle: tests-stale-route-extras
revision: rev β #4
duration: ~50분
---

# tests-route-dataloader-mock — Report

> **요약**: rev β #4 — DataLoader mock + enum 4 fix (1 file, 4 hunks)로 Query
> Operations 3 GREEN. CI +2 PASS (mini-do +4 vs CI +2 — cross-test 영향 가능).
> 누적 7 chain passed 228→395 (+73%).

## 1. PDCA 흐름 (~50분)

| Phase                        | 소요 |
| ---------------------------- | ---- |
| Mini-do (4 root cause + fix) | 30분 |
| Plan (사후)                  | 5분  |
| commit + push + PR           | 5분  |
| CI + 머지                    | 10분 |
| Analyze + Report             | 10분 |

## 2. 변경 (1 file, 4 hunks)

```diff
- db.query.users.findFirst.mockResolvedValue(mockUser)
+ db.query.users.findMany.mockResolvedValue([mockUser])
- role: 'member'
+ role: 'MEMBER'
- status: 'active' (members)
+ status: 'ACTIVE'
- status: 'CURRENT' (exhibitions)
+ status: 'ONGOING'
```

## 3. CI 결과

| 지표   | PR #13 base | PR #14 base | 차이   |
| ------ | ----------: | ----------: | ------ |
| Total  |         533 |         533 | 0      |
| Passed |         393 |     **395** | **+2** |
| Failed |         140 |         138 | -2     |

mini-do +4 vs CI +2 — cross-test isolation 가능. 별 사이클 후보
(`tests-ci-isolation`).

## 4. 7 chain 누적

passed 228 → **395 (+167, +73%)**. tests passed coverage 73% 도달.

## 5. rev β 4연속

| #      |   Match | Eject |
| ------ | ------: | ----: |
| #1     |     95% |     0 |
| #2     |    100% |     0 |
| #3     |    100% |     0 |
| **#4** | **95%** | **0** |

평균 97.5%, ejection 0. rev β 안정성 지속.

## 6. 핵심 학습

1. **DataLoader vs db.query mock 함정**: production이 DataLoader 사용 →
   batchLoadFn은 findMany. test는 findFirst만 mock하면 silent fail (null reading
   'X')
2. **enum value casing**: GraphQL enum은 UPPER_SNAKE_CASE 컨벤션. mock data에서
   lowercase는 silent serialize error
3. **mini-do→CI 차이 첫 발생**: 본 사이클이 첫 변동 사례. cross-test mock
   isolation 또는 worker 분배 추정
4. **enum 정확한 값 사전 grep**: `'CURRENT'` 가정 vs 실제 `'ONGOING'` — schema
   파일 사전 확인이 mini-do의 일부

## 7. 메모리 권장

- `feedback_dataloader_mock.md` (신규) — production이 DataLoader 사용 시 test
  mock 패턴
- `feedback_graphql_enum_casing.md` (신규) — GraphQL enum UPPER_SNAKE_CASE 강제
- `feedback_pdca_rev_b.md` 업데이트 — 4연속 검증 (Match 평균 97.5%, mini-do→CI
  첫 변동 사례)

## 8. 다음 단계

- [ ] Archive
- [ ] **다음 사이클**: tests-route-error-policy (3, ~1h) 또는 tests-db-fixture
      (큰 효과 +28, 옵션 결정)
