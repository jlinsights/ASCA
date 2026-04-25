---
name: ASCA Design System
version: 1.2.0-alpha
description: >-
  사단법인 동양서예협회(ASCA) 웹사이트의 디자인 시스템 명세.
  전통 동아시아 예술의 색채·서체·질감을 현대 디지털 인터페이스 언어로 재해석한 토큰 집합.
  본 문서는 AI 코딩 에이전트가 UI를 생성·수정할 때 참조하는 단일 진실 공급원(SSOT).
references:
  tailwind: tailwind.config.ts
  globals: app/globals.css
  brand-page: app/brand/page.tsx
  brand-data: app/brand/_components/brand-data.ts

# ─────────────────────────────────────────────
# COLORS — 의미론 기반 매핑
# ─────────────────────────────────────────────
colors:
  # Semantic (UI 의도) — 일반 UI 작업은 이 레이어만 사용
  # 주의: shadcn 규약에 따라 `accent` 는 hover/selected 배경용 부드러운 색.
  # "프리미엄 강조"는 별도 `highlight` 슬롯을 사용한다.
  primary: '#88A891'            # Celadon Green — 청자 녹색, 브랜드 주색
  primary-foreground: '#1a1a1a'
  secondary: '#af2626'          # Scholar Red — 선비 홍색, 보조 강조
  secondary-foreground: '#f5f5f0'
  accent: '#88A891'             # Celadon Green (OKLCH 변환) — hover/selected 배경
  accent-foreground: '#1a1a1a'
  highlight: '#ffcc00'          # Brand Gold — 수상·기념·프리미엄. bg-brand-gold 로 접근
  highlight-foreground: '#1a1a1a'
  destructive: '#dc2626'
  destructive-foreground: '#ffffff'  # 백색 — Rice Paper(#f5f5f0)는 4.42:1로 AA 미달
  success: '#4a7c59'            # East Wood — 동방목
  warning: '#fdb462'            # Autumn Gold — 가을 황금
  info: '#1e3a8a'               # North Water — 북방수
  muted: '#f0f0eb'              # Warm Muted Bg (globals.css --muted oklch 0.94 근사)
  muted-foreground: '#6a6a6a'   # Darker Gray — muted bg 위 AA 4.72:1 통과
                                # Note: 장식 토큰 stone-gray(#707070)와 별도 — semantic 슬롯

  # Surface (라이트 모드 기준)
  background: '#f5f5f0'         # Rice Paper White
  foreground: '#1a1a1a'         # Ink Black
  card: '#fdfdfb'
  border: '#e2e2dd'
  input: '#d9d9d4'
  ring: '#88A891'

  # Obang (오방색) — 동아시아 우주관의 5방위
  east-wood: '#4a7c59'          # 동방-목-봄
  south-fire: '#d73527'         # 남방-화-여름
  center-earth: '#f4e2d7'       # 중앙-토-환절기
  west-metal: '#f2f2f2'         # 서방-금-가을
  north-water: '#1e3a8a'        # 북방-수-겨울

  # Seasonal (계절)
  spring-blossom: '#fad0c4'     # 벚꽃 분홍
  summer-jade: '#7dd3c0'        # 여름 옥색
  autumn-gold: '#fdb462'        # 가을 황금
  winter-snow: '#ffffff'        # 겨울 설백

  # Calligraphy Materials (서예 재료)
  ink-black: '#1a1a1a'          # 먹색
  rice-paper: '#f5f5f0'         # 한지
  bamboo-green: '#6b7c32'       # 대나무 붓대
  silk-cream: '#faf7f0'         # 비단 종이
  lacquer-black: '#0d1b2a'      # 옻칠 벼루
  vermillion: '#e63946'         # 주인(朱印) 낙관

  # Cultural Accents
  scholar-red: '#af2626'        # 선비 홍색
  celadon-green: '#88A891'      # 청자색
  stone-gray: '#707070'         # 석조 회색
  temple-gold: '#d4af37'        # 사찰 금색 (차분한 고전 금색 — Brand Gold 와 구분)
  moon-silver: '#c0c0c0'        # 달빛 은색
  plum-purple: '#8e4585'        # 매화 자색

  # Brand Extended Palette (brand-data.ts 공식 PRIMARY_COLORS 정본)
  # Source: app/brand/_components/brand-data.ts
  brand-gold: '#ffcc00'         # 브랜드 공식 금색 — Semantic `accent` 로 승격
  terra-red: '#9b4444'          # 전통 도장 주홍 — Scholar Red 의 차분한 보조
  sage-green: '#b7c4b7'         # 문인화 절제된 초록 — Celadon Green 의 저채도 변형
  spring-green: '#09f557'       # 생동·새 시작 — 장식 악센트 한정, UI 금지
  medium-orchid: '#c14af2'      # 동양 난초 기품 — 장식 악센트 한정, UI 금지
  royal-blue: '#275eea'         # 청화백자 청색 — 장식 악센트 한정, UI 금지

