/**
 * 행사에서 이어지는 안내 페이지 — 일정·신청이 행사 기록이 아니라 별도 페이지에 있는 경우.
 * 행사 id 로 묶는다(제목은 고쳐질 수 있다).
 */
export interface EventLink {
  href: string
  label: string
}

export const EVENT_LINKS: Readonly<Record<string, EventLink>> = {
  // 2027 대만 서예 문화 기행 — 일정표·참가 안내 플립북
  '272782c1-fc3a-4440-ae73-f1a113b8cd55': {
    href: '/programs/cultural-exchange#taiwan-trip-flipbook',
    label: '기행 일정과 참가 안내 보기',
  },
}
