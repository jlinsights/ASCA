---
name: Exhibition Detail Mockup → Next.js Port
slug: exhibition-detail-mockup-port
version: 1.0.0
status: design
created: 2026-04-26
owner: jhlim725
references:
  mockup: ~/.gstack/projects/jlinsights-ASCA/designs/exhibition-detail-20260426/finalized.html
  design-system: docs/02-design/DESIGN.md (v1.2.0-alpha)
  current-page: app/exhibitions/[id]/page.tsx
  current-body: app/exhibitions/[id]/_components/exhibition-detail-body.tsx
  data-model: lib/types/exhibition-legacy.ts
  query-layer: lib/db/queries.ts
---

# Exhibition Detail Mockup → Next.js Port

> 2026-04-26 design-html으로 만든 「서경(書境) 새로운 지평」 mockup을 ASCA
> `/exhibitions/[id]` 페이지로 옮긴다. 운영 중인 실용 기능은 보존하되 mockup의
> 편집 디자인 가치를 살리는 절충 포팅.

## 1. Overview

### 1.1 Why

방금 만든 mockup은 ASCA DESIGN.md v1.2.0-alpha 토큰(청자녹색, 서원홍,
brand-gold, 한자 워터마크, dropcap, pull quote)으로 전시 상세 페이지의 시각
정체성을 보여주는 reference 작품이다. 이 디자인 가치를 운영에 가져가지 않으면
mockup은 영구히 reference로만 남고, 사용자는 여전히 일반 카드 페이지를 본다.

### 1.2 What

`app/exhibitions/[id]/_components/exhibition-detail-body.tsx`(391줄)를 mockup
디자인으로 교체. 데이터 격차를 메우기 위해 작품 풀 메타 join 쿼리를 추가. 기존
운영 기능(공유 버튼, 포스터 이미지 렌더, 오너 편집/삭제, 정적 ID '3' fallback)은
모두 보존. 컴포넌트는 ASCA CLAUDE.md 500줄 규약에 맞춰 섹션별 분해.

### 1.3 Out of scope (D4 Minimal)

이번 사이클에는 **포함하지 않는다**:

- i18n 다국어 자동 전환 (`exhibition.title` Korean default 그대로)
- Server Component 마이그레이션 (현재 client component 패턴 유지)
- `generateMetadata` SEO 메타데이터 API
- Suspense streaming, Partial Prerendering
- Storybook 도입, 자동 시각 회귀 (Chromatic 등)
- 작품 detail modal, 작가 카드 확장
- 도록 PDF / 작가 인터뷰 데이터 추가 (CTA strip 컴포넌트는 만들되 호출 안 함)
- 실제 지도 연동 (placeholder 유지)

각 항목은 별도 PDCA 사이클로 분리.

## 2. Decisions Locked

| ID  | Question                        | 선택                                                          | Rationale                                                                                                         |
| --- | ------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| D1  | mockup vs 실제 페이지 기능 교환 | **절충**                                                      | mockup 시각 + 운영 기능(공유·포스터·조회수) 보존 + 데이터 없는 장식은 조건부 렌더                                 |
| D2  | 포스터 이미지 hero 통합         | **포스터 hero 배경 통합**                                     | 포스터 있으면 Image fill + 다크 그라디언트 오버레이, 없으면 calligraphy watermark 폴백. 한 컴포넌트로 모든 케이스 |
| D3  | 작품 그리드 데이터 깊이         | **풀 메타 join 쿼리 추가**                                    | mockup 디자인의 80% 가치가 작품 카드. ID만으로는 빈 껍데기                                                        |
| D4  | 사이클 scope                    | **Minimal — UI 포팅 + 작품 join만**                           | 단일 책임 PR. i18n/SSR/SEO는 각각 별도 가치                                                                       |
| D5  | 스타일링 접근                   | **Tailwind 우선 + globals.css `@layer components` 소량 추가** | ASCA 기존 컨벤션 정합. hero/dropcap/pull-quote만 새 클래스                                                        |

## 3. File Layout

### 3.1 추가 / 수정

