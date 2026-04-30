# Archive Index — 2026-05

| Feature            | Match Rate | Completed  | Documents                                                                                                                                                                         |
| ------------------ | :--------: | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| jest-clerk-esm-fix |    95%     | 2026-05-01 | [Plan](jest-clerk-esm-fix/jest-clerk-esm-fix.plan.md) / [Analysis](jest-clerk-esm-fix/jest-clerk-esm-fix.analysis.md) / [Report](jest-clerk-esm-fix/jest-clerk-esm-fix.report.md) |

## Highlights

- **jest-clerk-esm-fix** (95%, 2026-05-01): 부모 사이클 tests-stale-update의 G4
  unplanned ejection을 rev β 패턴(plan 전 mini-do 30분으로 가설 직접 검증)으로
  해결. jest.setup.js 10 LOC 변경 (JSX → React.createElement + Clerk mock)으로
  GraphQL 4 files 통째 unblock. **ASCA Tests passed 228 → 369 (+141, +62%)**. PR
  #10 admin merge `a4753f20`. 핵심 학습: rev β 효과 정량 검증 (Match 55→95%,
  unplanned ejection 1→0), next/jest transformIgnorePatterns AND 함정, ESM-only
  패키지는 transform보다 mock by default, JSX in jest.setup.js 금지.
