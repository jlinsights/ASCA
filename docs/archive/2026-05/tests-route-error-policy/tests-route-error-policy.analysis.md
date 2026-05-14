---
feature: tests-route-error-policy
date: 2026-05-01
phase: check
match_rate: 100%
revision: β
parent_cycle: tests-route-mutation-auth
---

# Gap Analysis — tests-route-error-policy

## Match Rate: 100%

| 항목                     | Plan               | 구현                    | Match |
| ------------------------ | ------------------ | ----------------------- | ----- |
| Root cause 분류 (3 fail) | 각각 다른 원인     | 정확히 일치             | ✅    |
| Fix scope                | 1 file 3 hunks     | 1 file 3 hunks (+15/-4) | ✅    |
| route.test.ts suite      | 27/27 PASS         | 27/27 PASS              | ✅    |
| CI Tests passed delta    | 399 → 402 (+3)     | **399 → 402 (+3)**      | ✅    |
| Test Suites flip         | route.test.ts pass | 11→10 fail / 10→11 pass | ✅    |
| Real time                | ~85min             | ~75min                  | ✅    |
| Source 변경              | 0 (test only)      | 0                       | ✅    |

## Findings

1. **rev β 7연속 검증**: Match avg 98.6% (95/100/100/95/100/100/100), unplanned
   ejection 0
2. **route.test.ts 0 fail 달성** (5 cycle chain: dataloader → auth-cleanup →
   mutation-auth → error-policy)
3. **Test assertion ≠ source 수정** — production 동작 자체는 정합, test 가정만
   stale

## 학습

- **Apollo Server v4 status code 정책**:
  - Validation error (non-existent field) → 400
  - Parse error (malformed JSON) → throw (no Response)
  - Resolver throw → 200 + errors
- **vm-realm cross-realm instanceof 실패** — `.name` 비교가 robust
- **DataLoader resolver mock 방향**: `findFirst → findMany` (batchLoadFn)

## Remaining (별 사이클 후보)

- tests-realtime-async-fix (27 timeout)
- tests-db-fixture (28, 사용자 옵션 결정 필요)
- tests-stale-member-extras (10)
