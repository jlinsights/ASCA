---
feature: tests-stale-member-thenable-fix
date: 2026-05-02
phase: check
match_rate: 100%
revision: β
parent_cycle: tests-stale-member-extras-spike
---

# Gap Analysis — tests-stale-member-thenable-fix

## Match Rate: 100%

| 항목 | Plan | 구현 | Match |
|---|---|---|---|
| Root cause | Promise.resolve(this) 무한 재귀 | 정확 일치 | ✅ |
| Fix scope | 1 file 1 hunk | 1 file 1 hunk (+8/-3) | ✅ |
| hyphen file 결과 | 13/13 PASS | 13/13 PASS | ✅ |
| CI Tests passed delta | +13 | **+13 (419→432)** | ✅ |
| Test Suites delta | +1 pass | 11→12 pass | ✅ |
| Real time | ~75min | ~50min | ✅ |
| Ejection 사전 정의 | dot file 9 fail | 정확히 잔존 | ✅ |

## Findings

1. **rev β 10연속 검증**: Match avg 98.5% (95/100/100/95/100/100/100/95/100/100)
2. **mini-do 예측 100% 정확** (이번에는 ±0)
3. **Total tests 533 → 546** (+13 new tests now contributing to count)

## Remaining (별 사이클)

- **tests-stale-member-schema-rewrite** (~2-3h+, 9 fail):
  - dot file mockMember 구조 전면 재작성
  - snake_case → camelCase: membership_status → status
  - 필드 변경: membership_level_id → tierId
  - 통합: first_name_ko + last_name_ko → fullName + fullNameKo
- 본 사이클 ejection 사전 정의 정확
