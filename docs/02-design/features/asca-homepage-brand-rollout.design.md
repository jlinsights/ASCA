# ASCA Homepage Brand Rollout — Design

*Created: 2026-05-10*
*Phase: 02-design*
*Status: Draft (구현 진입 전 디자인 검토)*
*Plan: `docs/01-plan/features/asca-homepage-brand-rollout.plan.md`*
*DESIGN.md: 1.2.1-alpha (Phase 1~4 완료, design:lint/diff/wcag 3 hard gate)*

---

## 0. Convention Note — ASCA 실제 컨벤션 정렬 (do 단계 발견 사항 반영, 2026-05-10)

design 초안의 일부 사양을 ASCA 기존 컨벤션과 정렬:

| 초안 사양 | ASCA 실제 컨벤션 | 채택 |
|---|---|---|
| `app/[locale]/page.tsx` (Next.js i18n routing) | `app/page.tsx` 루트 + `LanguageContext` 패턴 (`useLanguage()` + `t()`) | LanguageContext 유지 — i18n routing 도입은 별도 사이클 |
| `messages/{ko,en,ja,zh}.json` | `lib/i18n/translations.ts` TS 파일 키 추가 | translations.ts에 키 추가 |
| `components/home/` 디렉토리 신규 | `components/sections/` (기존: `hero-section.tsx`, `featured-exhibitions-section.tsx`) | sections/ 컨벤션 따름 — `philosophy-section.tsx` 등 |
| 기존 Hero 갈아엎기 | `HeroSection` 운영 중 (Typewriter·이미지 자산 의존) | **단계적 전환** — 기존 Hero에 한자 표지·L1·L2 추가, Typewriter 유지 |
| Plan §3 5섹션 신규 | Hero 기존 + 신규 4섹션 (Philosophy·WhatWeDo·BrandMessage·ClosingCTA) | Hero는 강화, 나머지 4섹션 신규 |

**컴포넌트 매핑 갱신** (§3 컴포넌트 트리는 다음 위치로 변환):

```
app/page.tsx
└─ <HomePage />
   ├─ <HeroSection />                                # 기존 강화 (한자 표지 + L1 + L2)
   │  └─ <HanjaMark />                               # NEW components/brand/hanja-mark.tsx
   ├─ <PhilosophySection />                          # NEW components/sections/philosophy-section.tsx
   ├─ <WhatWeDoSection />                            # NEW components/sections/what-we-do-section.tsx
   ├─ <BrandMessageSection />                        # NEW components/sections/brand-message-section.tsx
   ├─ <ClosingCTASection />                          # NEW components/sections/closing-cta-section.tsx
   └─ <LayoutFooter />                               # 기존 유지
```

`<FeaturedExhibitionsSection>` (기존)은 본 사이클에서 제거하지 않음 — Hero와 Philosophy 사이에 유지하거나 What We Do 후로 이동할지는 do 단계 시각 검증 후 결정.

---

## 1. Overview

`brand-guidelines.md §2` 5섹션을 Next.js 14 App Router + ASCA i18n 4언어 + DESIGN.md 1.2.1-alpha 위에 구현하기 위한 디자인 명세. plan §3 의 D1~D8 산출물을 토큰·컴포넌트·i18n 키 단위로 분해.

**Plan Decision 반영**
- OQ#1 ✅ 한자 표지 SVG 친필 자산 (협회 작가 의뢰 + 디지털화)
- OQ#4 ✅ 2-layer CTA — 홈 CTA "함께하는 서예 문화" → `/community` (별도 사이클로 구현)

---

## 2. DESIGN.md ↔ brand-guidelines §7 토큰 매핑 (D7)

### 2.1 색상 매핑

