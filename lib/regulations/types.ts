/**
 * 정관·규정 마크다운(regulations/*.md)을 화면용으로 바꾼 구조.
 * 렌더러는 HTML 문자열이 아니라 이 트리만 받는다 — innerHTML 경로가 없다.
 */

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; children: Inline[] }
  | { kind: 'em'; children: Inline[] }
  | { kind: 'link'; href: string; external: boolean; children: Inline[] }
  | { kind: 'break' }

export interface RegulationFigure {
  /** regulations/assets/ 안의 파일 이름 */
  file: string
  alt: string
}

export type Block =
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'subheading'; inlines: Inline[] }
  | { kind: 'list'; ordered: boolean; start: number; items: Block[][] }
  | { kind: 'table'; header: Inline[][]; rows: Inline[][][] }
  | { kind: 'note'; blocks: Block[] }
  | { kind: 'figures'; figures: RegulationFigure[] }

export interface RegulationArticle {
  /** 문서 안에서 유일한 앵커. 부칙이 제1조부터 다시 세므로 조 번호만으로는 겹친다. */
  id: string
  /** '제12조', '제3조의2' */
  label: string
  /** 괄호 속 제목. 없으면 빈 문자열 */
  title: string
  blocks: Block[]
}

export interface RegulationSection {
  id: string
  /** '제1장 총 칙', '부칙 (附則)'. 장 구분이 없는 규정의 첫 묶음은 빈 문자열 */
  title: string
  isAddendum: boolean
  /** 첫 조 앞에 오는 본문 */
  blocks: Block[]
  articles: RegulationArticle[]
}

export interface RegulationDocument {
  title: string
  titleEn: string
  effectiveNote: string
  status: string
  sections: RegulationSection[]
  articleCount: number
  tableCount: number
}

export type TranslatedLanguage = 'en' | 'ja' | 'zh'

/** 한국어 원문 외의 참고용 번역본. 없는 언어는 원문을 보여준다 */
export type RegulationTranslations = Partial<Record<TranslatedLanguage, RegulationDocument>>

export interface RegulationLinkContext {
  /** 옛 단일 페이지의 섹션 앵커(#Articles-of-Incorporation) → 새 경로 */
  legacyAnchors: Readonly<Record<string, string>>
}
