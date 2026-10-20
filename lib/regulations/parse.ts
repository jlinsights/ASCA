import { Lexer, type Token, type Tokens } from 'marked'
import type {
  Block,
  Inline,
  RegulationArticle,
  RegulationDocument,
  RegulationFigure,
  RegulationLinkContext,
  RegulationSection,
} from './types'

/**
 * regulations/*.md 한 편을 RegulationDocument 로 바꾼다.
 * - `## ` = 장·부칙, `### 제N조 (제목)` = 조, 그 밖의 `###` = 소제목
 * - 번역본(regulations/i18n/{en,ja,zh})은 `Article N-M (Title)`, `第N条のM（見出し）`,
 *   `第N條之M（標題）` 로 조를 쓴다. 앵커(a6, a3-2)는 언어와 관계없이 같다
 * - `<!-- 검토 N -->` 주석은 내부 검토 메모라 출력에 절대 남기지 않는다
 */

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/
const HTML_COMMENT = /<!--[\s\S]*?-->\n?/g
const TITLE_TAIL = String.raw`\s*(?:[(（]([^)）]*)[)）])?\s*(.*)$`
const ARTICLE_HEADINGS: readonly { pattern: RegExp; label: (n: string, b?: string) => string }[] = [
  {
    pattern: new RegExp(String.raw`^제\s*(\d+)\s*조(?:\s*의\s*(\d+))?` + TITLE_TAIL),
    label: (n, b) => `제${n}조${b ? `의${b}` : ''}`,
  },
  {
    pattern: new RegExp(String.raw`^Article\s+(\d+)(?:-(\d+))?` + TITLE_TAIL),
    label: (n, b) => `Article ${n}${b ? `-${b}` : ''}`,
  },
  {
    pattern: new RegExp(String.raw`^第\s*(\d+)\s*条(?:\s*の\s*(\d+))?` + TITLE_TAIL),
    label: (n, b) => `第${n}条${b ? `の${b}` : ''}`,
  },
  {
    pattern: new RegExp(String.raw`^第\s*(\d+)\s*條(?:\s*之\s*(\d+))?` + TITLE_TAIL),
    label: (n, b) => `第${n}條${b ? `之${b}` : ''}`,
  },
]
const ADDENDUM_HEADING = /^(?:부\s*칙|附\s*則|Addend)/
const ASSET_PREFIX = './assets/'

function parseFrontmatter(source: string): { meta: Record<string, string>; body: string } {
  const match = FRONTMATTER.exec(source)
  if (!match) return { meta: {}, body: source }
  // prettier 가 긴 값을 들여쓴 다음 줄로 내린다 (`key:\n  'value'`) — 이어지는 줄을 앞 값에 붙인다
  const raw: Record<string, string> = {}
  let lastKey: string | null = null
  for (const line of match[1]!.split('\n')) {
    if (/^\s/.test(line) && lastKey) {
      raw[lastKey] = `${raw[lastKey]} ${line.trim()}`.trim()
      continue
    }
    const separator = line.indexOf(':')
    if (separator === -1) continue
    lastKey = line.slice(0, separator).trim()
    raw[lastKey] = line.slice(separator + 1).trim()
  }
  const meta: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    meta[key] = value.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1')
  }
  return { meta, body: source.slice(match[0].length) }
}

function toInlines(tokens: Token[] | undefined, ctx: RegulationLinkContext): Inline[] {
  if (!tokens) return []
  return tokens.flatMap((token): Inline[] => {
    switch (token.type) {
      case 'strong':
        return [{ kind: 'strong', children: toInlines(token.tokens, ctx) }]
      case 'em':
        return [{ kind: 'em', children: toInlines(token.tokens, ctx) }]
      case 'del':
        return toInlines(token.tokens, ctx)
      case 'link':
        return [resolveLink(token as Tokens.Link, ctx)]
      case 'br':
        return [{ kind: 'break' }]
      case 'html':
      case 'image':
        return []
      case 'text':
        return token.tokens?.length ? toInlines(token.tokens, ctx) : splitStrayStrong(token.text)
      default:
        return 'text' in token && typeof token.text === 'string'
          ? [{ kind: 'text', text: token.text }]
          : []
    }
  })
}

/**
 * CommonMark 는 `)**을` 처럼 구두점 뒤·한글 조사 앞의 `**` 를 닫는 기호로 보지 않는다.
 * 그래서 `**전체 회원(준회원 포함)**에게` 가 별표째 글자로 남는다 — 한 글자 노드 안에
 * 짝이 맞는 `**…**` 가 남아 있으면 그 부분만 굵게 되살린다.
 */
const STRAY_STRONG = /\*\*([^*]+?)\*\*/g

function splitStrayStrong(text: string): Inline[] {
  const parts: Inline[] = []
  let cursor = 0
  for (const match of text.matchAll(STRAY_STRONG)) {
    const start = match.index ?? 0
    if (start > cursor) parts.push({ kind: 'text', text: text.slice(cursor, start) })
    parts.push({ kind: 'strong', children: [{ kind: 'text', text: match[1]! }] })
    cursor = start + match[0].length
  }
  if (cursor < text.length) parts.push({ kind: 'text', text: text.slice(cursor) })
  return parts
}

