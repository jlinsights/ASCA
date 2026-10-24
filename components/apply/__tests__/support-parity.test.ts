/**
 * /fundraising·/contact 에 옮긴 숫자·문구 ↔ 규정 원문.
 * 페이지 데이터를 손으로 고치다 규정과 어긋나면(또는 규정이 바뀌었는데 페이지를 안 고치면) 여기서 깨진다.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, findRegulation } from '@/lib/regulations/catalog'
import { parseRegulation } from '@/lib/regulations/parse'
import { SITE_FAQ } from '@/lib/content/site-faq'
import { EMAIL, OFFICE, PHONE } from '@/lib/content/contact-info'
import type { RegSource } from '../apply-parts'
import * as fund from '@/app/fundraising/_components/fundraising-data'
import * as contact from '@/app/contact/_components/contact-data'

const REPO = path.join(__dirname, '..', '..', '..')
const ROOT = path.join(REPO, 'regulations')

function sourceOf(slug: string): string {
  const found = findRegulation(slug)
  if (!found) throw new Error(`알 수 없는 규정 slug: ${slug}`)
  return readFileSync(path.join(ROOT, found.file), 'utf8')
}

/** 줄바꿈·연속 공백을 한 칸으로, 굵게(**) 표시는 지운다 — 원문은 80자에서 줄을 접는다 */
const flat = (text: string) => text.replace(/\*\*/g, '').replace(/\s+/g, ' ')

function tableRows(source: string): string[][] {
  return source
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .map(line => line.split('|').map(cell => cell.trim()))
}

function anchorsOf(slug: string): Set<string> {
  const doc = parseRegulation(sourceOf(slug), { legacyAnchors: LEGACY_ANCHORS })
  return new Set(doc.sections.filter(s => !s.isAddendum).flatMap(s => s.articles.map(a => a.id)))
}

/** "### 제N조 (…)" 부터 다음 조 머리 전까지 */
function article(source: string, no: string): string {
  const start = source.indexOf(`### 제${no}조 `)
  if (start < 0) throw new Error(`제${no}조 없음`)
  const next = source.indexOf('\n### ', start + 1)
  return flat(source.slice(start, next < 0 ? undefined : next))
}

const dues = sourceOf('membership-dues')
const articles = sourceOf('articles')
const operation = sourceOf('operation-judging')
const objections = sourceOf('objections')

describe('회비·후원 페이지 ↔ 회원 및 회비 규정', () => {
  const rows = tableRows(dues)
  const tiers = fund.DUES.map(row => row.cells)

  it.each(tiers)('%s 연회비 %s 가 제3조 ① 표에 있다', (tier, annual) => {
    expect(rows.some(r => r[1] === tier && r[2] === annual && r.length === 5)).toBe(true)
  })

  it.each(tiers.filter(([, , reg]) => reg !== '—'))(
    '%s 등록비 %s 가 제3조 ② 표에 있다',
    (tier, _annual, registration) => {
      const section = dues.slice(dues.indexOf('**② 등록비'), dues.indexOf('**③ 평생회원'))
      expect(tableRows(section).some(r => r[1] === tier && r[2] === registration)).toBe(true)
    }
  )

  it('다섯 등급이 모두 있다 — 행을 빠뜨리지 않았다', () => {
    expect(tiers.map(([tier]) => tier)).toEqual([
      '청년작가',
      '일반작가',
      '추천작가',
      '초대작가',
      '임원',
    ])
  })

  it('임원 발전기금 200만원·CMS 최대 20개월이 제4조와 같다', () => {
    const fourth = article(dues, '4')
    expect(fourth).toContain('발전기금 2백만원')
    expect(fourth).toContain('최대 20개월까지 CMS')
    expect(tiers.find(([tier]) => tier === '임원')?.[3]).toContain('발전기금 200만원')
  })

  it('평생회원은 초대작가 이상, 연회비의 10배 — 제3조 ③', () => {
    const third = article(dues, '3')
    expect(third).toContain('초대작가 이상의 정회원은 누구나 평생회비를 납부')
    expect(third).toContain('연회비(제3조 제1항)의 10배')
  })

  it('납부 기한 1월 31일이 제5조 ① 과 같다', () => {
    expect(article(dues, '5')).toContain('연회비는 매년 1월 31일까지 납부')
  })

  it('미납 조치 세 단계가 제5조 ② 와 같다', () => {
    const fifth = article(dues, '5')
    expect(fund.ARREARS.map(r => r.cells[0])).toEqual([
      '당해 연도 미납',
      '연속 2년 미납',
      '연속 3년 미납',
    ])
    expect(fifth).toContain('당해 연도 연회비 미납 시')
    expect(fifth).toContain('연속 2년 미납 시):** 회원 자격이 정지'.replace(/\*\*/g, ''))
    expect(fifth).toContain('이사회의 의결을 거쳐 이사장이 제명할 수')
  })

  it('전자 영수증·온라인 납부 원칙이 제11조와 같다', () => {
    const eleventh = article(dues, '11')
    expect(eleventh).toContain('온라인 납부(계좌이체, CMS 출금 등)를 원칙')
    expect(eleventh).toContain('전자 영수증')
  })
})

