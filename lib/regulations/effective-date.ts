const EFFECTIVE = /시행\s+(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./g

/**
 * '[시행 2025. 2. 8.] [제3호 시행령, 2026. 1. 1., 일부개정]' 같은 표기들에서
 * "시행 YYYY. M. D." 날짜 중 가장 늦은 것을 원문 표기 그대로 돌려준다. 없으면 빈 문자열.
 */
export function latestEffectiveDate(notes: readonly string[]): string {
  let best = ''
  let bestKey = -1
  for (const note of notes) {
    for (const match of note.matchAll(EFFECTIVE)) {
      const [, year, month, day] = match
      const key = Number(year) * 10000 + Number(month) * 100 + Number(day)
      if (key > bestKey) {
        bestKey = key
        best = `${year}. ${Number(month)}. ${Number(day)}.`
      }
    }
  }
  return best
}
