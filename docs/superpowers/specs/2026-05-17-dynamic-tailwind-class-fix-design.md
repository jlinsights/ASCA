# 동적 Tailwind 클래스 버그 수정 — 설계서

- **날짜**: 2026-05-17
- **프로젝트**: ASCA (`/Users/jaehong/Developer/Projects/ASCA`)
- **출처**: `/superpowers:brainstorming` — 원 주제 "DESIGN.md OPTIMIZATION"에서 전수 감사 중 발견된 실제 버그로 재범위 설정 (갈래 1)
- **상태**: 설계 승인 완료 → writing-plans 대기

---

## 1. 배경 — 감사가 드러낸 것

원 요청은 "DESIGN.md 토큰 정리/축소"였다. 48색 토큰을 전수 감사한 결과:

- 색상 토큰은 비대하지 않았다. 진짜 미사용 토큰은 `moon-silver` **1개뿐**.
- `components/cultural/`의 5개 컴포넌트가 Tailwind 클래스명을 **동적으로 조합**한다 — `bg-${getEventTypeColor(event.type)}` 형태.
- Tailwind JIT는 소스의 **리터럴 문자열만** 스캔한다. `bg-${변수}`에서는 클래스를 생성하지 못한다. `tailwind.config.ts`에 `safelist`도 없다.
- 프로덕션 빌드 CSS(`.next/static/css/*.css`) 직접 검사로 확정: `bg-plum-purple`·`bg-spring-blossom`·`bg-winter-snow`·`bg-east-wood`·`bg-south-fire`·`bg-west-metal`·`bg-north-water`가 **0개 — 누락(purged)**. 정적으로도 쓰이는 토큰(`bg-celadon-green` 14, `bg-scholar-red` 13 등)만 우연히 생성되어 동작.

→ 해당 동적 색상이 프로덕션에서 배경/테두리 색 없이 렌더된다. `CalligraphyHero`의 계절 악센트, `CulturalCalendar`의 'performance'/'festival' 이벤트, `VirtualExhibition` 벽면 색 등이 깨져 있다.

### 감사 결정 정정 (중요)

브레인스토밍 중간에 "Obang(오방색)·Seasonal 세트의 미사용 토큰을 세트로 유지하고 DESIGN.md 본문에 '사용 0 — 세트 보존' 주석을 단다"는 결정이 있었다. **이 결정은 무효다.** 그 결정은 정적 grep만으로 "사용 0"이라 판단한 *틀린 전제* 위에서 나왔다. 재감사 결과 해당 토큰들은 동적 클래스로 실제 참조되고 있다. 세트 주석 작업은 본 사이클에서 수행하지 않는다.

---

## 2. 목표 & 성공 기준

`components/cultural/`의 5개 컴포넌트에서 동적 `bg-${token}` 클래스를 정적 클래스 lookup으로 치환해, 필요한 색상 클래스가 모두 프로덕션 CSS에 생성되도록 한다. 재발 방지 장치(문서 가이드라인 + ESLint 규칙)를 함께 둔다.

**성공 기준 (검증 가능)**

1. `npm run build` 후 컴파일된 CSS에 §4 매트릭스의 **88개 리터럴 클래스 전량**이 1개 이상 존재한다. (현재 7종 0개 → 수정 후 전부 ≥1)
2. `design:lint` · `design:diff` · `design:wcag` · `type-check` · `lint` · `test` 전부 통과.
3. ESLint 규칙이 동적 클래스 패턴을 차단하며, 수정 후 코드베이스에서 false positive 0건으로 통과한다.
4. 5개 컴포넌트의 before/after 스크린샷에서 동적 색상이 실제로 렌더된다.

---

## 3. 수정 대상 — 6개 매핑 함수

| 컴포넌트 | 함수 | 정의 위치 | 동적 호출 지점 |
|---|---|---|---|
| `CulturalCalendar.tsx` | `getEventTypeColor` | L258 | L298, L323, L391, L520, L637 |
| `CulturalCalendar.tsx` | `getSeasonalColor` | L243 | L444, L662 |
| `CalligraphyHero.tsx` | `getSeasonalAccent` | L88 | L221, L231, L232, L295, L296, L352 |
| `VirtualExhibition.tsx` | `getWallColor` | L160 | L190 |
| `ArtistPortfolioGrid.tsx` | `getStatusColor` | L141 | L209 |
| `LearningHub.tsx` | `getDifficultyColor` | L172 | L334, L379 |

