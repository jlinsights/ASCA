# Design: Security Hardening

> Plan 문서 기반 구체적 구현 설계 — 파일별 변경사항 및 코드 패턴 정의

## 1. 구현 순서 및 파일 매핑

```
Step 1: API 인증 일괄 적용 (C5, C6, W5)
Step 2: XSS 방어 (C3, C4)
Step 3: SQL Injection 차단 (C1)
Step 4: 환경변수 검증 + 지연 초기화 (C2, W9)
Step 5: 에러 메시지 보안 처리 (C7)
Step 6: 관리자 권한 확인 (W10)
```

---

## 2. Step 1: API 인증 일괄 적용

### 2.1 기존 인프라 활용

이미 구현된 `createSecureAPI` 래퍼(`lib/security/secure-api.ts`)를 활용.
이 래퍼는 Rate Limiting + CSRF + 인증 + 감사 로그를 일괄 처리함.

```typescript
// 기존 패턴 (lib/security/secure-api.ts)
import { createSecureAPI } from '@/lib/security/secure-api'

export const POST = createSecureAPI(
  { requireAuth: true, rateLimitPreset: 'strict' },
  async ({ user, request }) => { ... }
)
```

### 2.2 변경 대상 파일 (6건)

**인증 방식 2가지**:
- **정적 라우트** (params 불필요): `createSecureAPI` 래퍼 사용
- **동적 라우트** (`[id]` params 필요): `requireAdminAuth` 함수 직접 호출

| # | 파일 | HTTP 메서드 | 변경 내용 |
|---|------|-----------|----------|
| 1 | `app/api/artists/route.ts` | POST | `createSecureAPI` 래퍼로 감싸기 |
| 2 | `app/api/artists/[id]/route.ts` | PUT, DELETE | `requireAdminAuth` 직접 호출 |
| 3 | `app/api/cultural-exchange/applications/route.ts` | GET, POST | GET: memberId 없으면 관리자 인증, POST: `requireAdminAuth` |
| 4 | `app/api/cultural-exchange/programs/route.ts` | POST | `requireAdminAuth` 직접 호출 |
| 5 | `app/api/cultural-exchange/programs/[id]/route.ts` | PUT, DELETE | `requireAdminAuth` 직접 호출 |
| 6 | `app/api/migration/migrate-all/route.ts` | POST | 영구 비활성화 (503) — CLI 마이그레이션 사용 |

### 2.3 구현 패턴

**Before** (`app/api/artists/route.ts` POST):
```typescript
export async function POST(request: NextRequest) {
  try {
    // TODO: Admin Auth Check
    const body = await request.json()
    const { EnhancedAdminAPI } = await import('@/lib/api/enhanced-admin-api')
    const newArtist = await EnhancedAdminAPI.createArtist(body)
    return NextResponse.json(newArtist, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '...', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
```

**After**:
```typescript
import { createSecureAPI } from '@/lib/security/secure-api'
import { ApiResponse } from '@/lib/api/response'

export const POST = createSecureAPI(
  { requireAuth: true, rateLimitPreset: 'strict', logActions: true },
  async ({ user, request }) => {
    const body = await request.json()
    const { EnhancedAdminAPI } = await import('@/lib/api/enhanced-admin-api')
    const newArtist = await EnhancedAdminAPI.createArtist(body)

    if (!newArtist) {
      return ApiResponse.error('작가 생성에 실패했습니다.', 'CREATE_FAILED', 500)
    }

    return ApiResponse.success(newArtist, undefined, 201)
  }
)
```

### 2.4 cultural-exchange GET 인증 해제 패턴

GET은 인증 필수가 아닐 수 있음. `memberId` 파라미터 없이 전체 조회는 관리자만 허용:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')

  // memberId 없이 전체 조회 → 관리자 인증 필요
  if (!memberId) {
    const { requireAdminAuth } = await import('@/lib/auth/middleware')
    const user = await requireAdminAuth(request)
    if (!user) {
      return ApiResponse.error('관리자 인증이 필요합니다', 'UNAUTHORIZED', 401)
    }
  }
  // memberId 있으면 → 본인 확인 필요 (추후 구현)
  // ...
}
```

---

## 3. Step 2: XSS 방어

### 3.1 의존성 설치

```bash
npm install isomorphic-dompurify
npm install -D @types/dompurify
```

### 3.2 Sanitize 유틸리티 생성

**새 파일**: `lib/security/sanitize.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
  'blockquote', 'pre', 'code', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
  'width', 'height', 'loading'
]

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  })
}

export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

### 3.3 변경 대상 파일

