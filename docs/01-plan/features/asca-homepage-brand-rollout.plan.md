# ASCA Homepage Brand Rollout — Plan

_Created: 2026-05-10_ _Phase: 01-plan_ _Status: Draft (사용자 검토 대기)_
_Owner: TBD_

---

## 1. Goal

`brand-guidelines.md §2` 5섹션 구성과 `§9 Step 2` 롤아웃 지침을 Next.js 14 App
Router 홈페이지에 구현한다. 4언어 i18n(ko/en/ja/zh) 인프라와 ASCA `DESIGN.md`
토큰 위에서 동작해야 한다.

**Success criteria**

- 홈페이지 메인 진입 시 `法古創新 · 人書俱老` 한자 표지 + 모국어 L1 슬로건 + L2
  헤더 카피가 한 화면에서 즉시 보인다.
- 4언어 전환 시 §1의 L2 SSOT 문장이 정확히 출력된다.
- DESIGN.md 색상·서체 토큰을 위반하지 않고 brand-guidelines §7과 정렬된다.
- Lighthouse 성능 ≥ 90, LCP < 2.5s, CLS < 0.1.

## 2. Scope

**In scope**

- 홈페이지 (`app/page.tsx`) 5섹션 — Hero / Philosophy / What We Do / Brand
  Message / Closing CTA
- 4언어 카피 i18n 키 추가 (ko/en/ja/zh)
- Hero 한자 표지 + L1 슬로건 컴포넌트
- 5섹션 각 컴포넌트
  (`components/home/{Hero,Philosophy,WhatWeDo,BrandMessage,ClosingCTA}.tsx`)
- 4 CTA 버튼(협회 소개 / 전시·공모전 / 회원 가입 / 교육 프로그램) 라우팅
- 시각 토큰 정렬 점검 (먹색·여백색·인주색·담묵 회색 — DESIGN.md vs
  brand-guidelines.md §7)

**Out of scope** (별도 사이클)

- 협회 소개 페이지 L3 풀 소개문 렌더링 (`asca-about-page-rollout` 후속)
- 전시·공모·교육 상세 페이지 (`asca-exhibition-port-handoff` 등 기존 사이클
  활용)
- 회원 가입 인증 흐름 (`asca-auth-rollout` 별도)
- 도록·포스터 인쇄물 (`.agents/dorok-poster-design-brief.md` 외부 디자이너 트랙)
- 백오피스·CMS 연동

## 3. Deliverables

| #   | 산출물                                                 | 위치                                                            |
| --- | ------------------------------------------------------ | --------------------------------------------------------------- |
| D1  | Hero 컴포넌트 + 한자 표지 SVG/Web Font                 | `components/home/Hero.tsx`                                      |
| D2  | Philosophy 섹션                                        | `components/home/Philosophy.tsx`                                |
| D3  | What We Do 5-row 표 컴포넌트                           | `components/home/WhatWeDo.tsx`                                  |
| D4  | Brand Message 섹션                                     | `components/home/BrandMessage.tsx`                              |
| D5  | Closing CTA + 4 버튼                                   | `components/home/ClosingCTA.tsx`                                |
| D6  | 4언어 i18n 키 8종 (L1 슬로건·L2 헤더·5섹션 본문·4 CTA) | `messages/{ko,en,ja,zh}.json`                                   |
| D7  | DESIGN.md ↔ brand-guidelines §7 색상 토큰 정렬 보고서 | `docs/02-design/features/asca-homepage-brand-rollout.design.md` |
| D8  | E2E 4언어 시각 회귀 테스트                             | `e2e/home.brand-rollout.spec.ts`                                |

## 4. Milestones

| 구간          | 산출물                                 | 비고                                     |
| ------------- | -------------------------------------- | ---------------------------------------- |
| **Week 1**    | D7 토큰 정렬 → D1 Hero → D2 Philosophy | 토큰 충돌 해결이 선행                    |
| **Week 2**    | D3·D4·D5 + D6 i18n + D8 E2E            | E2E 4언어 × 5섹션 모두 시각 회귀         |
| **Week 2 끝** | 스테이징 배포 + 1차 디자인 리뷰        | `/plan-design-review` 또는 사무국장 검토 |