`CalligraphyHero.getElementColor` (L102) — 정의만 있고 **호출되지 않는 죽은 코드**. 본 사이클에서 **제거**한다 (사용자 결정). 함수 본문 및 정의 전체 삭제.

> 행 번호는 작성 시점 기준. 구현 시 함수명으로 재확인할 것.

---

## 4. 정적 클래스 매트릭스 (구현의 테스트 오라클)

각 함수가 *토큰명 문자열* 대신 *완성된 리터럴 클래스 묶음*을 반환하도록 한다. 아래 83개 리터럴이 소스에 그대로 존재해야 Tailwind가 생성한다. **이 표가 구현 명세이자 검증 기준이다.**

### 4.1 `getEventTypeColor` — 7토큰 × 6형태 = 42

토큰 매핑: `exhibition→temple-gold` · `workshop→summer-jade` · `ceremony→vermillion` · `festival→spring-blossom` · `lecture→celadon-green` · `performance→plum-purple` · `default→ink-black`

각 토큰 `X`마다: `bg-X` · `text-X` · `border-X` · `hover:border-X/40` · `hover:bg-X/80` · `bg-X/20`

```
temple-gold:    bg-temple-gold text-temple-gold border-temple-gold hover:border-temple-gold/40 hover:bg-temple-gold/80 bg-temple-gold/20
summer-jade:    bg-summer-jade text-summer-jade border-summer-jade hover:border-summer-jade/40 hover:bg-summer-jade/80 bg-summer-jade/20
vermillion:     bg-vermillion text-vermillion border-vermillion hover:border-vermillion/40 hover:bg-vermillion/80 bg-vermillion/20
spring-blossom: bg-spring-blossom text-spring-blossom border-spring-blossom hover:border-spring-blossom/40 hover:bg-spring-blossom/80 bg-spring-blossom/20
celadon-green:  bg-celadon-green text-celadon-green border-celadon-green hover:border-celadon-green/40 hover:bg-celadon-green/80 bg-celadon-green/20
plum-purple:    bg-plum-purple text-plum-purple border-plum-purple hover:border-plum-purple/40 hover:bg-plum-purple/80 bg-plum-purple/20
ink-black:      bg-ink-black text-ink-black border-ink-black hover:border-ink-black/40 hover:bg-ink-black/80 bg-ink-black/20
```

### 4.2 `getSeasonalColor` — 5토큰 × 1형태 = 5

토큰 매핑: `spring→spring-blossom` · `summer→summer-jade` · `autumn→autumn-gold` · `winter→winter-snow` · `default→celadon-green`

`bg-spring-blossom` · `bg-summer-jade` · `bg-autumn-gold` · `bg-winter-snow` · `bg-celadon-green`

### 4.3 `getSeasonalAccent` — 5토큰 × 5형태 = 25

토큰 매핑: `getSeasonalColor`와 동일 (spring/summer/autumn/winter/default)

각 토큰 `X`마다: `bg-X` · `bg-X/10` · `hover:bg-X/80` · `border-X` · `text-X`

```
spring-blossom: bg-spring-blossom bg-spring-blossom/10 hover:bg-spring-blossom/80 border-spring-blossom text-spring-blossom
summer-jade:    bg-summer-jade bg-summer-jade/10 hover:bg-summer-jade/80 border-summer-jade text-summer-jade
autumn-gold:    bg-autumn-gold bg-autumn-gold/10 hover:bg-autumn-gold/80 border-autumn-gold text-autumn-gold
winter-snow:    bg-winter-snow bg-winter-snow/10 hover:bg-winter-snow/80 border-winter-snow text-winter-snow
celadon-green:  bg-celadon-green bg-celadon-green/10 hover:bg-celadon-green/80 border-celadon-green text-celadon-green
```

> L295·L296은 `bg-X text-ink-black` 와 `hover:bg-X/80` 두 리터럴로 나뉘어 있으나 같은 버튼의 클래스다.

