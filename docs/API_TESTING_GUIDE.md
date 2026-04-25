# API Testing Guide - Members API

회원 관리 API 엔드포인트의 수동 테스트 가이드입니다.

---

## 🚀 시작하기

### 1. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 2. 개발 인증 설정

개발 환경에서는 `devAuth`를 통해 자동으로 인증이 처리됩니다.

```typescript
// lib/auth/dev-auth.ts
// 개발 환경에서 자동으로 userId가 설정됨
```

---

## 📡 API 엔드포인트

### GET /api/members

회원 목록을 조회합니다.

#### 기본 요청

```bash
curl http://localhost:3000/api/members
```

#### 검색 파라미터

| 파라미터    | 타입   | 설명                   | 예시                     |
| ----------- | ------ | ---------------------- | ------------------------ |
| `query`     | string | 검색어 (이름, 이메일)  | `?query=홍길동`          |
| `page`      | number | 페이지 번호 (기본: 1)  | `?page=2`                |
| `limit`     | number | 페이지 크기 (기본: 20) | `?limit=10`              |
| `status`    | string | 회원 상태              | `?status=active`         |
| `level`     | string | 멤버십 레벨            | `?level=honorary_master` |
| `sortBy`    | string | 정렬 필드              | `?sortBy=created_at`     |
| `sortOrder` | string | 정렬 순서 (asc/desc)   | `?sortOrder=desc`        |

#### 요청 예시

**페이지네이션**:

```bash
curl "http://localhost:3000/api/members?page=1&limit=10"
```

**검색 (이름, 이메일)**:

```bash
curl "http://localhost:3000/api/members?query=홍길동"
```

**상태 필터링**:

```bash
curl "http://localhost:3000/api/members?status=active"
```

**레벨 필터링**:

```bash
curl "http://localhost:3000/api/members?level=honorary_master"
```

**정렬**:

```bash
curl "http://localhost:3000/api/members?sortBy=created_at&sortOrder=desc"
```

**조합**:

```bash
curl "http://localhost:3000/api/members?query=test&status=active&page=1&limit=20&sortBy=created_at&sortOrder=desc"
```

#### 응답 예시

**성공 (200 OK)**:

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "member@example.com",
        "first_name_ko": "홍",
        "last_name_ko": "길동",
        "first_name_en": "Gil-dong",
        "last_name_en": "Hong",
        "membership_status": "active",
        "membership_level_id": "honorary_master",
        "timezone": "Asia/Seoul",
        "preferred_language": "ko",
        "is_verified": true,
        "is_public": true,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-10T00:00:00.000Z",
        "joined_date": "2026-01-01T00:00:00.000Z",
        "last_active": "2026-01-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**실패 - 인증 실패 (401 Unauthorized)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**실패 - 서버 오류 (500 Internal Server Error)**:

```json
{
  "success": false,
  "error": "서버 오류"
}
```

---

### POST /api/members

새로운 회원을 생성합니다.

#### 요청 본문

```typescript
interface CreateMemberRequest {
  email: string // 필수
  first_name_ko?: string
  last_name_ko?: string
  first_name_en?: string
  last_name_en?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  nationality?: string
  residence_country?: string
  residence_city?: string
  timezone?: string // 기본: "Asia/Seoul"
  preferred_language?: string // 기본: "ko"
  membership_level_id?: string
  membership_status?: string // 기본: "active"
}
```

#### 요청 예시

**기본 회원 생성**:

```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "first_name_ko": "새",
    "last_name_ko": "회원",
    "first_name_en": "New",
    "last_name_en": "Member"
  }'
```

**전체 정보 포함**:

```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "first_name_ko": "새",
    "last_name_ko": "회원",
    "first_name_en": "New",
    "last_name_en": "Member",
    "phone": "010-1234-5678",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "nationality": "KR",
    "residence_country": "KR",
    "residence_city": "서울",
    "timezone": "Asia/Seoul",
    "preferred_language": "ko",
    "membership_level_id": "beginner",
    "membership_status": "active"
  }'
```

#### 응답 예시

