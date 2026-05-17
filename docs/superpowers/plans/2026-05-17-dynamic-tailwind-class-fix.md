# 동적 Tailwind 클래스 버그 수정 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `components/cultural/`의 5개 컴포넌트에서 동적 `bg-${token}` Tailwind 클래스를 정적 클래스 lookup 맵으로 치환해, 누락된 색상 클래스가 프로덕션 CSS에 생성되도록 한다.

**Architecture:** 6개 정적 클래스 맵을 `components/cultural/_constants/color-classes.ts`(Tailwind content glob에 포함된 경로)에 두고, 각 컴포넌트의 `get*Color` 함수가 토큰명 대신 완성된 리터럴 클래스를 반환하도록 리팩터한다. 재발은 DESIGN.md 가이드라인 + ESLint `no-restricted-syntax` 규칙으로 막는다.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS 3 (JIT), Jest, ESLint

**참조 설계서:** `docs/superpowers/specs/2026-05-17-dynamic-tailwind-class-fix-design.md`

**커밋 주의:** 프로젝트 `CLAUDE.md`는 자동 커밋을 금지한다 — 본 계획 실행 자체가 명시적 요청에 해당하므로 태스크별 커밋을 수행하되, 각 커밋 전 `.commit_message.txt`에 한 줄 설명(이모지·한국어)을 덮어쓴다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `components/cultural/_constants/color-classes.ts` | 신규. 6개 정적 클래스 맵 (SSOT) |
| `components/cultural/_constants/__tests__/color-classes.test.ts` | 신규. 맵 리터럴 정합성 단위 테스트 |
| `components/cultural/CulturalCalendar.tsx` | `getEventTypeColor`·`getSeasonalColor` 리팩터 + 호출부 7곳 |
| `components/cultural/CalligraphyHero.tsx` | `getSeasonalAccent` 리팩터 + 호출부 6곳, `getElementColor` 삭제 |
| `components/cultural/VirtualExhibition.tsx` | `getWallColor` 리팩터 + 호출부 1곳 |
| `components/cultural/ArtistPortfolioGrid.tsx` | `getStatusColor` 리팩터 + 호출부 1곳 |
| `components/cultural/LearningHub.tsx` | `getDifficultyColor` 리팩터 + 호출부 2곳 |
| `docs/02-design/DESIGN.md` | §10에 동적 클래스 금지 가이드라인 |
| `.eslintrc.json` | `no-restricted-syntax` 규칙 추가 |

---

## Task 1: 정적 클래스 맵 + 단위 테스트

**Files:**
- Create: `components/cultural/_constants/color-classes.ts`
- Test: `components/cultural/_constants/__tests__/color-classes.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`components/cultural/_constants/__tests__/color-classes.test.ts`:

```ts
import {
  EVENT_TYPE_CLASSES,
  SEASONAL_ACCENT_CLASSES,
  STATUS_CLASSES,
  SEASONAL_BG,
  WALL_BG,
  DIFFICULTY_BG,
} from '../color-classes'

// 완성된 리터럴 클래스만 허용 — 동적 보간(${) 절대 불가
const VALID_CLASS = /^(hover:)?(bg|text|border)-[a-z-]+(\/\d+)?$/