describe('회비·후원 페이지 ↔ 정관', () => {
  const PROGRAM_KEYWORDS = [
    ['한·중·일 연합전', '신진작가 발굴'],
    ['교류전시', '학술발표'],
    ['한국적 서체개발 육성'],
    ['해외문헌의 연구조사'],
  ]

  it('정관 제4조의 1~4호 사업을 빠짐없이, 순서대로 옮겼다', () => {
    const fourth = article(articles, '4')
    expect(fund.PROGRAMS).toHaveLength(PROGRAM_KEYWORDS.length)
    PROGRAM_KEYWORDS.forEach((keywords, index) => {
      keywords.forEach(keyword => {
        expect(fourth).toContain(keyword)
        expect(fund.PROGRAMS[index]?.title).toContain(keyword)
      })
    })
  })

  it('임원 무보수에는 상임이사 예외와 실비가 붙는다 — 제37조', () => {
    expect(article(articles, '37')).toContain('상임이사를 제외한 임원에 대하여는 보수를 지급하지')
    expect(article(articles, '37')).toContain('실비는 지급할 수')
  })

  it.each([
    ['예산 편성', '34', '회계연도 개시 1월 전', '매 회계연도 개시 1월전'],
    ['결산', '35', '회계연도 종료 후 2월 이내', '매 회계연도 종료후 2월 이내'],
    ['회계감사', '36', '연 2회 이상', '연 2회 이상'],
  ])('%s 시기가 정관 제%s조와 같다', (title, no, when, original) => {
    expect(fund.ACCOUNTABILITY.find(step => step.title === title)?.when).toBe(when)
    expect(article(articles, no)).toContain(original)
  })

  it('총회 안건 7일 전 공개가 운영 및 심사 규정 제9조와 같다', () => {
    expect(fund.ACCOUNTABILITY.find(step => step.title === '안건 사전 공개')?.when).toBe(
      '총회 7일 전'
    )
    expect(article(operation, '9')).toContain('개최 7일 전까지')
  })

  it('FAQ id 가 모두 실제 항목을 가리킨다', () => {
    const ids = new Set(SITE_FAQ.map(item => item.id))
    fund.FUNDRAISING_FAQ_IDS.forEach(id => expect(ids).toContain(id))
  })
})

