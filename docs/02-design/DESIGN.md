---
name: ASCA Design System
version: 2.0.0-alpha
description: >-
  사단법인 동양서예협회(ASCA) 웹사이트의 디자인 시스템 명세. 전통 동아시아
  예술의 색채·서체·질감을 현대 디지털 인터페이스 언어로 재해석한 토큰 집합. 본
  문서는 AI 코딩 에이전트가 UI를 생성·수정할 때 참조하는 단일 진실 공급원(SSOT).
  색상은「브랜드 의미론 이름」과「shadcn / Tailwind 슬롯(app/globals.css)」이
  1:1로 같지 않을 수 있으므로 §2.1에서 두 층을 구분한다.
references:
  tailwind: tailwind.config.ts
  globals: app/globals.css
  brand-page: app/brand/page.tsx
  brand-data: app/brand/_components/brand-data.ts
  copy: copy.md
  layout: app/layout.tsx
  home-styles: components/home/home.css
  home-copy: lib/i18n/translations/home.ts

# ─────────────────────────────────────────────
# COLORS — 브랜드 팔레트 + shadcn 시맨틱 슬롯 (구현 = app/globals.css :root)
# YAML 키 primary/secondary 는 Tailwind bg-primary/bg-secondary 와 동일 의미.
# 2026-10-10 ASCA Ink System(Navy & Gold) 채택 — 토큰 이름은 유지, 값만 교체. §2.0 참조.
# ─────────────────────────────────────────────
colors:
  # shadcn 시맨틱 슬롯 (WCAG 검증·design-lint 대상 — globals.css OKLCH의 HEX 근사)
  primary: '#0b1733' # navy-900 深藍 — bg-primary / --primary (주 CTA·강조 버튼)
  primary-foreground: '#fbf8ef' # paper — 16.69:1
  secondary: '#f5e9c8' # gold-200 — 보조 표면·칩
  secondary-foreground: '#0b1733'
  accent: '#d4a84a' # gold-500 正金 — hover·선택
  accent-foreground: '#0b1733' # 8.02:1
  highlight: '#d4a84a' # gold-500 — 수상·기념·프리미엄
  highlight-foreground: '#0b1733'
  destructive: '#a8201a' # seal-red 朱印 — 오류·낙관에만
  destructive-foreground: '#ffffff' # 7.28:1
  success: '#3f7a4e'
  warning: '#a77d24' # gold-700
  info: '#2a3f7a' # navy-600
  muted: '#f4efdd' # paper-2
  muted-foreground: '#424a5e' # stone-700 — muted 위 7.69:1

  # Surface (라이트 모드 기준)
  background: '#fbf8ef' # paper 宣紙
  foreground: '#0b1733' # navy-900
  card: '#ffffff'
  border: '#e5e0ce' # warm paper border
  input: '#d9d3bf'
  ring: '#c89729' # gold-600

  # Obang (오방색) — 동아시아 우주관의 5방위
  east-wood: '#4a7c59' # 동방-목-봄
  south-fire: '#d73527' # 남방-화-여름
  center-earth: '#f4e2d7' # 중앙-토-환절기
  west-metal: '#f2f2f2' # 서방-금-가을
  north-water: '#1e3a8a' # 북방-수-겨울

  # Seasonal (계절)
  spring-blossom: '#fad0c4' # 벚꽃 분홍
  summer-jade: '#7dd3c0' # 여름 옥색
  autumn-gold: '#fdb462' # 가을 황금
  winter-snow: '#ffffff' # 겨울 설백

  # Calligraphy Materials (서예 재료)
  ink-black: '#0b1733' # navy-900 · 본문 먹색
  rice-paper: '#fbf8ef' # paper 宣紙
  bamboo-green: '#6b7c32' # 대나무 붓대
  silk-cream: '#fbf5e4' # gold-100 cream paper
  lacquer-black: '#070d1a' # navy-950 墨玄
  vermillion: '#a8201a' # seal-red 朱印 낙관

  # Cultural Accents
  scholar-red: '#0b1733' # navy-900 — 이름만 유지(구 선비 홍색, 주 CTA 클래스)
  celadon-green: '#a77d24' # gold-700 — 이름만 유지(구 청자색). 글자로도 paper 위 3.53:1
  stone-gray: '#424a5e' # stone-700 — paper 위 AA
  temple-gold: '#d4a84a' # gold-500 正金
  plum-purple: '#8e4585' # 매화 자색

  # Brand Extended Palette (brand-data.ts 공식 PRIMARY_COLORS 정본)
  # Source: app/brand/_components/brand-data.ts
  brand-gold: '#ffcc00' # 레거시 브랜드 금색 — /brand 기존 표기 전용, 새 UI 금지
  terra-red: '#9b4444' # 전통 도장 주홍 — Scholar Red 의 차분한 보조
  sage-green: '#b7c4b7' # 문인화 절제된 초록 — Celadon Green 의 저채도 변형
  spring-green: '#09f557' # 생동·새 시작 — 장식 악센트 한정, UI 금지
  medium-orchid: '#c14af2' # 동양 난초 기품 — 장식 악센트 한정, UI 금지
  royal-blue: '#275eea' # 청화백자 청색 — 장식 악센트 한정, UI 금지

# ─────────────────────────────────────────────
# TYPOGRAPHY — Google DESIGN.md spec canonical tokens
# 확장 정보(family, scale, weight/tracking/leading)는 본문 prose 참조
# ─────────────────────────────────────────────
typography:
  display-lg:
    fontFamily: 'var(--font-display), var(--font-noto-serif-kr), serif'
    fontSize: '3.75rem' # 60px
  display-md:
    fontFamily: 'var(--font-display), var(--font-noto-serif-kr), serif'
    fontSize: '3rem' # 48px
  headline-lg:
    fontFamily: 'var(--font-display), var(--font-noto-serif-kr), serif'
    fontSize: '2.25rem' # 36px
  headline-md:
    fontFamily: 'var(--font-display), var(--font-noto-serif-kr), serif'
    fontSize: '1.875rem' # 30px
  title-lg:
    fontFamily: "'Pretendard', var(--font-noto-sans-kr), sans-serif"
    fontSize: '1.5rem' # 24px
  body-lg:
    fontFamily: "'Pretendard', var(--font-noto-sans-kr), sans-serif"
    fontSize: '1.125rem' # 18px
  body-md:
    fontFamily: "'Pretendard', var(--font-noto-sans-kr), sans-serif"
    fontSize: '1rem' # 16px
  label-sm:
    fontFamily: "'Pretendard', var(--font-noto-sans-kr), sans-serif"
    fontSize: '0.875rem' # 14px