### 4.4 `getWallColor` — 3토큰 × 1형태 = 3

반환값: `rice-paper` · `west-metal` · `winter-snow` (default 포함 distinct 3개)

`bg-rice-paper` · `bg-west-metal` · `bg-winter-snow`

### 4.5 `getStatusColor` — 4토큰 × 2형태 = 8

반환값: `temple-gold` · `summer-jade` · `autumn-gold` · `celadon-green`

각 토큰 `X`마다: `bg-X` · `border-X`

### 4.6 `getDifficultyColor` — 5토큰 × 1형태 = 5

반환값: `summer-jade` · `autumn-gold` · `vermillion` · `temple-gold` · `celadon-green`

`bg-summer-jade` · `bg-autumn-gold` · `bg-vermillion` · `bg-temple-gold` · `bg-celadon-green`

**합계: 42 + 5 + 25 + 3 + 8 + 5 = 88개 리터럴.** (맵 간 중복 토큰 존재 — 검증 시 unique 셋으로 grep해도 무방, 모두 ≥1이면 통과)

전제: 위 토큰은 전부 `tailwind.config.ts`에 정의되어 있어 클래스가 유효하게 해석된다. (감사로 확인 완료)

---

## 5. 구현 설계

### 5.1 클래스 맵 파일

신규 파일: **`components/cultural/_constants/color-classes.ts`**

- `components/` 하위 → Tailwind `content` glob(`./components/**/*.{ts,tsx}`)에 포함되어 스캔됨. **`lib/`는 content glob에 없으므로 금지** — 거기 두면 같은 버그가 재발한다.
- 6개 맵을 한 파일에 둔다. 이미 max-lines(500) 초과인 5개 컴포넌트를 더 키우지 않고, 레포의 기존 "data 분리" 패턴(component-split Phase 2)을 따른다.

파일 구조 (예시 — `getEventTypeColor` 항목):

```ts
// components/cultural/_constants/color-classes.ts
export const EVENT_TYPE_CLASSES = {
  exhibition: { bg: 'bg-temple-gold', text: 'text-temple-gold', border: 'border-temple-gold',
    hoverBorder: 'hover:border-temple-gold/40', hoverBg: 'hover:bg-temple-gold/80', bgSoft: 'bg-temple-gold/20' },
  // workshop, ceremony, festival, lecture, performance ...
  default: { bg: 'bg-ink-black', text: 'text-ink-black', border: 'border-ink-black',
    hoverBorder: 'hover:border-ink-black/40', hoverBg: 'hover:bg-ink-black/80', bgSoft: 'bg-ink-black/20' },
} as const
```

각 맵의 키 형태(`bg`/`text`/`border`/`hoverBorder`/`hoverBg`/`bgSoft` 등)는 §4의 "필요 형태"와 1:1 대응한다. 함수별로 필요한 형태만 정의한다 (예: `getWallColor`는 `bg`만, `getStatusColor`는 `bg`+`border`만).

### 5.2 함수 리팩터

각 `get*Color`는 토큰명 대신 맵 항목(클래스 묶음 객체)을 반환한다. `default` 케이스는 맵의 `default` 키로 흡수.

```ts
const getEventTypeColor = (type: string) =>
  EVENT_TYPE_CLASSES[type as keyof typeof EVENT_TYPE_CLASSES] ?? EVENT_TYPE_CLASSES.default
```

### 5.3 호출부 치환

동적 보간을 정적 속성 접근으로 바꾼다. 예시 (`CulturalCalendar.tsx` L391):

```tsx
// before
`bg-${getEventTypeColor(event.type)} text-ink-black hover:bg-${getEventTypeColor(event.type)}/80`
// after
const c = getEventTypeColor(event.type)
// ... `${c.bg} text-ink-black ${c.hoverBg}`
```

함수가 한 JSX 블록에서 여러 번 호출되면 지역 변수로 한 번만 평가한다.

### 5.4 죽은 코드 제거

`CalligraphyHero.tsx`의 `getElementColor` 함수 정의 전체 삭제. 삭제로 발생하는 미사용 import가 있으면 함께 정리한다 (본 변경이 만든 orphan만).

---

## 6. 재발 방지

### 6.1 DESIGN.md 가이드라인

