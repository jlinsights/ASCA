import { readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, findRegulation } from '@/lib/regulations/catalog'
import { parseRegulation } from '@/lib/regulations/parse'
import type { LedgerRow, RegSource } from '../apply-parts'
import * as entry from '@/app/application/_components/application-data'
import * as commission from '@/app/commissioning-application/_components/commissioning-data'
import * as member from '@/app/membership/_components/membership-data'
import { SITE_FAQ } from '@/lib/content/site-faq'
import { ELIGIBILITY } from '@/app/contests/_components/contest-23-data'

const ROOT = path.join(__dirname, '..', '..', '..', 'regulations')

function sourceOf(slug: string): string {
  const found = findRegulation(slug)
  if (!found) throw new Error(`알 수 없는 규정 slug: ${slug}`)
  return readFileSync(path.join(ROOT, found.file), 'utf8')
}

/** 줄바꿈·연속 공백을 한 칸으로 — 원문은 80자에서 줄을 접는다 */
const flat = (text: string) => text.replace(/\s+/g, ' ')

/** 마크다운 표에 이 칸들을 모두 가진 행이 있는가 */
function hasTableRow(source: string, cells: readonly string[]): boolean {
  return source
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .some(line => {
      const row = line.split('|').map(cell => cell.trim())
      return cells.every(cell => row.includes(cell))
    })
}

function anchorsOf(slug: string): Set<string> {
  const doc = parseRegulation(sourceOf(slug), { legacyAnchors: LEGACY_ANCHORS })
  return new Set(doc.sections.filter(s => !s.isAddendum).flatMap(s => s.articles.map(a => a.id)))
}

const membership = sourceOf('membership-dues')
const judging = sourceOf('operation-judging')

describe('출품원서 페이지 ↔ 규정 원문', () => {
  it.each(entry.ENTRY_FEES.map(row => row.cells))('출품비 %s 행이 제6조 표에 있다', (...cells) => {
    expect(hasTableRow(membership, cells)).toBe(true)
  })

  it.each(entry.FRAMING_FEES.map(row => row.cells))(
    '표구비 %s 행이 제8조 표에 있다',
    (name, ...prices) => {
      // 제8조 표의 첫 칸은 '반절지 (35x135cm)' 처럼 치수가 붙어 있다
      const line = membership.split('\n').find(l => l.includes(`| ${name} (`))
      expect(line).toBeDefined()
      prices.forEach(price => expect(line).toContain(price))
    }
  )

  it.each(entry.AWARDS)('$name: $count, $prize 가 제7조와 같다', award => {
    expect(flat(judging)).toContain(`${award.name}: ${award.count}, ${award.prize}`)
  })

  it('규격 세 가지가 제5조와 같다', () => {
    const sizes = entry.SIZES.map(s => `${s.name}(${s.size.replace('cm', '')}cm)`).join(', ')
    expect(flat(judging).replace(/\*\*/g, '')).toContain(sizes)
  })

  it.each(entry.DIVISIONS)('$title 부문의 세부가 제5조와 같다', division => {
    expect(flat(judging)).toContain(division.body)
  })

  it.each(entry.CRITERIA)('$name($han) $score: $elements', criterion => {
    expect(flat(judging)).toContain(
      `${criterion.name}(${criterion.han}): ${criterion.score} (평가요소: ${criterion.elements})`
    )
  })

  it.each(entry.GRADE_THRESHOLDS.map(row => row.cells))('등급 기준 %s: %s', (score, grade) => {
    expect(flat(judging)).toContain(`${score}: ${grade}`)
  })
})

describe('특별선임(회원 안내·추천·초대작가 신청) ↔ 규정 원문', () => {
  const selection = flat(sourceOf('artist-selection'))

  it.each(member.SPECIAL_FEES.map(row => row.cells))(
    '특별선임 비용 %s 행이 회원 및 회비 규정 제3조 ④ 표에 있다',
    (...cells) => {
      expect(hasTableRow(membership, cells)).toBe(true)
    }
  )

  it('합계 = 심사료 + 등록비 + 첫해 연회비', () => {
    const won = (s: string) => Number(s.replace('만원', ''))
    for (const { cells } of member.SPECIAL_FEES) {
      const [, review, registration, dues, total] = cells
      expect(won(review) + won(registration) + won(dues)).toBe(won(total))
    }
  })

  it.each(member.SPECIAL_ELIGIBLE)('신청 대상 「%s」가 선임 규정 제11조 ①에 있다', item => {
    expect(selection).toContain(item)
  })

  it('공모요강 특별규정과 FAQ 연회비 답의 금액이 표와 같다', () => {
    const rule = ELIGIBILITY.find(item => item.title === '특별규정')?.body ?? ''
    const dues = SITE_FAQ.find(item => item.id === 'dues')?.a ?? ''
    for (const { cells } of member.SPECIAL_FEES) {
      const [name, review, registration, , total] = cells
      expect(rule).toContain(`${name} ${total}`)
      expect(dues).toContain(`${name} ${registration}`)
      expect(dues).toContain(`심사료 ${review}`)
    }
  })

  it('FAQ 의 특별선임 금액이 표와 같다', () => {
    const answer = SITE_FAQ.find(item => item.id === 'special-appointment')?.a ?? ''
    for (const { cells } of member.SPECIAL_FEES) {
      const [name, review, registration, dues, total] = cells
      expect(answer).toContain(`${name}: ${review} + ${registration} + ${dues} = ${total}`)
    }
  })
})

describe('위원 위촉 페이지 ↔ 규정 원문', () => {
  it.each(commission.ROLES.flatMap(role => role.qualifications.map(q => [role.title, q])))(
    '%s 자격 「%s」가 원문에 있다',
    (_role, qualification) => {
      expect(flat(judging)).toContain(qualification)
    }
  )

  it.each(
    [...commission.JUROR_PAY, ...commission.COMMITTEE_PAY, ...commission.RECRUITER_PAY].map(
      (row: LedgerRow) => row.cells
    )
  )('수당 %s 행이 제4조의2 표에 있다', (...cells) => {
    expect(hasTableRow(judging, cells)).toBe(true)
  })

  it.each(commission.RECUSAL_GROUNDS)('제척 사유 「%s」가 제3조의2에 있다', ground => {
    expect(flat(judging)).toContain(ground)
  })
})

describe('근거 링크', () => {
  const sources: RegSource[] = [
    ...entry.DIVISION_SOURCES,
    ...entry.FEE_SOURCES,
    ...entry.JUDGING_SOURCES,
    ...entry.AWARD_SOURCES,
    ...commission.ROLES.flatMap(role => role.sources),
    ...commission.STEP_SOURCES,
    ...commission.PAY_SOURCES,
    ...commission.FAIRNESS_SOURCES,
    ...Object.values(member.SRC).filter(s => s.href.includes('#')),
  ]

  it.each(sources.map(s => [s.label, s.href]))('%s(%s)가 실제 조문을 가리킨다', (_label, href) => {
    const match = /^\/regulations\/([a-z-]+)#(a[\d-]+)$/.exec(href)
    expect(match).not.toBeNull()
    const [, slug, anchor] = match as RegExpExecArray
    expect(anchorsOf(slug)).toContain(anchor)
  })
})