describe('color-classes 정적 맵', () => {
  it('동적으로 깨졌던 토큰의 클래스가 리터럴로 존재한다', () => {
    expect(EVENT_TYPE_CLASSES.performance.bg).toBe('bg-plum-purple')
    expect(EVENT_TYPE_CLASSES.festival.bg).toBe('bg-spring-blossom')
    expect(SEASONAL_ACCENT_CLASSES.winter.hoverBg).toBe('hover:bg-winter-snow/80')
    expect(WALL_BG.modern).toBe('bg-west-metal')
  })

  it('모든 맵의 모든 클래스 문자열이 완성된 리터럴이다', () => {
    const all: string[] = []
    for (const s of Object.values(EVENT_TYPE_CLASSES)) all.push(...Object.values(s))
    for (const s of Object.values(SEASONAL_ACCENT_CLASSES)) all.push(...Object.values(s))
    for (const s of Object.values(STATUS_CLASSES)) all.push(...Object.values(s))
    all.push(...Object.values(SEASONAL_BG), ...Object.values(WALL_BG), ...Object.values(DIFFICULTY_BG))

    expect(all.length).toBe(89)
    for (const cls of all) {
      expect(cls).not.toContain('${')
      expect(cls).toMatch(VALID_CLASS)
    }
  })

  it('모든 맵에 default 키가 있다 (fallback 보장)', () => {
    expect(EVENT_TYPE_CLASSES.default).toBeDefined()
    expect(SEASONAL_ACCENT_CLASSES.default).toBeDefined()
    expect(STATUS_CLASSES.default).toBeDefined()
    expect(SEASONAL_BG.default).toBeDefined()
    expect(WALL_BG.default).toBeDefined()
    expect(DIFFICULTY_BG.default).toBeDefined()
  })
})
```

> **89 = 맵 값 개수 합** — EVENT_TYPE 7×6=42 + SEASONAL_ACCENT 5×5=25 + STATUS 4×2=8 + SEASONAL_BG 5 + WALL_BG 4 + DIFFICULTY_BG 5. 설계서 §4 매트릭스의 *88*은 **유니크 리터럴** 수 — WALL_BG의 `bg-rice-paper`가 `traditional`·`default` 두 키에 중복되어 값 개수(89)와 1 차이. 본 테스트는 맵 값 개수를 세므로 `toBe(89)`.

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- color-classes`
Expected: FAIL — `Cannot find module '../color-classes'`

- [ ] **Step 3: 맵 파일 작성**

`components/cultural/_constants/color-classes.ts`:

```ts
// 정적 Tailwind 클래스 맵 — 동적 `bg-${token}` 조합 금지(DESIGN.md §10) 대응.
// 모든 값은 완성된 리터럴 클래스 문자열이어야 Tailwind JIT가 생성한다.

export type EventTypeClassSet = {
  bg: string
  text: string
  border: string
  hoverBorder: string
  hoverBg: string
  bgSoft: string
}

// CulturalCalendar.getEventTypeColor 용 — exhibition/workshop/ceremony/festival/lecture/performance
export const EVENT_TYPE_CLASSES: Record<string, EventTypeClassSet> = {
  exhibition: { bg: 'bg-temple-gold', text: 'text-temple-gold', border: 'border-temple-gold', hoverBorder: 'hover:border-temple-gold/40', hoverBg: 'hover:bg-temple-gold/80', bgSoft: 'bg-temple-gold/20' },
  workshop: { bg: 'bg-summer-jade', text: 'text-summer-jade', border: 'border-summer-jade', hoverBorder: 'hover:border-summer-jade/40', hoverBg: 'hover:bg-summer-jade/80', bgSoft: 'bg-summer-jade/20' },
  ceremony: { bg: 'bg-vermillion', text: 'text-vermillion', border: 'border-vermillion', hoverBorder: 'hover:border-vermillion/40', hoverBg: 'hover:bg-vermillion/80', bgSoft: 'bg-vermillion/20' },
  festival: { bg: 'bg-spring-blossom', text: 'text-spring-blossom', border: 'border-spring-blossom', hoverBorder: 'hover:border-spring-blossom/40', hoverBg: 'hover:bg-spring-blossom/80', bgSoft: 'bg-spring-blossom/20' },
  lecture: { bg: 'bg-celadon-green', text: 'text-celadon-green', border: 'border-celadon-green', hoverBorder: 'hover:border-celadon-green/40', hoverBg: 'hover:bg-celadon-green/80', bgSoft: 'bg-celadon-green/20' },
  performance: { bg: 'bg-plum-purple', text: 'text-plum-purple', border: 'border-plum-purple', hoverBorder: 'hover:border-plum-purple/40', hoverBg: 'hover:bg-plum-purple/80', bgSoft: 'bg-plum-purple/20' },
  default: { bg: 'bg-ink-black', text: 'text-ink-black', border: 'border-ink-black', hoverBorder: 'hover:border-ink-black/40', hoverBg: 'hover:bg-ink-black/80', bgSoft: 'bg-ink-black/20' },
}

export type SeasonalAccentClassSet = {
  bg: string
  bgSoft10: string
  hoverBg: string
  border: string
  text: string
}

// CalligraphyHero.getSeasonalAccent 용 — spring/summer/autumn/winter
export const SEASONAL_ACCENT_CLASSES: Record<string, SeasonalAccentClassSet> = {
  spring: { bg: 'bg-spring-blossom', bgSoft10: 'bg-spring-blossom/10', hoverBg: 'hover:bg-spring-blossom/80', border: 'border-spring-blossom', text: 'text-spring-blossom' },
  summer: { bg: 'bg-summer-jade', bgSoft10: 'bg-summer-jade/10', hoverBg: 'hover:bg-summer-jade/80', border: 'border-summer-jade', text: 'text-summer-jade' },
  autumn: { bg: 'bg-autumn-gold', bgSoft10: 'bg-autumn-gold/10', hoverBg: 'hover:bg-autumn-gold/80', border: 'border-autumn-gold', text: 'text-autumn-gold' },
  winter: { bg: 'bg-winter-snow', bgSoft10: 'bg-winter-snow/10', hoverBg: 'hover:bg-winter-snow/80', border: 'border-winter-snow', text: 'text-winter-snow' },
  default: { bg: 'bg-celadon-green', bgSoft10: 'bg-celadon-green/10', hoverBg: 'hover:bg-celadon-green/80', border: 'border-celadon-green', text: 'text-celadon-green' },
}

export type StatusClassSet = { bg: string; border: string }

// ArtistPortfolioGrid.getStatusColor 용 — featured/active/historical
export const STATUS_CLASSES: Record<string, StatusClassSet> = {
  featured: { bg: 'bg-temple-gold', border: 'border-temple-gold' },
  active: { bg: 'bg-summer-jade', border: 'border-summer-jade' },
  historical: { bg: 'bg-autumn-gold', border: 'border-autumn-gold' },
  default: { bg: 'bg-celadon-green', border: 'border-celadon-green' },
}

// CulturalCalendar.getSeasonalColor 용 — bg 클래스만 필요
export const SEASONAL_BG: Record<string, string> = {
  spring: 'bg-spring-blossom',
  summer: 'bg-summer-jade',
  autumn: 'bg-autumn-gold',
  winter: 'bg-winter-snow',
  default: 'bg-celadon-green',
}

// VirtualExhibition.getWallColor 용 — galleryLayout.style 키
export const WALL_BG: Record<string, string> = {
  traditional: 'bg-rice-paper',
  modern: 'bg-west-metal',
  minimalist: 'bg-winter-snow',
  default: 'bg-rice-paper',
}

// LearningHub.getDifficultyColor 용 — beginner/intermediate/advanced/master
export const DIFFICULTY_BG: Record<string, string> = {
  beginner: 'bg-summer-jade',
  intermediate: 'bg-autumn-gold',
  advanced: 'bg-vermillion',
  master: 'bg-temple-gold',
  default: 'bg-celadon-green',
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- color-classes`
Expected: PASS — 3 tests

