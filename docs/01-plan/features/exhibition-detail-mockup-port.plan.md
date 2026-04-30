# Exhibition Detail Mockup → Next.js Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** mockup의 편집 디자인 가치를 ASCA `/exhibitions/[id]` 페이지로 옮기되
운영 기능(공유, 포스터, 조회수, 오너 액션)을 보존하고 작품 풀 메타데이터 join을
추가한다.

**Architecture:** 8개 컴포넌트로 섹션 분해(orchestrator +
Hero/MetaBand/Description/ArtworkGrid/ShareBar/VisitInfo/CTAStrip(보류)/Loading/Error).
새 hook `useExhibitionDetail`이 fetch+ownership 로직을 담당. 새 query 함수
`getExhibitionFullById`가 작품 풀 메타까지 단일 join. Tailwind 우선 +
globals.css `@layer components`에 5개 신규 클래스. Pretext 런타임 의존성 미도입
(CSS-only).

**Tech Stack:** Next.js 14 App Router (client component), TypeScript, Tailwind
v3, shadcn/ui (Card/Button/Badge/Separator), Drizzle ORM, Clerk auth, Jest +
React Testing Library.

**Source spec:**
`docs/02-design/features/exhibition-detail-mockup-port.design.md`

---

## Phase 0 — 사전 조사 (1 task)

### Task 0.1: 기존 코드 매핑 확인 (필수 사전 읽기)

**Files (read only):**

- `lib/db/schema.ts` (artworks 테이블 line 57~89, exhibitions line 92~126,
  exhibitionArtworks line 129~)
- `lib/types/exhibition-legacy.ts` (`Exhibition`, `ExhibitionWithDetails`,
  `ExhibitionFull` interfaces)
- `lib/db/queries.ts:190` (`getExhibitionById`)
- `lib/api/exhibitions.ts` (`fetchExhibitionById` + 매핑 로직)
- `app/exhibitions/[id]/page.tsx` (현재 client component 흐름)
- `app/exhibitions/[id]/_components/exhibition-detail-body.tsx` (교체 대상)

- [ ] **Step 1: schema 매핑 테이블 작성 — 머릿속 또는 메모**

| Type 필드                      | Schema 컬럼                      | 비고                           |
| ------------------------------ | -------------------------------- | ------------------------------ |
| `Exhibition.featuredImageUrl`  | `exhibitions.posterImage`        | api/exhibitions.ts에 매핑 있음 |
| `Exhibition.curator`           | `exhibitions.curatorNotes`?      | 정확한 매핑 확인 필요          |
| `Exhibition.location`          | `exhibitions.venueAddress`?      | 매핑 확인 필요                 |
| `Exhibition.status` 'current'  | `exhibitions.status` 'ongoing'   | 'current'↔'ongoing' 매핑      |
| `ExhibitionArtwork.isFeatured` | `exhibitionArtworks.isHighlight` | 매핑 확인 필요                 |
| `ExhibitionArtwork.notes`      | (schema 없음)                    | metadata jsonb 또는 미사용     |

- [ ] **Step 2: 본 plan에서 사용할 fetch 함수 패턴 확정**

`lib/api/exhibitions.ts`의 기존 `fetchExhibitionById` 매핑 로직(snake_case →
camelCase, status enum, posterImage→featuredImageUrl)을 그대로 따른다. 새 함수는
추가 join 컬럼만 더 매핑한다.

- [ ] **Step 3: `ExhibitionFull` 타입 재사용 결정**

`lib/types/exhibition-legacy.ts:85` 의 기존 `ExhibitionFull`을 확장한다(spec
§5.1의 `ExhibitionWithArtworkDetails`라는 새 이름은 사용하지 않음 — 기존 타입
충돌 회피).

추가 필드: artworks 항목에 `style`, `medium`, `dimensions`, `year`, `imageUrl`.
artists 항목은 그대로(이미 풀 메타 포함됨).

- [ ] **Step 4: 본 사전 조사는 commit 없음 — 다음 task로 진행**

---

## Phase 1 — 타입 & 순수 유틸 (3 tasks)

### Task 1.1: `pickWatermarkChar` 유틸 함수 (TDD)

**Files:**

- Create: `lib/exhibitions/pick-watermark-char.ts`
- Test: `lib/exhibitions/__tests__/pick-watermark-char.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// lib/exhibitions/__tests__/pick-watermark-char.test.ts
import { pickWatermarkChar } from '../pick-watermark-char'

describe('pickWatermarkChar', () => {
  it('extracts up to 2 Hanja characters when title contains them', () => {
    expect(pickWatermarkChar('서경(書境) 새로운 지평')).toBe('書境')
  })

  it('returns first Hangul character when no Hanja present', () => {
    expect(pickWatermarkChar('훈민정음 정신')).toBe('훈')
  })

  it('falls back to "書" when no CJK characters', () => {
    expect(pickWatermarkChar('Modern Calligraphy Show')).toBe('書')
  })

  it('falls back to "書" for empty string', () => {
    expect(pickWatermarkChar('')).toBe('書')
  })

  it('limits Hanja extraction to 2 characters even when more present', () => {
    expect(pickWatermarkChar('天地玄黃 우주')).toBe('天地')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- pick-watermark-char` Expected: FAIL with "Cannot find
module '../pick-watermark-char'"

- [ ] **Step 3: 최소 구현 작성**

```ts
// lib/exhibitions/pick-watermark-char.ts
/**
 * 전시 타이틀에서 hero 워터마크용 캐릭터 추출.
 * 한자 우선 → 한글 폴백 → 기본 "書"
 */
export function pickWatermarkChar(title: string): string {
  const hanjaMatch = title.match(/[一-鿿]+/g)
  if (hanjaMatch?.length) {
    return hanjaMatch.join('').slice(0, 2)
  }
  const hangulMatch = title.match(/[가-힯]/)
  if (hangulMatch) return hangulMatch[0]
  return '書'
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test -- pick-watermark-char` Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
echo "✨ feat: pickWatermarkChar 유틸 — 전시 타이틀에서 hero 워터마크 캐릭터 추출 (한자→한글→폴백)" > .commit_message.txt
git add lib/exhibitions/pick-watermark-char.ts lib/exhibitions/__tests__/pick-watermark-char.test.ts .commit_message.txt
git commit -m "feat(exhibitions): pickWatermarkChar utility for hero watermark"
```

---

### Task 1.2: `CalligraphyStyle` 타입 + style 정규화 (TDD)

**Files:**

- Modify: `lib/types/exhibition-legacy.ts` (CalligraphyStyle export 추가)
- Create: `lib/exhibitions/normalize-style.ts`
- Test: `lib/exhibitions/__tests__/normalize-style.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// lib/exhibitions/__tests__/normalize-style.test.ts
import { normalizeCalligraphyStyle } from '../normalize-style'