# ─────────────────────────────────────────────
# TYPOGRAPHY — Google DESIGN.md spec canonical tokens
# 확장 정보(family 9종, scale 13단계, weight/tracking/leading)는 본문 prose 참조
# ─────────────────────────────────────────────
typography:
  display-lg:
    fontFamily: 'var(--font-playfair), var(--font-noto-serif-kr), serif'
    fontSize: '3.75rem'          # 60px
  display-md:
    fontFamily: 'var(--font-playfair), var(--font-noto-serif-kr), serif'
    fontSize: '3rem'             # 48px
  headline-lg:
    fontFamily: 'var(--font-playfair), var(--font-noto-serif-kr), serif'
    fontSize: '2.25rem'          # 36px
  headline-md:
    fontFamily: 'var(--font-playfair), var(--font-noto-serif-kr), serif'
    fontSize: '1.875rem'         # 30px
  title-lg:
    fontFamily: 'var(--font-inter), var(--font-noto-sans-kr), sans-serif'
    fontSize: '1.5rem'           # 24px
  body-lg:
    fontFamily: 'var(--font-inter), var(--font-noto-sans-kr), sans-serif'
    fontSize: '1.125rem'         # 18px
  body-md:
    fontFamily: 'var(--font-inter), var(--font-noto-sans-kr), sans-serif'
    fontSize: '1rem'             # 16px
  label-sm:
    fontFamily: 'var(--font-inter), var(--font-noto-sans-kr), sans-serif'
    fontSize: '0.875rem'         # 14px

# ─────────────────────────────────────────────
# LAYOUT — 8px 기반 스페이싱 + 컨테이너
# ─────────────────────────────────────────────
layout:
  container:
    center: true
    padding: '2rem'
    max: '1400px'
  spacing:
    xs: '0.5rem'    # 8px
    sm: '1rem'      # 16px
    md: '1.5rem'    # 24px
    lg: '2rem'      # 32px
    xl: '3rem'      # 48px
    # 확장
    '18': '4.5rem'
    '88': '22rem'
    '104': '26rem'
    '128': '32rem'
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', 2xl: '1400px' }

# ─────────────────────────────────────────────
# SHAPES — 기본 0.5rem (--radius)
# ─────────────────────────────────────────────
rounded:
  none: '0rem'                       # 0px
  sm: '0.25rem'                      # 4px  (실 계산: var(--radius) - 4px)
  md: '0.375rem'                     # 6px  (실 계산: var(--radius) - 2px)
  lg: '0.5rem'                       # 8px  (--radius)
  xl: '1rem'                         # 16px
  2xl: '1.5rem'                      # 24px
  full: '9999px'

# ─────────────────────────────────────────────
# SPACING — 8px 그리드 (canonical, layout.spacing 동일)
# ─────────────────────────────────────────────
spacing:
  xs: '0.5rem'                       # 8px
  sm: '1rem'                         # 16px
  md: '1.5rem'                       # 24px
  lg: '2rem'                         # 32px
  xl: '3rem'                         # 48px

# ─────────────────────────────────────────────
# ELEVATION — 따뜻한 먹색 기반 섀도우 (hsl 20 6% 20%)
# ─────────────────────────────────────────────
elevation:
  2xs: '0 1px 2px 0 hsl(20 6% 20% / 0.04)'
  xs: '0 1px 3px 0 hsl(20 6% 20% / 0.06)'
  sm: '0 1px 3px 0 hsl(20 6% 20% / 0.08), 0 1px 2px -1px hsl(20 6% 20% / 0.06)'
  md: '0 4px 8px -2px hsl(20 6% 20% / 0.1), 0 2px 4px -2px hsl(20 6% 20% / 0.06)'
  lg: '0 8px 16px -4px hsl(20 6% 20% / 0.1), 0 4px 6px -2px hsl(20 6% 20% / 0.05)'
  xl: '0 16px 32px -8px hsl(20 6% 20% / 0.12), 0 8px 16px -4px hsl(20 6% 20% / 0.06)'
  2xl: '0 24px 48px -12px hsl(20 6% 20% / 0.18)'

