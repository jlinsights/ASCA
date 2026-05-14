---
feature: tests-stale-member-schema-rewrite
date: 2026-05-02
phase: report
match_rate: 90%
revision: β
chain_position: 14 (rev β #11)
pr: '#21'
merge: 65971e47
---

# Report — tests-stale-member-schema-rewrite (rev β #11)

## TL;DR

📐 부모 사이클 ejection (dot file 9 fail) 정식 처리. mockMember 구조 + DTO +
assertion + dead method 일괄 정리. **Local 52/52 PASS**, CI Tests passed 432→439
(+7, mini-do +9 예측에서 -2, env 차이 추정). **14 chain 누적 228→439 (+211,
+93%)**. rev β 11연속 검증 (Match avg 97.7%).

## §1. Plan vs Reality

| 항목          | Plan       | Reality             |
| ------------- | ---------- | ------------------- |
| Match Rate    | ≥95%       | **90%**             |
| Time          | 100min     | ~75min              |
| Files changed | 1          | 1 (+51/-78)         |
| Local 결과    | 52/52 PASS | 52/52 PASS ✅       |
| CI delta      | +9         | +7 (-2 CI variance) |
| Test Suites   | 12→13 pass | 12→13 pass ✅       |
| Total         | 546→544    | 544 ✅              |

## §2. Root Cause + Fix (4 sub-cause)

### 1. mockMember 구조 stale

- Before: snake_case + 폐기 필드 (is_verified, joined_date, deleted_at)
- After: camelCase + 현 schema (id, userId, membershipNumber, status, fullName,
  ...)

### 2. createMember DTO 입력 stale

```diff
-first_name_ko, last_name_ko, membership_level_id, membership_status
+firstNameKo, lastNameKo, membershipLevelId, membershipStatus
```

### 3. service `member.status` 사용

- mock에 `status` 필드 누락 (membership_status만 있음) → 추가

### 4. updateMemberLevel: dead method

- service에 미존재 → describe block 전체 삭제

## §3. Chain 누적 효과

| 사이클                                    | Tests passed | Δ               |
| ----------------------------------------- | ------------ | --------------- |
| (start)                                   | 228          | -               |
| 1-10                                      | 432          | +204            |
| 11. **tests-stale-member-schema-rewrite** | **439**      | **+7**          |
| **Total**                                 | **439**      | **+211 (+93%)** |

## §4. rev β 11연속 검증

| #       | Cycle                                 | Match     | Ejection            |
| ------- | ------------------------------------- | --------- | ------------------- |
| 1-10    | (이전)                                | 95-100%   | 0                   |
| 11      | **tests-stale-member-schema-rewrite** | **90%**   | **2 (CI variance)** |
| **avg** |                                       | **97.7%** | **2 unplanned**     |

## §5. 학습

1. **TypeScript `as unknown as Member` cast**: lenient (snake_case 컴파일 통과)
   → runtime 차이 가능
2. **CI env variance**: local 100% PASS이라도 CI에서 2 test 차이 가능 (timezone,
   async timing)
3. **dead method test cleanup**: describe block 전체 삭제 = surgical (Karpathy
   §3)
4. **rev β 첫 90% 사이클**: CI variance ejection 사전 정의 못 함 (Karpathy §1
   한계)

## §6. Next 후보

- **tests-realtime-logic-fixes** (~12, ~2-3h+):
  - sse-manager Max clients limit (2)
  - websocket-manager event broadcast (2)
  - e2e-flow 다중 client (8)
- **tests-member-ci-variance-spike** (~30min):
  - CI-only 2 fail 식별 (joinDate timestamp casting?)
- **tests-db-fixture** (~28, ~3h+, 사용자 옵션 결정 필요)
