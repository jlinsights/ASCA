# ASCA Community Page Rollout — Design

*Created: 2026-05-10*
*Phase: 02-design*
*Status: Draft (do 진입 전 검토)*
*Plan: `docs/01-plan/features/asca-community-page-rollout.plan.md`*
*Parent: `asca-homepage-brand-rollout` (completed 2026-05-10, Match 100%) — D7 토큰·HanjaMark·whileInView 패턴·인주색 세로선 모두 자산화 됨*
*DESIGN.md: 1.2.1-alpha + parent 사이클 라이트/다크 토큰 등록 후*

---

## 0. Convention Note — ASCA 정렬

| 항목 | 채택 |
|---|---|
| 페이지 라우트 | `app/community/page.tsx` (i18n routing 미사용 — LanguageContext 패턴 일관) |
| 컴포넌트 위치 | `components/community/` 신규 (도메인별 폴더 컨벤션 — admin/artists/exhibition 등) |
| i18n | `lib/i18n/translations.ts` 키 추가 (parent 사이클 패턴 재사용) |
| 시각 자산 재사용 | `<HanjaMark>` (footer variant 작게 재사용 또는 인장 SVG 신규) |

`/community` 라우트는 ASCA에 미존재 — 본 사이클이 첫 신설.

---

## 1. Overview

community-marketing-playbook §1·§3·§7 운영 매뉴얼을 사용자에게 노출하는 4영역 페이지. parent 사이클의 HanjaMark·whileInView·인주색 세로선·divide-y 패턴을 재활용해 일관성 확보.

**Plan Decision 반영**
- ✅ OQ#1 작은 인장(印章) SVG 모티프 (`<SealMark>`) — Hero 정체성
- ⏳ OQ#2 카페/카톡 URL 사무국 결정 대기 → i18n 키 placeholder 운영
- ✅ OQ#3 카페 댓글 안내 + 사무국 이메일 보조 — 100일 임서 신청
- ✅ OQ#4 좌측 인주색 세로선 — 정회원 분기 (BrandMessage 패턴 재사용)
- ✅ OQ#5 한지 텍스처 + 텍스트 합성 — OG 이미지

---

## 2. 토큰 매핑 (parent D7 결과 재사용)

parent 사이클에서 globals.css 라이트·다크 모두 정렬 완료. 변경 없음.

| 사용처 | 토큰 |
|---|---|
| 페이지 배경 | `--background` (rice-paper) |
| 본문 텍스트 | `--foreground` (ink-black) |
| 보조 텍스트 | `--muted-foreground` |
| 인장 SVG fill / 분기 세로선 | `--vermillion` |
| 정회원 분기 강조선 | `--vermillion` (BrandMessage 동일 패턴) |
| CTA 버튼 (카페 진입) | `--primary` (scholar-red) |
| 카드 표면 | `--card` |

---

## 3. 컴포넌트 트리

```
app/community/page.tsx                                   # i18n LanguageContext 패턴
└─ <CommunityPage />
   ├─ <CommunityHero />                                  # D2
   │  ├─ <SealMark />                                    # D2 — 작은 인장 모티프
   │  ├─ <SloganL1 />                                    # "한 획을 함께 긋는 사람들"
   │  └─ <SubcopyL2 />                                   # 정체성 본문
   │
   ├─ <DaoArchitecture />                                # D3
   │  └─ 3 Card (法古·創新·人書俱老)                       # 각 카드: 한자 + 한국어 + 본문
   │
   ├─ <ImseoCard />                                      # D4
   │  ├─ <SectionTitle />                                # 100일 임서 챌린지
   │  ├─ <ImseoMeta />                                   # 정원·기간·신청 동선 (OQ#3 채택)
   │  └─ <CafeCommentLink />                             # 카페 댓글 안내 + 보조 메일
   │
   ├─ <CafeEntry />                                      # D5
   │  ├─ <SectionTitle />                                # 카페·오픈채팅 진입
   │  ├─ <NaverCafeLink />                               # OQ#2 deferred — placeholder
   │  └─ <KakaoOpenChatLink />                           # OQ#2 deferred — placeholder
   │
   └─ <MembershipBranch />                               # D6
      ├─ blockquote + 좌측 인주색 세로선 (BrandMessage 패턴)
      ├─ <h3>                                            # 정회원이 되고 싶으시면
      └─ <Link href="/membership"> (또는 /about)
```

**파일 위치**
- 페이지: `app/community/page.tsx`
- 컴포넌트: `components/community/{Hero,DaoArchitecture,ImseoCard,CafeEntry,MembershipBranch}.tsx`
- 신규 표지: `components/brand/seal-mark.tsx` (D2 — `<HanjaMark>` 옆 짝)

---

## 4. SealMark 컴포넌트 (OQ#1 채택)

### 4.1 자산 사양

