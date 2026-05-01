---
template: report
feature: tests-stale-route-extras
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
matchRate: 100
status: completed
mergedCommit: 761c2e20
pr: 13
parentCycle: tests-stale-graphql-extras
revision: rev β #3
duration: ~45분
---

# tests-stale-route-extras — Completion Report

> **요약**: 부모 사이클 ejection 17 fail 중 단일 root
> cause(`require('@/lib/db/drizzle')` 미존재 path) 8건을 1 sed 치환으로 해결.
> **Match 100%**, rev β 패턴 3연속 안정성 검증. 잔여 9건은 5 별 사이클로 사전
> 정의 ejection.

---

## 1. PDCA 흐름 (역대 최단 사이클)

| Phase    | 산출물                              | 소요      |
| -------- | ----------------------------------- | --------- |
| Mini-do  | sed 1회 (15→0 occurrences)          | 15분      |
| Plan     | rev β 사후 문서화 + 5 ejection 정의 | 15분      |
| Do       | (mini-do로 완료)                    | -         |
| Check/CI | +8 PASS 확인 + admin merge          | 10분      |
| Analyze  | Match 100%                          | 5분       |
| Report   | (본 문서)                           | 5분       |
| **합계** |                                     | **~45분** |

**rev β 효과**: estimate 1h vs 실제 45분 (15분 단축).

---

## 2. 변경 사항 (1 file, 15 occurrences → 0)

```bash
sed -i '' "s|require('@/lib/db/drizzle')|require('@/lib/db')|g" \
  app/api/graphql/__tests__/route.test.ts
```

`@/lib/db/drizzle` (production 미존재) → `@/lib/db` (실제 path). PDCA 사이클
가장 작은 단위.

---

## 3. CI 효과

| 지표   | PR #12 base | PR #13 base | 차이   |
| ------ | ----------: | ----------: | ------ |
| Total  |         533 |         533 | 0      |
| Passed |         385 |     **393** | **+8** |
| Failed |         148 |         140 | -8     |

mini-do 결과(`17 → 9 fails (8 PASS)`)와 CI 결과 정확히 일치. rev β 검증력.

---

## 4. 6 사이클 chain 누적 효과

| 사이클                       |  passed | net           |
| ---------------------------- | ------: | ------------- |
| Pre-chain (PR #6)            |     228 | baseline      |
| jest-infra-debt              |       - | infra unblock |
| tests-infra-cleanup          |       - | infra unblock |
| tests-stale-update           |     228 | -2            |
| jest-clerk-esm-fix           |     369 | +141          |
| tests-stale-graphql-extras   |     385 | +16           |
| **tests-stale-route-extras** | **393** | **+8**        |

**누적**: passed **228 → 393 (+165, +72%)**. 6 PDCA chain의 가시적 효과.

---

## 5. rev β 3연속 검증

| 사이클                        |    Match |               Eject | Estimate vs Actual |
| ----------------------------- | -------: | ------------------: | ------------------ |
| #1 jest-clerk-esm-fix         |      95% |                   0 | 1.5h→2h            |
| #2 tests-stale-graphql-extras |     100% |                   0 | 1h→1h              |
| **#3 본 사이클**              | **100%** | **0** (5 사전 예측) | **1h→45분**        |

**3 사이클 평균**: Match 98.3%, ejection 0, estimate 정확. rev β를 PDCA
default로 채택 권장 확정.

---

## 6. 5 신규 별 사이클 사전 정의

본 사이클 §1.1 표에서 잔여 9 fail을 5 root cause 그룹으로 사전 분류:

| Priority | 사이클명                    | 건수 | 추정  | Root cause                      |
| :------: | --------------------------- | ---: | ----- | ------------------------------- |
|    1     | tests-route-dataloader-mock |    3 | ~2h   | DataLoader가 db.query mock 우회 |
|    2     | tests-route-schema-mock     |    3 | ~1h   | mock data schema mismatch       |
|    3     | tests-route-error-policy    |    2 | ~1h   | Apollo errorPolicy / JSON parse |
|    4     | tests-route-authz           |    1 | ~30분 | Admin role context 부족         |
|    5     | tests-route-auth-header     |    1 | ~30분 | Clerk mock null 반환            |

---

## 7. 학습

### 7.1 단일 root cause 일괄 치환의 극치 ROI

1 sed 명령 → 8 tests PASS. PDCA 사이클의 가장 효율적 단위. 패턴 인식 (Karpathy
§1) + 단일 fix (§3 surgical) + grep 검증 (§4)의 정수.

### 7.2 5 ejection 사전 정의 = surprise 제거

본 사이클은 do 단계 **0 surprise** — Plan §1.1 표에 5 그룹을 사전 정의. analyze
단계에서 발견 0건. rev β 패턴의 핵심 강점.

### 7.3 DataLoader 함정 (별 사이클 P1 영역)

production resolver가 DataLoader 사용 시 test가 `db.query.*` mock으로 우회 불가.
DataLoader 자체를 mock해야. `tests-route-dataloader-mock` 사이클 핵심 challenge.

### 7.4 누적 효과 가시화 + 모멘텀

228 → 393 passed (+72%) — 6 PDCA chain 누적 효과 시각화로 다음 사이클 진입 동기
강화.

---

## 8. 메모리 권장

- `feedback_pdca_rev_b.md` 업데이트 — rev β 3연속 검증 (Match 98.3%, ejection 0)
- `feedback_pre_eject_groups.md` (신규) — Plan §1.1에 root cause 그룹 사전 분류
  패턴
- `project_asca_tests_red_chain.md` 업데이트 — 6 사이클 chain 누적

---

## 9. 다음 단계

- [x] 전체 PDCA 종결
- [ ] Archive
- [ ] **다음 사이클**: 1순위 `tests-route-dataloader-mock` (~2h, 3건) 또는
      사용자 선호

---

## 10. 참조

- 부모: `docs/archive/2026-05/tests-stale-graphql-extras/`
- Plan: `docs/01-plan/features/tests-stale-route-extras.plan.md`
- Analysis: `docs/03-analysis/tests-stale-route-extras.analysis.md`
- Merge commit: `761c2e20`
- PR: https://github.com/jlinsights/ASCA/pull/13