| brand-guidelines §7.1 어휘 | DESIGN.md 토큰 | 사용 위치 |
|---|---|---|
| 먹색 / 검정 | `ink-black` (#1a1a1a) ≡ `--foreground` | 본문 텍스트, 한자 표지 SVG fill 기본 |
| 백색·한지색·여백색 | `rice-paper` (#f5f5f0) ≡ `--background` | 페이지 배경, 모든 섹션 |
| 담묵 회색 (UI 보조) | `--muted-foreground` (#6a6a6a) | 캡션·메타·서브 텍스트 |
| 담묵 회색 (장식) | `stone-gray` (#707070) | 한지 질감 위 장식 라인 |
| 적색 인주색 (장식) | `vermillion` (#e63946) | 한자 표지 가운뎃점, 도장 모티프 |
| 적색 인주색 (CTA 시맨틱) | `--primary` ≡ `scholar-red` (#af2626) | CTA 버튼 4종 |
| 은은한 금색 (의례적 강조) | `temple-gold` (#d4af37) | 도록·전시 머리 장식 한정 (홈에서는 미사용) |
| 카드 표면 | `--card` (#fdfdfb) | Brand Message 인용 카드, What We Do 행 |

**DESIGN.md hard gate 통과 조건**
- 인라인 hex 색상 사용 0건 (`design:lint` 통과)
- WCAG 2.1 AA 명도비 — `--foreground` on `--background` (AAA), `--primary-foreground` on `--primary` (AA)
- `brand-gold` (#ffcc00) 는 격조 부적합 — 홈에서는 미사용. 의례적 금색은 `temple-gold` 만.

### 2.2 타이포 매핑 (DESIGN.md §3.5)

| brand-guidelines 권고 | DESIGN.md 토큰 |
|---|---|
| 한국어 명조 (Hero·Philosophy 제목) | `display-lg` / `display-md` / `headline-lg` (Playfair + Noto Serif KR) |
| 한국어 고딕 (본문·메타·버튼) | `body-lg` / `body-md` / `label-sm` (Inter + Noto Sans KR) |
| 중국어·일본어 본문 | DESIGN.md §3.2 언어별 자동 전환 위임 (Noto Serif/Sans CJK 자동 적용) |
| 한자 표지 `法古創新·人書俱老` | DESIGN.md typography 토큰 미사용 — SVG 친필 자산 (§4) |

---

## 3. 컴포넌트 트리

```
app/[locale]/page.tsx                                    # i18n locale segment
└─ <HomePage />
   ├─ <Hero />                              # D1
   │  ├─ <HanjaMark variant="hero" />       # SVG 친필 (§4)
   │  ├─ <SloganL1 />                       # display-lg + Noto Serif KR
   │  └─ <SubcopyL2 />                      # body-lg + Noto Sans KR
   │
   ├─ <Philosophy />                        # D2
   │  ├─ <SectionTitle />                   # headline-lg
   │  └─ <SectionBody />                    # body-md, max-w-prose
   │
   ├─ <WhatWeDo />                          # D3
   │  ├─ <SectionTitle />
   │  └─ <ActivityTable />                  # 5-row, gallery-card variant
   │
   ├─ <BrandMessage />                      # D4
   │  ├─ <SectionTitle />
   │  └─ <QuoteCard />                      # gallery-card-glass + scholar-red 인용 부호
   │
   └─ <ClosingCTA />                        # D5
      ├─ <SectionTitle />
      ├─ <SectionBody />
      └─ <CTAButtonGrid />                  # 4 button: --primary scholar-red
         ├─ Button1 → /about            # 협회 철학 보기
         ├─ Button2 → /exhibitions      # 전시·공모전 둘러보기
         ├─ Button3 → /community        # 함께하는 서예 문화 (OQ#4 채택)
         └─ Button4 → /education        # 서예 배우기
```

**파일 위치**
- 페이지: `app/[locale]/page.tsx` (또는 기존 i18n 라우팅 컨벤션 따름)
- 컴포넌트: `components/home/{Hero,Philosophy,WhatWeDo,BrandMessage,ClosingCTA}.tsx`
- 공유: `components/brand/{HanjaMark,SloganL1,SubcopyL2}.tsx`

---

## 4. SVG 친필 자산 — 한자 표지 (D1 보조 산출물)

### 4.1 자산 사양

| 항목 | 값 |
|---|---|
| 텍스트 | `法古創新 · 人書俱老` (8자 + 가운뎃점) |
| 작가 | 협회 작가 1인 (사무국 의뢰 — 추가 task) |
| 친필 형식 | 정자 해서 또는 작가 고유체 (작가 결정) |
| 크기 (원본) | A3 한지 1매 |
| 디지털화 | 600dpi 스캔 → 벡터 트레이스 (Illustrator/Inkscape) → SVG 단일 패스 |
| SVG 파일 | `public/brand/hanja-mark.svg` |
| viewBox | `0 0 1600 200` (가로 직사각, 좌측 4자 + 가운뎃점 + 우측 4자) |
| Stroke | currentColor 또는 fill="currentColor" — DESIGN.md 토큰 자동 적용 |
| 가운뎃점 | 별도 path with `fill="var(--vermillion, #e63946)"` (인주색) |

### 4.2 컴포넌트 인터페이스

```tsx
// components/brand/HanjaMark.tsx
type HanjaMarkProps = {
  variant: 'hero' | 'header' | 'footer'  // 크기·여백 분기
  color?: 'ink' | 'paper' | 'inherit'    // ink-black | rice-paper | currentColor
  ariaLabel?: string                     // 기본: "법고창신 인서구로"
}
```

### 4.3 임시 Fallback (SVG 도착 전까지)

- DESIGN.md `display-lg` 토큰 + Noto Serif CJK 명조
- Hero 섹션에서 정자 해서 풍 표현이 어려우므로 fallback 기간을 최소화 — Week 1 종료 전 친필 자산 도착 권장
- Fallback 활성 동안에도 `<HanjaMark>` 인터페이스는 동일 (내부에서 SVG 또는 텍스트 분기)

### 4.4 협회 작가 의뢰 task (별도 — 사무국 액션)

- 협회 이사·심사위원 가운데 정자 해서 또는 협회 정체성에 부합하는 작가 1인 선정
- 친필 작품의 협회 자산화 동의서 (저작권·사용 범위·기간)
- 의뢰 기간: 2주 권장 (창작 1주 + 디지털화 1주)
- 비용: 사무국 결정

---

## 5. i18n 키 표 (D6)

| 키 | 한국어 | 中文 | 日本語 | English |
|---|---|---|---|---|
| `home.hero.l1` | 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어집니다. | 法古創新，人書俱老。 | 古典に学び、新たな書の美をひらく。 | Rooted in Tradition, Renewed Through Calligraphy. |
| `home.hero.l2` | 동양서예협회는 옛 법을 깊이 익혀 오늘의 감각으로 새로움을 열고, 글씨와 사람이 함께 깊어지는 서예 문화를 지향합니다. | 法古開新，人書俱老。以筆承道，以書養心。 | 東洋書芸協会は、古典に深く学びながら現代の感性を取り入れ、書と人がともに深まる文化を目指してまいります。 | The Asian Society of Calligraphic Arts seeks to renew tradition through contemporary expression, cultivating a culture in which calligraphy and character mature together. |
| `home.philosophy.title` | 문자에 정신을 담고, 서예로 시대를 잇습니다 | 以文承神，以書通時 | 文字に精神を、書に時代を | Embodying Spirit in Letters, Bridging Eras Through Calligraphy |
| `home.philosophy.body` | 서예는 단순히 글자를 아름답게 쓰는 일이 아닙니다. 한 획의 강약, 먹의 농담, 여백의 호흡 속에는 작가의 시간과 마음, 인격과 수양이 함께 담깁니다. 동양서예협회는 法古創新의 정신으로 고전을 깊이 익히고, 人書俱老의 자세로 글씨와 사람이 함께 성숙하는 서예 문화를 만들어갑니다. | (中文 본문 — brand-guidelines §1.2 인용) | (日本語 본문 — brand-guidelines §1.3 인용) | (English 본문 — brand-guidelines §1.4 인용) |
| `home.whatWeDo.title` | 동양서예협회가 하는 일 | 本協會之活動 | 協会の活動 | What We Do |
| `home.whatWeDo.row.exhibition.label` | 전시 | 展覽 | 展覧会 | Exhibitions |
| `home.whatWeDo.row.exhibition.body` | 한문서예, 한글서예, 문인화, 현대서예를 아우르는 전시 개최 | … | … | … |
| `home.whatWeDo.row.contest.*` | 공모전 / 大韓民國東洋書藝大展 등 작가 발굴 | … | … | … |
| `home.whatWeDo.row.education.*` | 교육 / 기초~창작·전각·문인화 체계적 교육 | … | … | … |
| `home.whatWeDo.row.exchange.*` | 교류 / 국내외 문자예술 단체 문화 교류 | … | … | … |
| `home.whatWeDo.row.research.*` | 연구 / 동양 문자문화·서예미학 현대적 해석 | … | … | … |
| `home.brandMessage.title` | 한글의 리듬, 한문의 깊이, 서예의 정신 | (中文 정렬) | (日本語 정렬) | (English 정렬) |
| `home.brandMessage.body` | (brand-guidelines §2 Section 4 본문) | … | … | … |
| `home.closingCta.title` | 오늘의 서예, 함께 새롭게 써 내려갑니다 | … | … | … |
| `home.closingCta.body` | 동양서예협회는 서예가 과거의 유산에 머무르지 않고, 오늘의 삶과 다음 세대의 감각 속에서 다시 살아나는 예술이 되기를 바랍니다. | … | … | … |
| `home.closingCta.button.about` | 협회 철학 보기 | 協會理念 | 協会の理念 | Our Philosophy |
| `home.closingCta.button.exhibitions` | 전시·공모전 둘러보기 | 展覽與公募 | 展覧会・公募展 | Exhibitions |
| `home.closingCta.button.community` | 함께하는 서예 문화 | 共承書藝文化 | 書芸文化を共に | Join Our Calligraphy Community |
| `home.closingCta.button.education` | 서예 배우기 | 書藝學習 | 書を学ぶ | Learn Calligraphy |

**기록 원칙**
- L1 슬로건은 brand-guidelines §8 SSOT와 1:1 일치 — 임의 의역 금지
- L2 헤더 카피는 brand-guidelines §1 각 언어 첫 문장 SSOT와 1:1 일치
- 풀 본문(`philosophy.body`, `closingCta.body` 등)은 brand-guidelines §1·§2 SSOT 인용

---

## 6. CTA 버튼 디자인

| 항목 | 사양 |
|---|---|
| 컴포넌트 | `gallery-btn-default` (DESIGN.md §8.1) |
| 색상 | `--primary` (scholar-red #af2626) on `--primary-foreground` (#fafafa) |
| 사이즈 | 데스크톱 `gallery-btn-lg`, 모바일 `gallery-btn-default` |
| 타이포 | `label-sm` 또는 `body-md` weight-medium |
| 그리드 | OQ#5 미결정 — design 단계에서 권장: 데스크톱 4-in-row, 모바일 2x2 stack |
| 호버 | DESIGN.md `--accent` (celadon-green #88A891) ring + 1px lift |
| 포커스 | `--ring` (#88A891) outline 2px (WCAG keyboard nav) |

`/community` 라우트는 본 사이클 out of scope — Stub 페이지("협회 동도 모집 안내 / 카페·카톡 진입 / 정회원 분기" 4 영역의 임시 안내)를 D5 동시에 작성, 정식 구현은 별도 사이클 `asca-community-page-rollout`.

---

## 7. E2E 시각 회귀 (D8)

| 항목 | 사양 |
|---|---|
| 도구 | Playwright (기존 ASCA e2e 인프라) |
| 스냅샷 단위 | 4언어 × 5섹션 = 20장 |
| 뷰포트 | 1차: desktop 1440 × 900 / 2차(다음 사이클): tablet 768·mobile 375 |
| 비교 정책 | maxDiffPixelRatio 0.005 (한자 표지 안티앨리어싱 미세 차이 흡수) |
| 파일 | `e2e/home.brand-rollout.spec.ts` |
| 스냅샷 저장 | `e2e/__screenshots__/home/{ko,en,ja,zh}/{hero,philosophy,whatWeDo,brandMessage,closingCta}.png` |

**시나리오**
1. 각 언어로 진입 → 5섹션 순차 스냅샷
2. 한자 표지가 모든 언어에서 동일 위치·동일 크기 (시각 통일성 검증)
3. CTA 버튼 4종이 정확한 라우트로 이동 (route assertion, 클릭 X — 시각 회귀와 분리)
4. WCAG 명도비 자동 검증 (`@axe-core/playwright`)

---

## 8. Acceptance Criteria 매핑 (Plan §7)

| Plan 기준 | Design 산출물 | 비고 |
|---|---|---|
| 5섹션 §2 그대로 출력 | §3 컴포넌트 트리 | 1:1 매핑 |
| 4언어 L1 슬로건 §8 SSOT 일치 | §5 i18n 키 표 | 키 단위 검증 |
| 인라인 hex 0건 | §2.1 토큰 매핑 | DESIGN.md `design:lint` 자동 |
| Lighthouse ≥ 90, LCP < 2.5s, CLS < 0.1 | §4 SVG 자산화 + §6 버튼 단순화 | 멀티미디어 배경 미사용(OQ#3 권장 정적 한지) |
| WCAG AA 명도비 | §2.1 + §6 + §7 axe | DESIGN.md WCAG hard gate |
| 4언어 × 5섹션 시각 회귀 | §7 E2E | 20 스냅샷 |
| 1차 디자인 리뷰 승인 | 본 design 문서 + 스테이징 빌드 | 사무국장 또는 `/plan-design-review` |

---

## 9. OQ 결정 반영 (2026-05-10 채택)

| OQ | 결정 | design 적용 위치 |
|---|---|---|
| ✅ OQ#1 한자 표지 폰트 | SVG 친필 (협회 작가 의뢰) | §4 SVG 친필 자산 사양 + §3 `<HanjaMark>` 컴포넌트 |
| ✅ OQ#2 기본 언어 | 한국어 고정 + 사용자 명시 전환만 | i18n 라우팅 `/[locale]` default `ko` 고정, Accept-Language 비활성 |
| ✅ OQ#3 Hero 멀티미디어 | 정적 한지 질감 + SVG 한자 표지만 | §3 Hero 컴포넌트 트리에 영상·이미지 자산 노드 미포함 |
| ✅ OQ#4 회원 가입 CTA 분기 | 2-layer (홈 → `/community` → 정회원 분기) | §3 Button3 → `/community` + `asca-community-page-rollout` 후속 사이클 |
| ✅ OQ#5 CTA 그리드 | 데스크톱 4-in-row, 모바일 2x2 stack | §6 CTA 버튼 디자인 갱신 (아래 §6.1 참조) |

### 6.1 CTA 그리드 사양 갱신 (OQ#5 채택 반영)

```tsx
// components/home/CTAButtonGrid.tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
  {/* 4 buttons */}
</div>
```

- 데스크톱 (md+): 4-in-row, gap-6
- 모바일 (<md): 2x2 stack, gap-4
- 터치 영역: 모바일 버튼 height ≥ 48px (WCAG 2.5.5)
- DESIGN.md `gallery-btn-default` 변형 — 모바일은 자동 스케일

---

## 10. Next Step

OQ 5건 모두 채택 (2026-05-10) — design 단계 완료. 검토 후:
1. 협회 작가 SVG 친필 의뢰 task 발주 (사무국 액션, 2주 lead time) — do와 병렬 가능
2. `/pdca do asca-homepage-brand-rollout` 으로 do 단계 진입 — D7 토큰 정렬 → D1 Hero → D2~D5 → D6 i18n → D8 E2E
3. SVG 친필 도착 시 `<HanjaMark>` fallback → SVG 교체 (단일 컴포넌트 변경)

후속 사이클:
- `asca-community-page-rollout` (`/community` 정식 구현 — OQ#4 채택의 자연스러운 후속)
- `asca-membership-flow` (정회원 정관·심사·연회비 동선)
- `asca-about-page-rollout` (L3 풀 소개문 + 협회 연혁·임원·정관)