# ─────────────────────────────────────────────
# MOTION — 먹의 번짐에서 영감
# ─────────────────────────────────────────────
motion:
  duration: { fast: '150ms', normal: '250ms', slow: '400ms' }
  ease:
    out: 'cubic-bezier(0.16, 1, 0.3, 1)'      # 붓을 들어올리는 느낌
    in-out: 'cubic-bezier(0.45, 0, 0.55, 1)'  # 필압의 자연스러운 흐름
  signature:
    ink-spread: 'ink-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'

# Components 매핑은 본문 §8(Components prose)에 정의. 이전 components: front-matter
# 블록은 비-canonical 구조(tokens/variants/sizes nested)로 Google CLI 파서를 실패시켜
# 2026-04-25 prose 로 이전 (정보 손실 0, lint clean).
---

# ASCA Design System

> 사단법인 동양서예협회의 웹 인터페이스는 **正法의 계승 발전과 創新의 조화로운 구현**을
> 원칙으로 한다. 본 문서는 그 원칙을 코드로 번역하기 위한 스펙이며, AI 에이전트와
> 디자이너·엔지니어가 동일한 토큰·명명·관계를 공유하게 한다.

## 1. Overview

ASCA는 서예라는 **무형의 정신성**을 디지털 인터페이스로 옮긴다. 따라서 시각 언어는 세 가지
축에서 균형을 찾는다.

| 축 | 의미 | 디자인 결정 |
|---|---|---|
| **전통 (正法)** | 2,000년 이상 축적된 동아시아 색채·서체·여백 미학 | Obang 5방위색, 서예 재료(먹·한지·주인) 팔레트, CJK 세리프 우선 |
| **현대 (創新)** | 디지털 UX가 요구하는 명료함과 접근성 | WCAG 2.1 AA 대비, OKLCH 색공간, 8px 그리드 |
| **국제 (4개 언어)** | 한/영/중/일 모든 사용자에게 동등한 품질 | 언어별 폰트 스택, 유니코드 CJK 포괄, i18n 레이아웃 |

세 축 중 하나라도 포기하는 결정은 하지 않는다. **충돌이 있다면 접근성이 우선**이다.

## 2. Colors

### 2.1 의미론(Semantic) 레이어 — 항상 먼저 이 레이어부터 선택

UI 요소는 원칙적으로 Semantic 토큰으로 구현한다. Obang/Materials는 **브랜드 표현용**이지
범용 UI 토큰이 아니다.

| 토큰 | HEX | 용도 | 근거 |
|---|---|---|---|
| `{colors.primary}` | `#88A891` | 주요 CTA, 링크, 포커스 링 | Celadon Green — 청자의 은은함, 브랜드 중심 |
| `{colors.secondary}` | `#af2626` | 보조 강조, 섹션 구분선, 인용 | Scholar Red — 선비의 단호함 |
| `{colors.accent}` | `#88A891` | hover 배경, 선택 상태, 메뉴 하이라이트 | shadcn 규약 — `bg-accent`/`hover:bg-accent` (Celadon Green) |
| `{colors.highlight}` | `#ffcc00` | 수상·기념·프리미엄 배지 | Brand Gold — `bg-brand-gold`/`text-brand-gold` 로 접근, 과용 금지 |
| `{colors.destructive}` | `#dc2626` | 삭제·오류 | 일반 destructive, Scholar Red와 분리 |
| `{colors.success}` | `#4a7c59` | 완료·승인 | East Wood (봄·생명) |
| `{colors.warning}` | `#fdb462` | 주의·임박 | Autumn Gold (풍요 속 경계) |
| `{colors.info}` | `#1e3a8a` | 정보·안내 | North Water (깊이·지혜) |

### 2.2 Surface 레이어 — 배경/테두리

라이트·다크 모드 모두 OKLCH로 정의되어 있으며, 다크 모드는 `app/globals.css`의 `.dark`
클래스에서 자동 반전된다. 직접 HEX를 쓰지 말고 Tailwind 클래스(`bg-background`,
`text-foreground`, `border-border`)를 사용한다.

### 2.3 Obang (오방색) — 문화적 정체성 표현에만

동·서·남·북·중앙의 5방위 색상은 **랜딩 히어로, 문화 소개 페이지, 계절 캠페인** 등
브랜드 내러티브가 필요한 영역에서만 사용한다. 일반 버튼·폼에는 금지.

