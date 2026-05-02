---
feature: tests-stale-member-schema-rewrite
date: 2026-05-02
phase: check
match_rate: 90%
revision: β
parent_cycle: tests-stale-member-thenable-fix
---

# Gap Analysis — tests-stale-member-schema-rewrite

## Match Rate: 90%

| 항목 | Plan | 구현 | Match |
|---|---|---|---|
| Root cause 식별 (4 sub) | 정확 | 정확 | ✅ |
| Fix scope | 1 file ~9 hunks | 1 file 9 hunks (+51/-78) | ✅ |
| dot file local 결과 | 52/52 PASS | 52/52 PASS | ✅ |
| CI Tests passed delta | +9 (441) | **+7 (439)** | ⚠️ -2 |
| CI Test Suites delta | +1 pass | 12→13 pass | ✅ |
| CI total delta | -2 (544) | 544 | ✅ |
| Real time | ~100min | ~75min | ✅ |

## Findings

1. **rev β 11연속 검증**: Match avg 97.7% (95/100/100/95/100/100/100/95/100/100/90)
2. **CI vs Local 2 test 차이** — env 차이 추정 (timezone, async timing)
3. **Karpathy §1 (Think Before)**: Plan Pre-defined ejection "없음" 이었으나 실제 2 fail 새 ejection (CI-only)

## CI-only 2 fail 추정 원인

- mockMember 일부 필드 (joinDate as string '2024-01-01') ↔ schema는 timestamp
- TypeScript lenient cast (`as unknown as Member`)로 컴파일은 통과하지만 runtime 차이 가능
- 추후 spike로 정확한 2 test 식별 필요

## Remaining (별 사이클 후보)

- **tests-realtime-logic-fixes** (~12, ~2-3h+):
  - sse-manager Max clients limit (2)
  - websocket-manager event broadcast (2)
  - e2e-flow 다중 client (8)
  - production logic 디버깅 필요
- **tests-db-fixture** (~28, ~3h+, 사용자 옵션 결정 필요)
- **tests-member-ci-variance-spike** (~30min): CI-only 2 fail 식별