| 항목 | 값 |
|---|---|
| 형태 | 정사각 인장(印章) — 한자 1~2자 (예: "書" 또는 "同道") |
| 색상 | fill `var(--vermillion)`, 텍스트 `var(--rice-paper)` 또는 `var(--background)` |
| 크기 | viewBox `0 0 100 100`, hero variant `w-16 h-16 md:w-20 md:h-20` |
| 글자 | text fallback (Noto Serif CJK) — 협회 작가 친필 인장 도착 시 SVG 교체 |
| 라이선스 | 협회 자산 (작가 의뢰는 사무국 액션, fallback 운영) |

### 4.2 컴포넌트 인터페이스

```tsx
// components/brand/seal-mark.tsx
type SealMarkProps = {
  variant: 'hero' | 'inline'   // 페이지 hero 큰 사이즈 vs 본문 inline 작은 사이즈
  text?: string                 // 기본: '同道'
  ariaLabel?: string            // 기본: '협회 인장 동도'
  className?: string
}
```

### 4.3 Fallback (SVG 도착 전)

- 정사각 div + bg-vermillion + 가운데 한자 텍스트 (text-rice-paper, font-serif)
- 약간의 회전 (-3deg ~ +3deg)으로 손도장 자연스러움 표현
- SVG 도착 시 `<img src="/brand/seal-mark.svg">` 또는 인라인 SVG로 교체

---

## 5. i18n 키 표 (D7)

| 키 | ko | en | ja | zh |
|---|---|---|---|---|
| `communityHeroL1` | 한 획을 함께 긋는 사람들 | One Stroke, Together | 一筆を共にひく人々 | 共執一筆者 |
| `communityHeroBody` | 동양서예협회는 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 동도(同道)들의 모임을 엽니다. | (영문 SSOT) | (일문 SSOT) | (중문 SSOT) |
| `communityDaoTitle` | 三道 — 함께 걷는 길 | The Three Ways | 三道 — ともに歩む道 | 三道 — 共行之道 |
| `communityDaoBeopgo` | 法古 · 옛 법을 익히다 | Beopgo · Learning the Old | 法古 · 古典に学ぶ | 法古 · 學古之法 |
| `communityDaoChangsin` | 創新 · 새로움을 열다 | Changsin · Opening the New | 創新 · 新たをひらく | 創新 · 開啟新境 |
| `communityDaoInseoGuno` | 人書俱老 · 글씨와 사람이 함께 깊어지다 | Inseo Guno · Maturing Together | 人書俱老 · 書と人がともに深まる | 人書俱老 · 書與人共老 |
| `communityImseoTitle` | 100일 임서 — 한 획의 시간 | 100-Day Imseo Practice | 100日臨書 | 百日臨書 |
| `communityImseoBody` | 매일 한 획 또는 한 자(字)를 임서로 옮기며, 글씨와 사람이 함께 깊어지는 시간을 만듭니다. | (영문 SSOT) | (일문 SSOT) | (중문 SSOT) |
| `communityImseoCtaLabel` | 1기 모집 안내 보기 | View Cohort 1 Details | 1期募集案内 | 第一期招募指南 |
| `communityCafeTitle` | 동도들의 자리 — 카페와 오픈채팅 | Where the 동도 Gather | 同道の集う場 | 同道相聚之處 |
| `communityCafeBody` | 작품 공유와 합평, 운영 안내가 오가는 자리입니다. | (영문 SSOT) | (일문 SSOT) | (중문 SSOT) |
| `communityCafeNaverLabel` | 네이버 카페 입장 | Enter Naver Café | Naverカフェへ | 進入Naver社群 |
| `communityCafeKakaoLabel` | 카카오톡 오픈채팅 | KakaoTalk Open Chat | KakaoTalkオープンチャット | KakaoTalk公開聊天 |
| `communityMembershipTitle` | 정회원이 되고 싶으시면 | Becoming a Full Member | 正会員になるには | 加入正式會員 |
| `communityMembershipBody` | 정회원은 협회 의사결정과 정기 전시 출품 등에 함께하시는 분들입니다. 절차와 정관은 별도 안내를 따릅니다. | (영문 SSOT) | (일문 SSOT) | (중문 SSOT) |
| `communityMembershipCtaLabel` | 정회원 안내 보기 | About Full Membership | 正会員のご案内 | 正會員介紹 |
| `communityCafeNaverUrl` | (사무국 결정 대기 — placeholder `#`) | (동일) | (동일) | (동일) |
| `communityKakaoUrl` | (사무국 결정 대기 — placeholder `#`) | (동일) | (동일) | (동일) |

**총 약 18 키 × 4언어 ≈ 72 entry** (URL 2키는 placeholder).

URL i18n 키는 사무국 결정 후 한 줄 갱신으로 4언어 전체 반영.

---

## 6. 4영역 와이어프레임

### 6.1 CommunityHero
- max-w-3xl 중앙 정렬
- `<SealMark variant="hero">` 인장 + L1 슬로건 (display-md) + body (body-lg)
- whileInView once:true (parent 패턴)

### 6.2 DaoArchitecture
- 3 카드 그리드 — `grid-cols-1 md:grid-cols-3`
- 각 카드: 한자 표지(text-3xl) + 한국어 부제 + 본문
- 인주색 점 1개 (도장 모티프 재현) — 카드 좌상단
- 모바일은 stack, 데스크톱은 3-col

