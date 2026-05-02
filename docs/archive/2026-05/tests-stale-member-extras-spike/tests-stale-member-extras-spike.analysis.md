---
feature: tests-stale-member-extras-spike
date: 2026-05-02
phase: check
match_rate: 100%
revision: β
parent_cycle: tests-realtime-async-fix
scope: spike (식별 위주)
---

# Gap Analysis — tests-stale-member-extras-spike

## Match Rate: 100%

| 항목 | Plan | 구현 | Match |
|---|---|---|---|
| Root cause 식별 | OOM 원인 식별 | 2 root cause 정확 식별 | ✅ |
| Surgical fix (extra) | 가능 시 적용 | 양 file `jest` import 제거 | ✅ |
| dot file OOM | 해결 가능성 검증 | **79s → 2.1s 해결** | ✅ |
| hyphen file OOM | 부분 효과만 | thenable 잔존 | ✅ (예측 정확) |
| CI 변동 | 변동 가능 (예측 안 함) | 419 → 419 (변동 없음, local-only) | ✅ |
| Real time | ~80min | ~60min | ✅ |
| Spike scope (식별만) | 30min | 30min mini-do + 30min fix | ✅ |

## Findings

1. **rev β 9연속 검증**: Match avg 98.3% (95/100/100/95/100/100/100/95/100)
2. **Memory 메모와 정확 일치** — `feedback_jest_globals_hoisting.md` 사전 학습이 식별 시간 단축
3. **Local OOM ≠ CI 영향** — CI 워커 메모리가 더 커서 OOM 미발생, 그러나 local DX는 크게 개선

## 두 root cause 정확도

| Root Cause | 검증 방법 | 결과 |
|---|---|---|
| @jest/globals jest 임포트 hoisting 비활성화 | dot file 1 line fix → 79s→2.1s | ✅ 정확 |
| thenable mock 무한 재귀 | hyphen file 코드 분석 (line 35-37) | ✅ 정확 (별 fix 필요) |

## Remaining (별 사이클)

- **tests-stale-member-thenable-fix** (~1h):
  - hyphen file thenable mock 재설계
  - 9 stale fail (jest hoisting fix 후 잔존) 처리
- 본 spike 후 정식 사이클 estimate 가능