# ─────────────────────────────────────────────
# LAYOUT — 8px 기반 스페이싱 + 컨테이너
# ─────────────────────────────────────────────
layout:
  container:
    center: true
    padding: '2rem'
    max: '1400px'
  spacing:
    xs: '0.5rem' # 8px
    sm: '1rem' # 16px
    md: '1.5rem' # 24px
    lg: '2rem' # 32px
    xl: '3rem' # 48px
    # 확장
    '18': '4.5rem'
    '88': '22rem'
    '104': '26rem'
    '128': '32rem'
  breakpoints:
    { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', 2xl: '1400px' }

# ─────────────────────────────────────────────
# SHAPES — 기본 0.375rem / 6px (--radius)
# ─────────────────────────────────────────────
rounded:
  none: '0rem' # 0px
  sm: '0.125rem' # 2px  (실 계산: var(--radius) - 4px)
  md: '0.25rem' # 4px  (실 계산: var(--radius) - 2px)
  lg: '0.375rem' # 6px  (--radius) — Ink System 기본 반경
  xl: '1rem' # 16px
  2xl: '1.5rem' # 24px
  full: '9999px'

# ─────────────────────────────────────────────
# SPACING — 8px 그리드 (canonical, layout.spacing 동일)
# ─────────────────────────────────────────────
spacing:
  xs: '0.5rem' # 8px
  sm: '1rem' # 16px
  md: '1.5rem' # 24px
  lg: '2rem' # 32px
  xl: '3rem' # 48px

# ─────────────────────────────────────────────
# ELEVATION — 남색 기반 섀도우 (hsl 222 54% 8%)
# ─────────────────────────────────────────────
elevation:
  # navy-tinted (hsl 222 54% 8%), never neutral black — Ink System
  2xs: '0 1px 2px 0 hsl(222 54% 8% / 0.06)'
  xs: '0 1px 3px 0 hsl(222 54% 8% / 0.08)'
  sm:
    '0 2px 4px -1px hsl(222 54% 8% / 0.1), 0 1px 2px -1px hsl(222 54% 8% / 0.06)'
  md:
    '0 8px 16px -4px hsl(222 54% 8% / 0.12), 0 4px 8px -2px hsl(222 54% 8% /
    0.08)'
  lg:
    '0 16px 32px -8px hsl(222 54% 8% / 0.14), 0 8px 16px -4px hsl(222 54% 8% /
    0.08)'
  xl:
    '0 24px 48px -12px hsl(222 54% 8% / 0.18), 0 12px 24px -6px hsl(222 54% 8% /
    0.1)'
  2xl: '0 32px 64px -16px hsl(222 54% 8% / 0.22)'

# ─────────────────────────────────────────────
# MOTION — 먹의 번짐에서 영감
# ─────────────────────────────────────────────
motion:
  duration: { fast: '150ms', normal: '250ms', slow: '400ms', brush: '720ms' }
  ease:
    out: 'cubic-bezier(0.16, 1, 0.3, 1)' # 붓을 들어올리는 느낌
    in-out: 'cubic-bezier(0.45, 0, 0.55, 1)' # 필압의 자연스러운 흐름
  signature:
    ink-spread: 'ink-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
# Components 매핑은 본문 §8(Components prose)에 정의. 이전 components: front-matter
# 블록은 비-canonical 구조(tokens/variants/sizes nested)로 Google CLI 파서를 실패시켜
# 2026-04-25 prose 로 이전 (정보 손실 0, lint clean).
---

# ASCA Design System

> 사단법인 동양서예협회의 웹 인터페이스는 **正法의 계승 발전과 創新의 조화로운
> 구현**을 원칙으로 한다. 본 문서는 그 원칙을 코드로 번역하기 위한 스펙이며, AI
> 에이전트와 디자이너·엔지니어가 동일한 토큰·명명·관계를 공유하게 한다.

## 1. Overview

ASCA는 서예라는 **무형의 정신성**을 디지털 인터페이스로 옮긴다. 따라서 시각
언어는 세 가지 축에서 균형을 찾는다.

| 축                  | 의미                                             | 디자인 결정                                                    |
| ------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| **전통 (正法)**     | 2,000년 이상 축적된 동아시아 색채·서체·여백 미학 | Obang 5방위색, 서예 재료(먹·한지·주인) 팔레트, CJK 세리프 우선 |
| **현대 (創新)**     | 디지털 UX가 요구하는 명료함과 접근성             | WCAG 2.1 AA 대비, OKLCH 색공간, 8px 그리드                     |
| **국제 (4개 언어)** | 한/영/중/일 모든 사용자에게 동등한 품질          | 언어별 폰트 스택, 유니코드 CJK 포괄, i18n 레이아웃             |

세 축 중 하나라도 포기하는 결정은 하지 않는다. **충돌이 있다면 접근성이
우선**이다.

### 1.1 문서와 구현의 역할

- 디자인 계약과 공통 토큰은 이 문서, 카피 작성 기준은 루트 `copy.md`를 따른다.
- 구현은 `tailwind.config.ts`, `app/globals.css`, 대상 컴포넌트의 CSS와
  대조한다. 외부 시안만으로 저장소 토큰이나 현재 노출 문구를 덮어쓰지 않는다.
- 홈의 `.asca-home` 테마는 `components/home/home.css`에 정의된 한정 범위다. 공통
  컴포넌트에 그 지역 변수·버튼 변형을 그대로 가져오지 않는다(§8.9).
- 문서에 명시한 원칙과 화면 적용 여부는 구분한다. 검증 결과는 실행한 명령과
  확인한 화면 범위를 함께 기록한다(§11).

## 2. Colors

### 2.0 ASCA Ink System 채택 (2026-10-10)