| # | 파일 | 현재 | 변경 |
|---|------|------|------|
| 1 | `app/blog/page.tsx:236` | `dangerouslySetInnerHTML={{ __html: content.replace(...) }}` | `dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}` |
| 2 | `components/ui/typewriter-effect.tsx:79` | `dangerouslySetInnerHTML={{ __html: displayedText }}` | 순수 텍스트로 전환. `<br/>`만 `\n` 변환 후 `white-space: pre-wrap` 스타일 적용 |
| 3 | `app/gallery/page.tsx:336` | `dangerouslySetInnerHTML` | 확인 후 `sanitizeHTML` 적용 |

### 3.4 typewriter-effect 구체적 변경

`<br/>` 태그만 지원하므로 HTML 렌더링이 불필요:

```typescript
// Before
<div className={className} dangerouslySetInnerHTML={{ __html: displayedText }} />

// After
<div className={className} style={{ whiteSpace: 'pre-wrap' }}>
  {displayedText.replace(/<br\s*\/?>/gi, '\n')}
</div>
```

### 3.5 안전한 dangerouslySetInnerHTML (유지 대상)

아래는 개발자 제어 데이터이므로 변경 불필요:
- `components/json-ld.tsx` — JSON-LD 구조화 데이터 (개발자 하드코딩)
- `components/ui/chart.tsx` — CSS 변수 스타일 태그 (내부 생성)

---

## 4. Step 3: SQL Injection 차단

### 4.1 변경 파일: `lib/sync-engine.ts:255-274`

### 4.2 화이트리스트 기반 검증

```typescript
// 허용된 테이블명
const ALLOWED_TABLES = ['artists', 'artworks', 'exhibitions', 'events', 'news'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

// 허용된 컬럼명 패턴 (영문소문자, 언더스코어만)
const SAFE_COLUMN_PATTERN = /^[a-z][a-z0-9_]{0,62}$/

function validateTableName(name: string): name is AllowedTable {
  return ALLOWED_TABLES.includes(name.toLowerCase() as AllowedTable)
}

function validateColumnName(name: string): boolean {
  return SAFE_COLUMN_PATTERN.test(name)
}

// 허용된 데이터 타입
const ALLOWED_DATA_TYPES = [
  'TEXT', 'VARCHAR(255)', 'INTEGER', 'BIGINT', 'BOOLEAN',
  'TIMESTAMP', 'TIMESTAMPTZ', 'DATE', 'JSONB', 'UUID',
  'NUMERIC', 'REAL', 'DOUBLE PRECISION'
] as const

function validateDataType(type: string): boolean {
  return ALLOWED_DATA_TYPES.includes(type.toUpperCase() as any)
}
```

### 4.3 executeSchemaChange 수정

```typescript
private async executeSchemaChange(tableName: string, change: SchemaChange) {
  // 화이트리스트 검증
  if (!validateTableName(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`)
  }
  if (!validateColumnName(change.columnName)) {
    throw new Error(`Invalid column name: ${change.columnName}`)
  }
  if (change.dataType && !validateDataType(change.dataType)) {
    throw new Error(`Invalid data type: ${change.dataType}`)
  }

  // 검증 통과 후 SQL 생성 (기존 로직 유지)
  let sql = ''
  switch (change.type) {
    case 'add_column':
      sql = `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${change.columnName}" ${change.dataType}`
      break
    // ...
  }
  // ...
}
```

---

## 5. Step 4: 환경변수 검증 + 지연 초기화

### 5.1 변경 파일: `lib/sync-engine.ts:14-29, 494`

### 5.2 생성자 → 지연 초기화 패턴

```typescript
export class SyncEngine {
  private _supabase: any = null
  private _airtableBase: any = null

  private get supabase() {
    if (!this._supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !key) {
        throw new Error('SyncEngine: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
      }
      this._supabase = createClient(url, key)
    }
    return this._supabase
  }

  private get airtableBase() {
    if (!this._airtableBase) {
      const apiKey = process.env.AIRTABLE_API_KEY
      const baseId = process.env.AIRTABLE_BASE_ID
      if (!apiKey || !baseId) {
        throw new Error('SyncEngine: AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required')
      }
      this._airtableBase = new Airtable({ apiKey }).base(baseId)
    }
    return this._airtableBase
  }

  constructor() {
    // 지연 초기화: 실제 사용 시점에 클라이언트 생성
  }
}
```

### 5.3 싱글톤 → 지연 팩토리

```typescript
// Before
export const syncEngine = new SyncEngine()