## 5. Inputs (참조 SSOT)

| 자산                                   | 사용 부분                              |
| -------------------------------------- | -------------------------------------- |
| `.agents/brand-guidelines.md` §0       | 카피 시스템 L1/L2/L3 단계 정의         |
| `.agents/brand-guidelines.md` §1       | 4언어 L2/L3 본문                       |
| `.agents/brand-guidelines.md` §2       | 홈페이지 5섹션 구성 (1:1 매핑)         |
| `.agents/brand-guidelines.md` §7       | 색상·서체·이미지 가이드                |
| `.agents/brand-guidelines.md` §8       | L1 슬로건 8종                          |
| `docs/02-design/DESIGN.md`             | 기존 ASCA 디자인 토큰 (Phase 1~4 완료) |
| `.agents/product-marketing-context.md` | 톤·금지 어휘 (Words to avoid)          |

## 6. Dependencies & Risks

**Dependencies**

- ASCA i18n 4언어 인프라 (이미 운영 중)
- DESIGN.md 토큰 (Phase 1~4 완료, design:lint/diff/wcag 3 hard gate 통과)
- 한자 표지 노출 방식 결정 — 시스템 폰트 vs 명조 web font vs SVG 자산

**Risks** | Risk | 대응 | |---|---| | DESIGN.md 색상 토큰과 brand-guidelines §7
색상 표현이 다른 어휘 (예: "먹색" vs `--color-ink-900`) | D7 정렬 보고서가 첫
산출물 — Week 1 첫날 처리 | | 한자 표지 폰트 라이선스·크기 | SVG 자산화로 우회,
web font 채택 시 서브셋 필요 | | 일본어·중국어 본문 줄바꿈·자간이 한국어 기준
레이아웃과 충돌 | i18n 키 단위로 line-height·letter-spacing 분기, 4언어 시각
회귀 테스트가 검증 | | 4 CTA 버튼 라우팅 대상 페이지가 일부 미완성(전시·교육 등)
| 미완성 라우트는 임시 안내 페이지 또는 외부 링크로 처리 |

## 7. Acceptance Criteria

- [ ] `/`(홈) 진입 시 5섹션이 §2 그대로 출력 (위 D1~D5 검수)
- [ ] 4언어 전환 시 L1 슬로건 8종이 §8 SSOT와 1:1 일치
- [ ] DESIGN.md 토큰만 사용 — 인라인 hex 색상 사용 0건
- [ ] Lighthouse: Performance ≥ 90, LCP < 2.5s, CLS < 0.1
- [ ] WCAG 2.1 AA 명도비 통과 (먹색/백색·인주색/백색 모두)
- [ ] 4언어 × 5섹션 시각 회귀 E2E 통과
- [ ] `/plan-design-review` 또는 사무국장 1차 리뷰 승인

## 8. Open Questions

1. **한자 표지 `法古創新 · 人書俱老` 의 폰트** — 명조 web font, SVG 자산, 이미지
   자산 중 어느 것?
   - ✅ **Decision (2026-05-10, 채택): SVG 자산 (협회 작가 친필 디지털화).**
     - 8자(法古創新·人書俱老 + 가운뎃점)는 폰트 라이선스 우회 가치가 낮다.
     - 협회 작가가 직접 쓴 친필을 SVG로 디지털화하면 협회 정체성과 1:1 일치 —
       어떤 web font도 손글씨 격조를 못 따라간다.
     - SVG는 모든 화면에서 픽셀 무손실, 색상 토큰 자동 적용, LCP 영향 최소.
     - 대안 web font 후보(Noto Serif CJK·IropkeBatang)는 SVG 제작 지연 시 임시
       fallback으로만.
     - **Action**: design 단계에서 SVG 친필 자산 제작 task 신설 (협회 작가 1인
       의뢰).

