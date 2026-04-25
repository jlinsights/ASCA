# 동양서예협회 데이터베이스 설정 가이드

이 문서는 Drizzle ORM과 PostgreSQL(Supabase)을 사용한 동양서예협회 웹사이트의
데이터베이스 설정 방법을 설명합니다.

## 📋 목차

1. [설치 및 설정](#설치-및-설정)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [사용 방법](#사용-방법)
4. [스크립트 명령어](#스크립트-명령어)
5. [개발 가이드](#개발-가이드)
6. [문제 해결](#문제-해결)

## 🚀 설치 및 설정

### 1. 패키지 설치

```bash
npm install drizzle-orm drizzle-kit postgres --legacy-peer-deps
npm install tsx --save-dev --legacy-peer-deps
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 데이터베이스 초기화

```bash
# 마이그레이션 생성
npm run db:generate

# 데이터베이스에 스키마 적용
npm run db:push

# 시드 데이터 생성
npm run db:seed
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### 1. Users (사용자)

- 기본 사용자 정보 및 역할 관리
- 역할: admin, artist, member, visitor

#### 2. Artists (작가)

- 작가 상세 정보 (다국어 지원)
- 전문 분야, 수상 경력, 전시 이력

#### 3. Artworks (작품)

- 작품 정보 (다국어 지원)
- 카테고리, 스타일, 재료, 크기 등

#### 4. Exhibitions (전시회)

- 전시회 정보 (다국어 지원)
- 일정, 장소, 입장료 등

#### 5. News (뉴스)

- 뉴스 및 공지사항 (다국어 지원)
- 카테고리, 상태, 조회수 등

#### 6. Events (이벤트)

- 워크숍, 강연회 등 이벤트 정보
- 참가자 관리, 등록 마감일 등

#### 7. Galleries (갤러리)

- 온라인 갤러리 공간 관리
- 상설/임시 전시 구분

### 관계 테이블

- `exhibition_artworks`: 전시회-작품 관계
- `exhibition_artists`: 전시회-작가 관계
- `gallery_artworks`: 갤러리-작품 관계
- `event_participants`: 이벤트 참가자
- `admin_permissions`: 관리자 권한

## 💻 사용 방법

### 기본 쿼리 예시

```typescript
import { db } from '@/lib/db'
import {
  createUser,
  getUserByEmail,
  getAllArtists,
  getFeaturedArtworks,
} from '@/lib/db/queries'

// 사용자 생성
const newUser = await createUser({
  id: 'user-001',
  email: 'user@example.com',
  name: '홍길동',
  role: 'member',
})

// 이메일로 사용자 조회
const user = await getUserByEmail('user@example.com')

// 모든 작가 조회
const artists = await getAllArtists({ limit: 10 })

// 추천 작품 조회
const featuredArtworks = await getFeaturedArtworks(5)
```

### 직접 쿼리 사용

```typescript
import { db } from '@/lib/db'
import { users, artworks } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// 직접 쿼리 작성
const recentArtworks = await db
  .select()
  .from(artworks)
  .orderBy(desc(artworks.createdAt))
  .limit(10)

// 조건부 쿼리
const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'))
```

## 📜 스크립트 명령어

### 데이터베이스 관리

```bash
# 마이그레이션 생성
npm run db:generate

# 스키마를 데이터베이스에 적용
npm run db:push

# 마이그레이션 실행
npm run db:migrate

# 데이터베이스 스튜디오 실행 (GUI)
npm run db:studio

# 스키마 검증
npm run db:check

# 데이터베이스 초기화
npm run db:drop
```

### 데이터 관리

```bash
# 시드 데이터 생성
npm run db:seed

# 데이터베이스 완전 리셋 (초기화 + 스키마 적용 + 시드 데이터)
npm run db:reset

# 데이터베이스 테스트
npx tsx lib/db/test.ts
```

## 🛠️ 개발 가이드

### 새로운 테이블 추가

1. `lib/db/schema.ts`에 테이블 정의 추가
2. 필요한 경우 관계 설정
3. `lib/db/queries.ts`에 쿼리 함수 추가
4. 마이그레이션 생성 및 적용

```typescript
// schema.ts 예시
export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})
```

### 쿼리 함수 작성 가이드

```typescript
// queries.ts 예시
export async function createNewItem(data: NewItem): Promise<Item> {
  const [item] = await db.insert(newTable).values(data).returning()
  return item
}

export async function getNewItemById(id: string): Promise<Item | undefined> {
  const [item] = await db.select().from(newTable).where(eq(newTable.id, id))
  return item
}
```

### 타입 안전성

Drizzle ORM은 완전한 타입 안전성을 제공합니다:

```typescript
// 자동 생성된 타입 사용
import { type User, type NewUser } from '@/lib/db/schema'

// 컴파일 타임에 타입 검증
const user: User = await getUserById('user-001')
const newUser: NewUser = {
  id: 'user-002',
  email: 'test@example.com',
  name: '테스트',
  role: 'member', // 'admin' | 'artist' | 'member' | 'visitor'만 허용
}
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 데이터베이스 파일이 생성되지 않는 경우

```bash
# 권한 확인
ls -la sqlite.db

# 수동으로 데이터베이스 생성
touch sqlite.db
npm run db:push
```

#### 2. 마이그레이션 오류

```bash
# 기존 마이그레이션 파일 확인
ls -la drizzle/

# 마이그레이션 재생성
rm -rf drizzle/
npm run db:generate
npm run db:push
```

#### 3. 시드 데이터 중복 오류

```bash
# 데이터베이스 완전 리셋
npm run db:reset
```

#### 4. 타입 오류

```bash
# TypeScript 컴파일 확인
npm run type-check

# 스키마 재생성
npm run db:generate
```

### 디버깅 팁

1. **Drizzle Studio 사용**: `npm run db:studio`로 GUI에서 데이터 확인
2. **로그 확인**: 쿼리 실행 시 콘솔 로그 확인
3. **타입 검증**: TypeScript 컴파일러 활용
4. **테스트 실행**: `npx tsx lib/db/test.ts`로 연결 테스트

## 📚 추가 자료

- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)
- [SQLite 문서](https://www.sqlite.org/docs.html)
- [Better SQLite3 문서](https://github.com/WiseLibs/better-sqlite3)

## 🤝 기여하기

데이터베이스 스키마나 쿼리 개선 사항이 있다면:

1. 새로운 브랜치 생성
2. 변경 사항 구현
3. 테스트 실행 확인
4. Pull Request 생성

---

**주의사항**: 프로덕션 환경에서는 반드시 데이터베이스 백업을 수행한 후
마이그레이션을 실행하세요.
