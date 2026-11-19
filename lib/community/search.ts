// 게시판 검색어 — 주소(?q=)에서 받아 제목·본문 부분 일치 조건으로 바꾼다. 서버·화면 공용(DB 접근 없음).

export const SEARCH_MAX = 60

/**
 * 검색어 다듬기 — 앞뒤 공백·제어 문자를 지우고, 연속 공백을 하나로, 길이를 자른다.
 * 비면 null (검색 안 함).
 */
export function normalizeSearch(raw: string | string[] | undefined | null): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEARCH_MAX)
    .trim()
  return cleaned ? cleaned : null
}

/**
 * PostgREST or() 필터 — 제목·본문 ilike.
 * 1) LIKE 와일드카드(% _ \)는 글자 그대로 찾도록 백슬래시로 막고,
 * 2) or() 안에서 쉼표·괄호가 구문으로 읽히지 않게 값을 큰따옴표로 감싸며 " \ 를 다시 막는다.
 * PostgREST 가 * 를 % 로 바꾸므로 * 는 미리 뺀다.
 */
export function searchFilter(term: string): string {
  const like = term.replace(/\*/g, ' ').replace(/[\\%_]/g, match => `\\${match}`)
  const inner = `%${like}%`.replace(/[\\"]/g, match => `\\${match}`)
  return `title.ilike."${inner}",body.ilike."${inner}"`
}