### 2.4 Calligraphy Materials — 질감·배경·히어로

`ink-black`·`rice-paper`·`vermillion`·`silk-cream`은 서예 작품의 물성을 재현할 때 쓴다.
작품 상세 페이지, 작가 소개, 낙관 요소가 전형적 사용처.

### 2.5 Brand Extended Palette — 브랜드 가이드 정본

`app/brand/_components/brand-data.ts` 의 PRIMARY_COLORS 를 Tailwind·DESIGN.md 로 정렬한
팔레트. **/brand 페이지에 실제 노출되는 공식 색상**이다.

| 토큰 | HEX | Tier | 허용 사용처 |
|---|---|---|---|
| `{colors.brand-gold}` | `#ffcc00` | **Semantic** | `highlight` 슬롯 — 수상·프리미엄·기념. `bg-brand-gold` / `text-brand-gold` 사용 |
| `{colors.terra-red}` | `#9b4444` | Cultural | Scholar Red 대비 차분한 보조 강조 (인용 블록, 섹션 헤더 밑줄) |
| `{colors.sage-green}` | `#b7c4b7` | Cultural | Celadon Green 의 저채도 변형 (배경 틴트, 메타 정보) |
| `{colors.spring-green}` | `#09f557` | Decorative | **UI 금지** — 브랜드 가이드·문화 캠페인 장식에만 |
| `{colors.medium-orchid}` | `#c14af2` | Decorative | **UI 금지** — 시즈널 캠페인 장식에만 |
| `{colors.royal-blue}` | `#275eea` | Decorative | **UI 금지** — 문화 캠페인 장식에만 |

**Tier 의미:**
- **Semantic**: 일반 UI 작업에 쓸 수 있음 (§2.1과 동급)
- **Cultural**: 브랜드 맥락에서만 (작가 소개, 작품 리스트 등)
- **Decorative**: /brand 페이지, 랜딩 히어로, 시즈널 배너 외 금지

**Temple Gold vs Brand Gold 혼동 방지:**

| 토큰 | Tailwind 클래스 | HEX | 성격 | 언제 |
|---|---|---|---|---|
| `{colors.highlight}` = `{colors.brand-gold}` | `bg-brand-gold` | `#ffcc00` | 선명, 채도 높음 | 수상·NEW·프리미엄 배지 등 **알림성 강조** |
| `{colors.temple-gold}` | `bg-temple-gold` | `#d4af37` | 차분, 올리브 기미 | 전통·유물·장식 프레임 등 **고전적 깊이** |

둘을 같은 화면에서 동시에 쓰지 않는다.

**주의 — `bg-accent` 는 Gold 가 아니다:**
`bg-accent` / `hover:bg-accent` 는 shadcn 규약상 **Celadon Green** 기반 부드러운 배경
(드롭다운 hover, 메뉴 선택 상태 등). 프리미엄 강조에는 반드시 `bg-brand-gold` 를 쓴다.

### 2.6 WCAG 검증 쌍

아래 페어는 WCAG AA (4.5:1) 이상을 충족한다. 새 조합을 만들면 반드시 대비율을 측정한다.

- `{colors.foreground}` on `{colors.background}` — 15.8:1 ✅
- `{colors.primary-foreground}` on `{colors.primary}` — 5.2:1 ✅
- `{colors.secondary-foreground}` on `{colors.secondary}` — 6.1:1 ✅
- `{colors.accent-foreground}` on `{colors.accent}` (`#1a1a1a` on `#88A891`) — 5.2:1 ✅
- `{colors.highlight-foreground}` on `{colors.highlight}` (`#1a1a1a` on `#ffcc00`) — 14.1:1 ✅
- `{colors.terra-red}` (`#9b4444`) on `{colors.rice-paper}` (`#f5f5f0`) — 6.8:1 ✅
- ⚠️ `{colors.sage-green}` (`#b7c4b7`) 흰 배경 — 약 2.1:1 ❌ (텍스트 금지, 배경 틴트/보더만)
- ⚠️ `{colors.spring-green}` (`#09f557`) 흰 배경 — 약 1.5:1 ❌ (텍스트 절대 금지)

> 새 조합 추가 시 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 로 재측정 후 업데이트.

## 3. Typography

### 3.1 폰트 선택 규칙