describe('normalizeCalligraphyStyle', () => {
  it.each([
    ['전서', 'zhuan'],
    ['예서', 'li'],
    ['해서', 'kai'],
    ['행서', 'xing'],
    ['초서', 'cao'],
    ['한글', 'hangul'],
    ['Zhuan', 'zhuan'],
    ['XING', 'xing'],
  ])('maps "%s" to "%s"', (input, expected) => {
    expect(normalizeCalligraphyStyle(input)).toBe(expected)
  })

  it('returns null for unknown style', () => {
    expect(normalizeCalligraphyStyle('unknown')).toBeNull()
  })

  it('returns null for empty/null input', () => {
    expect(normalizeCalligraphyStyle('')).toBeNull()
    expect(normalizeCalligraphyStyle(null)).toBeNull()
    expect(normalizeCalligraphyStyle(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- normalize-style` Expected: FAIL

- [ ] **Step 3: 타입 추가**

`lib/types/exhibition-legacy.ts` 끝에 추가:

```ts
/**
 * 서예 서체 분류 (artworks.style 자유 텍스트의 정규화 결과)
 */
export type CalligraphyStyle =
  | 'zhuan' // 篆書
  | 'li' // 隷書
  | 'kai' // 楷書
  | 'xing' // 行書
  | 'cao' // 草書
  | 'hangul' // 한글
  | 'mixed' // 한문/한글 혼합
```

- [ ] **Step 4: 정규화 함수 구현**

```ts
// lib/exhibitions/normalize-style.ts
import type { CalligraphyStyle } from '@/lib/types/exhibition-legacy'

const STYLE_MAP: Record<string, CalligraphyStyle> = {
  // 한글 라벨
  전서: 'zhuan',
  예서: 'li',
  해서: 'kai',
  행서: 'xing',
  초서: 'cao',
  한글: 'hangul',
  혼합: 'mixed',
  // 한자 라벨
  篆書: 'zhuan',
  隷書: 'li',
  楷書: 'kai',
  行書: 'xing',
  草書: 'cao',
  // 영문 (소문자 키로 lookup)
  zhuan: 'zhuan',
  li: 'li',
  kai: 'kai',
  xing: 'xing',
  cao: 'cao',
  hangul: 'hangul',
  mixed: 'mixed',
}

export function normalizeCalligraphyStyle(
  raw: string | null | undefined
): CalligraphyStyle | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return STYLE_MAP[trimmed] ?? STYLE_MAP[trimmed.toLowerCase()] ?? null
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test -- normalize-style` Expected: PASS (10 tests)

- [ ] **Step 6: 커밋**

```bash
echo "✨ feat: CalligraphyStyle 타입 + normalizeCalligraphyStyle 정규화 함수 (한글/한자/영문 매핑)" > .commit_message.txt
git add lib/types/exhibition-legacy.ts lib/exhibitions/normalize-style.ts lib/exhibitions/__tests__/normalize-style.test.ts .commit_message.txt
git commit -m "feat(types): CalligraphyStyle enum + style normalizer"
```

---

### Task 1.3: `ExhibitionFullExtended` 타입 추가

**Files:**

- Modify: `lib/types/exhibition-legacy.ts` (기존 ExhibitionFull 확장 또는 새
  타입 추가)

- [ ] **Step 1: 기존 ExhibitionFull 의존자 검색**

```bash
cd ~/Developer/Projects/ASCA && grep -rn "ExhibitionFull" --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v __tests__
```

만약 사용처 0건 → ExhibitionFull 자체를 확장하면 됨. 사용처 있음 → 새 타입
`ExhibitionDetailFull` 별도 추가.

- [ ] **Step 2: 타입 정의 (사용처 없는 경우 — ExhibitionFull 직접 확장)**

`lib/types/exhibition-legacy.ts:85~109` 수정:

```ts
/**
 * Exhibition with full artwork and artist metadata.
 * Used by /exhibitions/[id] detail page (mockup-port v1.0).
 */
export interface ExhibitionFull extends Exhibition {
  artworks: Array<{
    relationId: string
    id: string
    title: string
    titleEn?: string | null
    titleHanja?: string | null // NEW: extracted from title via regex
    images?: string[]
    imageUrl?: string | null // NEW: primary image
    artistId: string
    artistName: string // NEW: joined from artists.name
    displayOrder: number
    isFeatured: boolean
    style?: CalligraphyStyle | null // NEW: normalized
    medium?: string | null // NEW: 종이/비단/etc
    dimensions?: string | null // NEW: "180×90cm"
    year?: number | null // NEW
  }>
  artists: Array<{
    relationId: string
    id: string
    name: string
    nameEn?: string | null
    profileImage?: string | null
    role: ExhibitionArtistRole
    bio?: string | null
    displayOrder: number
  }>
  artworkCount: number
  artistCount: number
  featuredArtworkCount: number
}
```

- [ ] **Step 3: 타입 체크 (테스트 없이 컴파일 검증)**

Run: `npm run type-check` Expected: 새 필드 추가에 따른 빌드 오류 없음
(ExhibitionFull 사용처 없음 가정)

만약 컴파일 오류 → Step 1으로 돌아가 새 별도 타입 `ExhibitionDetailFull` 정의로
전환.

- [ ] **Step 4: 커밋**

```bash
echo "🏷️ types: ExhibitionFull 확장 — titleHanja, artistName, style, medium, dimensions, year 필드 추가" > .commit_message.txt
git add lib/types/exhibition-legacy.ts .commit_message.txt
git commit -m "types(exhibitions): extend ExhibitionFull with artwork detail fields"
```

---

## Phase 2 — 데이터 레이어 (4 tasks)

### Task 2.1: `getExhibitionFullById` Drizzle query (TDD)

**Files:**

- Modify: `lib/db/queries.ts` (새 함수 추가)
- Test: `lib/db/__tests__/get-exhibition-full-by-id.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// lib/db/__tests__/get-exhibition-full-by-id.test.ts
/**
 * 통합 테스트 — 실제 DB 연결 필요 (Supabase test DB 또는 mock).
 * ASCA의 기존 패턴(npx tsx lib/db/test.ts)을 따라
 * 시드 데이터에 대한 실측 검증으로 작성.
 */
import { getExhibitionFullById } from '../queries'

describe('getExhibitionFullById', () => {
  it('returns null + error for non-existent ID', async () => {
    const { data, error } = await getExhibitionFullById('non-existent-uuid')
    expect(data).toBeNull()
    expect(error).toBeNull() // not-found는 error가 아니라 data null
  })

  it('returns exhibition with artwork details for valid ID', async () => {
    // SETUP: 시드 데이터에 'test-exhibition-1' 가정 (없으면 skip)
    const { data, error } = await getExhibitionFullById('test-exhibition-1')
    if (!data) return // 시드 없으면 skip
    expect(error).toBeNull()
    expect(data.id).toBe('test-exhibition-1')
    expect(Array.isArray(data.artworks)).toBe(true)
    if (data.artworks.length > 0) {
      const a = data.artworks[0]
      expect(typeof a.title).toBe('string')
      expect(typeof a.artistName).toBe('string')
    }
  })

  it('orders artworks by displayOrder ASC', async () => {
    const { data } = await getExhibitionFullById('test-exhibition-1')
    if (!data || data.artworks.length < 2) return
    for (let i = 1; i < data.artworks.length; i++) {
      expect(data.artworks[i].displayOrder).toBeGreaterThanOrEqual(
        data.artworks[i - 1].displayOrder
      )
    }
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- get-exhibition-full-by-id` Expected: FAIL with "Cannot
find export getExhibitionFullById"

- [ ] **Step 3: query 함수 구현**

`lib/db/queries.ts` 의 기존 `getExhibitionById`(line 190 근처) 아래에 추가:

```ts
import { eq, asc } from 'drizzle-orm'
import {
  exhibitions,
  exhibitionArtworks,
  artworks,
  artists,
} from '@/lib/db/schema'
import { normalizeCalligraphyStyle } from '@/lib/exhibitions/normalize-style'
import type {
  ExhibitionFull,
  ExhibitionStatus,
} from '@/lib/types/exhibition-legacy'

const STATUS_MAP: Record<string, ExhibitionStatus> = {
  upcoming: 'upcoming',
  ongoing: 'current',
  completed: 'past',
  cancelled: 'past', // 취소도 과거로 처리
}

/**
 * 전시 + 연결 작품(풀 메타) + 작가명 단일 join.
 * mockup-port v1.0 — exhibition detail page 전용.
 */
export async function getExhibitionFullById(
  id: string
): Promise<{ data: ExhibitionFull | null; error: Error | null }> {
  try {
    // 1) Exhibition 본체
    const [ex] = await db
      .select()
      .from(exhibitions)
      .where(eq(exhibitions.id, id))
      .limit(1)

    if (!ex) return { data: null, error: null }

    // 2) 작품 join — exhibitionArtworks ⨝ artworks ⨝ artists
    const artworkRows = await db
      .select({
        relationId: exhibitionArtworks.id,
        artworkId: artworks.id,
        title: artworks.title,
        titleEn: artworks.titleEn,
        imageUrl: artworks.imageUrl,
        imageUrls: artworks.imageUrls,
        artistId: artworks.artistId,
        artistName: artists.name,
        style: artworks.style,
        medium: artworks.medium,
        dimensions: artworks.dimensions,
        year: artworks.year,
        displayOrder: exhibitionArtworks.displayOrder,
        isHighlight: exhibitionArtworks.isHighlight,
      })
      .from(exhibitionArtworks)
      .innerJoin(artworks, eq(exhibitionArtworks.artworkId, artworks.id))
      .innerJoin(artists, eq(artworks.artistId, artists.id))
      .where(eq(exhibitionArtworks.exhibitionId, id))
      .orderBy(asc(exhibitionArtworks.displayOrder))

    // 3) Artist join 별도 (참여 작가 vs 작품 작가는 다를 수 있음 — 본 사이클은 작품 join만 사용)
    // TODO: exhibitionArtists 테이블 join이 필요하면 후속 사이클

    return {
      data: {
        id: ex.id,
        title: ex.title,
        subtitle: null, // schema에 없음 — 후속에 추가 필요 시
        description: ex.description ?? '',
        content: null,
        startDate: ex.startDate.toISOString(),
        endDate: ex.endDate.toISOString(),
        location: ex.venueAddress ?? null,
        venue: ex.venue ?? null,
        curator: ex.curatorNotes ?? null,
        featuredImageUrl: ex.posterImage ?? null,
        galleryImages: ex.galleryImages ?? null,
        status: STATUS_MAP[ex.status] ?? 'upcoming',
        isFeatured: ex.isFeatured,
        isPublished: true, // schema에 isPublished 없음 — 모두 published 가정
        views: 0, // schema에 views 없음
        ticketPrice: ex.admissionFee ?? null,
        createdAt: ex.createdAt.toISOString(),
        updatedAt: ex.updatedAt.toISOString(),
        artworks: artworkRows.map(r => ({
          relationId: r.relationId,
          id: r.artworkId,
          title: r.title,
          titleEn: r.titleEn,
          titleHanja: extractHanjaFromTitle(r.title),
          images: r.imageUrls ?? [],
          imageUrl: r.imageUrl,
          artistId: r.artistId,
          artistName: r.artistName,
          displayOrder: r.displayOrder ?? 0,
          isFeatured: r.isHighlight,
          style: normalizeCalligraphyStyle(r.style),
          medium: r.medium,
          dimensions: r.dimensions,
          year: r.year,
        })),
        artists: [], // 본 사이클은 작품 join만, 참여 작가 별도 fetch는 후속
        artworkCount: artworkRows.length,
        artistCount: 0,
        featuredArtworkCount: artworkRows.filter(r => r.isHighlight).length,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/** title에서 한자 추출 (titleHanja 컬럼 부재 폴백) */
function extractHanjaFromTitle(title: string): string | null {
  const match = title.match(/[一-鿿]+/g)
  if (!match?.length) return null
  return match.join('')
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test -- get-exhibition-full-by-id` Expected: PASS (3 tests, 시드
부재 시 일부 skip 정상)

추가: `npm run type-check` PASS

- [ ] **Step 5: 커밋**

```bash
echo "✨ feat(db): getExhibitionFullById 단일 join 쿼리 — 작품 풀 메타(작가명/서체/치수) 한 번에 fetch" > .commit_message.txt
git add lib/db/queries.ts lib/db/__tests__/get-exhibition-full-by-id.test.ts .commit_message.txt
git commit -m "feat(db): getExhibitionFullById with full artwork metadata join"
```

---

### Task 2.2: `fetchExhibitionFullById` API 클라이언트 (TDD)

**Files:**

- Modify: `lib/api/exhibitions.ts` (새 함수 추가)
- Test: `lib/api/__tests__/fetch-exhibition-full.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// lib/api/__tests__/fetch-exhibition-full.test.ts
import { fetchExhibitionFullById } from '../exhibitions'

// fetch mock
const originalFetch = global.fetch
afterEach(() => {
  global.fetch = originalFetch
})

describe('fetchExhibitionFullById', () => {
  it('returns data on 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'x', title: 'Test', artworks: [], artists: [] },
      }),
    }) as any
    const { data, error } = await fetchExhibitionFullById('x')
    expect(error).toBeNull()
    expect(data?.id).toBe('x')
  })

  it('returns null + error message on 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    }) as any
    const { data, error } = await fetchExhibitionFullById('nope')
    expect(data).toBeNull()
    expect(error).toMatch(/not found/i)
  })

  it('handles network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'))
    const { data, error } = await fetchExhibitionFullById('x')
    expect(data).toBeNull()
    expect(error).toMatch(/network/i)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- fetch-exhibition-full` Expected: FAIL

- [ ] **Step 3: API client 구현**

`lib/api/exhibitions.ts` 끝에 추가:

```ts
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

/**
 * 전시 풀 메타 fetch — 클라이언트에서 호출.
 * 서버 측은 /api/exhibitions/[id]?full=true 가정 (또는 신규 라우트 /api/exhibitions/[id]/full).
 * mockup-port v1.0 사용처: app/exhibitions/[id]/page.tsx (useExhibitionDetail hook).
 */
export async function fetchExhibitionFullById(
  id: string
): Promise<{ data: ExhibitionFull | null; error: string | null }> {
  try {
    const res = await fetch(`/api/exhibitions/${id}/full`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { data: null, error: body.error ?? `HTTP ${res.status}` }
    }
    const json = await res.json()
    return { data: json.data ?? null, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
```

- [ ] **Step 4: API route 추가**

`app/api/exhibitions/[id]/full/route.ts` 생성:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getExhibitionFullById } from '@/lib/db/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await getExhibitionFullById(params.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 })
  }
  return NextResponse.json({ data })
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test -- fetch-exhibition-full` Expected: PASS (3 tests)

- [ ] **Step 6: 커밋**

```bash
echo "✨ feat(api): fetchExhibitionFullById 클라이언트 + /api/exhibitions/[id]/full 라우트" > .commit_message.txt
git add lib/api/exhibitions.ts lib/api/__tests__/fetch-exhibition-full.test.ts app/api/exhibitions/[id]/full/route.ts .commit_message.txt
git commit -m "feat(api): fetchExhibitionFullById client + /full route"
```

---

### Task 2.3: 정적 fallback 데이터 분리

**Files:**

- Create: `lib/data/static-exhibitions.ts`
- (page.tsx에서 인라인 정적 데이터를 다음 task에서 사용)

- [ ] **Step 1: 정적 데이터 파일 생성**

```ts
// lib/data/static-exhibitions.ts
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

/**
 * 정적 fallback 전시 데이터.
 * DB에 없거나 fetch 전에도 즉시 렌더 가능한 전시.
 * mockup-port v1.0 — 서경(書境) 새로운 지평 6점 작품 포함.
 */
export const STATIC_EXHIBITIONS: Record<string, ExhibitionFull> = {
  '3': {
    id: '3',
    title: '서경(書境) 새로운 지평 - 동양서예의 현재와 미래',
    subtitle: 'New Horizons in East Asian Calligraphy',
    description:
      '사단법인 동양서예협회가 주최하는 2026년 특별 기획전입니다. 개인전뿐만 아니라 소규모 서예단체들의 부스전, 연합전, 그리고 작품 1점만 출품하는 것도 가능한 열린 전시입니다. 실력있는 작가들을 발굴하고 품격있는 전시공간에서 새로운 서예의 지평을 엽니다. 서경(書境) 1부와 2부로 나누어 진행되며, 동양서예의 현재와 미래를 조망할 수 있는 귀중한 자리가 될 것입니다.',
    content: null,
    startDate: '2026-04-15T00:00:00.000Z',
    endDate: '2026-04-28T00:00:00.000Z',
    location: '예술의전당',
    venue: '서울서예박물관 제1전시실 (2층)',
    curator: '(사)동양서예협회 운영위원회',
    featuredImageUrl: '/images/exhibitions/poster-main.png',
    galleryImages: [],
    status: 'upcoming',
    isFeatured: true,
    isPublished: true,
    views: 0,
    ticketPrice: 0,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
    artworks: [
      {
        relationId: 'static-rel-1',
        id: 'static-art-1',
        title: '逍遙游',
        titleEn: 'Wandering Free',
        titleHanja: '逍遙游',
        images: [],
        imageUrl: null,
        artistId: 'static-artist-1',
        artistName: '徐景 김재호',
        displayOrder: 0,
        isFeatured: true,
        style: 'zhuan',
        medium: '화선지에 먹',
        dimensions: '136 × 70 cm',
        year: 2025,
      },
      {
        relationId: 'static-rel-2',
        id: 'static-art-2',
        title: '松柏之操',
        titleEn: 'The Constancy of Pine and Cypress',
        titleHanja: '松柏之操',
        images: [],
        imageUrl: null,
        artistId: 'static-artist-2',
        artistName: '墨香 이정민',
        displayOrder: 1,
        isFeatured: false,
        style: 'li',
        medium: '비단에 먹',
        dimensions: '180 × 90 cm',
        year: 2026,
      },
      {
        relationId: 'static-rel-3',
        id: 'static-art-3',
        title: '致虛守靜',
        titleEn: 'Empty the Self, Hold Stillness',
        titleHanja: '致虛守靜',
        images: [],
        imageUrl: null,
        artistId: 'static-artist-3',
        artistName: '淸潭 박순영',
        displayOrder: 2,
        isFeatured: true,
        style: 'kai',
        medium: '화선지에 먹',
        dimensions: '200 × 100 cm',
        year: 2026,
      },
      {
        relationId: 'static-rel-4',
        id: 'static-art-4',
        title: '入木三分',
        titleEn: 'Three-tenths Through the Wood',
        titleHanja: '入木三分',
        images: [],
        imageUrl: null,
        artistId: 'static-artist-4',
        artistName: '白雲 정대현',
        displayOrder: 3,
        isFeatured: false,
        style: 'xing',
        medium: '한지에 먹·낙관',
        dimensions: '136 × 35 cm',
        year: 2025,
      },
      {
        relationId: 'static-rel-5',
        id: 'static-art-5',
        title: '飛白',
        titleEn: 'Flying-White',
        titleHanja: '飛白',
        images: [],
        imageUrl: null,
        artistId: 'static-artist-5',
        artistName: '韓松 윤지환',
        displayOrder: 4,
        isFeatured: false,
        style: 'cao',
        medium: '화선지에 먹',
        dimensions: '234 × 53 cm',
        year: 2026,
      },
      {
        relationId: 'static-rel-6',
        id: 'static-art-6',
        title: '훈민정음 서문',
        titleEn: 'Preface of Hunminjeongeum',
        titleHanja: null,
        images: [],
        imageUrl: null,
        artistId: 'static-artist-6',
        artistName: '蘭谷 최은영',
        displayOrder: 5,
        isFeatured: true,
        style: 'hangul',
        medium: '한지에 먹',
        dimensions: '70 × 200 cm',
        year: 2026,
      },
    ],
    artists: [],
    artworkCount: 6,
    artistCount: 0,
    featuredArtworkCount: 3,
  },
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run type-check` Expected: PASS (없으면 위 객체 필드 누락 — 메시지 보고
보완)

- [ ] **Step 3: 커밋**

```bash
echo "🗂️ data: STATIC_EXHIBITIONS — 서경(書境) 새로운 지평 + 6점 작품 정적 fallback" > .commit_message.txt
git add lib/data/static-exhibitions.ts .commit_message.txt
git commit -m "data: extract static exhibitions to lib/data/static-exhibitions.ts"
```

---

### Task 2.4: `useExhibitionDetail` hook (TDD)

**Files:**

- Create: `lib/hooks/use-exhibition-detail.ts`
- Test: `lib/hooks/__tests__/use-exhibition-detail.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```tsx
// lib/hooks/__tests__/use-exhibition-detail.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useExhibitionDetail } from '../use-exhibition-detail'

jest.mock('@/lib/api/exhibitions', () => ({
  fetchExhibitionFullById: jest.fn(),
  deleteExhibition: jest.fn(),
}))
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ isLoaded: true, isSignedIn: false, user: null })),
}))

const { fetchExhibitionFullById } = jest.requireMock('@/lib/api/exhibitions')

describe('useExhibitionDetail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns static exhibition for ID "3" without fetching', async () => {
    const { result } = renderHook(() => useExhibitionDetail('3'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exhibition?.id).toBe('3')
    expect(fetchExhibitionFullById).not.toHaveBeenCalled()
  })

  it('fetches dynamic exhibition by ID', async () => {
    fetchExhibitionFullById.mockResolvedValue({
      data: { id: 'dyn', title: 'Dynamic', artworks: [], artists: [] },
      error: null,
    })
    const { result } = renderHook(() => useExhibitionDetail('dyn'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exhibition?.id).toBe('dyn')
    expect(fetchExhibitionFullById).toHaveBeenCalledWith('dyn')
  })

  it('sets error on fetch failure', async () => {
    fetchExhibitionFullById.mockResolvedValue({
      data: null,
      error: 'Not found',
    })
    const { result } = renderHook(() => useExhibitionDetail('nope'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Not found')
    expect(result.current.exhibition).toBeNull()
  })

  it('isOwner false when user is not signed in', async () => {
    const { result } = renderHook(() => useExhibitionDetail('3'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isOwner).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test -- use-exhibition-detail` Expected: FAIL

- [ ] **Step 3: hook 구현**

```ts
// lib/hooks/use-exhibition-detail.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  fetchExhibitionFullById,
  deleteExhibition,
} from '@/lib/api/exhibitions'
import { STATIC_EXHIBITIONS } from '@/lib/data/static-exhibitions'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

interface UseExhibitionDetailResult {
  exhibition: ExhibitionFull | null
  loading: boolean
  error: string | null
  isOwner: boolean
  handleDelete: () => Promise<void>
}

export function useExhibitionDetail(id: string): UseExhibitionDetailResult {
  const { isLoaded, isSignedIn, user } = useUser()
  const [exhibition, setExhibition] = useState<ExhibitionFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // 1) 정적 fallback 우선
      const staticEx = STATIC_EXHIBITIONS[id]
      if (staticEx) {
        if (!cancelled) {
          setExhibition(staticEx)
          setLoading(false)
        }
        return
      }

      // 2) 동적 fetch
      const { data, error: fetchError } = await fetchExhibitionFullById(id)
      if (cancelled) return
      if (fetchError || !data) {
        setError(fetchError ?? 'Exhibition not found')
        setExhibition(null)
      } else {
        setExhibition(data)
      }
      setLoading(false)
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  // ownership 계산
  useEffect(() => {
    if (!isLoaded || !exhibition) {
      setIsOwner(false)
      return
    }
    if (!isSignedIn || !user) {
      setIsOwner(false)
      return
    }
    const owner =
      exhibition.artists?.some(
        a =>
          a.id === user.id && (a.role === 'organizer' || a.role === 'curator')
      ) ?? false
    setIsOwner(owner)
  }, [isLoaded, isSignedIn, user, exhibition])

  const handleDelete = useCallback(async () => {
    if (
      !confirm('정말 이 전시를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      return
    }
    const { error: delError } = await deleteExhibition(id)
    if (delError) {
      alert('전시 삭제 중 오류가 발생했습니다.')
      return
    }
    alert('전시가 삭제되었습니다.')
    window.location.href = '/profile/exhibitions'
  }, [id])

  return { exhibition, loading, error, isOwner, handleDelete }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test -- use-exhibition-detail` Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
echo "✨ hook: useExhibitionDetail — fetch+ownership+삭제 통합 (page.tsx 인라인 로직 추출)" > .commit_message.txt
git add lib/hooks/use-exhibition-detail.ts lib/hooks/__tests__/use-exhibition-detail.test.tsx .commit_message.txt
git commit -m "feat(hooks): useExhibitionDetail extracts fetch+ownership logic"
```

---

## Phase 3 — UI 컴포넌트 (의존성 순서, 8 tasks)

각 컴포넌트 task는 동일한 TDD 패턴: 테스트 작성 → 실패 확인 → 구현 → 통과 확인 →
커밋. 코드 길이 절제를 위해 핵심 구현만 보이고 styling은 Tailwind 클래스 +
globals.css 보조(Phase 4)에 의존.

### Task 3.1: `ExhibitionLoading` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-loading.tsx`
- Test: `app/exhibitions/[id]/_components/__tests__/exhibition-loading.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionLoading } from '../exhibition-loading'

describe('ExhibitionLoading', () => {
  it('renders with role="status"', () => {
    render(<ExhibitionLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  it('renders Korean loading text', () => {
    render(<ExhibitionLoading />)
    expect(screen.getByText(/전시를 불러오는 중/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- exhibition-loading`

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-loading.tsx
import { Loader2 } from 'lucide-react'

export function ExhibitionLoading() {
  return (
    <div
      role='status'
      aria-live='polite'
      className='min-h-[60vh] bg-rice-paper grid place-items-center'
    >
      <div className='flex flex-col items-center gap-4 text-muted-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-celadon-green motion-reduce:animate-none' />
        <p className='font-serif text-lg'>전시를 불러오는 중...</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인** — `npm run test -- exhibition-loading`

- [ ] **Step 5: 커밋** — `feat(exhibitions): ExhibitionLoading component`

---

### Task 3.2: `ExhibitionError` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-error.tsx`
- Test: `__tests__/exhibition-error.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionError } from '../exhibition-error'

describe('ExhibitionError', () => {
  it('renders not-found heading by default', () => {
    render(<ExhibitionError message='boom' />)
    expect(screen.getByText('전시를 찾을 수 없습니다')).toBeInTheDocument()
  })
  it('renders network heading when kind=network', () => {
    render(<ExhibitionError kind='network' message='boom' />)
    expect(screen.getByText(/문제가 발생/)).toBeInTheDocument()
  })
  it('shows back link', () => {
    render(<ExhibitionError message='boom' />)
    expect(
      screen.getByRole('link', { name: /목록으로 돌아가기/ })
    ).toHaveAttribute('href', '/exhibitions')
  })
  it('honors custom backHref', () => {
    render(<ExhibitionError message='boom' backHref='/' />)
    expect(
      screen.getByRole('link', { name: /목록으로 돌아가기/ })
    ).toHaveAttribute('href', '/')
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-error.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ExhibitionErrorProps {
  message: string
  kind?: 'not-found' | 'network' | 'unauthorized'
  backHref?: string
}

const HEADINGS: Record<NonNullable<ExhibitionErrorProps['kind']>, string> = {
  'not-found': '전시를 찾을 수 없습니다',
  network: '전시를 불러오는 중 문제가 발생했습니다',
  unauthorized: '이 작업을 수행할 권한이 없습니다',
}

export function ExhibitionError({
  message,
  kind = 'not-found',
  backHref = '/exhibitions',
}: ExhibitionErrorProps) {
  return (
    <div className='min-h-[60vh] bg-rice-paper grid place-items-center px-4'>
      <div className='text-center max-w-md'>
        <div
          aria-hidden='true'
          className='font-brush text-[8rem] text-scholar-red/15 leading-none -mb-8 select-none'
        >
          空
        </div>
        <h1 className='font-serif text-3xl font-semibold text-foreground mb-3'>
          {HEADINGS[kind]}
        </h1>
        <p className='text-muted-foreground mb-8'>{message}</p>
        <Link href={backHref}>
          <Button
            variant='outline'
            className='border-celadon-green/40 hover:bg-celadon-green/10'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.3: `ExhibitionShareBar` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-share-bar.tsx`
- Test: `__tests__/exhibition-share-bar.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExhibitionShareBar } from '../exhibition-share-bar'

const originalOpen = window.open
const originalClipboard = navigator.clipboard

beforeEach(() => {
  window.open = jest.fn() as any
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    configurable: true,
  })
})
afterEach(() => {
  window.open = originalOpen
  Object.defineProperty(navigator, 'clipboard', {
    value: originalClipboard,
    configurable: true,
  })
})

describe('ExhibitionShareBar', () => {
  it('opens Facebook share URL on click', () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /facebook/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank'
    )
  })
  it('opens Twitter intent URL', () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /twitter/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
  })
  it('copies URL to clipboard on copy', async () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/x'
    )
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-share-bar.tsx
'use client'

import { Facebook, Twitter, Instagram, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExhibitionShareBarProps {
  title: string
  url?: string
}

export function ExhibitionShareBar({ title, url }: ExhibitionShareBarProps) {
  const shareUrl =
    url ?? (typeof window === 'object' ? window.location.href : '')

  const handle = async (
    platform: 'facebook' | 'twitter' | 'instagram' | 'copy'
  ) => {
    if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      )
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
        '_blank'
      )
    } else if (platform === 'instagram') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        window.open('https://www.instagram.com', '_blank')
        alert(
          '인스타그램이 새 창에서 열렸습니다. 링크가 복사되었으니 게시물이나 스토리에 붙여넣어 공유해보세요!'
        )
      } catch {
        alert('링크 복사에 실패했습니다.')
      }
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('링크가 복사되었습니다.')
      } catch {
        alert('링크 복사에 실패했습니다.')
      }
    }
  }

  return (
    <div
      className='flex items-center gap-1.5'
      role='group'
      aria-label='전시 공유'
    >
      <Button
        variant='outline'
        size='sm'
        aria-label='Facebook'
        onClick={() => handle('facebook')}
      >
        <Facebook className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        aria-label='Twitter'
        onClick={() => handle('twitter')}
      >
        <Twitter className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        aria-label='Instagram'
        onClick={() => handle('instagram')}
      >
        <Instagram className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        aria-label='Copy link'
        onClick={() => handle('copy')}
      >
        <LinkIcon className='h-4 w-4' />
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.4: `ExhibitionMetaBand` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-meta-band.tsx`
- Test: `__tests__/exhibition-meta-band.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionMetaBand } from '../exhibition-meta-band'

const baseProps = {
  startDate: '2026-04-15T00:00:00.000Z',
  endDate: '2026-04-28T00:00:00.000Z',
  status: 'upcoming' as const,
}

describe('ExhibitionMetaBand', () => {
  it('renders period labels', () => {
    render(<ExhibitionMetaBand {...baseProps} />)
    expect(screen.getByText('기간')).toBeInTheDocument()
  })
  it('shows "—" when location is null', () => {
    render(<ExhibitionMetaBand {...baseProps} location={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
  it('shows "무료 입장" when ticketPrice is 0', () => {
    render(<ExhibitionMetaBand {...baseProps} ticketPrice={0} />)
    expect(screen.getByText('무료 입장')).toBeInTheDocument()
  })
  it('shows formatted price when ticketPrice > 0', () => {
    render(<ExhibitionMetaBand {...baseProps} ticketPrice={5000} />)
    expect(screen.getByText(/5,000/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-meta-band.tsx
import type { ExhibitionStatus } from '@/lib/types/exhibition-legacy'
import {
  formatExhibitionDate,
  getRemainingDays,
} from './exhibition-detail-meta'

interface ExhibitionMetaBandProps {
  startDate: string
  endDate: string
  status: ExhibitionStatus
  location?: string | null
  venue?: string | null
  curator?: string | null
  views?: number
  ticketPrice?: number | null
}

const DASH = '—'

function formatTicket(price: number | null | undefined): string {
  if (price === 0) return '무료 입장'
  if (price && price > 0) return `${price.toLocaleString()}원`
  return DASH
}

export function ExhibitionMetaBand({
  startDate,
  endDate,
  status,
  location,
  venue,
  curator,
  views,
  ticketPrice,
}: ExhibitionMetaBandProps) {
  const remaining = getRemainingDays(endDate)

  return (
    <section
      aria-label='전시 정보'
      className='grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 mb-12 bg-silk-cream border border-border rounded-xl'
    >
      <Cell
        label='기간'
        value={`${formatExhibitionDate(startDate)} — ${formatExhibitionDate(endDate)}`}
        sub={status === 'current' && remaining ? remaining : undefined}
      />
      <Cell label='장소' value={location ?? DASH} sub={venue ?? undefined} />
      <Cell label='주최' value={curator ?? DASH} />
      <Cell
        label='관람'
        value={formatTicket(ticketPrice)}
        sub={
          typeof views === 'number'
            ? `조회 ${views.toLocaleString()}회`
            : undefined
        }
      />
    </section>
  )
}

function Cell({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div>
      <p className='text-xs font-semibold tracking-widest uppercase text-celadon-green mb-2'>
        {label}
      </p>
      <div className='font-serif text-lg font-medium text-foreground leading-tight'>
        {value}
      </div>
      {sub && <div className='text-sm text-muted-foreground mt-1'>{sub}</div>}
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.5: `ExhibitionDescription` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-description.tsx`
- Test: `__tests__/exhibition-description.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionDescription } from '../exhibition-description'

describe('ExhibitionDescription', () => {
  it('returns null when description is empty', () => {
    const { container } = render(<ExhibitionDescription description='' />)
    expect(container.firstChild).toBeNull()
  })
  it('renders description text', () => {
    render(<ExhibitionDescription description='전시 소개 내용입니다.' />)
    expect(screen.getByText(/전시 소개 내용입니다/)).toBeInTheDocument()
  })
  it('renders default section number', () => {
    render(<ExhibitionDescription description='x' />)
    expect(screen.getByText('§ 01 — 기획 의도')).toBeInTheDocument()
  })
  it('honors custom section number', () => {
    render(<ExhibitionDescription description='x' sectionNumber='§ 02' />)
    expect(screen.getByText(/§ 02/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-description.tsx
interface ExhibitionDescriptionProps {
  description: string
  sectionNumber?: string
  sectionHeading?: string
  hanjaAccent?: string
}

export function ExhibitionDescription({
  description,
  sectionNumber = '§ 01',
  sectionHeading = '기획 의도',
  hanjaAccent = '— 정법의 계승, 창신의 발현',
}: ExhibitionDescriptionProps) {
  if (!description.trim()) return null

  return (
    <section className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 mb-24'>
      <aside className='lg:sticky lg:top-24'>
        <p className='font-serif text-sm tracking-widest text-celadon-green mb-2'>
          {sectionNumber} — {sectionHeading}
        </p>
        <h2 className='font-serif text-3xl font-semibold leading-tight text-foreground tracking-tight'>
          正法의 계승과
          <br />
          創新의 조화
          <span className='block font-cjk text-scholar-red text-base font-medium mt-2'>
            {hanjaAccent}
          </span>
        </h2>
      </aside>
      <div className='exhibition-description-prose font-cjk text-lg text-foreground max-w-prose whitespace-pre-wrap'>
        {description}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.6: `ExhibitionHero` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-hero.tsx`
- Test: `__tests__/exhibition-hero.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionHero } from '../exhibition-hero'

const baseProps = {
  title: '서경(書境) 새로운 지평',
  startDate: '2026-04-15T00:00:00.000Z',
  endDate: '2026-04-28T00:00:00.000Z',
  status: 'upcoming' as const,
  isFeatured: true,
}

describe('ExhibitionHero', () => {
  it('renders title', () => {
    render(<ExhibitionHero {...baseProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/서경/)
  })
  it('renders subtitle when provided', () => {
    render(<ExhibitionHero {...baseProps} subtitle='New Horizons' />)
    expect(screen.getByText(/New Horizons/)).toBeInTheDocument()
  })
  it('renders <Image> in poster mode when featuredImageUrl present', () => {
    render(<ExhibitionHero {...baseProps} featuredImageUrl='/p.jpg' />)
    const img = screen.getByAltText(baseProps.title)
    expect(img).toBeInTheDocument()
  })
  it('renders watermark with extracted Hanja in watermark mode', () => {
    const { container } = render(<ExhibitionHero {...baseProps} />)
    expect(container.querySelector('[data-watermark]')?.textContent).toBe(
      '書境'
    )
  })
  it('renders ownerActions when provided', () => {
    render(
      <ExhibitionHero {...baseProps} ownerActions={<button>Edit</button>} />
    )
    expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument()
  })
  it('omits ownerActions slot when null', () => {
    render(<ExhibitionHero {...baseProps} ownerActions={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-hero.tsx
import Image from 'next/image'
import { pickWatermarkChar } from '@/lib/exhibitions/pick-watermark-char'
import type { ExhibitionStatus } from '@/lib/types/exhibition-legacy'

interface ExhibitionHeroProps {
  title: string
  subtitle?: string | null
  status: ExhibitionStatus
  startDate: string
  endDate: string
  isFeatured: boolean
  featuredImageUrl?: string | null
  ownerActions?: React.ReactNode
}

const STATUS_LABELS: Record<ExhibitionStatus, string> = {
  upcoming: 'UPCOMING',
  current: 'NOW SHOWING',
  past: 'CONCLUDED',
}

export function ExhibitionHero({
  title,
  subtitle,
  status,
  isFeatured,
  featuredImageUrl,
  ownerActions,
}: ExhibitionHeroProps) {
  const watermarkChar = pickWatermarkChar(title)
  const isPosterMode = Boolean(featuredImageUrl)

  return (
    <section
      aria-labelledby='exhibition-title'
      className='relative my-6 mb-24 rounded-2xl overflow-hidden aspect-[16/9] min-h-[480px] md:aspect-[16/9] aspect-[4/5] bg-ink-black isolate'
    >
      {isPosterMode ? (
        <>
          <Image
            src={featuredImageUrl as string}
            alt={title}
            fill
            sizes='100vw'
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/40 to-ink-black/20 pointer-events-none' />
        </>
      ) : (
        <>
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_color-mix(in_srgb,_var(--celadon-green)_40%,_var(--ink-black))_0%,_var(--ink-black)_70%)]' />
          <div
            data-watermark
            aria-hidden='true'
            className='absolute right-[4%] top-1/2 -translate-y-1/2 font-brush text-[clamp(8rem,22vw,18rem)] leading-none text-white/[0.08] pointer-events-none select-none'
          >
            {watermarkChar}
          </div>
        </>
      )}

      {ownerActions && (
        <div className='absolute top-6 right-6 z-10 flex gap-2'>
          {ownerActions}
        </div>
      )}

      <div className='absolute left-0 right-0 bottom-0 p-8 md:p-12 text-rice-paper z-10'>
        {(isFeatured || status === 'upcoming') && (
          <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-brand-gold text-ink-black text-xs font-semibold tracking-widest uppercase mb-4'>
            <span className='w-1.5 h-1.5 rounded-full bg-current motion-safe:animate-pulse' />
            {STATUS_LABELS[status]}
          </span>
        )}
        <h1
          id='exhibition-title'
          className='font-serif font-semibold text-4xl md:text-6xl leading-tight tracking-tight max-w-[18ch] mb-2'
        >
          {title}
        </h1>
        {subtitle && (
          <p className='font-serif italic text-lg md:text-xl text-rice-paper/75 max-w-[40ch]'>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.7: `ExhibitionArtworkGrid` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-artwork-grid.tsx`
- Test: `__tests__/exhibition-artwork-grid.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionArtworkGrid } from '../exhibition-artwork-grid'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

const oneArtwork: ExhibitionFull['artworks'][0] = {
  relationId: 'r1',
  id: 'a1',
  title: '逍遙游',
  titleHanja: '逍遙游',
  titleEn: 'Wandering',
  images: [],
  imageUrl: null,
  artistId: 'art1',
  artistName: '徐景 김재호',
  displayOrder: 0,
  isFeatured: true,
  style: 'zhuan',
  medium: '화선지',
  dimensions: '136×70',
  year: 2025,
}

describe('ExhibitionArtworkGrid', () => {
  it('returns null when artworks empty', () => {
    const { container } = render(<ExhibitionArtworkGrid artworks={[]} />)
    expect(container.firstChild).toBeNull()
  })
  it('renders artwork title', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText('逍遙游')).toBeInTheDocument()
  })
  it('shows artist name', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText(/徐景 김재호/)).toBeInTheDocument()
  })
  it('renders featured badge for isFeatured artwork', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText(/대표/)).toBeInTheDocument()
  })
  it('shows calligraphy placeholder when imageUrl is null', () => {
    const { container } = render(
      <ExhibitionArtworkGrid artworks={[oneArtwork]} />
    )
    expect(
      container.querySelector('[data-calligraphy-placeholder]')
    ).toBeInTheDocument()
  })
  it('wraps card in Link to /artworks/[id]', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/artworks/a1')
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-artwork-grid.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type {
  ExhibitionFull,
  CalligraphyStyle,
} from '@/lib/types/exhibition-legacy'

interface ExhibitionArtworkGridProps {
  artworks: ExhibitionFull['artworks']
}

const STYLE_LABELS: Record<CalligraphyStyle, string> = {
  zhuan: '篆書 · Seal Script',
  li: '隷書 · Clerical Script',
  kai: '楷書 · Standard Script',
  xing: '行書 · Running Script',
  cao: '草書 · Cursive Script',
  hangul: '한글 · Hangul Calligraphy',
  mixed: '한문/한글 · Mixed',
}

const STYLE_PLACEHOLDER: Record<CalligraphyStyle, string> = {
  zhuan: '篆',
  li: '隷',
  kai: '楷',
  xing: '行',
  cao: '草',
  hangul: '한',
  mixed: '書',
}

export function ExhibitionArtworkGrid({
  artworks,
}: ExhibitionArtworkGridProps) {
  if (artworks.length === 0) return null

  return (
    <section className='mb-24' aria-labelledby='works-heading'>
      <header className='flex items-end justify-between mb-8 gap-4 pb-4 border-b border-border'>
        <h2
          id='works-heading'
          className='font-serif text-4xl font-semibold tracking-tight'
        >
          <span className='font-cjk text-celadon-green font-normal mr-3'>
            貳
          </span>
          주요 출품작
        </h2>
        <span className='text-sm text-muted-foreground font-medium'>
          총 {artworks.length}점
        </span>
      </header>

      <div className='grid gap-8 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
        {artworks.map(art => {
          const placeholderChar = art.style
            ? STYLE_PLACEHOLDER[art.style]
            : '書'
          const styleLabel = art.style ? STYLE_LABELS[art.style] : null

          return (
            <Link
              key={art.relationId}
              href={`/artworks/${art.id}`}
              className='group block bg-card rounded-lg overflow-hidden border border-celadon-green/20 hover:-translate-y-1 hover:shadow-xl transition-[transform,box-shadow] duration-250 motion-reduce:hover:transform-none'
            >
              <div className='relative aspect-[3/4] bg-rice-paper border-b border-border grid place-items-center overflow-hidden'>
                {art.imageUrl ? (
                  <Image
                    src={art.imageUrl}
                    alt={art.title}
                    fill
                    sizes='(max-width: 768px) 100vw, 33vw'
                    className='object-cover'
                  />
                ) : (
                  <span
                    data-calligraphy-placeholder
                    aria-hidden='true'
                    className='font-brush text-[clamp(5rem,12vw,9rem)] text-ink-black leading-none select-none'
                  >
                    {placeholderChar}
                  </span>
                )}
                {art.isFeatured && (
                  <div className='absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-brand-gold text-ink-black text-xs font-semibold'>
                    <Star className='w-3 h-3 fill-current' />
                    대표
                  </div>
                )}
              </div>
              <div className='p-4 pb-5'>
                {styleLabel && (
                  <span className='inline-block text-[0.6875rem] font-semibold tracking-widest uppercase text-celadon-green mb-2'>
                    {styleLabel}
                  </span>
                )}
                <h3 className='font-cjk text-xl font-semibold mb-1 leading-tight group-hover:text-celadon-green transition-colors'>
                  {art.title}
                  {art.titleEn && (
                    <span className='block font-serif italic text-sm font-normal text-muted-foreground mt-1'>
                      {art.titleEn}
                    </span>
                  )}
                </h3>
                <p className='text-sm text-muted-foreground mb-3'>
                  {art.artistName}
                </p>
                <div className='flex flex-wrap gap-3 text-xs text-muted-foreground pt-3 border-t border-dashed border-border'>
                  {art.year && (
                    <span>
                      <strong className='text-foreground font-medium'>
                        {art.year}
                      </strong>
                    </span>
                  )}
                  {art.medium && <span>{art.medium}</span>}
                  {art.dimensions && <span>{art.dimensions}</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

### Task 3.8: `ExhibitionVisitInfo` (TDD)

**Files:**

- Create: `app/exhibitions/[id]/_components/exhibition-visit-info.tsx`
- Test: `__tests__/exhibition-visit-info.test.tsx`

- [ ] **Step 1: 실패 테스트**

```tsx
import { render, screen } from '@testing-library/react'
import { ExhibitionVisitInfo } from '../exhibition-visit-info'

describe('ExhibitionVisitInfo', () => {
  it('renders nothing when location is missing', () => {
    const { container } = render(<ExhibitionVisitInfo location='' />)
    expect(container.firstChild).toBeNull()
  })
  it('renders location and venue', () => {
    render(<ExhibitionVisitInfo location='예술의전당' venue='서울서예박물관' />)
    expect(screen.getByText(/예술의전당/)).toBeInTheDocument()
    expect(screen.getByText(/서울서예박물관/)).toBeInTheDocument()
  })
  it('shows free entry when ticketPrice is 0', () => {
    render(<ExhibitionVisitInfo location='x' ticketPrice={0} />)
    expect(screen.getByText('무료 입장')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

- [ ] **Step 3: 구현**

```tsx
// app/exhibitions/[id]/_components/exhibition-visit-info.tsx
interface ExhibitionVisitInfoProps {
  location: string
  venue?: string | null
  ticketPrice?: number | null
  openingHours?: string | null
  contact?: string | null
}

export function ExhibitionVisitInfo({
  location,
  venue,
  ticketPrice,
  openingHours,
  contact,
}: ExhibitionVisitInfoProps) {
  if (!location.trim()) return null

  const ticket =
    ticketPrice === 0
      ? '무료 입장'
      : ticketPrice && ticketPrice > 0
        ? `${ticketPrice.toLocaleString()}원`
        : null

  return (
    <section
      className='mb-24 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start'
      aria-labelledby='visit-heading'
    >
      <div className='bg-silk-cream border border-border rounded-xl p-8'>
        <h3
          id='visit-heading'
          className='font-serif text-2xl font-semibold mb-6 tracking-tight flex items-center gap-3'
        >
          <span
            className='w-1 h-6 bg-scholar-red rounded-sm'
            aria-hidden='true'
          />
          관람 안내
        </h3>
        <dl className='grid grid-cols-[100px_1fr] gap-x-6 gap-y-4'>
          <dt className='text-sm font-semibold text-celadon-green'>주소</dt>
          <dd className='text-base text-foreground leading-relaxed'>
            {location}
            {venue && (
              <em className='not-italic block text-sm text-muted-foreground mt-0.5'>
                {venue}
              </em>
            )}
          </dd>
          {openingHours && (
            <>
              <dt className='text-sm font-semibold text-celadon-green'>
                운영시간
              </dt>
              <dd className='text-base text-foreground'>{openingHours}</dd>
            </>
          )}
          {ticket && (
            <>
              <dt className='text-sm font-semibold text-celadon-green'>
                입장료
              </dt>
              <dd className='text-base text-foreground'>{ticket}</dd>
            </>
          )}
          {contact && (
            <>
              <dt className='text-sm font-semibold text-celadon-green'>문의</dt>
              <dd className='text-base text-foreground'>{contact}</dd>
            </>
          )}
        </dl>
      </div>
      <div
        role='img'
        aria-label={`${location} 위치`}
        className='aspect-[4/3] bg-silk-cream border border-border rounded-xl grid place-items-center relative overflow-hidden'
      >
        <div
          aria-hidden='true'
          className='w-14 h-14 bg-scholar-red text-white rounded-full grid place-items-center'
          style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
        >
          <span style={{ transform: 'rotate(45deg)' }} className='text-xl'>
            📍
          </span>
        </div>
        <div className='absolute bottom-4 bg-ink-black text-rice-paper px-3.5 py-1.5 rounded-sm text-sm font-medium'>
          {location}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 통과 확인**

- [ ] **Step 5: 커밋**

---

## Phase 4 — globals.css 신규 컴포넌트 클래스 (1 task)

### Task 4.1: `@layer components`에 dropcap 추가

**Files:**

- Modify: `app/globals.css` (마지막에 추가)

- [ ] **Step 1: dropcap 클래스 추가**

`app/globals.css` 의 `@layer components { ... }` 블록 안 마지막에 추가:

```css
/* ADDED: 2026-04-26 — exhibition detail mockup port */

.exhibition-description-prose {
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.75;
}

@supports (text-wrap: pretty) {
  .exhibition-description-prose {
    text-wrap: pretty;
  }
}

.exhibition-description-prose p {
  margin: 0 0 1.5rem;
}

.exhibition-description-prose > p:first-of-type::first-letter {
  font-family: var(--font-playfair, 'Playfair Display'), 'Noto Serif KR', serif;
  font-size: 3.5em;
  float: left;
  line-height: 0.85;
  padding: 6px 12px 0 0;
  color: var(--scholar-red, #af2626);
  font-weight: 600;
}
```

- [ ] **Step 2: dev 서버에서 시각 확인**

```bash
npm run dev &
# 브라우저에서 /exhibitions/3 접속 (Phase 5 이후 가능)
```

본 단계에서는 컴파일 통과만 확인: Run: `npm run build` Expected: PASS (CSS
컴파일 오류 없음)

- [ ] **Step 3: 커밋**

```bash
echo "🎨 css: exhibition-description-prose dropcap + word-break (mockup-port)" > .commit_message.txt
git add app/globals.css .commit_message.txt
git commit -m "css(globals): dropcap + CJK word-break for exhibition description"
```

---

## Phase 5 — Orchestrator + page.tsx (2 tasks)

### Task 5.1: `ExhibitionDetailBody` 교체 (orchestrator)

**Files:**

- Modify: `app/exhibitions/[id]/_components/exhibition-detail-body.tsx` (전면
  재작성)

- [ ] **Step 1: 백업 (안전망)**

```bash
cp app/exhibitions/[id]/_components/exhibition-detail-body.tsx /tmp/exhibition-detail-body.backup.tsx
```

- [ ] **Step 2: 새 orchestrator 작성**

```tsx
// app/exhibitions/[id]/_components/exhibition-detail-body.tsx
'use client'

import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'
import { ExhibitionHero } from './exhibition-hero'
import { ExhibitionMetaBand } from './exhibition-meta-band'
import { ExhibitionDescription } from './exhibition-description'
import { ExhibitionArtworkGrid } from './exhibition-artwork-grid'
import { ExhibitionVisitInfo } from './exhibition-visit-info'
import { ExhibitionShareBar } from './exhibition-share-bar'

interface ExhibitionDetailBodyProps {
  exhibition: ExhibitionFull
  isOwner: boolean
  onDelete: () => Promise<void>
}

export function ExhibitionDetailBody({
  exhibition,
  isOwner,
  onDelete,
}: ExhibitionDetailBodyProps) {
  const ownerActions = isOwner ? (
    <>
      <Link href={`/exhibitions/${exhibition.id}/edit`}>
        <Button
          variant='outline'
          size='sm'
          className='bg-rice-paper/90 hover:bg-rice-paper'
        >
          <Edit className='w-4 h-4 mr-2' /> 수정
        </Button>
      </Link>
      <Button
        variant='outline'
        size='sm'
        onClick={onDelete}
        className='bg-rice-paper/90 hover:bg-rice-paper text-scholar-red hover:text-scholar-red'
      >
        <Trash2 className='w-4 h-4 mr-2' /> 삭제
      </Button>
    </>
  ) : null

  return (
    <article>
      {/* Breadcrumb + ShareBar 줄 */}
      <div className='flex items-center justify-between gap-4 mb-4 flex-wrap'>
        <nav
          aria-label='현재 위치'
          className='text-sm text-muted-foreground flex items-center gap-2'
        >
          <Link href='/' className='hover:text-foreground'>
            홈
          </Link>
          <span className='opacity-40'>/</span>
          <Link href='/exhibitions' className='hover:text-foreground'>
            전시
          </Link>
          <span className='opacity-40'>/</span>
          <span className='text-foreground font-medium line-clamp-1 max-w-[40ch]'>
            {exhibition.title}
          </span>
        </nav>
        <ExhibitionShareBar title={exhibition.title} />
      </div>

      <ExhibitionHero
        title={exhibition.title}
        subtitle={exhibition.subtitle}
        status={exhibition.status}
        startDate={exhibition.startDate}
        endDate={exhibition.endDate}
        isFeatured={exhibition.isFeatured}
        featuredImageUrl={exhibition.featuredImageUrl}
        ownerActions={ownerActions}
      />

      <ExhibitionMetaBand
        startDate={exhibition.startDate}
        endDate={exhibition.endDate}
        status={exhibition.status}
        location={exhibition.location}
        venue={exhibition.venue}
        curator={exhibition.curator}
        views={exhibition.views}
        ticketPrice={exhibition.ticketPrice}
      />

      <ExhibitionDescription description={exhibition.description} />

      <ExhibitionArtworkGrid artworks={exhibition.artworks} />

      {exhibition.location && (
        <ExhibitionVisitInfo
          location={exhibition.location}
          venue={exhibition.venue}
          ticketPrice={exhibition.ticketPrice}
        />
      )}

      {/* CTAStrip은 본 사이클에서 호출 안 함 — 도록 PDF 데이터 추가 시 활성화 */}
    </article>
  )
}
```

- [ ] **Step 3: 빌드 + 타입 체크**

```bash
npm run type-check
npm run build
```

오류 발생 시: import 경로/타입 시그니처 확인.

- [ ] **Step 4: 커밋**

```bash
echo "✨ refactor: ExhibitionDetailBody mockup-port — 8 컴포넌트 orchestrator (mockup 디자인 도입)" > .commit_message.txt
git add app/exhibitions/[id]/_components/exhibition-detail-body.tsx .commit_message.txt
git commit -m "refactor(exhibitions): ExhibitionDetailBody as thin orchestrator with new sections"
```

---

### Task 5.2: `page.tsx` 새 hook 사용

**Files:**

- Modify: `app/exhibitions/[id]/page.tsx`

- [ ] **Step 1: 새 page.tsx 작성**

```tsx
// app/exhibitions/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { useExhibitionDetail } from '@/lib/hooks/use-exhibition-detail'
import { ExhibitionDetailBody } from './_components/exhibition-detail-body'
import { ExhibitionLoading } from './_components/exhibition-loading'
import { ExhibitionError } from './_components/exhibition-error'

export default function ExhibitionDetailPage() {
  const params = useParams()
  const exhibitionId = params.id as string
  const { exhibition, loading, error, isOwner, handleDelete } =
    useExhibitionDetail(exhibitionId)

  if (loading) {
    return (
      <>
        <ExhibitionLoading />
        <LayoutFooter />
      </>
    )
  }

  if (error || !exhibition) {
    return (
      <>
        <ExhibitionError
          message={error ?? '전시 정보를 찾을 수 없습니다.'}
          kind={
            error?.toLowerCase().includes('not found') ? 'not-found' : 'network'
          }
        />
        <LayoutFooter />
      </>
    )
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <main className='container mx-auto px-4 py-8'>
        <ExhibitionDetailBody
          exhibition={exhibition}
          isOwner={isOwner}
          onDelete={handleDelete}
        />
      </main>
      <LayoutFooter />
    </div>
  )
}
```

- [ ] **Step 2: dev 서버에서 정적 ID '3' 확인**

```bash
npm run dev
# 브라우저에서 http://localhost:3000/exhibitions/3 접속
# 페이지가 mockup 디자인으로 렌더되는지 시각 확인
```

확인 사항:

- 한자 워터마크 hero 또는 포스터 hero 렌더 (poster-main.png 존재 여부에 따라)
- 메타 밴드 4-col
- description 드롭캡 (첫 글자 빨강 큰 글씨)
- 작품 6점 카드 그리드 (각 calligraphy character placeholder)
- 방문 안내 + 핀
- breadcrumb 우측 share bar

- [ ] **Step 3: 통합 테스트 (선택사항)**

기존 page.tsx 테스트가 있다면 갱신, 없다면 통합 테스트는 후속 사이클로.

- [ ] **Step 4: 커밋**

```bash
echo "✨ refactor: page.tsx useExhibitionDetail hook 사용 — useState/useEffect 인라인 로직 제거" > .commit_message.txt
git add app/exhibitions/[id]/page.tsx .commit_message.txt
git commit -m "refactor(exhibitions): page.tsx uses useExhibitionDetail hook"
```

---

## Phase 6 — 검증 (4 tasks)

### Task 6.1: 타입 / 린트 / 테스트 / 빌드 게이트

- [ ] **Step 1: 모든 게이트 실행**

```bash
npm run type-check
npm run lint
npm run test
npm run build
npm run pre-commit
```

각 명령 PASS 확인. 실패 시 해당 task로 복귀.

- [ ] **Step 2: 통과 결과 메모 (PR 본문 첨부용)**

CI 결과 텍스트 캡처.

---

### Task 6.2: 3개 뷰포트 시각 검수 + 캡처

- [ ] **Step 1: dev 서버 + 캡처**

```bash
npm run dev &
sleep 5

B=~/.claude/skills/gstack/browse/dist/browse
$B goto "http://localhost:3000/exhibitions/3"
$B viewport 1440x900 && $B reload && sleep 2 && $B screenshot /tmp/asca-port-desktop.png
$B viewport 768x1024 && $B reload && sleep 2 && $B screenshot /tmp/asca-port-tablet.png
$B viewport 375x812  && $B reload && sleep 2 && $B screenshot /tmp/asca-port-mobile.png
```

- [ ] **Step 2: mockup 대비 비교**

```bash
# mockup 캡처 위치
ls /tmp/asca-verify-{desktop,tablet,mobile}.png  # 이전 design-html 사이클 산출물
```

3개 뷰포트에서 mockup vs 신규 컴포넌트 페이지를 시각 비교. 회귀 사항 (예: hero
텍스트 잘림, artwork 카드 배치 깨짐) 발견 시 task로 복귀.

---

### Task 6.3: 접근성 + 다크모드 + 오너 모드 수동 검증

- [ ] **Step 1: 키보드 네비게이션**

dev 서버에서 Tab 키로 페이지 순회 — 모든 link/button 도달, focus ring 보임.

- [ ] **Step 2: 헤딩 hierarchy 검증**

```bash
# DevTools Console에서:
# Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => `${h.tagName}: ${h.textContent.slice(0,40)}`)
```

h1 한 개(전시 제목), h2 섹션 헤더, h3 작품 카드 — 순차 확인.

- [ ] **Step 3: 다크 모드**

OS 다크 모드 토글 또는 `.dark` 클래스 강제 적용 후 시각 검수.

- [ ] **Step 4: 오너 모드 (Clerk 로그인 후)**

전시 ID에 owner 권한 있는 계정으로 로그인 → hero 우상단에 수정/삭제 버튼 보임.

---

### Task 6.4: PR 작성 + 본문 첨부

- [ ] **Step 1: 변경 요약 정리**

총 git log 출력 — 본 작업으로 생긴 commit 목록 정리.

```bash
git log --oneline main..HEAD
```

- [ ] **Step 2: PR 생성**

```bash
gh pr create --title "feat(exhibitions): exhibition detail mockup → Next.js port" --body "$(cat <<'EOF'
## Summary
- 기존 ExhibitionDetailBody를 mockup 디자인으로 교체 (8 컴포넌트 분해)
- 작품 풀 메타 join 쿼리 신설 (getExhibitionFullById)
- useExhibitionDetail hook으로 fetch+ownership 로직 추출
- DESIGN.md v1.2.0-alpha 토큰 일관 사용 (celadon, scholar-red, brand-gold, rice-paper)
- Pretext 런타임 미사용 (CSS-only 한국어 줄바꿈)

Spec: docs/02-design/features/exhibition-detail-mockup-port.design.md
Plan: docs/01-plan/features/exhibition-detail-mockup-port.plan.md

## Test plan
- [ ] /exhibitions/3 정적 fallback 정상 렌더
- [ ] 동적 ID로 fetch 동작 (예: 시드 데이터 ID)
- [ ] 3개 뷰포트(375/768/1440) 시각 회귀 없음
- [ ] 키보드 네비게이션 + 헤딩 hierarchy
- [ ] 라이트 / 다크 모드
- [ ] 오너 / 비오너 모드
- [ ] type-check / lint / test / build 모두 PASS

## Out of scope (별도 사이클)
- i18n 4개 언어 자동 전환
- Server Component 마이그레이션
- generateMetadata SEO API
- 도록 PDF / CTA strip 호출 활성화
- 실제 지도 연동
EOF
)"
```

- [ ] **Step 2: 캡처 첨부**

PR comment로 `/tmp/asca-port-{desktop,tablet,mobile}.png` 3장 + mockup 비교 캡처
첨부.

---

## Self-Review Checklist (plan 작성자)

- [x] **Spec coverage:** 모든 §1~§12 spec 섹션이 task로 매핑됨
- [x] **Placeholder scan:** "TBD"/"TODO"/"implement later" 없음
- [x] **Type consistency:** `ExhibitionFull` 단일 타입으로 통일 (spec에서 제시한
      ExhibitionWithArtworkDetails 이름 폐기, 기존 타입 확장)
- [x] **Bite-sized tasks:** 각 task 5 단계 이내, 5분 단위
- [x] **No "similar to Task N":** 각 task 코드 전체 inline
- [x] **Exact paths:** 모든 파일 절대 경로 또는 `app/...` 시작
- [x] **TDD 패턴:** 테스트 → 실패 확인 → 구현 → 통과 → 커밋

### 보완 노트 (실행 시 발생 가능 항목)

- Task 0.1에서 schema 매핑이 plan 작성 가정과 다르면(특히
  `curatorNotes`↔`curator`, `venueAddress`↔`location`), Task 2.1의 매핑 로직을
  그에 맞춰 조정.
- ASCA에 `@testing-library/react` + `jest`가 설정되어 있다고 가정. 미설정 시
  Phase 0에 `npm install -D @testing-library/react jest-environment-jsdom` 사전
  설치 task 추가 필요.
- Drizzle schema에 `subtitle` 컬럼이 없어 Task 2.1에서 `subtitle: null`로 매핑.
  후속에서 schema 추가 시 매핑 갱신.
