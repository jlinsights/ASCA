import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, REGULATIONS } from '../catalog'
import { parseRegulation } from '../parse'
import type { RegulationDocument } from '../types'

// 번역본(regulations/i18n/<언어>/)은 한국어 원문과 조·장·표 구조가 같아야 한다.
// 조 앵커(a6, a3-2)가 같아야 어느 언어로 보든 같은 링크가 같은 조문을 가리킨다.

const ROOT = path.join(__dirname, '..', '..', '..', 'regulations')
const ctx = { legacyAnchors: LEGACY_ANCHORS }
const LANGUAGES = ['en', 'ja', 'zh'] as const

const LABEL: Record<(typeof LANGUAGES)[number], RegExp> = {
  en: /^Article \d+(-\d+)?$/,
  ja: /^第\d+条(の\d+)?$/,
  zh: /^第\d+條(之\d+)?$/,
}

function parse(file: string): { source: string; doc: RegulationDocument } {
  const source = readFileSync(file, 'utf8')
  return { source, doc: parseRegulation(source, ctx) }
}

function shape(doc: RegulationDocument) {
  return {
    sections: doc.sections.map(section => ({
      isAddendum: section.isAddendum,
      hasTitle: section.title !== '',
      // 문단 나눔은 언어마다 다를 수 있어 조 앵커만 비교한다
      articles: section.articles.map(article => article.id),
      blocks: section.blocks.length,
    })),
    tableCount: doc.tableCount,
  }
}

describe('parseRegulation — 번역본 조 제목', () => {
  it.each([
    ['### Article 3-2 (Disqualification)', 'Article 3-2', 'Disqualification', 'a3-2'],
    ['### 第3条の2（除斥）', '第3条の2', '除斥', 'a3-2'],
    ['### 第3條之2（迴避）', '第3條之2', '迴避', 'a3-2'],
    ['### Article 41', 'Article 41', '', 'a41'],
  ])('%s', (heading, label, title, id) => {
    const { articles } = parseRegulation(`# T\n\n${heading}\n\n본문\n`, ctx).sections[0]!
    expect(articles[0]).toMatchObject({ label, title, id })
  })

  it.each(['## Addenda <No. 1, 2023. 08. 24>', '## 附則 <第1号、2023. 08. 24>'])(
    '%s 는 부칙으로 읽는다',
    heading => {
      const doc = parseRegulation(`# T\n\n${heading}\n\n### Article 1 (X)\n\nY\n`, ctx)
      expect(doc.sections[0]!.isAddendum).toBe(true)
    }
  )
})

describe.each(LANGUAGES)('번역본 %s', language => {
  it.each(REGULATIONS.map(entry => [entry.slug, entry.file] as const))(
    '%s: 원문과 장·조·표 구조가 같다',
    (_slug, file) => {
      const target = path.join(ROOT, 'i18n', language, file)
      expect(existsSync(target)).toBe(true)
      const original = parse(path.join(ROOT, file)).doc
      const { source, doc } = parse(target)

      expect(shape(doc)).toEqual(shape(original))
      expect(doc.title).not.toBe('')
      expect(doc.title).not.toBe(original.title)
      expect(doc.titleEn).toBe('')
      for (const article of doc.sections.flatMap(section => section.articles)) {
        expect(article.label).toMatch(LABEL[language])
      }
      // 내부 검토 주석·한국어 조 표기가 번역본에 남지 않는다
      expect(source).not.toMatch(/<!--/)
      expect(source).not.toMatch(/^### 제\s*\d+\s*조/m)
    }
  )
})