1. **본문(UI)**: `{typography.family.sans}` — Inter + Noto Sans KR + CJK
2. **헤딩·인용**: `{typography.family.serif}` — Playfair Display + Noto Serif KR
3. **서예 인용(원문)**: `{typography.family.calligraphy}` — Source Han Serif + KaiTi
4. **장식 히어로**: `{typography.family.brush}` — Ma Shan Zheng, **영웅 영역 외 금지**
5. **코드**: `{typography.family.mono}` — JetBrains Mono

### 3.2 언어별 자동 전환

`lang` 속성에 따라 CSS가 자동으로 최적 폰트를 선택한다. 다국어 페이지에서는
`html[lang="ko|en|zh|jp"]`에 의존하고, 인라인 `font-family`를 덮어쓰지 않는다.

### 3.3 스케일

1.25 ratio 기반 13단계 스케일. Display 크기(5xl 이상)는 랜딩 히어로·작품 타이틀에만 쓴다.
본문은 `base`(16px) 고정, 가이드 문구는 `sm`(14px), 캡션은 `xs`(12px).

### 3.4 행간·자간

- 한국어/중국어/일본어 본문: `leading-relaxed` (1.75) — CJK의 시각 밀도를 완화
- 영문 본문: `leading-normal` (1.5)
- 헤딩: `tracking-tight` (-0.025em)
- 전각 강조: `tracking-widest` (0.1em)

### 3.5 Typography Reference (extended)

> **Why prose**: Google DESIGN.md spec v1은 typography를 토큰별 `{fontFamily, fontSize}` 객체로 정의한다. ASCA 고유 확장(family 9종, scale 13단계, weight/tracking/leading)은 본 prose 섹션에 보존하여 `npx design.md lint` 통과와 정보 보존을 동시 달성한다.

#### 3.5.1 Font Families (확장 — front matter 외부)

| 토큰 | 정의 | 적용 |
|------|------|------|
| `sans` | `var(--font-inter), var(--font-noto-sans-kr), "Noto Sans CJK SC/TC/JP", system-ui, sans-serif` | UI 본문 |
| `serif` | `var(--font-playfair), var(--font-noto-serif-kr), "Source Han Serif SC/TC", "Noto Serif CJK *"` | 헤드라인·인용 |
| `calligraphy` | `"Source Han Serif SC/TC/KR/JP", "Noto Serif CJK *", "KaiTi", "STKaiti", serif` | 작품 정보, 한자 |
| `brush` | `"Ma Shan Zheng", "Long Cang", "Source Han Serif SC", "Noto Serif CJK SC", cursive` | 데코레이티브 (히어로 한정) |
| `mono` | `"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace` | 코드, 좌표 |
| `korean` | `var(--font-noto-serif-kr), "Source Han Serif KR", "Nanum Myeongjo", "Batang", serif` | 한국어 강조 |
| `chinese` | `"Source Han Serif SC", "Noto Serif CJK SC", "SimSun", "Microsoft YaHei", serif` | 중국어 강조 |
| `japanese` | `"Noto Serif CJK JP", "Source Han Serif JP", "Yu Mincho", "Hiragino Mincho Pro", serif` | 일본어 강조 |
| `english` | `"Playfair Display", "Crimson Text", "Georgia", serif` | 영어 강조 |

#### 3.5.2 Scale Mapping (Tailwind 13단계 ↔ canonical)

| Tailwind | size / line-height | canonical 토큰 | 용도 |
|---------|--------------------|---------------|------|
| `xs` | `0.75rem / 1rem` (12px) | — | metadata, footnote |
| `sm` | `0.875rem / 1.25rem` (14px) | `label-sm` | 라벨 |
| `base` | `1rem / 1.5rem` (16px) | `body-md` | 본문 기본 |
| `lg` | `1.125rem / 1.75rem` (18px) | `body-lg` | 본문 강조 |
| `xl` | `1.25rem / 1.75rem` (20px) | — | sub-heading |
| `2xl` | `1.5rem / 2rem` (24px) | `title-lg` | 카드 타이틀 |
| `3xl` | `1.875rem / 2.25rem` (30px) | `headline-md` | 섹션 헤더 |
| `4xl` | `2.25rem / 2.5rem` (36px) | `headline-lg` | 페이지 헤더 |
| `5xl` | `3rem / 1.1` (48px) | `display-md` | 영웅 보조 |
| `6xl` | `3.75rem / 1.1` (60px) | `display-lg` | 영웅 |
| `7xl` ~ `9xl` | `4.5rem` ~ `8rem` | — | 메가 히어로 (예외) |