describe('문의 페이지 ↔ 이의제기 처리 규정', () => {
  it('접수 기간 7일 — 제3조', () => {
    expect(article(objections, '3')).toContain('공식 결과 공지일로부터 7일 이내')
  })

  it.each(contact.OBJECTION_FIELDS)('필수 항목 "$term" 이 제4조 문구 그대로다', field => {
    expect(article(objections, '4')).toContain(`${field.term}: ${field.detail}`)
  })

  it('양식 이메일이 필수 항목 네 가지를 모두 묻는다', () => {
    const body = decodeURIComponent(contact.OBJECTION_MAILTO.split('&body=')[1] ?? '')
    contact.OBJECTION_FIELDS.forEach(field => expect(body).toContain(field.term))
    expect(contact.OBJECTION_MAILTO.startsWith(`mailto:${EMAIL}?`)).toBe(true)
  })

  it('접수 창구(이메일·전화)가 제4조와 같다', () => {
    const fourth = article(objections, '4')
    expect(fourth).toContain(EMAIL)
    expect(fourth).toContain(PHONE.display)
    expect(fourth).toContain('전화로 접수한 경우에도 위 필수 항목을 서면으로 제출')
  })

  it.each([
    ['접수 확인', '영업일 기준 24시간 이내'],
    ['1차 회신', '영업일 3일 이내'],
    ['최종 회신', '영업일 14일 이내'],
  ])('%s 기한이 제5조와 같다', (step, deadline) => {
    const row = contact.OBJECTION_DEADLINES.find(r => r.cells[0] === step)
    expect(row?.cells[1]).toContain(deadline)
    expect(article(objections, '5')).toContain(`${step}:`)
    expect(article(objections, '5')).toContain(deadline)
  })

  it.each(contact.OBJECTION_TYPES)('처리 유형 "$title" 이 제6조에 있다', type => {
    expect(article(objections, '6')).toContain(`${type.title}:`)
  })

  it('각하·기각 사유 네 가지가 제7조와 같다', () => {
    const seventh = article(objections, '7')
    const KEYWORDS = [['접수 기간'], ['필수 정보'], ['주관적 평가(점수)'], ['비방', '업무 방해']]
    expect(contact.OBJECTION_DISMISSALS).toHaveLength(KEYWORDS.length)
    KEYWORDS.forEach((keywords, index) =>
      keywords.forEach(keyword => {
        expect(seventh).toContain(keyword)
        expect(contact.OBJECTION_DISMISSALS[index]).toContain(keyword)
      })
    )
  })

  it('용건별 안내의 내부 링크가 실제 페이지다', () => {
    contact.TOPICS.filter(topic => topic.href.startsWith('/')).forEach(topic => {
      expect(existsSync(path.join(REPO, 'app', topic.href.slice(1), 'page.tsx'))).toBe(true)
    })
  })

  it('사무소 주소가 사용자가 준 주소와 같다', () => {
    expect(`〒${OFFICE.postalCode} ${OFFICE.line1}(${OFFICE.line2})`).toBe(
      '〒10467 경기도 고양시 덕양구 호국로 860, 207-1403(성사동, 래미안휴레스트)'
    )
  })
})

describe('근거 링크', () => {
  const sources: RegSource[] = [
    ...fund.DUES_SOURCES,
    ...fund.PAYMENT_SOURCES,
    ...fund.PROGRAM_SOURCES,
    ...fund.ACCOUNTABILITY_SOURCES,
    ...contact.OBJECTION_SOURCES,
    ...contact.OFFICE_SOURCES,
  ]

  it.each(sources.map(s => [s.label, s.href]))('%s(%s)가 실제 조문을 가리킨다', (_label, href) => {
    const match = /^\/regulations\/([a-z-]+)#(a[\d-]+)$/.exec(href)
    expect(match).not.toBeNull()
    const [, slug, anchor] = match as RegExpExecArray
    expect(anchorsOf(slug)).toContain(anchor)
  })
})

describe('옛 본부 주소·개인 번호가 남지 않았다', () => {
  // public/webflow 는 옛 사이트 보관본, lib/data 는 사진 파일명(JTL02872)이라 뺀다
  const SCAN = ['app', 'components', 'lib', 'copy.md']
  const SKIP = new Set(['node_modules', '__tests__', 'data'])
  const FORBIDDEN = [
    /보문로\s?105/,
    /보림빌딩/,
    /Borim/,
    /普門路105/,
    /02872/,
    /1089808555/,
    /02-928-1117/,
  ]

  function files(target: string): string[] {
    const full = path.join(REPO, target)
    if (!statSync(full).isDirectory()) return [full]
    return readdirSync(full).flatMap(name => (SKIP.has(name) ? [] : files(path.join(target, name))))
  }

  const hits = SCAN.flatMap(files)
    .filter(file => /\.(tsx?|md|json)$/.test(file))
    .flatMap(file => {
      const text = readFileSync(file, 'utf8')
      return FORBIDDEN.filter(pattern => pattern.test(text)).map(
        pattern => `${path.relative(REPO, file)} ${pattern}`
      )
    })

  it('소스 어디에도 없다', () => {
    expect(hits).toEqual([])
  })
})
