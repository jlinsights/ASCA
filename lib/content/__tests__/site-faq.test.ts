import { readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, findRegulation } from '@/lib/regulations/catalog'
import { parseRegulation } from '@/lib/regulations/parse'
import { FAQ_GROUPS, SITE_FAQ, faqGroups } from '../site-faq'

const ROOT = path.join(__dirname, '..', '..', '..', 'regulations')

/** /regulations/<slug> 에 실제로 존재하는 본문 조 앵커 */
function anchorsOf(slug: string): Set<string> {
  const entry = findRegulation(slug)
  if (!entry) throw new Error(`알 수 없는 규정 slug: ${slug}`)
  const source = readFileSync(path.join(ROOT, entry.file), 'utf8')
  const doc = parseRegulation(source, { legacyAnchors: LEGACY_ANCHORS })
  return new Set(doc.sections.filter(s => !s.isAddendum).flatMap(s => s.articles.map(a => a.id)))
}

const regSources = SITE_FAQ.flatMap(item =>
  (item.sources ?? [])
    .filter(source => source.href.startsWith('/regulations/'))
    .map(source => [item.q, source.label, source.href] as const)
)

describe('사이트 FAQ', () => {
  it('질문이 겹치지 않는다', () => {
    const questions = SITE_FAQ.map(item => item.q)
    expect(new Set(questions).size).toBe(questions.length)
  })

  it('id 가 겹치지 않고, 출품원서 페이지가 고르는 id 가 모두 있다', () => {
    const ids = SITE_FAQ.flatMap(item => (item.id ? [item.id] : []))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(expect.arrayContaining(['entry-fees', 'awards', 'artist-selection']))
  })

  it('모든 질문에 id 가 있다 — /faq#id 로 바로 갈 수 있게', () => {
    expect(SITE_FAQ.filter(item => !item.id).map(item => item.q)).toStrictEqual([])
  })

  it('/faq 의 주제 묶음은 모든 질문을 정확히 한 번씩 담는다', () => {
    const grouped = FAQ_GROUPS.flatMap(group => group.ids)
    expect(new Set(grouped).size).toBe(grouped.length)
    expect([...grouped].sort()).toStrictEqual(SITE_FAQ.map(item => item.id).sort())
    for (const group of faqGroups()) {
      expect(group.items.length).toBe(FAQ_GROUPS.find(g => g.key === group.key)?.ids.length)
    }
  })

  it.each(regSources)('「%s」의 근거 %s(%s)가 실제 조문을 가리킨다', (_q, _label, href) => {
    const match = /^\/regulations\/([a-z-]+)#(a[\d-]+)$/.exec(href)
    expect(match).not.toBeNull()
    const [, slug, anchor] = match as RegExpExecArray
    expect(anchorsOf(slug)).toContain(anchor)
  })

  it('삼체상 상금은 운영 및 심사 규정 제7조와 같다(15만원)', () => {
    const awards = SITE_FAQ.find(item => item.q.includes('시상내역'))
    expect(awards?.a).toContain('삼체상: 4명, 상장 및 상금 15만원')
  })
})
