/**
 * 화면에 공개하는 규정 목록. regulations/ 폴더를 glob 하지 않는다 —
 * 같은 폴더의 CHANGE-PROPOSALS.md(오류 수정 제안서)는 내부 문서라 공개 대상이 아니다.
 */

export interface RegulationEntry {
  slug: string
  file: string
  /** 옛 /articles-of-incorporation-and-bylaws 페이지의 섹션 id. 리다이렉트된 #앵커를 받는다 */
  legacyId: string
  /** 메뉴·목록에 쓰는 이름의 번역 키 */
  nameKey: string
  /** 한자 표기 (장식용 세로 글자) */
  hanja: string
}

export const REGULATIONS_BASE_PATH = '/regulations'

export const REGULATIONS: readonly RegulationEntry[] = [
  {
    slug: 'articles',
    file: '00-articles-of-incorporation.md',
    legacyId: 'Articles-of-Incorporation',
    nameKey: 'regsNameArticles',
    hanja: '定款',
  },
  {
    slug: 'membership-dues',
    file: '01-membership-and-dues.md',
    legacyId: 'Regulations-on-Membership-and-Dues',
    nameKey: 'regsNameMembership',
    hanja: '會費',
  },
  {
    slug: 'operation-judging',
    file: '02-operation-and-review.md',
    legacyId: 'Regulations-on-Operation-and-Review',
    nameKey: 'regsNameOperation',
    hanja: '審査',
  },
  {
    slug: 'exhibition',
    file: '03-exhibition.md',
    legacyId: 'Regulations-on-Exhibition-Management-and-Operation',
    nameKey: 'regsNameExhibition',
    hanja: '展示',
  },
  {
    slug: 'artist-selection',
    file: '04-recommended-invited-artists.md',
    legacyId: 'Regulations-on-the-Appointment-of-Recommended-and-Invited-Artists',
    nameKey: 'regsNameArtistSelection',
    hanja: '選任',
  },
  {
    slug: 'appraisal',
    file: '05-appraisal-certificate.md',
    legacyId: 'Regulations-on-Artwork-Appraisal-and-Certificate-Issuance',
    nameKey: 'regsNameAppraisal',
    hanja: '鑑定',
  },
  {
    slug: 'branches',
    file: '06-branches-chapters.md',
    legacyId: 'Regulations-on-the-Establishment-and-Operation-of-Branches-and-Chapters',
    nameKey: 'regsNameBranches',
    hanja: '支部',
  },
  {
    slug: 'objections',
    file: '07-objections.md',
    legacyId: 'Regulations-on-the-Handling-of-Objections',
    nameKey: 'regsNameObjections',
    hanja: '異議',
  },
  {
    slug: 'qualifications',
    file: '08-membership-qualifications.md',
    legacyId: 'Qualification-and-Requirements',
    nameKey: 'regsNameQualifications',
    hanja: '資格',
  },
]

export const REGULATION_ASSETS: readonly string[] = [
  '05-certificate-form-1.png',
  '05-certificate-form-2.png',
  '05-certificate-form-3.png',
]

export function regulationHref(slug: string): string {
  return `${REGULATIONS_BASE_PATH}/${slug}`
}

export function findRegulation(slug: string): RegulationEntry | undefined {
  return REGULATIONS.find(entry => entry.slug === slug)
}

export const LEGACY_ANCHORS: Readonly<Record<string, string>> = Object.fromEntries(
  REGULATIONS.map(entry => [entry.legacyId, regulationHref(entry.slug)])
)