// After
let _instance: SyncEngine | null = null
export function getSyncEngine(): SyncEngine {
  if (!_instance) {
    _instance = new SyncEngine()
  }
  return _instance
}
```

### 5.4 호출부 변경

> **참고**: `app/api/sync/` 라우트들은 `SyncEngine` 클래스를 직접 사용하지 않고
> 독자적인 devAuth + Supabase 클라이언트 기반 동기화를 구현하고 있음.
> `getSyncEngine()` 팩토리는 향후 sync 라우트 리팩토링 시 적용 예정.
>
> 현재는 `lib/sync-engine.ts` 내부에서만 `getSyncEngine()` export가 유효함.

변경 불필요 파일 (기존 Design에서 제외):
- ~~`app/api/sync/start/route.ts`~~
- ~~`app/api/sync/stop/route.ts`~~
- `app/api/sync/status/route.ts`

---

## 6. Step 5: 에러 메시지 보안 처리

### 6.1 원칙

- **개발 환경**: `error.message` + stack trace 포함
- **프로덕션**: 일반 메시지만 반환, 세부사항은 서버 로그

### 6.2 안전한 에러 응답 유틸리티

기존 `ApiResponse.error()`를 활용하되, `details` 필드를 환경별 분기:

```typescript
// lib/api/response.ts에 추가
static safeError(
  message: string,
  code: string,
  statusCode: number = 500,
  error?: unknown
): NextResponse {
  const isDev = process.env.NODE_ENV === 'development'

  // 서버 로그에는 항상 기록
  if (error) {
    console.error(`[API Error] ${code}:`, error)
  }

  return ApiResponse.error(
    message,
    code,
    statusCode,
    isDev && error instanceof Error ? error.message : undefined
  )
}
```

### 6.3 변경 대상

`createSecureAPI` 래퍼 적용 시 자동으로 에러 핸들링이 포함되므로, Step 1에서 래퍼를 적용하지 않는 GET 엔드포인트에서만 수동 적용:

| 파일 | 변경 |
|------|------|
| `app/api/artists/route.ts` GET catch | `ApiResponse.safeError(...)` 사용 |
| 기타 GET 엔드포인트 catch 블록 | 동일 패턴 적용 |

---

## 7. Step 6: 관리자 권한 확인 (W10)

### 7.1 변경 파일: `app/api/members/[id]/route.ts:95-102`

### 7.2 구현

```typescript
// Before
if (existingMember.user_id !== user.id) {
  // 관리자 권한 확인 로직 추가 필요
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
}

// After
if (existingMember.user_id !== user.id) {
  const { getAuthContext } = await import('@/lib/middleware/admin-middleware')
  const authCtx = await getAuthContext(request)
  if (!authCtx?.isAdmin) {
    return ApiResponse.error('권한이 없습니다', 'FORBIDDEN', 403)
  }
}
```

---

## 8. 변경 파일 전체 목록

| # | 파일 | Step | 변경 유형 |
|---|------|------|----------|
| 1 | `lib/security/sanitize.ts` | 2 | **신규 생성** |
| 2 | `lib/api/response.ts` | 5 | `safeError` 메서드 추가 |
| 3 | `lib/sync-engine.ts` | 3, 4 | SQL 검증 + 지연 초기화 |
| 4 | `app/api/artists/route.ts` | 1, 5 | `createSecureAPI` + 안전 에러 |
| 5 | `app/api/artists/[id]/route.ts` | 1 | `createSecureAPI` 적용 |
| 6 | `app/api/cultural-exchange/applications/route.ts` | 1 | 인증 활성화 |
| 7 | `app/api/cultural-exchange/programs/route.ts` | 1 | `createSecureAPI` 적용 |
| 8 | `app/api/cultural-exchange/programs/[id]/route.ts` | 1 | `createSecureAPI` 적용 |
| 9 | `app/api/migration/migrate-all/route.ts` | 1 | `createSecureAPI` 적용 |
| 10 | `app/blog/page.tsx` | 2 | `sanitizeHTML` 적용 |
| 11 | `components/ui/typewriter-effect.tsx` | 2 | `dangerouslySetInnerHTML` 제거 |
| 12 | `app/gallery/page.tsx` | 2 | `sanitizeHTML` 적용 확인 |
| 13 | `app/api/members/[id]/route.ts` | 6 | 관리자 권한 확인 구현 |
| 14 | `app/api/sync/start/route.ts` | 4 | `getSyncEngine()` 호출 변경 |
| 15 | `app/api/sync/stop/route.ts` | 4 | `getSyncEngine()` 호출 변경 |
| 16 | `app/api/sync/status/route.ts` | 4 | `getSyncEngine()` 호출 변경 |

---

## 9. 검증 체크리스트

- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 에러 0건
- [ ] `npm run build` 성공
- [ ] 모든 쓰기 API에 인증 미들웨어 확인 (`grep "TODO.*Auth" app/api/` → 0건)
- [ ] `dangerouslySetInnerHTML` 사용처 전수: 안전(json-ld, chart) 또는 sanitize 적용 확인
- [ ] `syncEngine` 직접 export 제거 → `getSyncEngine()` 사용 확인
- [ ] 프로덕션 에러 응답에 `error.message` 미포함 확인

---

**작성일**: 2026-03-28
**PDCA Phase**: Design
**참조**: `docs/01-plan/features/security-hardening.plan.md`
**다음 단계**: `/pdca do security-hardening`