- [ ] **Step 5: 타입 체크**

Run: `npm run type-check`
Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '✨ cultural 컴포넌트 정적 Tailwind 클래스 맵 추가' > .commit_message.txt
git add components/cultural/_constants/color-classes.ts components/cultural/_constants/__tests__/color-classes.test.ts .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 2: CulturalCalendar.tsx 리팩터

**Files:**
- Modify: `components/cultural/CulturalCalendar.tsx` (함수 `getSeasonalColor` L243~, `getEventTypeColor` L258~; 호출부 L298, L323, L391, L444, L520, L637, L662)

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 추가:

```ts
import { EVENT_TYPE_CLASSES, SEASONAL_BG } from './_constants/color-classes'
```

- [ ] **Step 2: 두 함수를 맵 lookup으로 교체**

`getSeasonalColor`(switch 블록 전체)와 `getEventTypeColor`(switch 블록 전체)를 다음으로 교체:

```ts
  const getSeasonalColor = (season: string) =>
    SEASONAL_BG[season] ?? SEASONAL_BG.default

  const getEventTypeColor = (type: string) =>
    EVENT_TYPE_CLASSES[type] ?? EVENT_TYPE_CLASSES.default
```

> `getSeasonalColor`는 `bg-*` 문자열을, `getEventTypeColor`는 `EventTypeClassSet` 객체를 반환한다.

- [ ] **Step 3: 호출부 7곳 치환**

각 템플릿 리터럴을 정확히 다음과 같이 바꾼다.

L298:
```tsx
// before
`hover:border-${getEventTypeColor(event.type)}/40`
// after
getEventTypeColor(event.type).hoverBorder
```

L323:
```tsx
// before
`border-${getEventTypeColor(event.type)} text-${getEventTypeColor(event.type)}`
// after
`${getEventTypeColor(event.type).border} ${getEventTypeColor(event.type).text}`
```

