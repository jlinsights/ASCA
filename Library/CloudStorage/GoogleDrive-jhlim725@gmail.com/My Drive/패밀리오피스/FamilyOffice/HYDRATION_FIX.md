# Hydration 불일치 문제 해결

## 문제 상황

Next.js에서 서버사이드 렌더링과 클라이언트 하이드레이션 간의 불일치로 인한 에러가 발생했습니다.

## 원인 분석

1. **외부 스크립트의 동적 로딩**: HubSpot, ChannelIO, Calendly 등의 외부 스크립트들이 서버와 클라이언트에서 다르게 렌더링됨
2. **JSON-LD 구조화 데이터**: 서버에서 생성된 스크립트 태그와 클라이언트에서 생성된 태그의 속성 불일치
3. **스크립트 실행 타이밍**: DOM 준비 전에 실행되는 스크립트들로 인한 hydration 문제

## 해결 방안

### 1. Next.js Script 컴포넌트 사용

기존의 `<script>` 태그를 Next.js의 `Script` 컴포넌트로 변경:

- `strategy="afterInteractive"`: DOM 준비 후 실행
- `strategy="beforeInteractive"`: 크리티컬한 스크립트용

### 2. 클라이언트 전용 컴포넌트 분리

외부 스크립트들을 별도의 클라이언트 컴포넌트로 분리:

- `components/analytics.tsx`: Google Analytics & GTM
- `components/external-scripts.tsx`: HubSpot, ChannelIO, Calendly
- `components/structured-data.tsx`: JSON-LD 구조화 데이터

### 3. 환경 변수 활용

하드코딩된 ID들을 환경 변수로 관리:

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-MP3HPPMN";
const channelIOKey = process.env.NEXT_PUBLIC_CHANNEL_IO_KEY || "fallback-key";
```

### 4. 조건부 렌더링

필수 환경 변수가 없을 때 렌더링 방지:

```typescript
if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "GA_MEASUREMENT_ID") {
  return null;
}
```

### 5. 타입 안전성 추가

Window 객체 확장으로 TypeScript 에러 방지:

```typescript
declare global {
  interface Window {
    ChannelIO: any;
    Calendly: any;
  }
}
```

## 변경된 파일들

- `app/layout.tsx`: 기존 스크립트 제거, 클라이언트 컴포넌트 추가
- `components/analytics.tsx`: Google Analytics & GTM 관리
- `components/external-scripts.tsx`: 외부 서비스 스크립트 관리
- `components/structured-data.tsx`: JSON-LD 구조화 데이터 관리

## 환경 변수 설정 (선택사항)

`.env.local` 파일에 다음 변수들을 설정할 수 있습니다:

```
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_GTM_ID=your-gtm-id
NEXT_PUBLIC_HUBSPOT_ID=your-hubspot-id
NEXT_PUBLIC_CHANNEL_IO_KEY=your-channel-io-key
NEXT_PUBLIC_CALENDLY_URL=your-calendly-url
```

## 결과

- ✅ Hydration 불일치 에러 해결
- ✅ 외부 스크립트 로딩 최적화
- ✅ 타입 안전성 향상
- ✅ 환경 변수를 통한 구성 관리
- ✅ 성능 개선 (스크립트 지연 로딩)