설계 출처는 Claude Design 프로젝트 **"ASCA Design System"**(ASCA Ink System —
Navy & Gold)이며, 저장소의 토큰 계약은 이 문서와 구현을 대조해 관리한다. 깊은
남색(`#0b1733`)을 바탕, 절제된 금색(`#d4a84a`)을 강조, 따뜻한 宣紙(`#fbf8ef`)를
밝은 면으로 쓰고, 朱印 홍색(`#a8201a`)은 낙관·오류에만 쓴다. 박물관 도록 같은
절제가 원칙이다.

**토큰 이름은 유지하고 값만 바꿨다.** 기존 클래스(`bg-scholar-red`,
`text-celadon-green` …)가 수백 곳에 있어, 이름을 바꾸는 대신 값을 Ink System
색으로 돌렸다. 그래서 **이름이 색을 말해 주지 않는다** — 새 코드는 아래 표의
시맨틱 슬롯(`bg-primary`, `bg-accent` …)을 쓴다.

| 기존 이름       | 이제의 값 | Ink System 이름 | 비고                                                   |
| --------------- | --------- | --------------- | ------------------------------------------------------ |
| `scholar-red`   | `#0b1733` | navy-900 深藍   | 주 CTA (구 선비 홍). 다크=gold-400, 다크 채움=navy-600 |
| `ink-black`     | `#0b1733` | navy-900        | 본문 먹색                                              |
| `celadon-green` | `#a77d24` | gold-700 古金   | 글자·배경 겸용 금색 (구 청자). paper 위 글자 3.53:1    |
| `temple-gold`   | `#d4a84a` | gold-500 正金   | 시그니처 금색 — 장식·큰 글자                           |
| `rice-paper`    | `#fbf8ef` | paper 宣紙      | 밝은 면                                                |
| `silk-cream`    | `#fbf5e4` | gold-100        | cream paper                                            |
| `lacquer-black` | `#070d1a` | navy-950 墨玄   | 가장 깊은 바탕                                         |
| `vermillion`    | `#a8201a` | seal-red 朱印   | 낙관 전용 — 버튼·글자 강조 금지                        |
| `stone-gray`    | `#424a5e` | stone-700       | 보조 텍스트                                            |

언어 우선순위는 **한국어 우선**을 유지한다(Ink System 원안은 번체 우선).
슬로건도 기존 브랜드 선언(法古創新 · 人書俱老)을 유지한다. 번체 한자 처리 규칙은
§3 과 BRAND 규칙을 따른다.

### 2.1 shadcn 시맨틱 슬롯 — `app/globals.css` 와 1:1 (코드 SSOT)

| 슬롯                      | Tailwind 예               | 라이트                | 다크                  | 용도                    |
| ------------------------- | ------------------------- | --------------------- | --------------------- | ----------------------- |
| `--primary`               | `bg-primary`              | `#0b1733` navy-900    | `#d4a84a` gold-500    | 주 버튼·강한 CTA        |
| `--primary-foreground`    | `text-primary-foreground` | `#fbf8ef`             | `#070d1a`             | primary 면 위 텍스트    |
| `--secondary`             | `bg-secondary`            | `#f5e9c8` gold-200    | `#1d2e5c` navy-700    | 보조 버튼·칩            |
| `--accent`                | `bg-accent`               | `#d4a84a` gold-500    | `#e2c074` gold-400    | hover·선택·하이라이트   |
| `--muted` / `-foreground` | `bg-muted`                | `#f4efdd` / `#424a5e` | `#142244` / `#9eb0d6` | 옅은 패널 / 보조 텍스트 |
| `--destructive`           | `bg-destructive`          | `#a8201a` seal-red    | `#c94a3f`             | 삭제·검증 오류          |
| `--ring`                  | `ring-ring`               | `#c89729` gold-600    | `#e2c074`             | 포커스 링               |
| `{colors.highlight}`      | `bg-highlight`            | `#d4a84a`             | —                     | 수상·프리미엄 배지      |

다크 모드에서는 Ink System 원안대로 **금색이 primary 로 올라온다**(남색 바탕 위
남색 버튼은 보이지 않으므로).

#### 2.1.1 상태·피드백

| 토큰 / Tailwind | HEX                  | 용도      |
| --------------- | -------------------- | --------- |
| `success`       | `#3f7a4e`            | 완료·승인 |
| `warning`       | `#a77d24` (gold-700) | 주의·임박 |
| `info`          | `#2a3f7a` (navy-600) | 정보·안내 |

#### 2.1.2 금색은 글자로 쓰지 않는다

`#d4a84a`(gold-500)는 paper 위 2.08:1 — **본문 글자 금지**, 헤어라인·배경·큰
장식 글자만. 금색 글자가 필요하면 gold-700(`text-celadon-green`, 3.53:1, 큰 글자
한정) 또는 gold-800(`#8a661c`, 4.95:1)을 쓴다. 금색 면 위 글자는
남색(`text-ink-black`, 4.73:1 on gold-700 · 8.02:1 on gold-500)이고, **흰 글자는
금색 면 위에서 AA 미달**이다.

### 2.2 Surface 레이어 — 배경/테두리

라이트·다크 모드 모두 OKLCH로 정의되어 있으며, 다크 모드는 `app/globals.css`의
`.dark` 클래스에서 자동 반전된다. 직접 HEX를 쓰지 말고 Tailwind
클래스(`bg-background`, `text-foreground`, `border-border`)를 사용한다.

### 2.3 Obang (오방색) — 문화적 정체성 표현에만

동·서·남·북·중앙의 5방위 색상은 **랜딩 히어로, 문화 소개 페이지, 계절 캠페인**
등 브랜드 내러티브가 필요한 영역에서만 사용한다. 일반 버튼·폼에는 금지.

### 2.4 Calligraphy Materials — 질감·배경·히어로

`ink-black`·`rice-paper`·`vermillion`·`silk-cream`은 서예 작품의 물성을 재현할
때 쓴다. 작품 상세 페이지, 작가 소개, 낙관 요소가 전형적 사용처.

### 2.5 Brand Extended Palette — 기존 브랜드 표기

`app/brand/_components/brand-data.ts`에는 Ink System과 레거시 색상 표기가 함께
남아 있다. 아래 확장 팔레트는 브랜드 표현용이며, 일반 UI의 기준은 §2.1이다.

