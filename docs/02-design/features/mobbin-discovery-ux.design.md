# 작가·작품 탐색 UX

기준: [ASCA Design System](../DESIGN.md). 작가(`/artists`)와 작품(`/artworks`)
목록에서 검색·필터·결과를 하나의 탐색 패널로 묶는다.

## 참고 패턴

- [Dribbble 탐색 화면](https://mobbin.com/screens/83aedb0c-48b7-41b0-9862-38aeac879d03):
  검색과 상세 필터를 작품 그리드 앞에 배치한다.
- [Unity 필터 화면](https://mobbin.com/screens/d009669f-31a0-46ce-b29d-b44645c4a924):
  적용된 조건을 해제할 수 있는 칩과 결과 정보를 가까이 둔다.

Mobbin MCP의 화면 이미지를 확인하고 정보 구조를 참고했다. 외부 서비스의
색상·폰트·이미지를 제품에 가져오지 않는다.

## 디자인 시스템 적용

- 색상: `{colors.background}`, `{colors.card}`, `{colors.foreground}`,
  `{colors.muted-foreground}`, `{colors.secondary}`, `{colors.border}`,
  `{colors.ring}`. 기존 Navy & Gold 및 한지 표면을 유지한다.
- 제목: `{typography.headline-lg}`, 작품 제목: serif, 본문:
  `{typography.body-md}`. CJK 설명문에는 `leading-relaxed`를 사용한다.
- 레이아웃: 기존 `gallery-container`, `{spacing.sm}`, `{spacing.md}`,
  `{spacing.lg}`. 폼과 칩의 반경은 `{rounded.md}`, 패널은 `{rounded.lg}`.
- 입력·버튼에는 기존 touch 높이를 사용한다. 로딩 장식은 `motion-safe`로
  제한한다.
- 토큰 정의와 전역 CSS는 변경하지 않는다.

## 동작

- 검색창과 각 필터에 항상 보이는 라벨을 제공한다. 모바일에서는 상세 필터를 접고
  펼치며 선택한 조건은 계속 표시한다.
- 검색어 지우기, 개별 조건 해제, 전체 초기화를 구분한다. 정렬은 필터 초기화
  후에도 유지한다.
- 작가 검색은 기존 서버 필터·페이지 조회를 유지한다. 실패한 추가 페이지는 같은
  페이지를 재시도한다.
- 로딩·통신 오류·빈 컬렉션·조건에 맞지 않는 결과를 구분한다. 입력창은 조회
  중에도 유지한다.
- 작품 카드는 단일 링크로 이미지·제목·안내를 묶어 터치와 키보드로 상세 화면에
  접근한다.
- 탐색 UI와 작가 필터 옵션은 지원 언어별로 표시하고 API 값은 원래 한국어 값을
  유지한다.

## 검증

컴포넌트 동작·접근성 테스트, 작가 조회와 재시도 회귀 테스트, 타입 검사, 린트,
디자인 대비 검사, 포맷 검사 및 `/browse`를 이용한 모바일·데스크톱 화면 검증을
수행한다.