2. **4언어 자동 감지 vs 사용자 명시 선택** — 첫 진입 시 기본 언어는 한국어
   고정인가, Accept-Language인가?
   - ✅ **Decision (2026-05-10, 채택): 한국어 고정 + 사용자 명시 전환만.**
     - 협회 정체성·1차 ICP 모두 한국 — Accept-Language 자동 감지는 신규 진입자
       혼란 위험.
     - 국제 교류 트랙(playbook §8)은 별도 진입 동선(영문 초대문 + 직접 링크).
     - 다음 사이클에서 Accept-Language 도입 검토 가능 — 본 사이클 비스코프.

3. **Hero에 영상·작품 이미지·서예 영상 등 멀티미디어 배경을 둘 것인가, 정적 한지
   질감만으로 끝낼 것인가?** (성능·격조 trade-off)
   - ✅ **Decision (2026-05-10, 채택): 정적 한지 질감 + SVG 한자 표지만.**
     - 격조·LCP 모두 만족 — Lighthouse Acceptance(LCP < 2.5s) 안전 마진 확보.
     - 영상은 What We Do 또는 Brand Message 섹션에서 작품 클로즈업 1점 정도로
       절제.
     - 작품 영상 자산 보유 시 다음 사이클에 추가 가능.

4. **회원 가입 CTA가 가는 첫 페이지** — 동도(同道) 커뮤니티 카페 안내인가, 협회
   정회원 가입인가? (community-marketing-playbook의 "동도" 정체성과 정회원
   제도가 다른 층위)
   - ✅ **Decision (2026-05-10, 채택): 2-layer CTA. CTA 버튼은 "함께하는 서예
     문화" → `/community`(동도 안내) 도착, 페이지 하단에서 정회원 신청으로
     분기.**
     - 신규 진입자에게 정회원 심사·연회비는 진입 장벽이 높다 → 동도가 더 낮은 첫
       단계.
     - community-marketing-playbook §1.1 "위계 없이 평등한 동도(同道)" 정신과도
       부합.
     - 정회원 가입 동선은 별도 사이클 `asca-membership-flow` 로 분리 (Plan §2
       Out of scope 이미 명시).
     - **Action**: design 단계에서 `/community` 페이지의 1차 와이어프레임에
       "동도 소개 + 100일 임서·이번 주 작품 안내 + 카페·카톡 진입 + (하단)
       '정회원이 되고 싶으시면 이쪽으로' 링크" 4개 영역 명시.

5. **CTA 버튼 4종을 한 행에 둘 것인가, 2x2 그리드인가?** (모바일 반응형 영향)
   - ✅ **Decision (2026-05-10, 채택): 데스크톱 4-in-row, 모바일 2x2 stack.**
     - 4-in-row가 한 화면 내 4 동선 노출에 유리.
     - 모바일은 2x2가 가독성·터치 영역 모두 우수.
     - **Action**: design §6 그리드 사양 갱신 + Tailwind breakpoint `md:` 분기.

## 9. Next Step

OQ 5건 모두 채택 (2026-05-10) → design 단계 완료
(`docs/02-design/features/asca-homepage-brand-rollout.design.md`). 다음 단계는
do 진입 또는 사무국 회람.

**do 진입 시:** `/pdca do asca-homepage-brand-rollout` — D7 토큰 정렬 → D1 Hero
→ D2~D5 → D6 i18n → D8 E2E. SVG 친필 도착 전까지 fallback (Noto Serif CJK).
**사무국 회람 시:** plan + design 두 문서 + 디자이너 브리프 묶어 사무국·이사회
검토 → SVG 친필 작가 의뢰 발주 후 do.

후속 사이클 후보:

- `asca-about-page-rollout` (L3 풀 소개문 + 협회 연혁·임원·정관)
- `asca-membership-flow` (정회원 vs 동도 분리 제도 정립)
- `asca-international-page` (해외 동도·국제 교류 전용 페이지)