| 토큰                     | HEX       | Tier       | 허용 사용처                                                   |
| ------------------------ | --------- | ---------- | ------------------------------------------------------------- |
| `{colors.brand-gold}`    | `#ffcc00` | **Legacy** | /brand 기존 표기만 유지. 새 UI에서는 `bg-highlight` 사용      |
| `{colors.terra-red}`     | `#9b4444` | Cultural   | Scholar Red 대비 차분한 보조 강조 (인용 블록, 섹션 헤더 밑줄) |
| `{colors.sage-green}`    | `#b7c4b7` | Cultural   | Celadon Green 의 저채도 변형 (배경 틴트, 메타 정보)           |
| `{colors.spring-green}`  | `#09f557` | Decorative | **UI 금지** — 브랜드 가이드·문화 캠페인 장식에만              |
| `{colors.medium-orchid}` | `#c14af2` | Decorative | **UI 금지** — 시즈널 캠페인 장식에만                          |
| `{colors.royal-blue}`    | `#275eea` | Decorative | **UI 금지** — 문화 캠페인 장식에만                            |

**Tier 의미:**

- **Legacy**: 기존 브랜드 표기 호환용이며 새 UI에는 사용하지 않음
- **Cultural**: 브랜드 맥락에서만 (작가 소개, 작품 리스트 등)
- **Decorative**: /brand 페이지, 랜딩 히어로, 시즈널 배너 외 금지

**`brand-gold`(`#ffcc00`)는 레거시다.** Ink System 은 "plastic gold" 를 쓰지
않는다 — 금색은 `#d4a84a`(gold-500) 하나다. `highlight` 슬롯과 `temple-gold` 는
이미 gold-500 으로 옮겼다. `brand-gold` 는 /brand 페이지의 기존 공식 색
표기(`brand-data.ts`) 때문에 값을 남겼으며, 새 UI 에는 쓰지 않는다. /brand
페이지 내용 갱신은 별도 작업이다.

### 2.6 WCAG 검증 쌍

아래 페어는 **front matter `colors` 의 리터럴 HEX** 에 대해 계산한 값이다. 정량
값은 `npm run design:wcag` 출력이 정본이다.

- `{colors.foreground}` on `{colors.background}` (navy on paper) — 16.69:1 ✅
- `{colors.primary-foreground}` on `{colors.primary}` — 16.69:1 ✅
- `{colors.secondary-foreground}` on `{colors.secondary}` — 14.67:1 ✅
- `{colors.accent-foreground}` on `{colors.accent}` (navy on gold-500) — 8.02:1
  ✅
- `{colors.destructive-foreground}` on `{colors.destructive}` — 7.28:1 ✅
- `{colors.muted-foreground}` on `{colors.muted}` — 7.69:1 ✅
- 다크: paper on navy-950 18.28:1 · navy-950 on gold-500 8.78:1 · navy-300 on
  navy-800 7.18:1 ✅
- ⚠️ gold-500 글자 on paper — 2.08:1 ❌ (§2.1.2)
- ⚠️ 흰 글자 on `celadon-green`(gold-700) — 3.75:1 (큰 글자만)
- ⚠️ `{colors.sage-green}` (`#b7c4b7`) 흰 배경 — 약 2.1:1 ❌ (텍스트 금지, 배경
  틴트/보더만)
- ⚠️ `{colors.spring-green}` (`#09f557`) 흰 배경 — 약 1.5:1 ❌ (텍스트 절대
  금지)

