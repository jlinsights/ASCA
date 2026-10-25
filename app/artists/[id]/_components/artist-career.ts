/**
 * 작가 소개(bio) 글을 '소개 문단' 과 '경력 연보' 로 나눈다.
 *
 * DB 의 bio 는 대부분 한 줄에 한 경력을 적은 목록이다 — "제10회(2013) 대한민국 동양서예대전 특선".
 * 그대로 문단으로 찍으면 연도가 묻혀 읽히지 않는다. 연도와 경력 낱말이 함께 있는 줄만 연보로
 * 옮기고, 나머지(산문 소개)는 문단으로 둔다. 1952年…生， 같은 산문 줄은 연보로 옮기지 않는다.
 */

export interface CareerEntry {
  year: number | null
  text: string
}

export interface ArtistCareer {
  paragraphs: string[]
  entries: CareerEntry[]
}

const YEAR = /(?<!\d)((?:19|20)\d{2})(?!\d)/
const CAREER_WORD = /회|展|전|賞|상|선|출품|수상|초대|위원|회원|역임|졸업|수료|개인전|강사|협회|대회|공모/
const BULLET = /^[•·∙▪◦○●\-–—*]\s*/
/** 산문 문장 중간에서 끊긴 줄(쉼표로 끝남)은 연보가 아니다 */
const PROSE_TAIL = /[，,、]$/
const MAX_ENTRY_LENGTH = 140

function yearOf(text: string): number | null {
  const match = text.match(YEAR)
  return match ? Number(match[1]) : null
}

/** "제10회(2013) 대전" → "제10회 대전" — 연도는 왼쪽 칸에 따로 적는다 */
function withoutYearParen(text: string): string {
  return text
    .replace(/\(\s*(?:19|20)\d{2}\s*\)/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isCareerLine(line: string): boolean {
  if (line.length > MAX_ENTRY_LENGTH || PROSE_TAIL.test(line)) return false
  if (BULLET.test(line)) return true
  return YEAR.test(line) && CAREER_WORD.test(line)
}

function toEntry(raw: string): CareerEntry {
  const text = raw.replace(BULLET, '').trim()
  return { year: yearOf(text), text: withoutYearParen(text) || text }
}

export function parseArtistCareer(
  bio: string | null | undefined,
  extras: { awards?: string[] | null; exhibitions?: string[] | null } = {}
): ArtistCareer {
  const paragraphs: string[] = []
  const careerLines: string[] = []
  let buffer: string[] = []

  const flush = () => {
    if (buffer.length > 0) paragraphs.push(buffer.join('\n'))
    buffer = []
  }

  for (const rawLine of (bio ?? '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      continue
    }
    if (isCareerLine(line)) {
      flush()
      careerLines.push(line)
    } else {
      buffer.push(line)
    }
  }
  flush()

  // 경력처럼 보이는 줄이 하나뿐이면 연보를 따로 세우지 않는다 — 문단 속 한 문장일 가능성이 크다
  const [lone] = careerLines
  if (careerLines.length === 1 && lone) {
    paragraphs.push(lone)
    careerLines.length = 0
  }

  const listed = [...(extras.awards ?? []), ...(extras.exhibitions ?? [])]
    .map(item => item.trim())
    .filter(Boolean)

  return {
    paragraphs,
    entries: [...careerLines, ...listed].map(toEntry),
  }
}