function resolveLink(token: Tokens.Link, ctx: RegulationLinkContext): Inline {
  const children = toInlines(token.tokens, ctx)
  const legacy = token.href.startsWith('#') ? ctx.legacyAnchors[token.href.slice(1)] : undefined
  const href = legacy ?? token.href
  return { kind: 'link', href, external: /^https?:\/\//.test(href), children }
}

function collectFigures(tokens: Token[] | undefined): RegulationFigure[] {
  return (tokens ?? []).flatMap(token =>
    token.type === 'image' && token.href.startsWith(ASSET_PREFIX)
      ? [{ file: token.href.slice(ASSET_PREFIX.length), alt: token.text }]
      : []
  )
}

export function inlineText(inlines: Inline[]): string {
  return inlines
    .map(inline => {
      if (inline.kind === 'text') return inline.text
      if (inline.kind === 'break') return ' '
      return inlineText(inline.children)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function toBlocks(tokens: Token[], ctx: RegulationLinkContext): Block[] {
  return tokens.flatMap((token): Block[] => {
    switch (token.type) {
      case 'paragraph': {
        const figures = collectFigures(token.tokens)
        const inlines = toInlines(token.tokens, ctx)
        const blocks: Block[] = []
        if (inlineText(inlines)) blocks.push({ kind: 'paragraph', inlines })
        if (figures.length) blocks.push({ kind: 'figures', figures })
        return blocks
      }
      case 'text':
        return [{ kind: 'paragraph', inlines: toInlines(token.tokens ?? [token], ctx) }]
      case 'list': {
        const list = token as Tokens.List
        return [
          {
            kind: 'list',
            ordered: list.ordered,
            start: typeof list.start === 'number' ? list.start : 1,
            items: list.items.map(item => toBlocks(item.tokens, ctx)),
          },
        ]
      }
      case 'table': {
        const table = token as Tokens.Table
        return [
          {
            kind: 'table',
            header: table.header.map(cell => toInlines(cell.tokens, ctx)),
            rows: table.rows.map(row => row.map(cell => toInlines(cell.tokens, ctx))),
          },
        ]
      }
      case 'blockquote':
        return [{ kind: 'note', blocks: toBlocks(token.tokens ?? [], ctx) }]
      case 'heading':
        return [{ kind: 'subheading', inlines: toInlines(token.tokens, ctx) }]
      default:
        return []
    }
  })
}

function blockText(block: Block): string {
  switch (block.kind) {
    case 'paragraph':
    case 'subheading':
      return inlineText(block.inlines)
    case 'note':
      return block.blocks.map(blockText).join(' ')
    default:
      return ''
  }
}

interface ArticleHeading {
  label: string
  title: string
  anchor: string
}

function matchArticle(text: string): ArticleHeading | null {
  for (const { pattern, label } of ARTICLE_HEADINGS) {
    const match = pattern.exec(text)
    if (!match) continue
    const [, number, branch, paren, rest] = match
    return {
      label: label(number!, branch),
      title: (paren ?? rest ?? '').trim(),
      anchor: `a${number}${branch ? `-${branch}` : ''}`,
    }
  }
  return null
}

export function parseRegulation(source: string, ctx: RegulationLinkContext): RegulationDocument {
  const { meta, body } = parseFrontmatter(source)
  const effectiveNote = meta.effective_note ?? ''
  const tokens = Lexer.lex(body.replace(HTML_COMMENT, ''))

  const sections: RegulationSection[] = []
  const usedIds = new Set<string>()
  let tableCount = 0
  let title = meta.title ?? ''
  let article: RegulationArticle | null = null

  const currentSection = (): RegulationSection => {
    if (sections.length === 0) {
      sections.push({ id: 's1', title: '', isAddendum: false, blocks: [], articles: [] })
    }
    return sections[sections.length - 1]!
  }

  const pushBlocks = (blocks: Block[]) => {
    if (article) article.blocks.push(...blocks)
    else currentSection().blocks.push(...blocks)
  }

  for (const token of tokens) {
    if (token.type === 'table') tableCount += 1

    if (token.type === 'heading') {
      const text = inlineText(toInlines(token.tokens, ctx))
      if (token.depth === 1) {
        title = title || text
        continue
      }
      if (token.depth === 2) {
        article = null
        sections.push({
          id: `s${sections.length + 1}`,
          title: text,
          isAddendum: ADDENDUM_HEADING.test(text),
          blocks: [],
          articles: [],
        })
        continue
      }
      const heading = token.depth === 3 ? matchArticle(text) : null
      if (heading) {
        const section = currentSection()
        const id = usedIds.has(heading.anchor) ? `${section.id}-${heading.anchor}` : heading.anchor
        usedIds.add(id)
        article = { id, label: heading.label, title: heading.title, blocks: [] }
        section.articles.push(article)
        continue
      }
    }

    const blocks = toBlocks([token], ctx)
    // 머리 인용문 `> [시행 …]` 은 머리말 effective_note 와 같은 내용이라 한 번만 보여준다
    const isEffectiveQuote =
      blocks.length === 1 &&
      blocks[0]!.kind === 'note' &&
      effectiveNote !== '' &&
      blockText(blocks[0]!) === effectiveNote
    if (!isEffectiveQuote) pushBlocks(blocks)
  }

  return {
    title,
    titleEn: meta.title_en ?? '',
    effectiveNote,
    status: meta.status ?? '',
    sections: sections.filter(section => section.blocks.length || section.articles.length),
    articleCount: sections.reduce((sum, section) => sum + section.articles.length, 0),
    tableCount,
  }
}
