# asca-gallery-cultural-bugfix Gap Analysis (Check)

> **Feature**: asca-gallery-cultural-bugfix **Date**: 2026-07-07 **Branch**:
> main (PR #45 `3da4ce79` · #46 `37ee2a08` · #47 `60737382` 머지 완료)
> **Analyzer**: bkit gap-detector + 세션 게이트 실측 **Match Rate**: **100%**

---

## 1. 판정 요약 (17/17)

| 그룹                          | 결과                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A. stroke-animation 4건       | ✅ pausedElapsedRef 재개 보존·loopMode single 구현·loopTimeoutsRef 정리(stop/unmount)·characterImageRef RAF 캐시 |
| B. artwork-comparison 3건     | ✅ grid 폴백 케이스·isAnalyzing(state+ref 동기 가드)+버튼 disabled·콜백 ref null 대입                            |
| C. gallery-grid 2건           | ✅ 버튼 animate scale 1 복구·onEvent 3지점 래퍼 배선(image_open/share/navigate)                                  |
| D. virtual-exhibition 3건     | ✅ guideAudioRef 분리·fullscreenchange 단일 소스+catch·play() then/catch 상태 동기화                             |
| E. accessibility 2건          | ✅ auto=matchMedia+change 리스너·cleanup(스타일 제거+dark 마운트 상태 복원)                                      |
| F. 개별 3건                   | ✅ zoom fullscreen 수동 setState 제거·todayKey 마운트 후 판정·switch 블록 스코프                                 |
| G. 테스트                     | ✅ 7파일 20케이스 (fail-first 8건 RED→GREEN 절차 이행)                                                           |
| Out of Scope 침범 (plan §2.2) | ✅ 0건 — 3개 머지 커밋 diff에 JSDoc·perf·타입 수정 미포함                                                        |

## 2. 허용된 design 편차 (기록용)

| 편차                                               | 근거                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| B-2 `isAnalyzingRef` 추가 (design엔 state만 명세)  | state 가드는 stale closure로 동기 연속 호출 미차단 — **fail-first 테스트가 발견**한 실결함 대응 |
| A-4 initializeAnimation의 1회성 `new Image()` 유지 | 결함은 RAF 매 프레임 경로 — 1회성 로드는 성능 무해, onload 즉시 그리기 동작 보존                |
| animate deps에서 `characterImage` 제거             | A-4 캐시 전환으로 미사용 — exhaustive-deps 경고 해소                                            |
| C-1 자동 테스트 부재                               | design D-6 사전 결정 (framer-motion jsdom 비결정)                                               |

## 3. 게이트 실측

| 게이트                     | 결과                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| GitHub CI (PR #45·#46·#47) | ✅ 3개 전부 전 체크 PASS 후 squash 머지                            |
| 머지된 main `test:ci`      | ✅ 421/421 — 단, **1회 간헐 실패 관측**(아래 §4) 후 연속 2회 GREEN |
| `type-check`               | ✅ 0 error (머지된 main)                                           |
| 신규 테스트 격리 실행      | ✅ components/**tests** 32/32                                      |
| a11y 게이트 (전 사이클)    | ✅ lint 5룰 0 error·axe 스모크 유지                                |

## 4. 관측 사항 — 간헐 테스트 실패 1회

머지 직후 첫 `test:ci`에서 1개 스위트 3건 실패 → 즉시 재실행 2회 연속 421/421
GREEN, 신규 테스트 격리 실행도 GREEN. 당시 로그가 요약만 캡처되어 실패 스위트
미특정. 신규 테스트의 전역 mock(matchMedia·fullscreenElement)은 jest 파일별
jsdom 격리로 교차 오염 불가 구조. **기존 스위트의 간헐성으로 추정**되나 재현 시
스위트명 확보 → 별도 debt 후보로 등재 예정. Gap 판정에는 불포함(변경 스코프와
인과 미확인).

## 5. Gap 목록

- 🔴 Missing: **0건** · 🟡 Out-of-scope 추가: **0건** · 🔵 불일치: **0건**

## 6. 결론

Match Rate 100% (≥90%) → **iterate 불요, report 진행 가능**. 잔여: design §3
수동 스팟 체크(stroke 재생·갤러리 호버 버튼·전시 음악 토글)는 사용자 확인 권장.
