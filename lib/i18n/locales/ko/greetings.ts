// greetings 화면 번역 (ko) — /greetings 인사말씀 화면 틀(편지 본문은 greetings-tabs.tsx 의 네 언어 원문). 네 언어를 모으는 곳은 lib/i18n/translations/greetings.ts 다.
// 빈 문자열은 쓰지 않는다 — t() 가 빈 값이면 키 이름을 돌려준다.
const greetings: Record<string, string> = {
  greetTitle: '인사말씀',
  greetLede: '제23회 대한민국 동양서예대전을 앞두고 이사장이 인사말씀을 전합니다',
  greetChapterEyebrow: '2027 · 제23회 대전',
  greetChapterTitle: '이사장 인사말씀',
  greetTabsLabel: '인사말씀 언어',
}

export default greetings