L391:
```tsx
// before
`bg-${getEventTypeColor(event.type)} text-ink-black hover:bg-${getEventTypeColor(event.type)}/80`
// after
`${getEventTypeColor(event.type).bg} text-ink-black ${getEventTypeColor(event.type).hoverBg}`
```

L444:
```tsx
// before
`bg-${getSeasonalColor(traditionalDate.season)}`
// after
getSeasonalColor(traditionalDate.season)
```

L520:
```tsx
// before
`bg-${getEventTypeColor(event.type)}/20 text-${getEventTypeColor(event.type)}`
// after
`${getEventTypeColor(event.type).bgSoft} ${getEventTypeColor(event.type).text}`
```

L637:
```tsx
// before
`bg-${getEventTypeColor(type)} text-ink-black`
// after
`${getEventTypeColor(type).bg} text-ink-black`
```

L662:
```tsx
// before
`bg-${getSeasonalColor(season)} text-ink-black`
// after
`${getSeasonalColor(season)} text-ink-black`
```

> L298·L444는 `cn(...)` 인자 — 백틱 템플릿이 불필요해지면 일반 식으로 둔다.

- [ ] **Step 4: 타입 체크 + 린트**

Run: `npm run type-check && npm run lint`
Expected: 타입 에러 없음. 린트는 기존 `max-lines` warning만 (신규 error 없음)

- [ ] **Step 5: 동적 보간 잔존 확인**

Run: `grep -nE -- '-\$\{' components/cultural/CulturalCalendar.tsx`
Expected: L171 `festivals[`${month}-${day}`]` (객체 키, 무관)만 출력. 클래스 보간 0건.

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '🐛 CulturalCalendar 동적 Tailwind 클래스 → 정적 맵 치환' > .commit_message.txt
git add components/cultural/CulturalCalendar.tsx .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 3: CalligraphyHero.tsx 리팩터 + 죽은 코드 제거

**Files:**
- Modify: `components/cultural/CalligraphyHero.tsx` (함수 `getSeasonalAccent` L88~, `getElementColor` L102~ 삭제; 호출부 L221, L231, L232, L295, L296, L352)

- [ ] **Step 1: import 추가**

```ts
import { SEASONAL_ACCENT_CLASSES } from './_constants/color-classes'
```

- [ ] **Step 2: getSeasonalAccent 교체, getElementColor 삭제**

`getSeasonalAccent`(switch 블록 전체)를 교체:

```ts
  const getSeasonalAccent = (season?: string) =>
    SEASONAL_ACCENT_CLASSES[season ?? ''] ?? SEASONAL_ACCENT_CLASSES.default
```

`getElementColor` 함수 정의(`const getElementColor = (element?: string) => { ... }` 전체)를 **삭제**한다. 호출되는 곳이 없으므로 다른 변경은 불필요.

- [ ] **Step 3: 호출부 6곳 치환**

L221:
```tsx
// before
`bg-${getSeasonalAccent(currentArtwork?.season || 'spring')}/10`
// after
getSeasonalAccent(currentArtwork?.season || 'spring').bgSoft10
```

L231:
```tsx
// before
`border-${getSeasonalAccent(currentArtwork?.season || 'spring')}`,
// after
getSeasonalAccent(currentArtwork?.season || 'spring').border,
```

L232:
```tsx
// before
`text-${getSeasonalAccent(currentArtwork?.season || 'spring')}`
// after
getSeasonalAccent(currentArtwork?.season || 'spring').text
```

L295:
```tsx
// before
`bg-${getSeasonalAccent(currentArtwork?.season || 'spring')} text-ink-black`,
// after
`${getSeasonalAccent(currentArtwork?.season || 'spring').bg} text-ink-black`,
```

L296:
```tsx
// before
`hover:bg-${getSeasonalAccent(currentArtwork?.season || 'spring')}/80`
// after
getSeasonalAccent(currentArtwork?.season || 'spring').hoverBg
```