`docs/02-design/DESIGN.md` §10 "Agent Guidelines — AI 에이전트 작업 규칙"에 규칙 1줄 추가:

> **Tailwind 클래스명을 `bg-${변수}`처럼 동적 조합하지 말 것.** JIT가 리터럴만 스캔하므로 동적 클래스는 프로덕션 CSS에서 누락된다. 색상은 정적 클래스 lookup 맵(`_constants/color-classes.ts` 패턴)으로 표현한다.

### 6.2 ESLint 규칙

`.eslintrc.json`에 `no-restricted-syntax` 규칙 추가. 의도: `className` 등에서 Tailwind 유틸리티 접두사 직후에 `${...}` 보간이 오는 템플릿 리터럴을 차단.

- 접근: 템플릿 리터럴의 quasi(raw)가 `/(^|\s)(bg|text|border|ring|from|to|via|fill|stroke)-$/` 로 끝나고 그 뒤에 표현식이 오는 패턴을 AST 셀렉터로 잡는다.
- **구현 시 검증 필수**: (a) 5개 컴포넌트 수정 *후* 코드베이스 전체에서 false positive 0건일 것, (b) 의도한 동적 패턴은 실제로 잡힐 것 — 임시 테스트 라인으로 확인 후 제거. 셀렉터가 과탐/누락되면 정규식을 조정한다.
- 규칙은 `.tsx`/`.ts` 대상. 차단 메시지에 §6.1 가이드라인을 안내한다.

---

## 7. 검증 절차

1. **CSS 생성 검증 (핵심)** — `npm run build` 후 `.next/static/css/*.css`에서 §4의 88개 리터럴을 전수 grep. 전부 ≥1이어야 한다. 이 검사만이 본 버그를 증명한다 (lint/type-check/test로는 불가).
2. `npm run design:lint` · `design:diff` · `design:wcag` 통과.
3. `npm run type-check` · `lint` · `test` 통과. ESLint 규칙이 깨끗하게 통과.
4. **시각 검증** — `CulturalCalendar`·`CalligraphyHero`·`VirtualExhibition`·`ArtistPortfolioGrid`·`LearningHub` before/after 스크린샷(최소 1개 브레이크포인트). 동적 색상이 실제 렌더되는지 육안 확인.

---

## 8. 비범위

- **`moon-silver` 제거** — 유일한 진짜 미사용 색상 토큰. 본 사이클과 무관한 trivial 작업이므로 분리. 별도 후속에서 `DESIGN.md` + `tailwind.config.ts` 2줄 동시 제거(`design:diff` 게이트 유지).
- **Obang/Seasonal 세트 주석** — §1의 "감사 결정 정정"에 따라 수행하지 않음.
- **component-split Phase 3-4** (max-lines 초과 11파일) — 별도 사이클.
- **typography front-matter 토큰 8종** — Tailwind 유틸리티가 아닌 스펙 추상 토큰. 본 버그와 무관, 손대지 않음.
- **`rounded`/`spacing` 토큰** — 감사 결과 정리 대상 없음 (단, `spacing` 블록이 `layout.spacing`과 값 중복 — 별건, 본 사이클 외).

---

## 9. 변경 파일 요약

| 파일 | 변경 |
|---|---|
| `components/cultural/_constants/color-classes.ts` | 신규 — 6개 클래스 맵 |
| `components/cultural/CulturalCalendar.tsx` | `getEventTypeColor`·`getSeasonalColor` 리팩터, 호출부 7곳 치환 |
| `components/cultural/CalligraphyHero.tsx` | `getSeasonalAccent` 리팩터, 호출부 5곳 치환, `getElementColor` 삭제 |
| `components/cultural/VirtualExhibition.tsx` | `getWallColor` 리팩터, 호출부 1곳 치환 |
| `components/cultural/ArtistPortfolioGrid.tsx` | `getStatusColor` 리팩터, 호출부 1곳 치환 |
| `components/cultural/LearningHub.tsx` | `getDifficultyColor` 리팩터, 호출부 2곳 치환 |
| `docs/02-design/DESIGN.md` | §10에 동적 클래스 금지 가이드라인 1줄 |
| `.eslintrc.json` | `no-restricted-syntax` 규칙 추가 |
