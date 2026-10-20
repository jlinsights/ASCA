import { readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, REGULATIONS, REGULATION_ASSETS } from '../catalog'
import { inlineText, parseRegulation } from '../parse'
import type { Block, Inline, RegulationDocument } from '../types'

const ROOT = path.join(__dirname, '..', '..', '..', 'regulations')
const ctx = { legacyAnchors: LEGACY_ANCHORS }

function load(file: string): { source: string; doc: RegulationDocument } {
  const source = readFileSync(path.join(ROOT, file), 'utf8')
  return { source, doc: parseRegulation(source, ctx) }
}

function allBlocks(doc: RegulationDocument): Block[] {
  const nested = (blocks: Block[]): Block[] =>
    blocks.flatMap(block => {
      if (block.kind === 'list') return [block, ...block.items.flatMap(nested)]
      if (block.kind === 'note') return [block, ...nested(block.blocks)]
      return [block]
    })
  return doc.sections.flatMap(section =>
    nested([...section.blocks, ...section.articles.flatMap(article => article.blocks)])
  )
}

function allInlines(block: Block): Inline[] {
  switch (block.kind) {
    case 'paragraph':
    case 'subheading':
      return block.inlines
    case 'table':
      return [...block.header.flat(), ...block.rows.flat(2)]
    default:
      return []
  }
}

function flattenInlines(inlines: Inline[]): Inline[] {
  return inlines.flatMap(inline =>
    'children' in inline ? [inline, ...flattenInlines(inline.children)] : [inline]
  )
}

function visibleText(doc: RegulationDocument): string {
  const parts = [doc.title, doc.effectiveNote]
  for (const section of doc.sections) {
    parts.push(section.title)
    for (const article of section.articles) parts.push(article.label, article.title)
  }
  for (const block of allBlocks(doc)) parts.push(inlineText(allInlines(block)))
  return parts.join('\n')
}

// regulations/README.md 의 조문 수 — 저장소 문서가 정답지다
const README_ARTICLE_COUNTS: Record<string, number> = {
  articles: 44,
  'membership-dues': 18,
  'operation-judging': 16,
  exhibition: 16,
  'artist-selection': 18,
  appraisal: 11,
  branches: 17,
  objections: 8,
  qualifications: 0,
}