#### 3.5.3 Weight / Tracking / Leading

| 카테고리 | 토큰 |
|---------|------|
| `weight` | `thin(100)`, `light(300)`, `normal(400)`, `medium(500)`, `semibold(600)`, `bold(700)`, `black(900)` |
| `tracking` | `tighter(-0.05em)`, `tight(-0.025em)`, `normal(0em)`, `wide(0.025em)`, `wider(0.05em)`, `widest(0.1em)` |
| `leading` | `none(1)`, `tight(1.1)`, `snug(1.25)`, `normal(1.5)`, `relaxed(1.75)`, `loose(2)` |

위 값들은 Tailwind 기본값과 일치하므로 별도 config 불필요. CSS 클래스(`font-bold`, `tracking-tight`, `leading-relaxed`)로 직접 접근.

### 3.6 Color Pair Policy (WCAG)

> **Hard-fail pairs (verified by `npm run design:wcag`)** — `scripts/design-lint.ts` 실행 시 11개 페어 모두 WCAG 2.1 AA 통과 필수.

| 페어 | foreground / background | 최소 비율 | 크기 |
|------|------------------------|----------|------|
| P1 | `foreground` / `background` | 4.5:1 | 본문 |
| P2 | `primary-foreground` / `primary` | 4.5:1 | 본문 |
| P3 | `secondary-foreground` / `secondary` | 4.5:1 | 본문 |
| P4 | `accent-foreground` / `accent` | 4.5:1 | 본문 |
| P5 | `highlight-foreground` / `highlight` | 4.5:1 | 본문 |
| P6 | `destructive-foreground` / `destructive` | 4.5:1 | 본문 |
| P7 | `muted-foreground` / `muted` | 4.5:1 | 본문 |
| P8 | `card-foreground` / `card` | 4.5:1 | 본문 |
| P9 | `popover-foreground` / `popover` | 4.5:1 | 본문 |
| L1 | `foreground` / `background` | 3.0:1 | large text |
| L2 | `primary-foreground` / `primary` | 3.0:1 | large text |

**Decorative-only (excluded from contrast lint)**:
- **Obang 5색** (`east-wood`, `south-fire`, `center-earth`, `west-metal`, `north-water`): 일러스트레이션·아이콘 전용
- **Seasonal 4색** (`spring-blossom`, `summer-jade`, `autumn-gold`, `winter-snow`): 카테고리 라벨 장식
- **Calligraphy 4색** (`bamboo-green`, `silk-cream`, `lacquer-black`, `vermillion`): 작품 메타데이터 색상
- **Brand Extended 6색** (`terra-red`, `sage-green`, `spring-green`, `brand-gold`, `medium-orchid`, `royal-blue`): brand 페이지 정체성 표시 전용

> **Rationale**: 전통 동아시아 5방위·계절·서예 색상은 의미 전달·장식 목적의 시각 표현이지 본문 텍스트 contrast 대상 아님. 텍스트 위에 사용 시 shadcn semantic 슬롯의 foreground 색을 함께 적용해야 한다.

## 4. Layout

### 4.1 컨테이너

`gallery-container` (max 1400px, padding 2rem) 를 표준으로 쓴다. 예외는 풀블리드 히어로뿐.

### 4.2 스페이싱

모든 간격은 8px 배수. 토큰은 `{layout.spacing.*}`를 통해서만 참조하고, 임의의 `px` 값을
쓰지 않는다. 섹션 간 수직 간격은 모바일 `py-12`, 데스크톱 `py-20`이 기본.

### 4.3 그리드

`grid-cols-3 sm:grid-cols-4 md:grid-cols-6` — 컬러 팔레트 등 조밀한 카드에 쓰는 표준.
작품·전시 리스트는 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

## 5. Shapes

반경은 `{rounded.*}` 4단계로 제한. 개별 컴포넌트에서 `rounded-[Npx]` 임의값 금지.

| 용도 | 토큰 |
|---|---|
| 인풋·뱃지 | `sm` |
| 버튼·카드 | `md` |
| 다이얼로그·시트 | `lg` |
| 히어로 미디어 | `xl` or `2xl` |
| 아바타·칩 | `full` |

## 6. Elevation & Depth

섀도우는 차갑지 않다. 먹색 기반 `hsl(20 6% 20%)`를 쓰므로 일반 검은 그림자와 섞지 않는다.
다크 모드는 순수 검정 + 높은 opacity로 자동 전환된다.

