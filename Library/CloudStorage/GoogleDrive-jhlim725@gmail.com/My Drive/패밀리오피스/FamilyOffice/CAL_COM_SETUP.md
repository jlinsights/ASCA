# Cal.com 설정 가이드

## 🎯 **Cal.com vs Calendly 차이점**

Cal.com은 오픈소스 스케줄링 플랫폼으로 Calendly의 강력한 대안입니다:

- 더 많은 커스터마이징 옵션
- 셀프호스팅 가능
- 무료 티어에서도 더 많은 기능
- 더 나은 개발자 친화적 API

## 🔧 **설정 방법**

### 1. **Cal.com 계정 설정**

1. [Cal.com](https://cal.com) 회원가입
2. 이벤트 타입 생성 (예: "상담 예약", "미팅", etc.)
3. 브랜딩 및 설정 커스터마이징

### 2. **환경 변수 설정**

`.env.local` 파일에 다음 내용 추가:

```bash
# Cal.com 설정
NEXT_PUBLIC_CAL_URL=https://cal.com/your-username
```

### 3. **Cal.com 링크 형식**

- **개인 링크**: `your-username`
- **특정 이벤트**: `your-username/event-name`
- **팀 링크**: `team-name/member-name`

예시:

```bash
NEXT_PUBLIC_CAL_URL=https://cal.com/familyoffice/consultation
```

## 💻 **코드에서 사용법**

### 1. **자동 버튼 (권장)**

```tsx
import { CalComButton } from '@/components/cal-com-button'

// 기본 설정 사용
<CalComButton />

// 커스터마이징
<CalComButton
  calLink="familyoffice/consultation"
  buttonText="무료 상담 예약"
  className="your-custom-classes"
/>
```

### 2. **수동 통합**

```tsx
"use client";

const handleBooking = () => {
  if (window.Cal) {
    window.Cal("openModal", "familyoffice/consultation");
  } else {
    window.open("https://cal.com/familyoffice/consultation", "_blank");
  }
};

<button onClick={handleBooking}>상담 예약</button>;
```

### 3. **인라인 임베드**

```tsx
// HTML 요소에 직접 데이터 속성 추가
<div
  data-cal-link="familyoffice/consultation"
  className="cal-embed"
  style={{ width: "100%", height: "600px" }}
/>
```

## 🎨 **디자인 커스터마이징**

### Cal.com 테마 설정

Cal.com 대시보드에서:

1. Settings → Appearance
2. 브랜드 컬러 설정
3. 로고 업로드
4. 커스텀 CSS 추가

### 브랜드 컬러 매칭

```css
/* Cal.com 대시보드의 커스텀 CSS에 추가 */
:root {
  --cal-brand-color: #c9a961; /* 골드 */
  --cal-brand-text-color: #1e3a5f; /* 네이비 */
}
```

## 🔍 **디버깅 방법**

### 1. **브라우저 콘솔 확인**

개발자 도구에서 다음 로그 확인:

- `✅ Cal.com script loaded`
- `✅ Cal.com initialized successfully`
- `✅ Cal.com is ready for button`

### 2. **네트워크 탭 확인**

- `https://app.cal.com/embed/embed.js` 로딩 상태
- 403/404 에러 여부

### 3. **환경 변수 확인**

```javascript
// 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_CAL_URL);
```

## 🚀 **고급 기능**

### 1. **프리필 정보**

```tsx
window.Cal("openModal", "familyoffice/consultation", {
  name: "홍길동",
  email: "hong@example.com",
  notes: "문의사항: 자산관리 상담",
});
```

### 2. **이벤트 리스너**

```tsx
useEffect(() => {
  if (window.Cal) {
    window.Cal("on", "booking:successful", (data) => {
      console.log("예약 완료:", data);
      // GA 이벤트 트래킹, 리디렉션 등
    });
  }
}, []);
```

### 3. **다중 이벤트 타입**

```tsx
const eventTypes = {
  consultation: 'familyoffice/consultation',
  meeting: 'familyoffice/meeting',
  demo: 'familyoffice/demo'
}

<CalComButton calLink={eventTypes.consultation} buttonText="상담 예약" />
<CalComButton calLink={eventTypes.demo} buttonText="데모 신청" />
```

## 📱 **모바일 최적화**

Cal.com은 자동으로 모바일 친화적이지만, 추가 최적화:

```tsx
const isMobile = window.innerWidth < 768

<CalComButton
  calLink="familyoffice/consultation"
  buttonText={isMobile ? "예약" : "무료 상담 예약"}
  className={isMobile ? "w-full" : ""}
/>
```

## 🔒 **보안 및 프라이버시**

1. **GDPR 준수**: Cal.com 대시보드에서 프라이버시 설정
2. **데이터 보관**: 유럽 서버 또는 자체 호스팅 옵션
3. **인증**: OAuth, SAML 등 기업용 인증 지원

## ❓ **문제 해결**

### 스크립트 로딩 실패

```bash
# 네트워크 문제 확인
curl -I https://app.cal.com/embed/embed.js
```

### 모달이 열리지 않는 경우

1. 브라우저 팝업 차단 해제
2. JavaScript 활성화 확인
3. 콘솔 에러 메시지 확인

### 환경 변수 인식 실패

```bash
# 개발 서버 재시작
npm run dev
```

## 📊 **성능 모니터링**

```tsx
// 로딩 시간 측정
const start = performance.now();
window.Cal("init", {
  origin: "https://app.cal.com",
  callback: () => {
    console.log(`Cal.com 로딩 시간: ${performance.now() - start}ms`);
  },
});
```
