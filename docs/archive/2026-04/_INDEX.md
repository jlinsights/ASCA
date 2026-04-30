# Archive Index — 2026-04

| Feature                     | Match Rate | Completed  | Documents                                                                                                                                                                                                                                                                                                             |
| --------------------------- | :--------: | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| asca-design-system-finalize |    98%     | 2026-04-25 | [Plan](asca-design-system-finalize/asca-design-system-finalize.plan.md) / [Design](asca-design-system-finalize/asca-design-system-finalize.design.md) / [Analysis](asca-design-system-finalize/asca-design-system-finalize.analysis.md) / [Report](asca-design-system-finalize/asca-design-system-finalize.report.md) |
| jest-infra-debt             |    100%    | 2026-04-29 | [Plan](jest-infra-debt/jest-infra-debt.plan.md) / [Design](jest-infra-debt/jest-infra-debt.design.md) / [Analysis](jest-infra-debt/jest-infra-debt.analysis.md) / [Report](jest-infra-debt/jest-infra-debt.report.md)                                                                                                 |
| tests-infra-cleanup         |    100%    | 2026-04-30 | [Plan](tests-infra-cleanup/tests-infra-cleanup.plan.md) / [Analysis](tests-infra-cleanup/tests-infra-cleanup.analysis.md) / [Report](tests-infra-cleanup/tests-infra-cleanup.report.md)                                                                                                                               |
| tests-stale-update          |    55%     | 2026-04-30 | [Plan](tests-stale-update/tests-stale-update.plan.md) / [Design](tests-stale-update/tests-stale-update.design.md) / [Analysis](tests-stale-update/tests-stale-update.analysis.md) / [Report](tests-stale-update/tests-stale-update.report.md)                                                                         |

## Highlights

- **asca-design-system-finalize** (98%, 2026-04-25): 부모 사이클
  `asca-design-system`(2026-04-24, 82% partial)의 Phase 3 보류분 완전 해소.
  `scripts/design-diff.ts` (~110 LOC) + `scripts/design-lint.ts` (~140 LOC, WCAG
  2.1 11 페어) 신설, DESIGN.md typography canonical 8 토큰 변환,
  `tailwind.config.ts` 5 semantic literal 추가, CI Code Quality job 3 step (lint
  advisory + diff/wcag hard) 통합. 3 hard gate 전부 PASS, DoD 8/8.

- **jest-infra-debt** (100%, 2026-04-29): CSO 2026-04-28 Finding #3 unblocker.
  PR #3 (`asca-api-security-hardening`)이 5종 jest 인프라 결함으로 3일째 머지
  차단된 상황을 해소. F1(jest.config.js graphql ESM whitelist) +
  F2(`@jest/globals` jest hoisting 함정 — root cause 발견) + F3(SSE/realtime
  per-file Node env) + F4(jest.setup.js TEST_ENV_DEFAULTS placeholder
  fallback) + F5(`.env.example` 신규 생성). 핵심 학습:
  `import { jest } from '@jest/globals'`은 babel-jest의 `jest.mock()` hoisting을
  비활성화 — global jest 사용 권장.

- **tests-infra-cleanup** (100%, 2026-04-30): 부모 사이클 jest-infra-debt 종료
  후 surface된 잔여 인프라 결함 2종 해결. P1(jsdom용
  `setImmediate`/`clearImmediate` 폴리필 — undefined 체크 후 `setTimeout`
  위임) + P2(e2e workflow `.env.test` 복사 — Next.js `NODE_ENV=test`는
  `.env.local` 미로드). 13 LOC 단일 PR (#8, `c92d9371`), 45분 소요. 핵심 학습:
  폴리필 컨벤션(undefined 체크 + 위임 + 동일 위치) 확립, Plan §5 Risk 섹션을 OOS
  경계 정의 도구로 활용 가능.

- **tests-stale-update** (55%, 2026-04-30, partial with deviation): 부모 사이클
  tests-infra-cleanup 종료 후 잔여 Tests job stale logic을 4 root cause 그룹으로
  분류. G1(Realtime timeout doNotFake — 로컬 53/80 해결, CI 미미) +
  G2(verifyMember dead-delete 100%) 본 사이클로, G3(Repository PG 의존) 사전
  ejection, G4(.mjs transform) do 단계 ejection. PR #9 admin merge `89a2eec0`,
  CI Tests 136→134 fails. 본 사이클의 진짜 가치는 fix(-2)보다 **4 신규 사이클의
  정확한 root cause 식별**: jest-clerk-esm-fix(1위), tests-db-fixture(2위),
  tests-realtime-async-fix(3위), tests-stale-member-extras(4위). 핵심 학습: 사전
  inspection rev β 권장(design에서도 mini-do 검증), CI≠로컬 환경별 검증 필수,
  PDCA 가치는 fix line이 아닌 정밀 분류.