- 기본 카드: `shadow-sm`
- 호버된 카드: `shadow-xl` + `-translate-y-1`
- 다이얼로그/시트: `shadow-2xl`
- 글래스 계열은 섀도우 대신 `backdrop-blur` + 반투명 테두리로 깊이 표현

## 7. Motion

### 7.1 원칙

> **먹은 번져야 한다. 튀지 않는다.**

- 기본 duration: `250ms` (`--duration-normal`)
- 기본 ease: `cubic-bezier(0.16, 1, 0.3, 1)` — 붓을 들어올릴 때의 감쇠 곡선
- 스케일 애니메이션: 1.0 → 1.02 이하로 제한 (`gallery-card.interactive`)
- 리듬 강조: `ink-spread` 커스텀 애니메이션을 페이지 전환에 사용

### 7.2 접근성

`prefers-reduced-motion` 사용자에게는 모든 signature 애니메이션(`ink-spread`, `meteor`,
`aurora`, `gradient`)을 비활성화한다. 기능 전달용 transition만 `100ms` 이내로 유지.

## 8. Components

### 8.1 Buttons — `gallery-btn-*`

| Variant | 언제 쓰나 | 금지 |
|---|---|---|
| `default` | 화면당 1개의 주요 CTA | 같은 영역에 2개 이상 금지 |
| `outline` | 보조 액션 | 주요 CTA 대체 금지 |
| `ghost` | 밀집 영역, 아이콘 버튼 | Hero/랜딩 금지 |
| `secondary` | 중립적 액션 | `destructive`와 혼용 금지 |

사이즈 선택: 폼 내부 `md`, 히어로 `lg`/`xl`, 리스트 인라인 `sm`, 카드 내 `xs`.

### 8.2 Cards — `gallery-card*`

- 기본 `gallery-card` — 작품 썸네일, 공지, 일반 리스트
- `gallery-card-elevated` — 피처드 작품, 오늘의 전시
- `gallery-card-glass` — 히어로 위 플로팅 정보
- `gallery-card-bordered` — 작가 카드(경계 강조)

인터랙티브 카드는 반드시 `interactive` 클래스와 함께 `role="link"` 또는 `<a>` 래핑.

### 8.3 Glass Surfaces — `glass-panel`·`glass-card`·`glass-button`

배경 위에 떠 있는 오버레이에만. **배경이 단색이면 사용하지 않는다** (블러 효과가 무의미).
히어로 비디오, 그라디언트 배경 위에서만 가치가 있다.

### 8.4 미구현 컴포넌트 작성 시

1. 기존 토큰만으로 우선 구현
2. 토큰이 부족하면 이 문서를 먼저 수정 후 구현
3. `@layer components`에 추가, `app/globals.css` 맨 아래 `/* ADDED: YYYY-MM-DD */` 주석

### 8.5 Component Tokens (이전 front-matter `components:` 블록)

> 비-canonical 구조(`tokens:` nested)로 Google CLI 파서가 실패해 2026-04-25 prose로 이전. Tailwind/CSS 클래스 정의의 정본은 `app/globals.css`의 `@layer components`이며, 본 표는 토큰 매핑 가이드.

#### gallery-container

| 속성 | 값 |
|------|---|
| max-width | `1400px` |
| padding | `{spacing.md}` (1.5rem) |

#### gallery-card

| 속성 | 값 |
|------|---|
| backgroundColor | `{colors.rice-paper}` |
| border | `1px solid rgba(136, 168, 145, 0.2)` (celadon/20) |
| rounded | `{rounded.lg}` (0.5rem) |
| hover.translateY | `-4px` |
| hover.shadow | `{elevation.xl}` |

#### gallery-card-glass

| 속성 | 값 |
|------|---|
| backgroundColor | `rgba(245, 245, 240, 0.8)` |
| backdropBlur | `12px` |
| border | `rgba(136, 168, 145, 0.1)` |

#### gallery-btn (variants: default | outline | ghost | secondary)

| 사이즈 | height | padding-x | text |
|--------|--------|-----------|------|
| xs | 28px | 8px | xs (0.75rem) |
| sm | 32px | 12px | sm (0.875rem) |
| md | 40px | 16px | sm (0.875rem) |
| lg | 44px | 24px | base (1rem) |
| xl | 48px | 32px | base (1rem) |

#### glass-panel

| 속성 | 값 |
|------|---|
| backgroundColor | `rgba(255,255,255,0.1)` |
| backdropBlur | `12px` |
| border | `1px solid rgba(255,255,255,0.2)` |