```
app/exhibitions/[id]/
├── page.tsx                                       # 수정: useExhibitionDetail hook 사용, 새 fetch 함수 호출
└── _components/
    ├── exhibition-detail-body.tsx                 # 수정: 얇은 orchestrator (~120줄)
    ├── exhibition-detail-meta.ts                  # 그대로 유지 (status colors, date formatters)
    ├── exhibition-hero.tsx                        # NEW (~180줄)
    ├── exhibition-meta-band.tsx                   # NEW (~80줄)
    ├── exhibition-description.tsx                 # NEW (~120줄)
    ├── exhibition-artwork-grid.tsx                # NEW (~150줄)
    ├── exhibition-share-bar.tsx                   # NEW (~80줄)
    ├── exhibition-visit-info.tsx                  # NEW (~100줄, 조건부)
    ├── exhibition-cta-strip.tsx                   # NEW (~60줄, 본 사이클은 호출 안 함)
    ├── exhibition-loading.tsx                     # NEW (~50줄)
    └── exhibition-error.tsx                       # NEW (~50줄)

lib/
├── api/exhibitions.ts                             # 수정: fetchExhibitionWithArtworkDetails 추가
├── db/queries.ts                                  # 수정: getExhibitionWithArtworkDetails 추가
├── data/static-exhibitions.ts                     # NEW: ID '3' 정적 fallback + 6점 작품 데이터
├── hooks/use-exhibition-detail.ts                 # NEW: page.tsx fetch+ownership 로직 추출
└── types/exhibition-legacy.ts                     # 수정: ExhibitionWithArtworkDetails, CalligraphyStyle 추가

app/globals.css                                    # 수정: @layer components에 5개 이하 새 클래스
                                                   #   .exhibition-dropcap, .exhibition-pull-quote,
                                                   #   .calligraphy-watermark, .vermillion-stamp,
                                                   #   .ink-cta-strip
```

### 3.2 영향 받지 않는 영역

- `/exhibitions` 리스트, `/exhibitions/current/upcoming/past/online`
- `/exhibitions/[id]/edit`, `/exhibitions/create`
- `/api/exhibitions/*` 라우트 (단, GET handler 변경 가능성 — 단일 객체 응답 형태
  호환되도록 신규 필드만 추가)
- `tailwind.config.ts` — 변경 없음 (모든 토큰 이미 존재)
- `lib/db/schema.ts` — `CalligraphyStyle` enum이 schema에 없으면 schema 추가는
  사전 작업으로 별도 PR (writing-plans에서 결정)

## 4. Components

### 4.1 ExhibitionDetailBody (orchestrator)

```ts
interface ExhibitionDetailBodyProps {
  exhibition: ExhibitionWithArtworkDetails
  isOwner: boolean
  onDelete: () => Promise<void>
}
```

- 섹션 컴포넌트들을 조합해 단일 `<article>` 구성
- 조건부 렌더 결정 (description 비어있음 → 섹션 hidden, artworks 0건 → 섹션
  hidden, location 없음 → VisitInfo hidden)
- 권한 체크는 `page.tsx`에서 끝나고 결과만 받음

### 4.2 ExhibitionHero

```ts
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
```

- 두 모드 자동 분기:
  - **poster 모드** (`featuredImageUrl` truthy): Next/Image fill + 어두운
    그라디언트 오버레이 + 작은 calligraphy 코너 워터마크
  - **watermark 모드** (그 외): 다크 그라디언트 + 큰 calligraphy 워터마크
    (`pickWatermarkChar(title)` 결과)
- 항상 표시: status badge, title, subtitle (옵션)
- vermillion 인장 자리에 `ownerActions` 슬롯 (오너 모드일 때만 채워짐)

### 4.3 ExhibitionMetaBand

```ts
interface ExhibitionMetaBandProps {
  startDate: string
  endDate: string
  status: ExhibitionStatus // D-day 계산용
  location?: string | null
  venue?: string | null
  curator?: string | null
  viewCount?: number
  ticketPrice?: number | null
}
```

- 4-col grid (모바일 2-col)
- 항목: 기간(+ D-day) · 장소 + venue · 주최(curator) ·
  관람(ticketPrice/viewCount)
- 빈 값은 "—" 표시 (구조 유지)

### 4.4 ExhibitionDescription

