/**
 * 작가의 생몰 표시. 고인은 artists.death_year 가 채워져 있다.
 * 명단에서 빼지 않고 이름 앞에 故 를 붙여 기린다.
 */

export const DECEASED_MARK = '故'

export function artistDisplayName(name: string, deathYear: number | null | undefined): string {
  return deathYear ? `${DECEASED_MARK} ${name}` : name
}

/** '1940–2026' · '† 2026'(출생연도 모름) · 'b. 1960'(생존) · 둘 다 없으면 null */
export function lifeYearsLabel(
  birthYear: number | null | undefined,
  deathYear: number | null | undefined
): string | null {
  if (deathYear) return birthYear ? `${birthYear}–${deathYear}` : `† ${deathYear}`
  return birthYear ? `b. ${birthYear}` : null
}