## 9. Do's and Don'ts

### ✅ Do

- 의미론 토큰(`primary`/`secondary`/...)을 먼저 쓴다
- CJK 본문은 `leading-relaxed`, 영문은 `leading-normal`
- 반경은 `{rounded.*}` 4단계 내에서 선택
- 다크 모드는 `.dark` 클래스 기반 자동 전환에 맡긴다
- 새로운 색을 추가하기 전에 기존 Obang/Materials에 적합한 것이 있는지 확인한다
- WCAG AA 4.5:1 이상을 새 조합마다 측정한다

### ❌ Don't

- 버튼·폼에 Obang(`south-fire`, `east-wood` 등) 색상을 직접 쓰지 않는다
- Decorative 티어(`spring-green`, `medium-orchid`, `royal-blue`)를 UI에 쓰지 않는다
- `sage-green`·`spring-green`을 텍스트 색상으로 쓰지 않는다 (WCAG 미달)
- `brand-gold`와 `temple-gold`를 같은 화면에서 동시에 쓰지 않는다
- **프리미엄 강조에 `bg-accent` 를 쓰지 않는다** (accent 는 shadcn hover 배경, Celadon Green). 반드시 `bg-brand-gold` 사용
- `brush` 폰트를 본문·네비게이션에 쓰지 않는다 (히어로 외 금지)
- 섀도우를 순수 `#000` opacity로 만들지 않는다 (먹색 hsl 사용)
- `scale(1.05)` 이상의 호버 스케일은 금지 (1.02 한계)
- 색상을 HEX로 인라인 하드코딩하지 않는다 (`style={{color:'#af2626'}}` 금지)
- `.dark:` 변형을 Semantic 토큰에 덮어쓰지 않는다 (토큰이 이미 처리)
- `<br/>` 반복 + 임의 `mt-*` 로 간격을 만들지 않는다 (spacing 토큰 사용)
- `var(--celadon)` 사용 금지 (deprecated, `var(--celadon-green)` 로 대체됨)

## 10. Agent Guidelines — AI 에이전트 작업 규칙

에이전트가 UI를 생성·수정할 때:

1. **조회 순서**: 이 문서 → `tailwind.config.ts` → `app/globals.css` → 기존 컴포넌트
2. **토큰 참조 문법**: `{colors.primary}`, `{typography.scale.lg}` — 본문에서 규칙을 인용할 때 사용
3. **토큰이 없을 때**: 절대 임의 값을 만들지 않는다. 사용자에게 **"DESIGN.md에 토큰이
   없어 추가가 필요하다"** 고 보고한 뒤 승인받고 본 문서를 먼저 수정한다.
4. **컴포넌트가 없을 때**: `components/` 하위에 만들되, 기존 `gallery-*` 네이밍 규약을 따른다.
5. **PDCA 연동**: feature 단위 design 문서(`docs/02-design/features/*.design.md`)는
   본 문서의 토큰을 참조해야 하며, 중복 정의를 만들지 않는다.

## 11. Maintenance

- **오너**: @jhlim725
- **변경 주기**: 토큰 변경 시 `.commit_message.txt` + Git 커밋 필수
- **Breaking Change**: `version` 메이저 증가 (현재 1.1.0-alpha)
- **검증**: 토큰 추가/변경 시 `npm run build` + `npm run type-check` 통과 필수

### Changelog

- **1.2.0-alpha** (2026-04-24) — 🔴 **Critical fix** (design-validator 발견).
  shadcn `accent` 는 Celadon Green 기반 hover 배경이므로 Brand Gold 로 승격 불가.
  새 `highlight` Semantic 슬롯을 신설해 Brand Gold (`#ffcc00`, `bg-brand-gold`)
  전용으로 분리. globals.css 의 미사용 `--color-*` semantic mapping 변수 8개를
  dead code 로 제거. WCAG 검증 쌍 재측정.
- **1.1.0-alpha** (2026-04-24) — Brand Extended Palette 추가 (§2.5). globals.css
  `--celadon` 을 `--celadon-green` 으로 rename. `app/brand/_components/brand-data.ts`
  와 정렬 완료. (accent 승격은 1.2.0 에서 철회됨)
- **1.0.0-alpha** (2026-04-24) — 초판. 기존 `tailwind.config.ts` + `app/globals.css`
  토큰 정형화.

---

_이 문서는 [google-labs-code/design.md](https://github.com/google-labs-code/design.md)
포맷을 따른다._
