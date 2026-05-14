---
feature: tests-route-mutation-auth
date: 2026-05-01
phase: check
match_rate: 100%
revision: β
parent_cycle: tests-route-auth-cleanup
---

# Gap Analysis — tests-route-mutation-auth

## Match Rate: 100%

| 항목                         | Plan                              | 구현                    | Match |
| ---------------------------- | --------------------------------- | ----------------------- | ----- |
| Root cause 식별              | C+E와 동일 + enum casing 분리     | 정확히 일치             | ✅    |
| Fix scope                    | 1 file 2 hunks                    | 1 file 2 hunks (+10/-4) | ✅    |
| Mutation Operations 4/4      | GREEN                             | 4/4 GREEN               | ✅    |
| CI Tests passed delta        | 397 → 399 (+2)                    | **397 → 399 (+2)**      | ✅    |
| Ejection 사전 정의 (F group) | 3 fail → tests-route-error-policy | 잔여 3 fail 정확히 F    | ✅    |
| Real time                    | ~75min                            | ~70min                  | ✅    |

## Findings

1. **rev β 패턴 6연속 검증**: Match avg 98.3% (95/100/100/95/100/100), unplanned
   ejection 0
2. **신규 학습**: GraphQL enum 직렬화 layer는 DB casing과 별개 — mock에서 분리
3. **mini-do 예측 정확도**: CI delta 정확히 +2 (mini-do 측정과 동일)

## Remaining (별 사이클)

- **F 그룹 (3 fail)** → tests-route-error-policy
  - malformed JSON: SyntaxError 잡힘 안 됨
  - non-existent field: 200+errors 기대 / 400 받음
  - resolver exceptions: body.errors undefined
- 별도 root cause (graphql-yoga/Apollo error policy)
- 사전 spike 필요 (~1h+)