```ts
interface ExhibitionDescriptionProps {
  description: string // empty면 부모에서 컴포넌트 자체 렌더 안 함
  sectionNumber?: string // "§ 01" 기본값
  sectionHeading?: string // "기획 의도" 기본값
  hanjaAccent?: string // 정적 텍스트 또는 추출
}
```

- 좌측 sticky aside: 섹션 번호 + 헤딩 + 한자 액센트
- 우측 prose: dropcap (첫 문단 첫 글자, scholar-red), `whitespace-pre-wrap`, CJK
  leading-relaxed
- 모바일 stack
- pull quote: description 안 따옴표 내 텍스트 → blockquote 변환은 **본 사이클
  미적용** (단순 prose만 — 단순화)

### 4.5 ExhibitionArtworkGrid

```ts
interface ExhibitionArtworkGridProps {
  artworks: ExhibitionArtworkDetail[] // 0건이면 부모에서 hidden
}
```

- `auto-fill, minmax(280px, 1fr)` grid
- 카드: 이미지(`imageUrl` 있으면 Next/Image, 없으면 calligraphy character
  placeholder by `style`) + 서체 태그 + 제목(한자 + 한국어) + 작가명 +
  연도/재료/치수
- isFeatured → brand-gold 별 배지
- 카드 전체가 `<Link href={\`/artworks/\${artwork.id}\`}>`
- 24건 초과 시 처리는 본 사이클 외 (전체 표시)

### 4.6 ExhibitionShareBar

```ts
interface ExhibitionShareBarProps {
  title: string
  url?: string // 기본값: typeof window === 'object' && window.location.href
}
```

- 4개 버튼: Facebook / Twitter / Instagram / Copy link
- 핸들러는 기존 `ExhibitionDetailBody`의 `handleShare` 함수 그대로 이동
- **위치 확정: breadcrumb 우측 floating cluster** (hero 외부, 페이지 상단 액션
  영역으로 통일)

### 4.7 ExhibitionVisitInfo (조건부)

```ts
interface ExhibitionVisitInfoProps {
  location: string // 없으면 부모에서 hidden
  venue?: string | null
  ticketPrice?: number | null
  // 운영시간/문의는 schema에 없음 → 정적 안내 또는 prop 확장 (writing-plans에서 결정)
}
```

- 좌: 정보 카드 (주소/운영시간/입장료/편의시설/문의)
- 우: 지도 placeholder (실제 연동은 후속)

### 4.8 ExhibitionCTAStrip (본 사이클 호출 없음)

- 컴포넌트는 만들어 두되 `ExhibitionDetailBody`에서 호출하지 않음 (주석 + TODO)
- 도록 PDF / 작가 인터뷰 데이터 추가 시 호출 활성화 (별도 사이클)

### 4.9 ExhibitionLoading / ExhibitionError

```ts
interface ExhibitionErrorProps {
  message: string
  kind?: 'not-found' | 'network' | 'unauthorized'
  backHref?: string // 기본 '/exhibitions'
}
```

- Loading: rice-paper bg + celadon spinner + "전시를 불러오는 중..."
- Error: rice-paper bg + scholar-red "空" watermark + 메시지 + back link

## 5. Data Flow

### 5.1 새 타입

```ts
// lib/types/exhibition-legacy.ts (확장)

export type CalligraphyStyle =
  | 'zhuan'
  | 'li'
  | 'kai'
  | 'xing'
  | 'cao'
  | 'hangul'
  | 'mixed'

export interface ExhibitionArtworkDetail extends ExhibitionArtwork {
  artwork: {
    id: string
    title: string
    titleHanja?: string | null
    artistId: string
    artistName: string
    year?: number | null
    materials?: string | null
    dimensions?: string | null
    imageUrl?: string | null
    style?: CalligraphyStyle | null
  }
}

export interface ExhibitionWithArtworkDetails
  extends Omit<ExhibitionWithDetails, 'artworks'> {
  artworks: ExhibitionArtworkDetail[]
}
```

### 5.2 새 쿼리

```ts
// lib/db/queries.ts
export async function getExhibitionWithArtworkDetails(id: string): Promise<{
  data: ExhibitionWithArtworkDetails | null
  error: Error | null
}>
```

- Drizzle 단일 query: `exhibitions ⨝ exhibition_artworks ⨝ artworks ⨝ artists`
- `displayOrder ASC` 정렬
- 행수 보호: 단일 전시당 작품 수십~수백, cartesian 안전