**성공 (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newmember@example.com",
    "first_name_ko": "새",
    "last_name_ko": "회원",
    "first_name_en": "New",
    "last_name_en": "Member",
    "membership_status": "active",
    "membership_level_id": "beginner",
    "timezone": "Asia/Seoul",
    "preferred_language": "ko",
    "is_verified": false,
    "is_public": false,
    "created_at": "2026-01-10T12:00:00.000Z",
    "updated_at": "2026-01-10T12:00:00.000Z",
    "joined_date": "2026-01-10T12:00:00.000Z",
    "last_active": "2026-01-10T12:00:00.000Z"
  }
}
```

**실패 - 필수 필드 누락 (400 Bad Request)**:

```json
{
  "success": false,
  "error": "이메일은 필수입니다"
}
```

**실패 - 인증 실패 (401 Unauthorized)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**실패 - 서버 오류 (500 Internal Server Error)**:

```json
{
  "success": false,
  "error": "회원 생성 실패"
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 회원 목록 조회

1. **모든 회원 조회**

   ```bash
   curl http://localhost:3000/api/members
   ```

   - 예상: 성공 응답, 회원 목록 반환

2. **페이지네이션 테스트**

   ```bash
   curl "http://localhost:3000/api/members?page=1&limit=5"
   ```

   - 예상: 5개 회원, pagination 정보 포함

3. **검색 테스트**

   ```bash
   curl "http://localhost:3000/api/members?query=test"
   ```

   - 예상: "test"가 포함된 회원만 반환

4. **필터링 테스트**

   ```bash
   curl "http://localhost:3000/api/members?status=active"
   ```

   - 예상: active 상태 회원만 반환

### 시나리오 2: 회원 생성

1. **정상 회원 생성**

   ```bash
   curl -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test1@example.com",
       "first_name_ko": "테스트",
       "last_name_ko": "회원1"
     }'
   ```

   - 예상: 201 Created, 새 회원 정보 반환

2. **필수 필드 누락**

   ```bash
   curl -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{
       "first_name_ko": "테스트"
     }'
   ```

   - 예상: 400 Bad Request, "이메일은 필수입니다" 에러

3. **중복 이메일**

   ```bash
   # 동일한 이메일로 두 번 생성 시도
   curl -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{"email": "duplicate@example.com", "first_name_ko": "중복"}'

   curl -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{"email": "duplicate@example.com", "first_name_ko": "중복"}'
   ```

   - 예상: 두 번째 요청에서 중복 에러

---

## 🔍 개발 환경 더미 데이터

개발 환경에서 데이터베이스가 비어있을 경우, 자동으로 더미 데이터를 제공합니다:

### 더미 회원 1 (관리자)

```json
{
  "id": "dev-1",
  "email": "admin@dev.com",
  "first_name_ko": "관리자",
  "last_name_ko": "개발",
  "membership_status": "active",
  "membership_level_id": "honorary_master",
  "timezone": "Asia/Seoul",
  "preferred_language": "ko",
  "is_verified": true,
  "is_public": true
}
```

### 더미 회원 2 (일반 회원)

```json
{
  "id": "dev-2",
  "email": "member@dev.com",
  "first_name_ko": "회원",
  "last_name_ko": "테스트",
  "membership_status": "active",
  "membership_level_id": "advanced_practitioner",
  "timezone": "Asia/Seoul",
  "preferred_language": "ko",
  "is_verified": true,
  "is_public": true
}
```

---

## 🛠️ Postman/Thunder Client 사용

### Postman Collection 예시

```json
{
  "info": {
    "name": "ASCA Members API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Members",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/members?page=1&limit=20",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "members"],
          "query": [
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "20" }
          ]
        }
      }
    },
    {
      "name": "Create Member",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"newmember@example.com\",\n  \"first_name_ko\": \"새\",\n  \"last_name_ko\": \"회원\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/members",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "members"]
        }
      }
    }
  ]
}
```

---

## 📝 검증 체크리스트

### GET /api/members

- [ ] 빈 데이터베이스에서 더미 데이터 반환
- [ ] 페이지네이션 정상 동작
- [ ] 검색 기능 정상 동작
- [ ] 상태 필터링 정상 동작
- [ ] 레벨 필터링 정상 동작
- [ ] 정렬 기능 정상 동작
- [ ] 인증 실패 시 401 반환

### POST /api/members

- [ ] 필수 필드만으로 회원 생성 가능
- [ ] 전체 필드로 회원 생성 가능
- [ ] 필수 필드 누락 시 400 반환
- [ ] 중복 이메일 시 에러 처리
- [ ] 기본값 자동 설정 (timezone, preferred_language)
- [ ] 인증 실패 시 401 반환

---

## 🔗 관련 문서

- [PHASE4.5_SUMMARY.md](../PHASE4.5_SUMMARY.md) - Phase 4.5 전체 요약
- [lib/services/member-service.ts](../lib/services/member-service.ts) - Service
  Layer 구현
- [app/api/members/route.ts](../app/api/members/route.ts) - API Route Handler

---

작성일: 2026-01-10
