---
template: analysis
feature: jest-clerk-esm-fix
date: 2026-05-01
author: jaehong (jhlim725@gmail.com)
matchRate: 95
status: completed
mergedCommit: a4753f20
pr: 10
parentCycle: tests-stale-update (G4 ejection origin)
revision: rev β (사전 mini-do로 plan 가설 검증)
---

# jest-clerk-esm-fix — Gap Analysis

> **Match Rate: 95%** — G1 95.8% test pass (138/144), 잔여 6건은 OOS 명시. rev β
> 패턴 첫 검증 사이클로 0 unplanned ejection 달성.

---

## 1. Plan vs 구현 매핑

| Plan Item                                            | 구현 결과                                                     | 일치 |
| ---------------------------------------------------- | ------------------------------------------------------------- | :--: |
| Phase 1 — JSX → React.createElement                  | `jest.setup.js:61-67`                                         |  ✅  |
| Phase 1 — `@clerk/nextjs/server` jest.mock           | `jest.setup.js:70-75`                                         |  ✅  |
| Phase 1 — `.mjs`/transformIgnorePatterns 변경 불필요 | 둘 다 손대지 않음 (mock 회피 채택)                            |  ✅  |
| Phase 2 — auth.test.ts 단독 ≥56 PASS                 | 56/57 (logic stale 1건은 OOS)                                 |  ✅  |
| Phase 2 — 4 GraphQL files ≥95% PASS                  | 138/144 = 95.8%                                               |  ✅  |
| Phase 3 — 별 브랜치 + PR + 머지                      | `chore/jest-clerk-esm-fix` → PR #10 → admin squash `a4753f20` |  ✅  |

---

## 2. Goals (DoD) 결과

| Goal | 목표                             | 결과            | 충족 |
| ---- | -------------------------------- | --------------- | :--: |
| G1   | GraphQL 4 files RED → ≥95% GREEN | 138/144 = 95.8% |  ✅  |

**검증된 main 효과** (CI):

- PR #9 base: 362 total / 228 passed / 134 failed
- PR #10 base: **506 total / 369 passed / 137 failed**
- 차이: **+144 total, +141 passed, +3 failed (net)**

본 사이클 단독으로 ASCA Tests passed 카운트 **62% 증가** (228 → 369).

---

## 3. rev β 패턴 첫 검증

### 3.1 부모 (rev α) vs 본 사이클 (rev β) 비교

| 항목                       | tests-stale-update (rev α) | jest-clerk-esm-fix (rev β)    |
| -------------------------- | -------------------------- | ----------------------------- |
| Plan 작성 전 inspection    | grep 3-4건 (가설만)        | mini-do 30분 (가설 직접 검증) |
| Plan 가설 정확도           | 5건 중 2.4건 (48%)         | 3건 중 3건 (100%)             |
| Do 단계 unplanned ejection | G4 (1건)                   | 0                             |
| Plan estimate vs actual    | 5h → 2h (eject 후 단축)    | 1.5h → ~2h (CI 대기 포함)     |
| 실 효과                    | -2 fails (CI)              | +141 passed (CI)              |
| Match Rate                 | 55%                        | 95%                           |

### 3.2 rev β의 핵심 효과

1. **0 unplanned ejection** — Plan 작성 시점에 fact가 모두 검증됨 → do 단계가
   사후 문서화로 압축
2. **추정 정확도 ↑** — 1.5h 추정 vs 실 2h (CI 대기 포함). plan 가설 위에 가설
   쌓는 일이 없음
3. **Match Rate ↑** — 95% (rev α 55% 대비 +40pt)
4. **scope creep ↓** — 가설 검증 단계에서 "이 fix로 부족하다"는 신호를 plan 전에
   수집

---

## 4. 신규 발견 (root cause 3중)

### 4.1 next/jest의 `transformIgnorePatterns` AND 함정

next/jest 13+가 final config에 자체 패턴을 prepend:

```
"/node_modules/(?!.pnpm)(?!(geist)/)",
"/node_modules/.pnpm/(?!(geist)@)",
```

