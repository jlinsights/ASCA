import 'server-only'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { LEGACY_ANCHORS, type RegulationEntry } from './catalog'
import { parseRegulation } from './parse'
import type {
  Block,
  Inline,
  RegulationDocument,
  RegulationTranslations,
  TranslatedLanguage,
} from './types'

export const TRANSLATED_LANGUAGES: readonly TranslatedLanguage[] = ['en', 'ja', 'zh']

/** 빌드 시 정적 생성 단계에서만 읽는다 (각 페이지는 dynamicParams = false) */
export function loadRegulation(entry: RegulationEntry): RegulationDocument {
  const source = readFileSync(path.join(process.cwd(), 'regulations', entry.file), 'utf8')
  return parseRegulation(source, { legacyAnchors: LEGACY_ANCHORS })
}

/** 참고용 번역본(regulations/i18n/<언어>/). 파일이 없는 언어는 한국어 원문으로 대신한다 */
export function loadRegulationTranslations(entry: RegulationEntry): RegulationTranslations {
  const translations: RegulationTranslations = {}
  for (const language of TRANSLATED_LANGUAGES) {
    const file = path.join(process.cwd(), 'regulations', 'i18n', language, entry.file)
    if (!existsSync(file)) continue
    const doc = parseRegulation(readFileSync(file, 'utf8'), { legacyAnchors: LEGACY_ANCHORS })
    translations[language] = language === 'en' ? doc : joinCjkLines(doc)
  }
  return translations
}

// 마크다운 원문은 80자에서 줄을 바꾼다. 띄어쓰기 없는 일본어·중국어에서는 그 줄바꿈이
// 문장 가운데 빈칸으로 남으므로, 한자·가나·전각 문자 사이의 줄바꿈은 지운다
const CJK = String.raw`[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]`
const CJK_SOFT_BREAK = new RegExp(`(?<=${CJK})\\s*\\n\\s*(?=${CJK})`, 'g')

function joinInlines(inlines: Inline[]): Inline[] {
  return inlines.map(inline => {
    if (inline.kind === 'text') return { ...inline, text: inline.text.replace(CJK_SOFT_BREAK, '') }
    if ('children' in inline) return { ...inline, children: joinInlines(inline.children) }
    return inline
  })
}

function joinBlocks(blocks: Block[]): Block[] {
  return blocks.map(block => {
    switch (block.kind) {
      case 'paragraph':
      case 'subheading':
        return { ...block, inlines: joinInlines(block.inlines) }
      case 'list':
        return { ...block, items: block.items.map(joinBlocks) }
      case 'note':
        return { ...block, blocks: joinBlocks(block.blocks) }
      default:
        return block
    }
  })
}

export function joinCjkLines(doc: RegulationDocument): RegulationDocument {
  return {
    ...doc,
    sections: doc.sections.map(section => ({
      ...section,
      blocks: joinBlocks(section.blocks),
      articles: section.articles.map(article => ({
        ...article,
        blocks: joinBlocks(article.blocks),
      })),
    })),
  }
}