### 6.3 ImseoCard (OQ#3 채택)
- 1 영역 (카드 박스 X — DaoArchitecture와 시각 차별)
- `<SectionTitle>` + meta (정원 30명 / 기간 100일) + 본문
- CTA 1개: "1기 모집 안내 보기" → 카페 댓글 진입 (OQ#2 placeholder)
- 보조: 사무국 메일 mailto 링크

### 6.4 CafeEntry
- 2 카드 — 네이버 카페 / 카카오톡 오픈채팅
- 각 카드: 채널 명 + 짧은 안내 + CTA 버튼
- OQ#2 placeholder 시 버튼은 `aria-disabled="true"` + tooltip "곧 안내드립니다"

### 6.5 MembershipBranch (OQ#4 채택)
- BrandMessage 패턴 재사용: `<blockquote>` + `border-l-2 border-[color:var(--vermillion)]/70`
- 사이즈 작게: h3(text-xl), body(text-base)
- 페이지 전체 면적 < 15% (Acceptance Criteria)
- CTA 1개: "정회원 안내 보기" → `/membership` 또는 `/about` (`asca-membership-flow` 시작 시 정식 라우트)

---

## 7. E2E (D8)

`e2e/community.brand-rollout.spec.ts` 신규 — parent 사이클 spec 패턴 재사용.

| 검증 | 셀렉터·기준 |
|---|---|
| 페이지 진입 | `page.goto('/community')` 200 응답 |
| 4영역 + Hero = 5영역 모두 visible | section heading id 5종 |
| `<SealMark>` 인주색 fill | computed style `var(--vermillion)` |
| 4언어 × 5영역 시각 통일성 | parent 패턴 — boundingBox X 좌표 ±2px |
| OQ#2 placeholder 안전 동작 | URL 키 `#` 시 버튼 aria-disabled |
| MembershipBranch 면적 < 15% | bounding box height / page height |

baseline 생성은 `asca-homepage-brand-visual-regression-baseline` 사이클로 일괄.

---

## 8. Acceptance Criteria 매핑 (Plan §7)

| Plan 기준 | Design 산출물 |
|---|---|
| 4영역 모두 출력 | §3 컴포넌트 트리 5개 (Hero + 4영역) |
| 4언어 SSOT 1:1 | §5 i18n 키 표 18키 × 4언어 |
| 인라인 hex 0건 | §2 토큰 매핑 — 모두 var() 사용 |
| 정회원 분기 면적 < 15% | §6.5 사이즈 강등 + BrandMessage 패턴 |
| 모바일 height ≥ 48px (WCAG 2.5.5) | parent 사이클 Button 패턴 재사용 — `h-12 md:h-14` |
| 4언어 × 5영역 E2E | §7 spec 작성 + baseline 분리 사이클 |
| 홈 ClosingCTA 도착 정상 | `/community` 라우트 신설로 자동 해소 |

---

## 9. OQ 결정 반영 표 (2026-05-10)

| OQ | 결정 | 적용 위치 |
|---|---|---|
| ✅ #1 Hero 시각 모티프 | 작은 인장 SVG (`<SealMark>`) | §4 SealMark 컴포넌트 신설 |
| ⏳ #2 카페·카톡 URL | i18n 키 placeholder + 사무국 결정 대기 | §5 `communityCafeNaverUrl`·`communityKakaoUrl` placeholder, §6.4 aria-disabled fallback |
| ✅ #3 100일 임서 신청 동선 | 카페 댓글 안내 + 사무국 메일 보조 | §6.3 ImseoCard 구조 |
| ✅ #4 정회원 분기 카드 | 좌측 인주색 세로선 (BrandMessage 패턴) | §6.5 MembershipBranch — `<blockquote>` + `border-l-2 var(--vermillion)/70` |
| ✅ #5 OG 이미지 | 한지 텍스처 + 한자 표지 텍스트 합성 | `public/og/community.png` 1200×630 신규 |

---

## 10. Next Step

검토 후:
1. `/pdca do asca-community-page-rollout` 으로 do 단계 진입 — 다음 순서:
   - D1 페이지 골격(`app/community/page.tsx` + metadata + LayoutFooter)
   - D2 SealMark 컴포넌트 + CommunityHero
   - D3 DaoArchitecture
   - D4 ImseoCard
   - D5 CafeEntry
   - D6 MembershipBranch
   - D7 i18n 키 18 × 4언어 ≈ 72 entry 일괄
   - D8 E2E spec
2. (병렬) 사무국: 카페·오픈채팅 URL 결정 → OQ#2 unblock → URL i18n 1줄 갱신
3. (병렬) 사무국: SealMark 친필 인장 의뢰 (text fallback과 호환 인터페이스)
4. (병렬) OG 이미지 디자이너 의뢰 — `public/og/community.png` 1200×630

후속 사이클:
- `asca-membership-flow` (정회원 정관·심사·연회비) — MembershipBranch CTA 도착지
- `asca-homepage-brand-visual-regression-baseline` — D8 baseline 일괄
