---
template: plan
feature: tests-stale-route-extras
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: tests-stale-graphql-extras
  matchRate: 100
  status: archived
revision: rev β
---

# tests-stale-route-extras — Plan (rev β)

> **목적**: 부모 사이클 `tests-stale-graphql-extras`에서 ejection된 17 신규 RED
> 중 단일 root cause(`require('@/lib/db/drizzle')` 미존재 path) 8건을 일괄 fix.
> 잔여 9건은 별 root cause 5+ 그룹으로 추가 ejection.
>
> **Why now**: route.test.ts unblock 후 발견된 17 RED 중 가장 일관된 패턴(15건
> require pattern)을 1줄 sed 치환으로 47% 해결.

---

## 1. mini-do 사전 검증 결과

### 1.1 17 fail의 root cause 분포 (mini-do로 정확 식별)

| Group | Pattern                                              | 건수 | 처리                                          |
| ----- | ---------------------------------------------------- | :--: | --------------------------------------------- |
| **A** | `require('@/lib/db/drizzle')` (15 위치, 8 fail 영향) |  8   | **본 사이클 G1**: 일괄 sed 치환               |
| **B** | DataLoader mock 미설정 (production resolver가 사용)  |  3   | 별 사이클 `tests-route-dataloader-mock` (~2h) |
| **C** | Authorization context 부족 (admin role 등)           |  1   | 별 사이클 `tests-route-authz` (~30분)         |
| **D** | Mock 데이터 schema mismatch (resolver throw)         |  3   | 별 사이클 `tests-route-schema-mock` (~1h)     |
| **E** | Auth header processing test (Clerk mock null)        |  1   | 별 사이클 `tests-route-auth-header` (~30분)   |
| **F** | JSON parse + Apollo errorPolicy                      |  2   | 별 사이클 `tests-route-error-policy` (~1h)    |

**본 사이클 scope**: Group A 8건만 (단일 sed). 잔여 9건 = 5+ 별 사이클로 분산.

### 1.2 검증된 fix (mini-do)

```bash
sed -i '' "s|require('@/lib/db/drizzle')|require('@/lib/db')|g" \
  app/api/graphql/__tests__/route.test.ts
```

15 occurrence → 0. test 결과: 17 fails → **9 fails (8건 PASS, 47% 해결)**.

---

## 2. 목표 (Goals — Karpathy §4)

| Goal | Target                                                   | Verify Check                                                     | 검증 결과 |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------------- | :-------: |
| G1   | route.test.ts `require('@/lib/db/drizzle')` 0 occurrence | `grep -c "require('@/lib/db/drizzle')"` → **0**                  |    ✅     |
| G2   | route.test.ts +8 tests PASS                              | `npx jest app/api/graphql/__tests__/route` → 18 passed (이전 10) |    ✅     |

### 2.1 Out of Scope (5+ 별 사이클 ejection)

- Group B (DataLoader mock) — production이 DataLoader 사용, test가 db.query 직접
  mock으로 우회 불가
- Group C (Authorization) — admin role context 필요
- Group D (Schema mismatch) — mock data가 schema와 안 맞아 resolver throw
- Group E (Auth header) — Clerk mock이 항상 null 반환
- Group F (JSON/error policy) — Apollo Server의 error handling 변경

---

## 3. Phases

### Phase 1 — 단일 sed 치환 (mini-do로 완료)

```bash
/usr/bin/sed -i '' "s|require('@/lib/db/drizzle')|require('@/lib/db')|g" \
  app/api/graphql/__tests__/route.test.ts
```

### Phase 2 — 검증 (mini-do로 완료)

- [x] grep → 0
- [x] jest → 17 fails → 9 fails (8 PASS)

### Phase 3 — PR + 머지

- [ ] commit (1 file 15 occurrences)
- [ ] PR 생성
- [ ] CI: +8 PASS 확인, 잔여 9 RED는 별 사이클로 인식

---

## 4. 비기능

- **Reversibility**: 1 sed = 1 file 15 hunks (실제로는 single commit)
- **Backward compat**: production 무영향
- **CI 시간**: 변화 없음 (route.test.ts는 이미 27 tests run)

---

## 5. 위험

| Risk                                                 | Likelihood | Impact | Mitigation                                            |
| ---------------------------------------------------- | ---------- | ------ | ----------------------------------------------------- |
| sed 치환이 다른 의도된 path 영향                     | Very Low   | Low    | grep으로 정확한 pattern만 매칭 (`'@/lib/db/drizzle'`) |
| 잔여 9건 RED가 본 사이클 결과로 보임                 | Low        | Low    | analyze.md에 5 ejection 명시                          |
| 추가 dataloader 등 별 사이클이 너무 많아 추적 어려움 | Medium     | Low    | 본 plan §1.1 표로 5 사이클 우선순위 사전 정의         |

---

## 6. 일정

| Phase                | 예상 | 누적    |
| -------------------- | ---- | ------- |
| Mini-do (식별 + sed) | 15분 | 0:15    |
| Plan + commit + push | 15분 | 0:30    |
| CI + 머지            | 15분 | 0:45    |
| Buffer               | 15분 | 1:00    |
| **총합**             |      | **~1h** |

---

## 7. 다음 단계

1. commit (1 file)
2. push + PR + 머지
3. analyze (Match ~95% 예상)
4. report + archive
5. **다음 사이클 우선순위** (5 신규 ejection 중):
   - tests-route-dataloader-mock (3건, 가장 큰 효과)
   - 또는 tests-db-fixture (사용자 옵션 결정)
   - 또는 tests-realtime-async-fix

---

## 8. 참조

- 부모: `docs/archive/2026-05/tests-stale-graphql-extras/` (ejection origin)
- 조부모: `docs/archive/2026-05/jest-clerk-esm-fix/`
