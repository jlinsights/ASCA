# asca-a11y-cleanup Gap Analysis (Check)

> **Feature**: asca-a11y-cleanup **Date**: 2026-07-05 **Branch**:
> fix/a11y-focus-trap (PR #43 + #44 stacked) **Analyzer**: bkit gap-detector +
> 세션 게이트 실측 **Match Rate**: **100%**

---

## 1. 판정 요약

| 항목                          | 결과                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --- | ------------------- |
| FR-01 아이콘 버튼 aria-label  | ✅ 10/10 (playback 8 + analysis-panel 닫기 + detail-view audio)                                                              |
| FR-02 라벨↔컨트롤 연결       | ✅ 21/21 (useId 파생 id, select=htmlFor/id·그룹=role+aria-labelledby·토글=aria-pressed)                                      |
| FR-03 키보드 접근             | ✅ 3/3 (overview-tab·gallery-view=role button+Enter/Space, comparison-viewer=role application+방향키·±, handlePan 반환·배선) |
| FR-04 포커스 트랩             | ✅ hooks/use-focus-trap.ts + lightbox 통합(trapRef·tabIndex −1) + 테스트 3케이스                                             |
| FR-05 index key 제거          | ✅ 대상 8디렉터리 `key={index                                                                                                | i   | tagIndex}` grep 0건 |
| FR-06 게이트                  | ✅ .eslintrc 8글롭·5룰 error + jest-axe 스모크 9컴포넌트 + jest.setup 확장                                                   |
| Out of Scope 침범 (plan §2.2) | ✅ 없음 — 기능 버그 17건 미수정 보존, diff는 a11y 속성·key·트랩 한정                                                         |

## 2. 게이트 실측 (세션 검증, 2026-07-05)

| 게이트                         | 결과                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type-check`                   | 0 error                                                                                                                                            |
| `lint` (전체 + 대상 8디렉터리) | 0 error — **fail-injection으로 exit 1 작동 검증**                                                                                                  |
| `test:ci`                      | **401/401** (기존 389 + axe 스모크 9 + 트랩 3)                                                                                                     |
| `build`                        | 성공 (PR-2 변경 포함 재실행)                                                                                                                       |
| `prettier --check`             | clean                                                                                                                                              |
| `design:wcag` / `design:lint`  | 11/11 / pass                                                                                                                                       |
| GitHub CI (PR #43·#44)         | ✅ 전 체크 PASS (Code Quality·Tests·E2E·Security·Build·Vercel·CodeRabbit) — #43 `db11ce80`·#44 `713747cf` 머지, 머지된 main test:ci 401/401 재확인 |

## 3. 허용된 design 편차 (감점 없음, 기록용)

| 편차                                                            | 근거                                                                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| detail-view 아이콘 버튼 5개(줌 3·다운로드·공유) aria-label 추가 | D-2 동종 결함 확장 원칙                                                                                    |
| settings-panel 체크박스 4개 id/htmlFor + aria-label 병기        | design "조건부" 예고 — `control-has-associated-label`이 래핑 label 미인식(룰 한계)이라 발동                |
| analysis-panel key = 순수 콘텐츠 문자열                         | `react/no-array-index-key`가 `${str}-${index}` 복합 template key도 거부 → design §3 표기보다 엄격하게 적용 |
| overview-tab Progress aria-label                                | axe 스모크가 발견한 lint 밖 추가 결함 — 게이트 상호보완 실증                                               |

## 4. Gap 목록

- 🔴 Missing: **0건**
- 🟡 Out-of-scope 추가: **0건**
- 🔵 Design≠구현 불일치: **0건**

## 5. 결론

Match Rate 100% (≥90%) → **iterate 불요, report 진행 가능**. 머지
완료(2026-07-06): #43 squash → #44 base retarget + `--onto` rebase → squash.
stacked child 보호를 위해 #43은 `--delete-branch` 없이 머지 후 #44 머지 뒤
브랜치 일괄 삭제.
