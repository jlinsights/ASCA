// 카카오 디자인 가이드의 버튼 색 — 배경 #FEE500, 글자 rgba(0,0,0,0.85), 다크 모드에서도 그대로.
// 브랜드 고정색이라 Ink System 토큰이 아니라 임의값으로 둔다 (Tailwind 는 리터럴 클래스만 생성하므로 문자열 조립 금지).
export const KAKAO_BUTTON_CLASSES =
  'bg-[#FEE500] hover:bg-[#FEE500]/90 text-black/85 border-[#FEE500] hover:border-[#FEE500]/90'