L352:
```tsx
// before
`bg-${getSeasonalAccent(currentArtwork?.season || 'spring')} w-8`
// after
`${getSeasonalAccent(currentArtwork?.season || 'spring').bg} w-8`
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `npm run type-check && npm run lint`
Expected: 타입 에러 없음 (`getElementColor` 삭제로 `no-unused-vars` 도 해소). 신규 error 없음.

- [ ] **Step 5: 동적 보간 잔존 확인**

Run: `grep -nE -- '-\$\{' components/cultural/CalligraphyHero.tsx`
Expected: 출력 0건

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '🐛 CalligraphyHero 동적 클래스 정적 맵 치환 + 미사용 getElementColor 제거' > .commit_message.txt
git add components/cultural/CalligraphyHero.tsx .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 4: VirtualExhibition.tsx 리팩터

**Files:**
- Modify: `components/cultural/VirtualExhibition.tsx` (함수 `getWallColor` L160~; 호출부 L190)

- [ ] **Step 1: import 추가**

```ts
import { WALL_BG } from './_constants/color-classes'
```

- [ ] **Step 2: getWallColor 교체**

`getWallColor`(switch 블록 전체)를 교체:

```ts
  const getWallColor = () =>
    WALL_BG[exhibition.galleryLayout.style] ?? WALL_BG.default
```

- [ ] **Step 3: 호출부 1곳 치환**

L190:
```tsx
// before
className={cn('relative w-full h-full overflow-hidden cursor-move', `bg-${getWallColor()}`)}
// after
className={cn('relative w-full h-full overflow-hidden cursor-move', getWallColor())}
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `npm run type-check && npm run lint`
Expected: 타입 에러 없음. 신규 error 없음.

- [ ] **Step 5: 동적 보간 잔존 확인**

Run: `grep -nE -- '-\$\{' components/cultural/VirtualExhibition.tsx`
Expected: 출력 0건

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '🐛 VirtualExhibition 동적 Tailwind 클래스 → 정적 맵 치환' > .commit_message.txt
git add components/cultural/VirtualExhibition.tsx .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 5: ArtistPortfolioGrid.tsx 리팩터

**Files:**
- Modify: `components/cultural/ArtistPortfolioGrid.tsx` (함수 `getStatusColor` L141~; 호출부 L209)

- [ ] **Step 1: import 추가**

```ts
import { STATUS_CLASSES } from './_constants/color-classes'
```

- [ ] **Step 2: getStatusColor 교체**

`getStatusColor`(switch 블록 전체)를 교체:

```ts
  const getStatusColor = (status: string) =>
    STATUS_CLASSES[status] ?? STATUS_CLASSES.default
```

- [ ] **Step 3: 호출부 1곳 치환**

L209:
```tsx
// before
`bg-${getStatusColor(artist.status)} text-ink-black border-${getStatusColor(artist.status)}`
// after
`${getStatusColor(artist.status).bg} text-ink-black ${getStatusColor(artist.status).border}`
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `npm run type-check && npm run lint`
Expected: 타입 에러 없음. 신규 error 없음.

- [ ] **Step 5: 동적 보간 잔존 확인**

Run: `grep -nE -- '-\$\{' components/cultural/ArtistPortfolioGrid.tsx`
Expected: 출력 0건

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '🐛 ArtistPortfolioGrid 동적 Tailwind 클래스 → 정적 맵 치환' > .commit_message.txt
git add components/cultural/ArtistPortfolioGrid.tsx .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 6: LearningHub.tsx 리팩터

**Files:**
- Modify: `components/cultural/LearningHub.tsx` (함수 `getDifficultyColor` L172~; 호출부 L334, L379)

- [ ] **Step 1: import 추가**

```ts
import { DIFFICULTY_BG } from './_constants/color-classes'
```

- [ ] **Step 2: getDifficultyColor 교체**

`getDifficultyColor`(switch 블록 전체)를 교체:

```ts
  const getDifficultyColor = (difficulty: string) =>
    DIFFICULTY_BG[difficulty] ?? DIFFICULTY_BG.default
```

- [ ] **Step 3: 호출부 2곳 치환**

L334:
```tsx
// before
<Badge className={`bg-${getDifficultyColor(path.level)} text-ink-black`}>
// after
<Badge className={`${getDifficultyColor(path.level)} text-ink-black`}>
```

L379:
```tsx
// before
className={`bg-${getDifficultyColor(resource.difficulty)} text-ink-black text-xs`}
// after
className={`${getDifficultyColor(resource.difficulty)} text-ink-black text-xs`}
```

- [ ] **Step 4: 타입 체크 + 린트**

Run: `npm run type-check && npm run lint`
Expected: 타입 에러 없음. 신규 error 없음.

- [ ] **Step 5: 동적 보간 잔존 확인**

Run: `grep -nE -- '-\$\{' components/cultural/LearningHub.tsx`
Expected: 출력 0건

- [ ] **Step 6: 커밋**

```bash
printf '%s\n' '🐛 LearningHub 동적 Tailwind 클래스 → 정적 맵 치환' > .commit_message.txt
git add components/cultural/LearningHub.tsx .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 7: ESLint 규칙 추가 (완결성 게이트)

