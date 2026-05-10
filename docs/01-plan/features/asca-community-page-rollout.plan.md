# ASCA Community Page Rollout — Plan

*Created: 2026-05-10*
*Phase: 01-plan*
*Status: Draft (검토 대기)*
*Parent: `asca-homepage-brand-rollout` (completed 2026-05-10, Match 100%) — OQ#4 채택의 후속 사이클*

---

## 1. Goal

`/community` 페이지 정식 구현. `asca-homepage-brand-rollout` 의 OQ#4 (2-layer CTA — 홈 → /community → 정회원 분기) 채택의 후속. 페이지는 `.agents/community-marketing-playbook.md` 의 A 트랙 운영을 그대로 사용자에게 노출하는 4 영역 구조로 작성한다.

**Success criteria**
- 홈 ClosingCTA의 "함께하는 서예 문화" 클릭 → `/community` 도착이 정상 화면
- 4 영역(Hero·三道 구조·100일 임서·카페 진입·정회원 분기)이 한 페이지에 한 호흡으로 흐른다
- DESIGN.md 토큰 + brand-guidelines L1/L2/L3 SSOT 1:1 인용
- 모바일·데스크톱 모두 격조 유지
- 정회원 가입 동선 분기는 페이지 하단의 절제된 1 영역으로 한정 (homepage OQ#4 채택대로)

## 2. Scope

**In scope**
- 페이지: `app/community/page.tsx`
- 컴포넌트 5종 (`components/community/{Hero,DaoArchitecture,ImseoCard,CafeEntry,MembershipBranch}.tsx`)
- 4언어 i18n 키 추가 (`lib/i18n/translations.ts`)
- 모바일 반응형 + WCAG AA + DESIGN.md 토큰
- E2E spec 추가 (`e2e/community.brand-rollout.spec.ts`)
- 홈 ClosingCTA `/community` 라우트 도착 화면 정상화

**Out of scope** (분리 사이클)
- 네이버 카페 / 카카오톡 오픈채팅 실제 개설 — 사무국 액션 (`community-marketing-playbook.md §3`)
- 100일 임서 챌린지 운영·신청 처리 — playbook §7 운영 매뉴얼
- 정회원 가입 폼·정관 — `asca-membership-flow` 별도 사이클
- 로그인·인증 통합 — 별도
- 동도 회원 데이터베이스 — Drizzle 스키마 확장은 별도

## 3. Deliverables

| # | 산출물 | 위치 |
|---|---|---|
| D1 | `/community` 페이지 라우트 + 메타데이터 | `app/community/page.tsx` |
| D2 | CommunityHero — 정체성 ("한 획을 함께 긋는 사람들") | `components/community/Hero.tsx` |
| D3 | DaoArchitecture — 三道 구조 (法古·創新·人書俱老) 카드 3종 | `components/community/DaoArchitecture.tsx` |
| D4 | ImseoCard — 100일 임서 챌린지 안내 (playbook §7 SSOT) | `components/community/ImseoCard.tsx` |
| D5 | CafeEntry — 네이버 카페·카톡 오픈채팅 진입 안내 | `components/community/CafeEntry.tsx` |
| D6 | MembershipBranch — 정회원 분기 (하단 절제 1 영역) | `components/community/MembershipBranch.tsx` |
| D7 | 4언어 i18n 키 추가 (~15~20 키) | `lib/i18n/translations.ts` |
| D8 | E2E spec | `e2e/community.brand-rollout.spec.ts` |

## 4. Milestones

| 구간 | 산출물 | 비고 |
|---|---|---|
| **Week 1** | D1 페이지 + D2 Hero + D3 DaoArchitecture | 정체성·三道 골격 |
| **Week 2** | D4·D5·D6 + D7 i18n + D8 E2E | 운영 안내 + 정회원 분기 + 검증 |

## 5. Inputs (참조 SSOT)

| 자산 | 사용 부분 |
|---|---|
| `.agents/community-marketing-playbook.md` §1.1 | 정체성 — "한 획을 함께 긋는 사람들" |
| `.agents/community-marketing-playbook.md` §1.3 | 三道 게시판 구조 (法古·創新·人書俱老) |
| `.agents/community-marketing-playbook.md` §1.4 | 핵심 루프 — 1주 1점 + 월간 큐레이션 7점 |
| `.agents/community-marketing-playbook.md` §7 | 100일 임서 챌린지 |
| `.agents/community-marketing-playbook.md` §8 | 톤 가드레일 (Words to use/avoid) |
| `.agents/brand-guidelines.md` §0 | L1/L2/L3 카피 시스템 |
| `.agents/brand-guidelines.md` §7 | 시각·서체 |
| `.agents/brand-guidelines.md` §8 | 슬로건 |
| `docs/02-design/features/asca-homepage-brand-rollout.design.md` | 1차 시범 패턴 (whileInView, 분리선, 인주색 절제) |
| `app/globals.css` | DESIGN.md 1.2.1-alpha 토큰 (homepage 사이클 D7 등록 완료) |

## 6. Dependencies & Risks

**Dependencies**
- DESIGN.md 토큰 (parent 사이클에서 정렬 완료)
- `<HanjaMark>` 컴포넌트 — Hero에 재사용 또는 다른 시각 모티프 결정 (OQ#5)
- 카페·카톡 URL — 사무국이 결정하여 환경변수 또는 i18n 키로 주입

**Risks**

| Risk | 대응 |
|---|---|
| 카페·카톡 URL 미결정 → 버튼 hardcoded placeholder 또는 disabled | i18n 키로 두고 사무국 결정 시 1줄 갱신 |
| Hero에 한자 표지 또 두면 홈과 시각 중복 | OQ#5에서 결정 — 다른 모티프(예: 작은 인장) 권장 |
| 100일 임서 운영 시작 전이라 신청 동선 불완전 | "곧 시작합니다" 또는 "관심 등록" 텍스트로 우회, 운영 시작 시 1줄 갱신 |
| 정회원 분기 영역이 너무 크면 OQ#4 2-layer 정신 훼손 | 페이지 하단 1 영역 한정, 페이지 면적 < 15% |

## 7. Acceptance Criteria

- [ ] `/community` 진입 시 4영역(Hero·三道·임서·카페·정회원분기) 한 페이지에서 모두 출력
- [ ] 4언어 전환 시 i18n SSOT 1:1 일치 (community-marketing-playbook §1·brand-guidelines §1 인용)
- [ ] 인라인 hex 0건 (DESIGN.md `design:lint` 통과)
- [ ] 정회원 분기 영역 면적 < 페이지 15% (OQ#4 2-layer 정신)
- [ ] 모바일 height 48px↑ (WCAG 2.5.5)
- [ ] 4언어 × 5영역 시각 회귀 E2E 통과
- [ ] 홈 ClosingCTA "함께하는 서예 문화" → `/community` 도착이 정상 화면 확인 (404 회피 — homepage-brand-rollout 사용자 경험 완성)

## 8. Open Questions

1. **Hero 시각 모티프** — 한자 표지 재사용 vs 새 모티프?
   - ✅ **Decision (2026-05-10, 채택): 작은 인장(印章) SVG 모티프 + L1 슬로건 텍스트.**
     - 홈 Hero `<HanjaMark variant="hero">` 와 시각 중복 회피.
     - 인장(낙관)은 "내 작품"의 표지 — playbook §1.4 핵심 루프(동도 작품 업로드 → 큐레이션)와 정합.
     - 인주색(`--vermillion`) 작은 사각 인장 SVG.
     - **Action**: design §4 `<SealMark>` 컴포넌트 신설 (text fallback 가능 — `<HanjaMark>` 패턴 재사용).

2. **카페·카톡 URL 주입 방식** — i18n 키 vs 환경변수?
   - ⏳ **Deferred (사무국 결정 대기)**: design 단계에서 `communityCafeNaverUrl`·`communityKakaoUrl` i18n 키 placeholder 운영. 사무국 결정 시 1줄 갱신. 임시 fallback `#` (disabled 처리).

3. **100일 임서 신청 동선** — 페이지 내 폼 / 카페 댓글 안내 / 사무국 이메일?
   - ✅ **Decision (2026-05-10, 채택): 카페 게시판 댓글 안내 + 사무국 이메일 보조.**
     - playbook §7 SSOT — 카페 게시판 댓글 한 줄("1기 함께합니다, ○○○")로 신청.
     - 페이지 내 폼은 인증·DB 의존성 폭발 (asca-membership-flow와 충돌).
     - **Action**: `<ImseoCard>` 에 "1기 모집 안내" + "참여하시려면 카페에 댓글로 신청해 주세요" + 카페 진입 링크 + 보조 메일 링크.

4. **정회원 분기 카드 형태** — 단순 텍스트+Link / 카드 박스 / 좌측 인주색 세로선?
   - ✅ **Decision (2026-05-10, 채택): 좌측 인주색 세로선 (BrandMessage 패턴 재사용).**
     - parent 사이클 BrandMessage에서 자리잡은 "작가 낙관 모티프" 일관 적용.
     - 카드 박스는 시각적으로 너무 강조 → OQ#4 2-layer 정신 훼손. 단순 텍스트+Link는 너무 약함.
     - **Action**: `<MembershipBranch>` 는 `border-l-2 border-[color:var(--vermillion)]/70` 패턴 재사용, 사이즈 작게(text-base 본문, h2 → h3로 한 단계 강등).

5. **메타데이터 OG 이미지** — 협회 작품 / SVG 한자 표지 / 한지 텍스처?
   - ✅ **Decision (2026-05-10, 채택): 정적 한지 텍스처 + 한자 표지 텍스트 합성.**
     - 협회 작품 1점은 작가 동의·저작권 이슈. SVG 한자 표지는 의도 cut(도착 대기).
     - 한지 텍스처 + 텍스트 합성은 협회 자산화 즉시 가능.
     - **Action**: `public/og/community.png` 신규 (1200x630) — 한지 배경 + "法古創新 · 人書俱老 / 한 획을 함께 긋는 사람들". 다국어 OG 분기는 본 사이클 out of scope.

## 9. Next Step

OQ 5건 중 4건 ✅ 채택, OQ#2 ⏳ 사무국 결정 대기. design 단계 진입:

`/pdca design asca-community-page-rollout` 으로 다음 작성:
- DESIGN.md 토큰 재활용 (parent 사이클 D7 PASS 결과)
- 4영역 컴포넌트 트리 (Hero·DaoArchitecture·ImseoCard·CafeEntry·MembershipBranch)
- `<SealMark>` 컴포넌트 사양 (OQ#1 후속)
- 4언어 i18n 키 표 (OQ#2 placeholder 운영 명시)
- E2E spec 사양

병렬 사무국 액션:
- 네이버 카페 / 카카오톡 오픈채팅 URL 결정 (OQ#2 unblock)
- 100일 임서 1기 모집 일정 결정 (D4 ImseoCard 카피 확정)

## 10. Related

| 관계 | 사이클 | 상태 |
|---|---|---|
| Parent | `asca-homepage-brand-rollout` | ✅ completed (2026-05-10, Match 100%) — OQ#4 후속 |
| Sibling | `asca-membership-flow` | 미시작 — 정회원 정관·심사·연회비 동선 |
| Sibling | `asca-about-page-rollout` | 미시작 — `/about` stub |
| Reference | `asca-homepage-brand-visual-regression-baseline` | 미시작 — D8 baseline 후속 |
| Reference | `community-marketing-playbook.md` | 컨텍스트 자산 (운영 매뉴얼) — 본 사이클은 그 운영을 사용자에게 노출하는 화면 |