describe('parseRegulation — 실제 규정 9종', () => {
  it.each(REGULATIONS.map(entry => [entry.slug, entry.file] as const))(
    '%s: README 조문 수와 같고 앵커가 유일하다',
    (slug, file) => {
      const { doc } = load(file)
      expect(doc.articleCount).toBe(README_ARTICLE_COUNTS[slug])
      const ids = doc.sections.flatMap(section => [
        section.id,
        ...section.articles.map(article => article.id),
      ])
      expect(new Set(ids).size).toBe(ids.length)
      expect(doc.title).not.toBe('')
    }
  )

  it('부칙이 제1조부터 다시 세도 본문 제1조와 앵커가 겹치지 않는다', () => {
    const { doc } = load('02-operation-and-review.md')
    const firstArticleIds = doc.sections
      .flatMap(section => section.articles)
      .filter(article => article.label === '제1조')
      .map(article => article.id)
    expect(firstArticleIds.length).toBeGreaterThan(1)
    expect(new Set(firstArticleIds).size).toBe(firstArticleIds.length)
    expect(doc.sections.some(section => section.isAddendum)).toBe(true)
  })

  it('회비·심사 표 13개(이관 때 텍스트로 바꾼 것)와 자격 표 1개를 모두 표로 읽는다', () => {
    const counts = REGULATIONS.map(entry => load(entry.file).doc.tableCount)
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(14)
    expect(load('01-membership-and-dues.md').doc.tableCount).toBe(9)
    expect(load('02-operation-and-review.md').doc.tableCount).toBe(4)
    for (const entry of REGULATIONS) {
      const { doc } = load(entry.file)
      const rendered = allBlocks(doc).filter(block => block.kind === 'table').length
      expect(rendered).toBe(doc.tableCount)
    }
  })

  it('<!-- 검토 --> 주석은 원문에 있지만 출력 어디에도 남지 않는다', () => {
    let commentsInSource = 0
    for (const entry of REGULATIONS) {
      const { source, doc } = load(entry.file)
      commentsInSource += (source.match(/<!--/g) ?? []).length
      const text = visibleText(doc)
      expect(text).not.toMatch(/<!--|-->|검토 \d/)
      expect(JSON.stringify(doc)).not.toMatch(/검토 \d|세무사/)
    }
    expect(commentsInSource).toBeGreaterThan(0)
  })

  it('머리 인용문의 시행일은 머리말과 중복되지 않게 한 번만 남는다', () => {
    const { doc } = load('01-membership-and-dues.md')
    expect(doc.effectiveNote).toBe('[시행 2026. 1. 1.]')
    expect(allBlocks(doc).filter(block => block.kind === 'note')).toHaveLength(0)
  })

  it('빈 effective_note 는 빈 문자열, 다음 줄로 내린 머리말 값은 이어 붙여 읽는다', () => {
    // 06 의 title_en 은 prettier 가 `title_en:\n  '…'` 두 줄로 내린다
    expect(load('06-branches-chapters.md').doc.titleEn).toBe(
      'Regulations on the Establishment and Operation of Branches and Chapters'
    )
    expect(load('00-articles-of-incorporation.md').doc.effectiveNote).toBe('')
    expect(load('08-membership-qualifications.md').doc.effectiveNote).toBe('')
  })

  it('옛 단일 페이지 앵커 링크를 새 규정 경로로 바꾼다', () => {
    const { doc } = load('08-membership-qualifications.md')
    const links = allBlocks(doc)
      .flatMap(allInlines)
      .flatMap(inline => flattenInlines([inline]))
      .filter(inline => inline.kind === 'link')
    const hrefs = links.map(link => (link.kind === 'link' ? link.href : ''))
    expect(hrefs).toEqual(
      expect.arrayContaining(['/regulations/articles', '/regulations/artist-selection'])
    )
    expect(hrefs.some(href => href.startsWith('#'))).toBe(false)
    const external = links.filter(link => link.kind === 'link' && link.external)
    expect(external.length).toBe(2)
  })

  it('보증서 양식 이미지 3장을 그림 묶음으로 내고, 모두 공개 목록에 있다', () => {
    const { doc } = load('05-appraisal-certificate.md')
    const figures = allBlocks(doc).flatMap(block => (block.kind === 'figures' ? block.figures : []))
    expect(figures.map(figure => figure.file)).toEqual([...REGULATION_ASSETS])
    expect(figures.every(figure => figure.alt.length > 0)).toBe(true)
  })

  it('조문이 없는 자격 요건은 소제목과 목록을 그대로 담는다', () => {
    const { doc } = load('08-membership-qualifications.md')
    const blocks = allBlocks(doc)
    expect(blocks.filter(block => block.kind === 'subheading')).toHaveLength(2)
    expect(blocks.some(block => block.kind === 'list')).toBe(true)
  })

  it('어느 규정에도 별표(**)가 글자로 남지 않는다 — 한글 조사 앞에서 닫히는 굵은 글씨 포함', () => {
    for (const entry of REGULATIONS) {
      expect(visibleText(load(entry.file).doc)).not.toContain('**')
    }
    expect(visibleText(load('06-branches-chapters.md').doc)).toContain("'지부 활동 지원금'")
  })

  it('조사 앞에서 끝나는 굵은 글씨를 굵게 되살린다', () => {
    const doc = parseRegulation('채널을 통해 **전체 회원(준회원 포함)**에게 공개한다.\n', ctx)
    const paragraph = doc.sections[0]!.blocks[0]!
    expect(paragraph.kind === 'paragraph' && paragraph.inlines).toEqual([
      { kind: 'text', text: '채널을 통해 ' },
      { kind: 'strong', children: [{ kind: 'text', text: '전체 회원(준회원 포함)' }] },
      { kind: 'text', text: '에게 공개한다.' },
    ])
  })
})

describe('parseRegulation — 작은 입력', () => {
  it('제N조의M 과 괄호 없는 제목을 읽는다', () => {
    const doc = parseRegulation(
      "---\ntitle: '시험'\n---\n\n### 제3조의2 (특례)\n\n본문.\n\n### 제4조 정의\n\n본문2.\n",
      ctx
    )
    const articles = doc.sections.flatMap(section => section.articles)
    expect(articles.map(article => [article.label, article.title, article.id])).toEqual([
      ['제3조의2', '특례', 'a3-2'],
      ['제4조', '정의', 'a4'],
    ])
  })
})