### 5.3 새 API 클라이언트

```ts
// lib/api/exhibitions.ts (추가)
export async function fetchExhibitionWithArtworkDetails(
  id: string
): Promise<{ data: ExhibitionWithArtworkDetails | null; error: string | null }>
```

기존 `fetchExhibitionById`는 보존 (다른 호출자 영향 차단).

### 5.4 정적 fallback 분리

```ts
// lib/data/static-exhibitions.ts (NEW)
export const STATIC_EXHIBITIONS: Record<string, ExhibitionWithArtworkDetails> =
  {
    '3': {
      /* 서경 새로운 지평 + 6점 작품 (mockup 데이터) */
    },
  }
```

mockup의 작품 6점
(篆書 逍遙游 / 隷書 松柏之操 / 楷書 致虛守靜 / 行書 入木三分 / 草書 飛白 / 한글
훈민정음 서문) 그대로 정적 데이터로 이동.

### 5.5 Hook 추출

```ts
// lib/hooks/use-exhibition-detail.ts (NEW)
export function useExhibitionDetail(id: string): {
  exhibition: ExhibitionWithArtworkDetails | null
  loading: boolean
  error: string | null
  isOwner: boolean
  handleDelete: () => Promise<void>
}
```

`page.tsx`의 5개 useState + useEffect + ownership check 로직 추출. ASCA
CLAUDE.md "Logic Separation" 권장 사항 정합.

### 5.6 page.tsx 흐름

```
URL /exhibitions/[id]
  ↓
page.tsx (client, 'use client')
  ├─ useExhibitionDetail(id)
  ├─ loading  → <ExhibitionLoading />
  ├─ error    → <ExhibitionError message={error} kind={...} />
  └─ data     → <ExhibitionDetailBody
                  exhibition={data}
                  isOwner={isOwner}
                  onDelete={handleDelete}
                />
                  ├─ <ExhibitionHero ownerActions={isOwner ? <EditDeleteCluster /> : null} />
                  ├─ <ExhibitionShareBar />
                  ├─ <ExhibitionMetaBand />
                  ├─ <ExhibitionDescription />        (description 있을 때만)
                  ├─ <ExhibitionArtworkGrid />        (artworks 0건 아닐 때만)
                  └─ <ExhibitionVisitInfo />          (location 있을 때만)
```

## 6. Pretext Decision: Drop

mockup은 Pretext를 한국어 prose 높이 계산 + 카드 제목 shrinkwrap에 사용했지만,
**프로덕션에서는 제거**.

이유:

- 30KB gzip 영구 번들 비용 vs 0KB CSS-only
- Pretext는 브라우저 전용 (`Intl.Segmenter`, `document.fonts`) → SSR 불가,
  `'use client'` 경계 추가 필요
- `word-break: keep-all` + `text-wrap: pretty`로 한국어 줄바꿈 80%+ 커버 (모던
  브라우저)
- `inline-size: max-content` + grid `auto-fill`로 카드 폭 자연스럽게 처리
- contenteditable 데모는 mockup의 시연 효과였을 뿐, 프로덕션에선 CMS 편집

후속 사이클에서 특정 섹션(예: hero 헤딩)에 미세 조정이 필요하면
`next/dynamic({ ssr: false })`로 보호된 import 도입 가능.

## 7. Conditional Rendering Matrix

| 섹션        | 항상 | 조건                                | 데이터 없을 때 |
| ----------- | ---- | ----------------------------------- | -------------- |
| Hero        | ✓    | `featuredImageUrl` 유무로 mode 분기 | watermark 폴백 |
| ShareBar    | ✓    | —                                   | 운영 기능 보존 |
| MetaBand    | ✓    | 셀별 데이터 유무                    | 빈 값은 "—"    |
| Description | —    | `description` 비어있지 않을 때      | 섹션 hidden    |
| ArtworkGrid | —    | `artworks.length > 0`               | 섹션 hidden    |
| VisitInfo   | —    | `location` 있을 때만                | 섹션 hidden    |
| CTAStrip    | —    | (본 사이클 호출 없음)               | —              |

### 7.1 Hero 워터마크 캐릭터 선택