**Files:**
- Modify: `.eslintrc.json`

이 태스크는 Task 2~6의 완결성 검사를 겸한다 — 규칙 추가 후 린트가 통과하면 동적 클래스가 전부 제거된 것이고, 실패하면 누락된 호출부가 있는 것이다.

- [ ] **Step 1: 규칙 추가**

`.eslintrc.json`의 `rules` 객체에 다음 항목을 추가한다 (기존 규칙은 보존):

```json
"no-restricted-syntax": [
  "error",
  {
    "selector": "TemplateElement[tail=false][value.raw=/(^|[ :])(bg|text|border|ring|from|to|via|fill|stroke)-$/]",
    "message": "동적 Tailwind 클래스 금지 — `bg-${...}` 등은 JIT가 생성하지 못해 프로덕션 CSS에서 누락됩니다. 정적 클래스 lookup 맵(components/cultural/_constants/color-classes.ts 패턴)을 사용하세요. DESIGN.md §10 참조."
  }
]
```

> `tail=false`인 TemplateElement = 뒤에 `${...}` 보간이 따라오는 quasi. 그 quasi가 Tailwind 접두사 + `-`로 끝나면 동적 클래스다. `.eslintrc.json`에 `no-restricted-syntax`가 이미 있으면 배열에 객체만 추가한다.

- [ ] **Step 2: 린트 실행 — 통과해야 함**

Run: `npm run lint`
Expected: PASS — 신규 `no-restricted-syntax` error 0건. (Task 2~6에서 동적 클래스를 모두 제거했으므로)

> **실패 시**: 어떤 파일/라인이 걸렸는지 확인. (a) `components/cultural/`의 누락된 호출부면 해당 Task로 돌아가 수정. (b) 5개 컴포넌트 밖이면 — 사전 감사상 없어야 함 → **중단하고 사용자에게 보고**(범위 확장 사안). (c) 의도치 않은 false positive면 selector 정규식을 조정.

- [ ] **Step 3: 규칙이 실제 패턴을 잡는지 확인**

임시 검증: 아무 `.tsx`에 `` const _t = `bg-${x}` `` 한 줄을 추가하고 `npm run lint` → 해당 줄에 error가 떠야 함. 확인 후 임시 줄 삭제하고 `npm run lint` 재실행 → PASS.

- [ ] **Step 4: 커밋**

```bash
printf '%s\n' '🛡️ 동적 Tailwind 클래스 차단 ESLint 규칙(no-restricted-syntax) 추가' > .commit_message.txt
git add .eslintrc.json .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 8: DESIGN.md 가이드라인 추가

**Files:**
- Modify: `docs/02-design/DESIGN.md` (§10 Agent Guidelines)

- [ ] **Step 1: §10에 규칙 추가**

`docs/02-design/DESIGN.md`의 `## 10. Agent Guidelines — AI 에이전트 작업 규칙` 섹션에 항목을 추가한다. 기존 목록 형식(번호/불릿)에 맞춰 다음 내용을 넣는다:

```markdown
- **동적 Tailwind 클래스명 금지.** `bg-${변수}`·`text-${변수}` 처럼 클래스명을 동적 조합하지 말 것. Tailwind JIT는 소스의 리터럴 문자열만 스캔하므로 동적 클래스는 프로덕션 CSS에서 누락된다. 색상·상태별 분기는 완성된 리터럴 클래스를 담은 정적 lookup 맵으로 표현한다 (예: `components/cultural/_constants/color-classes.ts`). ESLint `no-restricted-syntax` 규칙이 이를 강제한다.
```

> §10의 실제 마크업(번호 목록인지 불릿인지)에 맞춰 형식만 조정. 내용·문구는 위와 동일하게.

- [ ] **Step 2: design:lint 통과 확인**

Run: `npm run design:lint`
Expected: errors 0, warnings 0 (가이드라인은 본문 prose — front-matter 토큰 불변)

- [ ] **Step 3: 커밋**