> 새 조합 추가 시
> [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 로
> 재측정 후 업데이트.

## 3. Typography

### 3.1 폰트 선택 규칙

1. **본문(UI)**: `{typography.family.sans}` — Pretendard + Noto Sans KR(폴백) +
   CJK
2. **헤딩·인용**: `{typography.family.serif}` — Playfair Display + Noto Serif KR
3. **서예 인용(원문)**: `{typography.family.calligraphy}` — Source Han Serif +
   KaiTi
4. **장식 히어로**: `{typography.family.brush}` — Ma Shan Zheng, **영웅 영역 외
   금지**
5. **코드**: `{typography.family.mono}` — JetBrains Mono

위 스택의 폰트 이름은 로딩 보장이 아니다. 현재 로딩 경로는 다음과 같다.

| 폰트             | 로딩 방식                                           | 변수·적용                         |
| ---------------- | --------------------------------------------------- | --------------------------------- |
| Pretendard       | `app/layout.tsx`의 버전 고정 CDN CSS                | `font-sans`의 첫 폰트             |
| Playfair Display | `next/font/local`, `public/fonts/playfair-display/` | `--font-display`                  |
| Noto Sans KR     | `app/globals.css`의 로컬 `@font-face`               | `--font-noto-sans-kr`             |
| Noto Serif KR    | `app/globals.css`의 로컬 `@font-face`               | `--font-noto-serif-kr`            |
| Noto Serif TC    | `app/layout.tsx`의 Google Fonts CSS                 | `--font-noto-serif-tc`, `font-tc` |

폰트 경로나 CDN을 바꾸면 `next.config.js`의 CSP도 대조한다. `--font-playfair`,
`--font-inter`, `--font-noto-sans`, `--font-noto-serif`를 새 코드의 폰트 변수로
사용하지 않는다. 다른 폴백 서체의 실제 선택 여부는 브라우저에서 확인한다.

### 3.2 언어별 자동 전환

UI 언어 코드는 `ko`, `en`, `ja`, `zh`이며 중국어 로케일은 `zh-TW`다.
`contexts/language-context.tsx`가 클라이언트의 `html.lang`을 갱신하며, 최초 서버
렌더는 `app/layout.tsx`의 한국어를 따른다. 언어 속성만으로 모든 폴백 폰트가 자동
로딩되지는 않는다.

협회명·슬로건 등 번체 한자에는 `lang='zh-Hant'` 또는 `lang='zh-TW'`를 단다.
`app/globals.css`의 해당 선택자와 `.cjk-tc-strict`는 Noto Serif TC를 적용한다.
`.cjk-tc-strict`는 언어 속성을 나누기 어려운 혼합 문장의 보완 수단이다. 일본어
본문의 자형을 번체 규칙으로 일괄 덮어쓰지 않는다.

### 3.3 스케일

1.25 ratio 기반 13단계 스케일. Display 크기(5xl 이상)는 랜딩 히어로·작품
타이틀에만 쓴다. 본문은 `base`(16px) 고정, 가이드 문구는 `sm`(14px), 캡션은
`xs`(12px).

### 3.4 행간·자간

- 한국어/중국어/일본어 본문: `leading-relaxed` (1.75) — CJK의 시각 밀도를 완화
- 영문 본문: `leading-normal` (1.5)
- 헤딩: `tracking-tight` (-0.025em)
- 전각 강조: `tracking-widest` (0.1em)

### 3.5 Typography Reference (extended)

> **Why prose**: Google DESIGN.md spec v1은 typography를 토큰별
> `{fontFamily, fontSize}` 객체로 정의한다. ASCA 고유 확장(family 9종, scale
> 13단계, weight/tracking/leading)은 본 prose 섹션에 보존하여
> `npx design.md lint` 통과와 정보 보존을 동시 달성한다.

#### 3.5.1 Font Families (확장 — front matter 외부)

| 토큰          | 정의                                                                                                                | 적용                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `sans`        | `"Pretendard", var(--font-noto-sans-kr), "Noto Sans CJK SC/TC/JP", system-ui, sans-serif`                           | UI 본문                                         |
| `serif`       | `var(--font-display)` (Playfair Display), `var(--font-noto-serif-kr), "Source Han Serif SC/TC", "Noto Serif CJK *"` | 헤드라인·인용                                   |
| `calligraphy` | `"Source Han Serif SC/TC/KR/JP", "Noto Serif CJK *", "KaiTi", "STKaiti", serif`                                     | 작품 정보, 한자                                 |
| `brush`       | `"Ma Shan Zheng", "Long Cang", "Source Han Serif SC", "Noto Serif CJK SC", cursive`                                 | 데코레이티브 (히어로 한정)                      |
| `mono`        | `"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace`                                                      | 코드, 좌표                                      |
| `korean`      | `var(--font-noto-serif-kr), "Source Han Serif KR", "Nanum Myeongjo", "Batang", serif`                               | 한국어 강조                                     |
| `chinese`     | `"Source Han Serif SC", "Noto Serif CJK SC", "SimSun", "Microsoft YaHei", serif`                                    | 레거시 간체 스택, 브랜드 한자에는 사용하지 않음 |
| `japanese`    | `"Noto Serif CJK JP", "Source Han Serif JP", "Yu Mincho", "Hiragino Mincho Pro", serif`                             | 일본어 강조                                     |
| `english`     | `var(--font-display), "Cormorant Garamond", "Georgia", serif`                                                       | 영어 강조                                       |
| `tc`          | `var(--font-noto-serif-tc), "Source Han Serif TC", "Noto Serif TC", serif`                                          | 번체 한자·브랜드 표기                           |

#### 3.5.2 Scale Mapping (Tailwind 13단계 ↔ canonical)

| Tailwind      | size / line-height          | canonical 토큰 | 용도               |
| ------------- | --------------------------- | -------------- | ------------------ |
| `xs`          | `0.75rem / 1rem` (12px)     | —              | metadata, footnote |
| `sm`          | `0.875rem / 1.25rem` (14px) | `label-sm`     | 라벨               |
| `base`        | `1rem / 1.5rem` (16px)      | `body-md`      | 본문 기본          |
| `lg`          | `1.125rem / 1.75rem` (18px) | `body-lg`      | 본문 강조          |
| `xl`          | `1.25rem / 1.75rem` (20px)  | —              | sub-heading        |
| `2xl`         | `1.5rem / 2rem` (24px)      | `title-lg`     | 카드 타이틀        |
| `3xl`         | `1.875rem / 2.25rem` (30px) | `headline-md`  | 섹션 헤더          |
| `4xl`         | `2.25rem / 2.5rem` (36px)   | `headline-lg`  | 페이지 헤더        |
| `5xl`         | `3rem / 1.1` (48px)         | `display-md`   | 영웅 보조          |
| `6xl`         | `3.75rem / 1.1` (60px)      | `display-lg`   | 영웅               |
| `7xl` ~ `9xl` | `4.5rem` ~ `8rem`           | —              | 메가 히어로 (예외) |

#### 3.5.3 Weight / Tracking / Leading

| 카테고리   | 토큰                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `weight`   | `thin(100)`, `light(300)`, `normal(400)`, `medium(500)`, `semibold(600)`, `bold(700)`, `black(900)`     |
| `tracking` | `tighter(-0.05em)`, `tight(-0.025em)`, `normal(0em)`, `wide(0.025em)`, `wider(0.05em)`, `widest(0.1em)` |
| `leading`  | `none(1)`, `tight(1.1)`, `snug(1.25)`, `normal(1.5)`, `relaxed(1.75)`, `loose(2)`                       |

위 값들은 Tailwind 기본값과 일치하므로 별도 config 불필요. CSS
클래스(`font-bold`, `tracking-tight`, `leading-relaxed`)로 직접 접근.

### 3.6 Color Pair Policy (WCAG)

> **Hard-fail pairs (verified by `npm run design:wcag`)** —
> `scripts/design-lint.ts`가 정의한 라이트 모드 YAML 색상 쌍은 모두 WCAG 2.1 AA
> 통과 필수. 이 검사는 실제 화면·다크 모드·홈 지역 변수의 대비를 검사하지
> 않는다. **P2**·**L2**는 남색 `primary`, **P3**는 밝은 금색 `secondary`
> 슬롯이다.

| 페어 | foreground / background                  | 최소 비율 | 크기       |
| ---- | ---------------------------------------- | --------- | ---------- |
| P1   | `foreground` / `background`              | 4.5:1     | 본문       |
| P2   | `primary-foreground` / `primary`         | 4.5:1     | 본문       |
| P3   | `secondary-foreground` / `secondary`     | 4.5:1     | 본문       |
| P4   | `accent-foreground` / `accent`           | 4.5:1     | 본문       |
| P5   | `highlight-foreground` / `highlight`     | 4.5:1     | 본문       |
| P6   | `destructive-foreground` / `destructive` | 4.5:1     | 본문       |
| P7   | `muted-foreground` / `muted`             | 4.5:1     | 본문       |
| P8   | `foreground` / `card`                    | 4.5:1     | 본문       |
| P9   | `foreground` / `card` (popover 대용)     | 4.5:1     | 본문       |
| L1   | `foreground` / `background`              | 3.0:1     | large text |
| L2   | `primary-foreground` / `primary`         | 3.0:1     | large text |

위 P8·P9는 현재 검사 스크립트의 대용 조합이다. `card-foreground`,
`popover-foreground`, `popover`의 실제 CSS 값은 화면에서 별도로 확인한다.

**Decorative-only (excluded from contrast lint)**:

- **Obang 5색** (`east-wood`, `south-fire`, `center-earth`, `west-metal`,
  `north-water`): 일러스트레이션·아이콘 전용
- **Seasonal 4색** (`spring-blossom`, `summer-jade`, `autumn-gold`,
  `winter-snow`): 카테고리 라벨 장식
- **Calligraphy 4색** (`bamboo-green`, `silk-cream`, `lacquer-black`,
  `vermillion`): 작품 메타데이터 색상
- **Brand Extended 6색** (`terra-red`, `sage-green`, `spring-green`,
  `brand-gold`, `medium-orchid`, `royal-blue`): brand 페이지 정체성 표시 전용

> **Rationale**: 전통 동아시아 5방위·계절·서예 색상은 의미 전달·장식 목적의 시각
> 표현이지 본문 텍스트 contrast 대상 아님. 텍스트 위에 사용 시 shadcn semantic
> 슬롯의 foreground 색을 함께 적용해야 한다.

## 4. Layout

### 4.1 컨테이너

`gallery-container`는 최대 1400px, 기본 좌우 `px-6`(1.5rem), 768px 이하
`px-4`(1rem)다. Tailwind `container`의 padding 2rem과 구분한다. 풀블리드
히어로는 별도 레이아웃을 사용한다.

### 4.2 스페이싱

모든 간격은 8px 배수. 토큰은 `{layout.spacing.*}`를 통해서만 참조하고, 임의의
`px` 값을 쓰지 않는다. 섹션 간 수직 간격은 모바일 `py-12`, 데스크톱 `py-20`이
기본.

### 4.3 그리드

`grid-cols-3 sm:grid-cols-4 md:grid-cols-6` — 컬러 팔레트 등 조밀한 카드에 쓰는
표준. 작품·전시 리스트는 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

## 5. Shapes

반경은 front matter의 `{rounded.*}` 토큰으로 제한. 개별 컴포넌트에서
`rounded-[Npx]` 임의값 금지.

| 용도            | 토큰          |
| --------------- | ------------- |
| 인풋·뱃지       | `sm`          |
| 버튼·카드       | `md`          |
| 다이얼로그·시트 | `lg`          |
| 히어로 미디어   | `xl` or `2xl` |
| 아바타·칩       | `full`        |

## 6. Elevation & Depth

라이트 모드 섀도우는 남색 기반 `hsl(222 54% 8%)`를 쓴다. 임의의 검은 그림자와
섞지 않는다. 다크 모드는 순수 검정 + 높은 opacity로 자동 전환된다.

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

`prefers-reduced-motion` 사용자에게는 모든 signature 애니메이션(`ink-spread`,
`meteor`, `aurora`, `gradient`)을 비활성화한다. 기능 전달용 transition만 `100ms`
이내로 유지.

## 8. Components

### 8.1 Buttons — `gallery-btn-*`

| Variant     | 언제 쓰나              | 금지                      |
| ----------- | ---------------------- | ------------------------- |
| `default`   | 화면당 1개의 주요 CTA  | 같은 영역에 2개 이상 금지 |
| `outline`   | 보조 액션              | 주요 CTA 대체 금지        |
| `ghost`     | 밀집 영역, 아이콘 버튼 | Hero/랜딩 금지            |
| `secondary` | 중립적 액션            | `destructive`와 혼용 금지 |

사이즈 선택: 폼 내부 `md`, 히어로 `lg`/`xl`, 리스트 인라인 `sm`, 카드 내 `xs`.

### 8.2 Cards — `gallery-card*`

- 기본 `gallery-card` — 작품 썸네일, 공지, 일반 리스트
- `gallery-card-elevated` — 피처드 작품, 오늘의 전시
- `gallery-card-glass` — 히어로 위 플로팅 정보
- `gallery-card-bordered` — 작가 카드(경계 강조)

인터랙티브 카드는 반드시 `interactive` 클래스와 함께 `role="link"` 또는 `<a>`
래핑.

### 8.3 Glass Surfaces — `glass-panel`·`glass-card`·`glass-button`

배경 위에 떠 있는 오버레이에만. **배경이 단색이면 사용하지 않는다** (블러 효과가
무의미). 히어로 비디오, 그라디언트 배경 위에서만 가치가 있다.

### 8.4 Enterprise Administrative UI — `admin-*`

- **Audit Log Viewer**:
  - `admin-log-row`: 타임스탬프, 주체, 행위, 리스크 점수(`risk-score`) 포함
  - `risk-indicator`: 리스크 점수에 따른 색상 변화 (0.0~0.3: `success`, 0.4~0.6:
    `warning`, 0.7+: `destructive`)
- **System Health Dashboard**:
  - `monitor-card`: CPU, 메모리, 레이턴시 지표를 담는 카드
  - `agent-status-grid`: 에이전트(`ArtistAgent` 등)의 활성 상태를 나타내는 미니
    그리드
- **Security Interstitials**:
  - `permission-denied-view`: 접근 권한 없음 안내 및 요청 버튼
  - `risk-validation-overlay`: 고위험 작업 전 2단계 인증/확인 팝업

### 8.5 Monitoring Visuals

- **Data Charts**:
  - 선형 차트(`stroke`): `celadon-green` (기본), `scholar-red` (임계치 초과)
  - 영역 채우기(`fill`): `celadon-green/10`
  - 격자선(`grid`): `border` (var(--border))

### 8.6 미구현 컴포넌트 작성 시

1. 기존 토큰만으로 우선 구현
2. 토큰이 부족하면 이 문서를 먼저 수정 후 구현
3. `@layer components`에 추가, `app/globals.css` 맨 아래
   `/* ADDED: YYYY-MM-DD */` 주석

### 8.7 Component Tokens (이전 front-matter `components:` 블록)

> 비-canonical 구조(`tokens:` nested)로 Google CLI 파서가 실패해 2026-04-25
> prose로 이전. Tailwind/CSS 클래스 정의의 정본은 `app/globals.css`의
> `@layer components`이며, 본 표는 토큰 매핑 가이드.

#### gallery-container

| 속성      | 값                           |
| --------- | ---------------------------- |
| max-width | `1400px`                     |
| padding   | 기본 1.5rem, 768px 이하 1rem |

#### gallery-card

| 속성             | 값                                              |
| ---------------- | ----------------------------------------------- |
| backgroundColor  | `{colors.rice-paper}`                           |
| border           | `border-celadon-green/20`, 다크 `border-border` |
| rounded          | `{rounded.lg}` (0.375rem)                       |
| hover.translateY | `-4px`                                          |
| hover.shadow     | `{elevation.xl}`                                |

#### gallery-card-glass

| 속성            | 값                                                 |
| --------------- | -------------------------------------------------- |
| backgroundColor | `bg-rice-paper/80`, 다크 `bg-card/80`              |
| backdropBlur    | `12px`                                             |
| border          | `border-celadon-green/10`, 다크 `border-border/30` |

#### gallery-btn (variants: default | outline | ghost | secondary)

| 사이즈 | height | padding-x | text          |
| ------ | ------ | --------- | ------------- |
| xs     | 28px   | 8px       | xs (0.75rem)  |
| sm     | 32px   | 12px      | sm (0.875rem) |
| md     | 40px   | 16px      | sm (0.875rem) |
| lg     | 44px   | 24px      | base (1rem)   |
| xl     | 48px   | 32px      | base (1rem)   |

#### glass-panel

| 속성            | 값                                |
| --------------- | --------------------------------- |
| backgroundColor | `rgba(255,255,255,0.1)`           |
| backdropBlur    | `12px`                            |
| border          | `1px solid rgba(255,255,255,0.2)` |

### 8.8 작가·작품 탐색 UI

`components/gallery/discovery-toolbar.tsx`를 공통 패턴으로 사용한다.

- 검색·정렬은 상단에 두고, 상세 조건은 `lg` 미만에서 접기 버튼으로 노출한다.
- 입력과 주요 조작은 `h-12`, 조건 칩은 `min-h-12`를 사용한다.
- 입력에는 보이는 label을 제공하고, 아이콘 버튼에는 동작을 설명하는 접근성
  이름을 둔다.
- 선택 조건은 개별 해제와 전체 초기화를 제공한다. 해제 후 검색 입력으로 포커스를
  돌린다.
- 결과 상태는 `role="status"`, `aria-live="polite"`로 알린다.
- 로딩·검색 결과 없음·미등록 데이터·조회 오류를 구분한다. 문구는 루트
  `copy.md`와 `components/gallery/discovery-copy.ts`를 참조한다.
- 배경·테두리·텍스트는 `card`, `border`, `foreground`, `muted-foreground`를
  사용한다.

### 8.9 홈 — 한정 범위의 에디토리얼 레이아웃

`app/page.tsx`는 `components/home/`의 히어로·전시·저널·입회 섹션을 조합하고
`components/home/home.css`를 읽는다. 공통 `gallery-*` 규칙과 구분한다.

| 항목           | 현재 홈 구현                                                   | 적용 범위                            |
| -------------- | -------------------------------------------------------------- | ------------------------------------ |
| 섹션 폭        | 최대 1280px, 기본 좌우 40px                                    | `.asca-section`, `.asca-join__inner` |
| 반응형 전환    | 960px·640px 이하에서 재배치                                    | 홈 CSS의 미디어 쿼리                 |
| 버튼           | `asca-btn--primary`, `--link`, `--ghost`, `--gold`, `--on-ink` | 홈 링크·CTA                          |
| 버튼 치수      | 최소 높이 44px, 기본 반경 2px                                  | `.asca-btn`                          |
| 작은 강조 글자 | 라이트 `--gold-800`, 다크 `--gold-400`                         | 지역 변수 `--accent-text`            |
| 모션           | `--dur-fast: 150ms`, `--dur-normal: 260ms`                     | 홈 지역 변수                         |

이 값은 기존 홈 구현의 한정 규칙이며 공통 간격·반경·모션 토큰을 대체하지 않는다.
새 페이지로 확장할 때는 공통 토큰과의 관계를 먼저 정의한다. 홈의 `--bg`, `--fg`,
`--accent-text`는 `.asca-home` 바깥에 정의된 전역 토큰으로 가정하지 않는다.

한국어 제목과 번체 제첨은 읽기 순서를 유지하고 각 섹션을 제목으로 연결한다. 홈의
전시·저널은 테두리와 날짜 열로 구분한 목록이다. 실제 링크를 유지하며, 클릭
이벤트만 있는 행으로 바꾸지 않는다. 새 창 링크는 카피의 언어별 안내를 제공한다.
`prefers-reduced-motion` 대응과 `:focus-visible`도 함께 확인한다.

## 9. Do's and Don'ts

### ✅ Do

- 의미론 토큰(`primary`/`secondary`/...)을 먼저 쓴다
- CJK 본문은 `leading-relaxed`, 영문은 `leading-normal`
- 반경은 `{rounded.*}`에 정의된 토큰에서 선택
- 다크 모드는 `.dark` 클래스 기반 자동 전환에 맡긴다
- 새로운 색을 추가하기 전에 기존 Obang/Materials에 적합한 것이 있는지 확인한다
- WCAG AA 4.5:1 이상을 새 조합마다 측정한다

### ❌ Don't

- 버튼·폼에 Obang(`south-fire`, `east-wood` 등) 색상을 직접 쓰지 않는다
- Decorative 티어(`spring-green`, `medium-orchid`, `royal-blue`)를 UI에 쓰지
  않는다
- `sage-green`·`spring-green`을 텍스트 색상으로 쓰지 않는다 (WCAG 미달)
- `brand-gold`와 `temple-gold`를 같은 화면에서 동시에 쓰지 않는다
- 레거시 `bg-brand-gold`를 새 UI에 쓰지 않는다. 수상·프리미엄 표시는
  `bg-highlight text-highlight-foreground`, 상호작용 강조는 `bg-accent`를
  사용한다.
- `brush` 폰트를 본문·네비게이션에 쓰지 않는다 (히어로 외 금지)
- 섀도우를 순수 `#000` opacity로 만들지 않는다 (먹색 hsl 사용)
- `scale(1.05)` 이상의 호버 스케일은 금지 (1.02 한계)
- 색상을 HEX로 인라인 하드코딩하지 않는다 (`style={{color:'#af2626'}}` 금지)
- `.dark:` 변형을 Semantic 토큰에 덮어쓰지 않는다 (토큰이 이미 처리)
- `<br/>` 반복 + 임의 `mt-*` 로 간격을 만들지 않는다 (spacing 토큰 사용)
- `var(--celadon)` 사용 금지 (deprecated, `var(--celadon-green)` 로 대체됨)

## 10. Agent Guidelines — AI 에이전트 작업 규칙

에이전트가 UI를 생성·수정할 때:

1. **조회 순서**: 이 문서 → `tailwind.config.ts` → `app/globals.css` → 기존
   컴포넌트
2. **토큰 참조 문법**: `{colors.primary}`, `{typography.body-lg}` — 본문에서
   규칙을 인용할 때 사용. **`{colors.primary}`는 YAML·Tailwind `primary` 슬롯
   (라이트 남색, 다크 금색, §2.1)** 이다. `celadon-green`은 레거시 이름이며 현재
   값은 gold-700이다. 이름으로 색상을 추정하지 않는다.
3. **토큰이 없을 때**: 절대 임의 값을 만들지 않는다. 사용자에게 **"DESIGN.md에
   토큰이 없어 추가가 필요하다"** 고 보고한 뒤 승인받고 본 문서를 먼저 수정한다.
4. **컴포넌트가 없을 때**: `components/` 하위에 만들되, 기존 `gallery-*` 네이밍
   규약을 따른다.
5. **PDCA 연동**: feature 단위 design
   문서(`docs/02-design/features/*.design.md`)는 본 문서의 토큰을 참조해야 하며,
   중복 정의를 만들지 않는다.
6. **동적 Tailwind 클래스명 금지**: `bg-${변수}`·`text-${변수}` 처럼 클래스명을
   동적 조합하지 말 것. Tailwind JIT는 소스의 리터럴 문자열만 스캔하므로 동적
   클래스는 프로덕션 CSS에서 누락된다. 색상·상태별 분기는 완성된 리터럴 클래스를
   담은 정적 lookup 맵으로 표현한다 (예:
   `components/cultural/_constants/color-classes.ts`). ESLint
   `no-restricted-syntax` 규칙이 이를 강제한다.

## 11. Maintenance

- **오너**: @jhlim725
- **변경 기록**: 문서·토큰 변경 시 `.commit_message.txt`를 갱신한다. Git 커밋은
  사용자의 명시적 요청이 있을 때만 수행한다.
- **Breaking Change**: 토큰 계약을 깨는 변경은 front matter `version`의 메이저를
  증가시킨다.
- **검증**: 문서 변경은 포맷과 `design:lint`·`design:wcag`·`design:diff`를
  확인한다. 토큰 구현 변경은 타입 검사와
  `NODE_ENV=production npm run build:full`도 확인한다. 검사 통과가 모든 화면의
  접근성을 증명하지는 않으므로 실제 화면을 별도로 검증한다.

| 검사                  | 확인 범위                                          | 별도 확인할 항목                                        |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| `npm run design:lint` | DESIGN.md의 구조·명세                              | 실제 CSS 적용·화면 품질                                 |
| `npm run design:diff` | YAML 색상과 Tailwind 리터럴·지원하는 RGB 채널 변수 | 직접 `var(...)`로 참조하는 시맨틱 색상·다크 모드·홈 CSS |
| `npm run design:wcag` | §3.6의 YAML 색상 쌍 대비                           | 렌더된 화면의 대비·키보드 조작·텍스트 확대              |

카피 문서 변경은 참조 경로와 번역 키·실제 링크도 대조한다. 문서만 바꿨다면
브라우저 확인·빌드·배포를 수행한 것으로 보고하지 않는다.

### Changelog

- **2.0.0-alpha 문서 보완** — 현재 폰트 로딩·번체 자형·홈 지역 스타일과 카피
  원본의 관계를 명시하고 디자인 검사의 실제 확인 범위를 정리. 토큰 값은 유지.

- **2.0.0-alpha 문서 정비** — Ink System의 레거시 금색 사용 제한, 컨테이너·반경·
  모션·그림자 정의를 현재 구현과 대조하고 탐색 UI 및 검증 지침을 보완.

- **1.3.0-alpha** (2026-05-10) — **Enterprise Phase 확장**: 관리자 대시보드,
  감사 로그, 에이전트 모니터링 UI 패턴 추가 (§8.4, §8.5). 리스크 점수 기반 시각
  지표 정의.
- **1.2.1-alpha** (2026-04-12) — §2.1 재구성: **브랜드 의미론**과 **shadcn 슬롯
  (`globals.css`)** 이중 층 명시. YAML `primary`/`secondary` 를 구현(SSOT)에
  맞춤(Primary=Scholar Red, Secondary=무채 표면). §2.6·§3.6·에이전트 가이드
  보강. `npm run design:wcag`·`design:diff` 통과 확인. shadcn `accent` 는
  Celadon Green 기반 hover 배경이므로 Brand Gold 로 승격 불가. 새 `highlight`
  Semantic 슬롯을 신설해 Brand Gold (`#ffcc00`, `bg-brand-gold`) 전용으로 분리.
  globals.css 의 미사용 `--color-*` semantic mapping 변수 8개를 dead code 로
  제거. WCAG 검증 쌍 재측정.
- **1.1.0-alpha** (2026-04-24) — Brand Extended Palette 추가 (§2.5). globals.css
  `--celadon` 을 `--celadon-green` 으로 rename.
  `app/brand/_components/brand-data.ts` 와 정렬 완료. (accent 승격은 1.2.0 에서
  철회됨)
- **1.0.0-alpha** (2026-04-24) — 초판. 기존 `tailwind.config.ts` +
  `app/globals.css` 토큰 정형화.

---

_이 문서는
[google-labs-code/design.md](https://github.com/google-labs-code/design.md)
포맷을 따른다._