```ts
function pickWatermarkChar(title: string): string {
  // 1) 한자 추출 (CJK Unified Ideograph U+4E00~U+9FFF)
  const hanjaMatch = title.match(/[一-鿿]+/g)
  if (hanjaMatch?.length) return hanjaMatch.join('').slice(0, 2)
  // 2) 한글 첫 글자 (U+AC00~U+D7AF)
  const hangulMatch = title.match(/[가-힯]/)
  if (hangulMatch) return hangulMatch[0]
  // 3) 폴백
  return '書'
}
```

## 8. Loading & Error States

### 8.1 ExhibitionLoading

- rice-paper 배경
- celadon ring spinner + "전시를 불러오는 중..." 한 줄
- spinner: SVG 회전 (4초), `prefers-reduced-motion` 시 정적
- ARIA `role="status"`, `aria-live="polite"`

### 8.2 ExhibitionError

- rice-paper 배경 + scholar-red "空" watermark (큰 글씨)
- 헤딩(font-serif): "전시를 찾을 수 없습니다" (kind에 따라 변경)
- 메시지(muted-foreground): error.message
- 액션: "← 목록으로 돌아가기" outlined celadon button

종류별 헤딩:

- `not-found`: "이 전시를 찾을 수 없습니다"
- `network`: "전시를 불러오는 중 문제가 발생했습니다"
- `unauthorized`: "이 작업을 수행할 권한이 없습니다"

### 8.3 Empty / Edge Cases

- 작품 0건 + 작가 0건: 두 섹션 hidden, description+meta+visit만 (전시 등록 직후
  정상 상태)
- description 비어있음: 섹션 hidden, meta 다음 바로 작품
- location 없음: meta 셀 "—", VisitInfo 섹션 hidden
- 모든 부수 데이터 없음: hero+share+meta(부분)+footer로 최소 페이지

### 8.4 오너 모드

```tsx
<ExhibitionHero
  ownerActions={
    isOwner ? (
      <div className='owner-cluster'>
        <Link href={`/exhibitions/${id}/edit`}>
          <Button variant='outline' size='sm'>
            <Edit /> 수정
          </Button>
        </Link>
        <Button variant='outline' size='sm' onClick={onDelete}>
          <Trash2 /> 삭제
        </Button>
      </div>
    ) : null
  }
/>
```

- 위치: hero 우상단 (현재 breadcrumb 영역에서 옮김)
- 삭제: 기존 `confirm()` 그대로 (D4 Minimal — 커스텀 dialog 추가 안 함)
- 비오너: cluster 자체 렌더 안 함 (DOM 흔적 없음)

## 9. Testing Strategy

### 9.1 단위 테스트

- `pickWatermarkChar(title)` — 4 케이스 (한자 우선 / 한글 폴백 / 영문 폴백 / 빈
  문자열)
- `formatExhibitionDate` / `getRemainingDays` — 기존 (변경 없음)

### 9.2 컴포넌트 테스트 (Jest + RTL)

| 컴포넌트              | 케이스                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------- |
| ExhibitionHero        | poster / watermark / ownerActions 받음·받지 않음                                        |
| ExhibitionMetaBand    | 풀 데이터 / location 없음 → "—" / ticketPrice=0 → "무료 입장"                           |
| ExhibitionDescription | 빈 description → null / 첫 문단 dropcap 렌더                                            |
| ExhibitionArtworkGrid | 0건 → null / isFeatured → 별 / imageUrl 없음 → calligraphy placeholder / style별 캔버스 |
| ExhibitionShareBar    | FB / TW / IG / Copy 클릭 핸들러 (mock window.open + clipboard)                          |
| ExhibitionVisitInfo   | location 없음 → null / 있음 → 렌더                                                      |
| ExhibitionLoading     | role="status"                                                                           |
| ExhibitionError       | kind별 헤딩 변경                                                                        |

### 9.3 통합 테스트

`app/exhibitions/[id]/page.test.tsx`:

- 정적 ID '3' fetch 호출 안 함
- 동적 ID mocked fetch
- loading / error / 오너 / 비오너 시각 분기

### 9.4 쿼리 테스트

`getExhibitionWithArtworkDetails`:

- 시드 데이터에 대해 `artworks[].artwork.title` non-empty
- displayOrder ASC 정렬
- 잘못된 ID → null + Error

### 9.5 시각 회귀 (manual)

자동 visual regression은 D4 외. 대신:

1. dev `/exhibitions/3` ↔ mockup `finalized.html` 나란히 비교
2. 3개 뷰포트 (375 / 768 / 1440) 시각 검수
3. gstack browse로 base 캡처 (`/tmp/asca-port-{desktop,tablet,mobile}.png`)

### 9.6 접근성

자동:

- 본 사이클은 manual 검수만 수행. axe-core 도입(`@axe-core/react` devDep 추가 +
  테스트 wrapper)은 별도 PR — D4 Minimal scope 외

수동 체크리스트:

- [ ] 헤딩 hierarchy: h1(전시 제목) / h2(섹션) / h3(작품 카드)
- [ ] 키보드 네비게이션: 모든 link/button 탭 도달, focus ring 보임
- [ ] Hero `<Image alt={title}>`
- [ ] watermark / vermillion / 카드 calligraphy 모두 `aria-hidden="true"`
- [ ] DESIGN.md WCAG 검증쌍(P1~P9, L1~L2) 그대로 사용 — 새 조합 없음

### 9.7 빌드 / 타입 / 린트 게이트

```bash
npm run type-check    # 새 타입 ExhibitionWithArtworkDetails / CalligraphyStyle
npm run lint
npm run build
npm run test
npm run pre-commit
```

### 9.8 회귀 가드

- `/exhibitions/[id]` 동작 (통합 테스트)
- 정적 fallback ID '3' 동작 (통합 테스트 + manual)
- `/exhibitions` 리스트, `/exhibitions/{current,upcoming,past,online}` — 변경
  없음 격리 확인
- `/exhibitions/[id]/edit`, `/exhibitions/create` — 영향 없음
- 다국어 4개 언어 — 깨지지 않음 (Korean default 그대로)
- 다크 모드 — `.dark` 클래스 자동 반전

## 10. Definition of Done

- [ ] 모든 단위/컴포넌트/통합 테스트 PASS
- [ ] `npm run pre-commit` PASS
- [ ] 3개 뷰포트 수동 시각 검수, mockup 대비 회귀 없음
- [ ] 키보드 + 스크린리더 1회 테스트 (VoiceOver/NVDA)
- [ ] 정적 ID '3' 라이브 + 1개 이상 동적 ID 라이브 검증
- [ ] 오너 / 비오너 모드 모두 검증
- [ ] 라이트 / 다크 모드 모두 검증
- [ ] PR 본문에 before/after 스크린샷
- [ ] `.commit_message.txt` 한 줄 요약 (한국어)

## 11. Open Questions for Implementation Plan

writing-plans 단계에서 확정할 항목:

1. `lib/db/schema.ts`의 `artworks` 테이블에 `titleHanja`, `style`, `dimensions`,
   `materials`, `year` 필드가 모두 존재하는가? 누락 시 schema 추가는 사전
   작업으로 분리(별도 PR 또는 본 PR 1단계).
2. `artists` 테이블 join으로 `artistName`을 가져올 때 다국어 필드 우선순위 —
   `name` (Korean default) 사용. `nameKo` / `nameEn` 분기는 i18n 사이클로 유보.
3. `useExhibitionDetail` hook에 swr/react-query 도입 여부 — 현재 inline
   useState/useEffect 패턴이 단순하고 의존성 추가는 D4 Minimal 위반이라
   **유지**. 명시적 결정.

## 12. References

- Mockup:
  `~/.gstack/projects/jlinsights-ASCA/designs/exhibition-detail-20260426/finalized.html`
- Design System: `docs/02-design/DESIGN.md` (v1.2.0-alpha)
- Current page: `app/exhibitions/[id]/page.tsx`
- Current body: `app/exhibitions/[id]/_components/exhibition-detail-body.tsx`
- Type: `lib/types/exhibition-legacy.ts` — `ExhibitionWithDetails`,
  `EXHIBITION_STATUS_LABELS`
- Query: `lib/db/queries.ts`, `lib/api/exhibitions.ts`
- ASCA conventions: `docs/CLAUDE.md` (500줄 분리, \_components/, custom hooks)