jest는 `transformIgnorePatterns`의 모든 패턴이 매칭되면 transform 안 함 (AND).
즉 user가 추가하는 패턴은 next의 hardcoded 패턴이 통과시키는 항목에만 적용 가능.
user override는 final config 후처리로 single 패턴으로 만들어야 함.

**미래 사이클을 위한 메모**: next/jest 사용 시 `getJestConfig()` 후처리:

```js
module.exports = async () => {
  const config = await createJestConfig(custom)()
  config.transformIgnorePatterns = [
    `/node_modules/(?!(${WHITELIST.join('|')})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return config
}
```

(본 사이클은 mock 접근으로 회피했으나, 다른 ESM 패키지 도입 시 위 패턴 필요)

### 4.2 babel preset regex 처리 충돌

next/babel preset이 `@clerk/backend` 같은 패키지의 regex literal을
transform하다가 `e.charCodeAt is not a function`. 이는 패키지 자체의 regex가
표준이 아닌 것보다 babel preset의 regex transformer 버그 가능성.

**회피책**: transform 자체를 안 함 (mock 또는 transformIgnorePatterns로 무시)

### 4.3 `.mjs` transform cascade 충돌

`'^.+\\.(js|jsx|ts|tsx|mjs)$'` 추가 시 jest.setup.js의 JSX(`<img>`) 처리에서
`Property declarations[0] of VariableDeclaration ...`. next/babel preset의 .mjs
path가 .js 처리에 cascade 영향.

**회피책**: jest.setup.js에서 JSX 사용 금지 (createElement)

---

## 5. 머지 결정

| 옵션                 | 선택 | 이유                                                                    |
| -------------------- | :--: | ----------------------------------------------------------------------- |
| 일반 머지 (CI green) |  ✗   | Code Quality fail (main의 pre-existing DESIGN.md prettier — 본 PR 무관) |
| Admin merge          |  ✅  | 부모 사이클 동일 패턴. Tests fail은 별 사이클 영역, E2E fail은 OOS      |

머지 commit: `a4753f20` (squash, branch deleted).

---

## 6. 학습 (Lessons)

1. **rev β 패턴 효과 정량 검증**: Match Rate 55% → 95% (+40pt), 0 unplanned
   ejection. PDCA 향후 default로 rev β 권장.
2. **mini-do의 적정 시간**: 30분 (3 가설 검증). 1시간 넘으면 mini-do가 아닌 do
   그 자체.
3. **mock by default**: ESM-only 패키지는 transform 시도보다 mock이 surgical.
   unit test scope에서만.
4. **next/jest의 transformIgnorePatterns AND 함정**: 별
   메모리(`feedback_next_jest_transform.md`)로 영구 보관 권장.
5. **JSX in jest.setup.js 금지**: cascade 충돌 위험. createElement 컨벤션화.

---

## 7. 권장 후속 사이클

본 사이클 머지 후 main 잔여:

| Priority | 사이클명                   | Scope                                        | 추정 |
| -------- | -------------------------- | -------------------------------------------- | ---- |
| 1        | tests-db-fixture           | Repository PG 의존 (사용자 옵션 결정 대기)   | ~4h  |
| 2        | tests-realtime-async-fix   | Realtime timeout 잔여 27건                   | 2-3h |
| 3 (new)  | tests-stale-graphql-extras | 본 PR 잔여 6건 logic stale (toHaveLength 등) | 1h   |
| 4        | tests-stale-member-extras  | updateMemberLevel + 9 stale                  | 2h   |

본 사이클 효과로 우선순위 1위 (jest-clerk-esm-fix) 종결. 다음 큰 효과는
tests-db-fixture (28+ tests unblock).

---

## 8. 결론

**Match Rate 95%** — Plan 모든 phase + G1 95.8% 충족. rev β 패턴의 첫 검증
사이클로 의의 확립.

`/pdca report jest-clerk-esm-fix` 진행 가능.
