# Unsplash API 설정 가이드

관리자 파일 업로드 페이지에서 Unsplash 이미지를 선택하여 업로드할 수 있는 기능이
추가되었습니다.

## 1. Unsplash API 키 발급

1. [Unsplash Developers](https://unsplash.com/developers) 사이트에 접속
2. 계정 생성 또는 로그인
3. "New Application" 클릭
4. 애플리케이션 정보 입력:
   - Application name: `ASCA Website`
   - Description: `동양서예협회 웹사이트용 이미지 선택 기능`
5. Access Key 복사

## 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Unsplash API
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

## 3. 기능 사용법

1. 관리자 대시보드 → 파일 관리 → 파일 업로드 탭
2. "Unsplash에서 이미지 선택" 버튼 클릭
3. 검색어 입력 또는 빠른 태그 선택
4. 원하는 이미지 클릭하여 선택
5. 자동으로 다운로드되어 업로드 대기 목록에 추가
6. "업로드 시작" 버튼으로 최종 업로드

## 4. 주요 기능

- **검색**: 키워드로 이미지 검색
- **빠른 태그**: 서예 관련 미리 정의된 태그
- **무한 스크롤**: 더 많은 이미지 로드
- **메타데이터**: 작가 정보, 좋아요 수, 설명 표시
- **자동 다운로드**: 선택한 이미지를 자동으로 다운로드
- **Unsplash 크레딧**: 적절한 출처 표시

## 5. 주의사항

- Unsplash API는 시간당 요청 제한이 있습니다 (무료: 50 requests/hour)
- 상업적 사용 시 Unsplash 라이선스를 확인하세요
- 이미지 사용 시 작가 크레딧을 표시하는 것이 좋습니다

## 6. 문제 해결

### API 키가 없는 경우

- 데모 모드로 작동하며 제한된 기능만 사용 가능
- 실제 사용을 위해서는 API 키 설정 필요

### 이미지 로드 실패

- 네트워크 연결 확인
- API 키 유효성 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 다운로드 실패

- CORS 정책으로 인한 문제일 수 있음
- 다른 이미지로 시도해보세요
