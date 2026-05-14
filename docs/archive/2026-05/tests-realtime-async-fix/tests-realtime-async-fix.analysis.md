---
feature: tests-realtime-async-fix
date: 2026-05-02
phase: check
match_rate: 95%
revision: β
parent_cycle: tests-route-error-policy
---

# Gap Analysis — tests-realtime-async-fix

## Match Rate: 95%

| 항목                  | Plan                         | 구현                    | Match    |
| --------------------- | ---------------------------- | ----------------------- | -------- |
| Root cause 식별       | fake timer + setTimeout 충돌 | 정확 일치               | ✅       |
| Fix scope             | 4 file replace_all           | 4 file (40 occurrences) | ✅       |
| CI Tests passed delta | 402 → 418 (+16)              | **402 → 419 (+17)**     | ⚠️ +1 더 |
| Real time             | ~80min                       | ~70min                  | ✅       |
| Source 변경           | 0 (test only)                | 0                       | ✅       |
| Ejection 사전 정의    | 12 logic bug                 | 정확히 잔여             | ✅       |

## Findings

1. **rev β 8연속 검증**: Match avg 98% (95/100/100/95/100/100/100/95)
2. **mini-do 예측 정확도 ~95%** (CI 419 vs predict 418, +1 추가 PASS)
3. **realtime suite 시간 67s → 4s** (timeout 제거 효과)

## 추가 PASS (+1) 분석

mini-do 측정 환경: local jsdom + 단일 worker CI 환경: parallel workers + node
env → 1 test의 race condition이 CI에서 우연히 통과 (재현 불안정) → Match Rate
95% (CI 결과를 기준으로 정확)

## Remaining (별 사이클)

- **tests-realtime-logic-fixes** (~12 fail):
  - sse-manager: Max clients limit 검증 안 됨 (2)
  - websocket-manager: createdEvent/updatedEvent broadcast 누락 (2)
  - e2e-flow: 다중 client broadcasting / 에러 전파 (8)
- 별도 root cause (실제 production logic, test framework 아님)
- ~2-3h+ 예상
