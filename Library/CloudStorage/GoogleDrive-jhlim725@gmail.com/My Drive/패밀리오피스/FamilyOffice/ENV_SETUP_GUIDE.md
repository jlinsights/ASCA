# 환경 변수 설정 가이드

## 🔧 **현재 .env.local 상태**

현재 설정된 환경 변수들:

```bash
NEXT_PUBLIC_CHANNEL_IO_KEY=4c0cca0c-7cf1-4441-8f11-3e04995a4a78
NEXT_PUBLIC_CAL_URL=https://cal.com/familyoffice
NEXT_PUBLIC_HUBSPOT_ID=43932435
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 📊 **API 키 필요성 분석**

### ✅ **현재 방식 (API 키 불필요)**

- **기본 임베드**: 예약 페이지 표시만
- **장점**: 빠른 구현, 유지보수 간단
- **단점**: 제한적 기능, 커스터마이징 한계

### 🚀 **고급 방식 (API 키 필요)**

- **완전한 통합**: 예약 관리, 분석, 자동화
- **장점**: 강력한 기능, 완전한 제어
- **단점**: 복잡한 구현, API 할당량 관리

## 🎯 **권장사항**

### **패밀리오피스 비즈니스의 경우**

#### **1단계: 기본 운영 (현재 상태)**

```bash
# 기본 운영에 충분
NEXT_PUBLIC_CAL_URL=https://cal.com/familyoffice
```

#### **2단계: 고급 기능 필요시**

```bash
# 기본 설정
NEXT_PUBLIC_CAL_URL=https://cal.com/familyoffice

# 고급 기능용 (Cal.com Pro 계정 필요)
CALCOM_API_KEY=cal_live_xxxxxxxxxxxxxxxxxx
CALCOM_API_URL=https://api.cal.com/v1

# 웹훅 URL (예약 완료 시 자동 처리)
CALCOM_WEBHOOK_URL=https://familyoffices.vip/api/webhooks/cal-com
CALCOM_WEBHOOK_SECRET=your-webhook-secret
```

## 📈 **비즈니스 가치별 API 활용도**

### **높은 가치 (API 키 추천)**

- **대량 예약 처리**: 월 100건+ 예약
- **CRM 연동**: HubSpot, Salesforce 자동 동기화
- **자동화 필요**: 예약 후 자동 이메일, SMS 발송
- **분석 중요**: 예약 패턴, 고객 행동 분석
- **커스텀 플로우**: 특별한 예약 프로세스

### **낮은 가치 (기본 임베드 충분)**

- **간단한 예약**: 기본적인 스케줄링만
- **소규모 운영**: 월 50건 미만 예약
- **빠른 시작**: 당장 예약 기능만 필요

## 🔑 **Cal.com API 키 획득 방법**

### **1. Cal.com Pro 계정 필요**

1. [Cal.com](https://cal.com) 로그인
2. Settings → Billing → Pro 플랜 업그레이드
3. 월 $12 (연간 결제 시 할인)

### **2. API 키 생성**

1. Settings → Developer → API Keys
2. "Create New API Key" 클릭
3. 권한 설정 (read, write, delete)
4. 키 복사 및 안전하게 보관

### **3. 환경 변수 설정**

```bash
# .env.local에 추가
CALCOM_API_KEY=cal_live_your_actual_api_key_here
```

## 💰 **비용 대비 효과 분석**

### **Cal.com Pro 플랜 ($12/월)**

#### **포함 기능:**

- ✅ API 접근
- ✅ 웹훅
- ✅ 고급 통합
- ✅ 무제한 이벤트 타입
- ✅ 커스텀 브랜딩
- ✅ 팀 관리

#### **ROI 계산:**

```
비용: $12/월 = $144/년
절약: 개발 시간 20시간 × $100/시간 = $2,000
추가 매출: 예약 전환률 20% 증가 × 월 평균 매출
결과: 첫 달부터 ROI 양수
```

## 🛠️ **단계별 구현 계획**

### **Phase 1: 기본 운영 (현재)**

- ✅ Cal.com 임베드
- ✅ 채널톡 연동
- ✅ 기본 예약 기능

### **Phase 2: 분석 및 추적**

```bash
# 추가 환경 변수
CALCOM_API_KEY=your_api_key
GOOGLE_ANALYTICS_ENHANCED=true
```

### **Phase 3: 자동화**

```bash
# 추가 통합
HUBSPOT_API_KEY=your_hubspot_key
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_SERVICE_API_KEY=your_email_key
```

### **Phase 4: 고급 분석**

```bash
# 고급 분석 도구
MIXPANEL_PROJECT_TOKEN=your_mixpanel_token
HOTJAR_SITE_ID=your_hotjar_id
```

## 📋 **현재 권장사항**

### **지금 당장 할 것**

1. **기본 기능 테스트**: 현재 Cal.com 임베드 확인
2. **브랜딩 설정**: Cal.com 대시보드에서 색상, 로고 설정
3. **이벤트 타입 최적화**: 상담 시간, 설명 개선

### **향후 고려사항**

1. **예약량 모니터링**: 월 예약 건수 추적
2. **고객 피드백**: 예약 프로세스 만족도 조사
3. **비즈니스 성장**: 예약이 매출에 미치는 영향 분석

## 🎯 **결론**

### **현재 상황 (API 키 없음)**

- ✅ **충분한 기능**: 기본 예약 시스템으로 비즈니스 시작 가능
- ✅ **비용 효율적**: 추가 비용 없이 운영
- ✅ **빠른 시작**: 즉시 사용 가능

### **API 키 추가 시점**

다음 중 하나라도 해당될 때:

- 월 예약 50건 초과
- CRM 연동 필요
- 자동화 요구사항 발생
- 고급 분석 필요
- 커스텀 예약 플로우 요구

**📌 현재는 API 키 없이도 충분하며, 비즈니스 성장에 따라 단계적으로 도입하는 것을 권장합니다.**
