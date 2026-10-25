const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/**
 * '2027-01-31' → '2027년 1월 31일(일)'. withYear=false 면 '1월 31일(일)'.
 * 요일은 손으로 적지 않고 날짜에서 계산한다 — 안내문에서 날짜와 요일이 엇갈린 적이 있다.
 */
export function koDate(iso: string, withYear = true): string {
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number]
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${withYear ? `${year}년 ` : ''}${month}월 ${day}일(${weekday})`
}