```bash
printf '%s\n' '📝 DESIGN.md §10에 동적 Tailwind 클래스 금지 가이드라인 추가' > .commit_message.txt
git add docs/02-design/DESIGN.md .commit_message.txt
git commit -F .commit_message.txt
```

---

## Task 9: 최종 검증

**Files:** 없음 (검증 전용)

- [ ] **Step 1: 프로덕션 빌드**

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 2: CSS 생성 검증 — 88개 리터럴 전수 확인 (핵심)**

다음 스크립트를 실행한다:

```bash
CSS=$(cat .next/static/css/*.css)
fail=0
chk() { grep -qF "$1" <<<"$CSS" || { echo "MISSING: $1"; fail=1; }; }

# EVENT_TYPE (7토큰 × 6형태)
for t in temple-gold summer-jade vermillion spring-blossom celadon-green plum-purple ink-black; do
  for f in "bg-$t" "text-$t" "border-$t" "hover:border-$t/40" "hover:bg-$t/80" "bg-$t/20"; do chk "$f"; done
done
# SEASONAL_ACCENT (5토큰 × 5형태)
for t in spring-blossom summer-jade autumn-gold winter-snow celadon-green; do
  for f in "bg-$t" "bg-$t/10" "hover:bg-$t/80" "border-$t" "text-$t"; do chk "$f"; done
done
# STATUS (4토큰 × 2형태)
for t in temple-gold summer-jade autumn-gold celadon-green; do
  for f in "bg-$t" "border-$t"; do chk "$f"; done
done
# SEASONAL_BG / WALL_BG / DIFFICULTY_BG (bg 단일형태)
for f in bg-spring-blossom bg-summer-jade bg-autumn-gold bg-winter-snow bg-celadon-green \
         bg-rice-paper bg-west-metal bg-vermillion bg-temple-gold; do chk "$f"; done

[ $fail -eq 0 ] && echo "OK — 모든 리터럴 클래스 생성됨" || echo "FAIL — 누락 존재"
```

Expected: `OK — 모든 리터럴 클래스 생성됨`

> 수정 전 `bg-plum-purple`·`bg-spring-blossom`·`bg-winter-snow`·`bg-west-metal` 등은 0개였다. 이 스크립트가 OK면 버그가 해소된 것이다.

- [ ] **Step 3: 디자인 게이트 + 테스트**

Run: `npm run design:lint && npm run design:diff && npm run design:wcag && npm run type-check && npm run lint && npm test`
Expected: 전부 통과. `design:diff`는 토큰을 건드리지 않았으므로 drift 0. `lint`는 신규 error 0 (기존 `max-lines` warning만).

- [ ] **Step 4: 시각 검증**

`npm run dev` 후, 다음 5개 컴포넌트가 쓰이는 페이지를 브라우저로 열어 동적 색상이 실제 렌더되는지 before/after 확인:
- `CulturalCalendar` — 'performance' 이벤트가 `plum-purple`, 'festival'이 `spring-blossom` 배경으로 보이는지
- `CalligraphyHero` — 계절 악센트 색이 보이는지
- `VirtualExhibition` — 'modern' 레이아웃 벽면이 `west-metal` 색인지
- `ArtistPortfolioGrid` — 상태 배지 색
- `LearningHub` — 난이도 배지 색

gstack `/browse` skill 또는 Playwright로 최소 1개 브레이크포인트 스크린샷을 남긴다.

- [ ] **Step 5: 최종 커밋 (해당 시)**

검증 과정에서 코드 변경이 없으면 커밋 없음. 변경이 있었으면:

```bash
printf '%s\n' '✅ 동적 클래스 수정 최종 검증 반영' > .commit_message.txt
git add -A && git commit -F .commit_message.txt
```

---

## 완료 기준

- [ ] Task 9 Step 2 스크립트가 `OK` 출력
- [ ] `design:lint`/`design:diff`/`design:wcag`/`type-check`/`lint`/`test` 전부 통과
- [ ] ESLint `no-restricted-syntax` 규칙이 동적 클래스를 차단하며 코드베이스는 통과
- [ ] 5개 컴포넌트 시각 검증 완료
- [ ] `components/cultural/` 5개 파일에 `-${` 클래스 보간 0건

## 비범위 (본 계획에서 다루지 않음)

- `moon-silver` 토큰 제거 — 별도 trivial 후속
- component-split Phase 3-4 (max-lines warning) — 별도 사이클
- `spacing`/`layout.spacing` 중복 — 별건
