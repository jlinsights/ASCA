// 문의서 — 용건을 먼저 고르고, 메일 앱이나 카카오톡으로 보낼 글을 만든다 (2026-11-01).
// 서버로 접수하지 않는다: 보내기는 방문자의 메일 앱·카카오톡이 한다. 그래서 '접수 완료' 화면이 없다.

export type InquiryTopicId =
  | 'artwork'
  | 'commission'
  | 'exhibition'
  | 'academy'
  | 'membership'
  | 'other'

export interface InquiryTopic {
  id: InquiryTopicId
  label: string
  hint: string
  /** 이미 답이 정리된 안내 페이지 — 문의 전에 먼저 권한다 */
  guide?: { label: string; href: string }
  /** 예산·일정 칸을 보일 용건 — 견적이 필요한 일 */
  asksPlan?: boolean
}

export const INQUIRY_TOPICS: readonly InquiryTopic[] = [
  {
    id: 'artwork',
    label: '작품 구입·소장',
    hint: '보신 작품의 소장 가능 여부와 가격',
    asksPlan: true,
  },
  {
    id: 'commission',
    label: '휘호·작품 의뢰',
    hint: '현판·글씨·선물용 작품 제작 견적',
    asksPlan: true,
  },
  {
    id: 'exhibition',
    label: '전시·대관·협업',
    hint: '기획전, 브랜드·기관 협업 제안',
    asksPlan: true,
  },
  {
    id: 'academy',
    label: '강좌·교육',
    hint: '수강, 단체 강의, 출강 요청',
    guide: { label: '강좌 안내', href: '/academy' },
  },
  {
    id: 'membership',
    label: '회원·공모전',
    hint: '입회, 출품, 승급',
    guide: { label: '회원 안내', href: '/membership' },
  },
  { id: 'other', label: '그 밖의 문의', hint: '위에 없는 용건' },
]

export function findInquiryTopic(id: string | null | undefined): InquiryTopic | undefined {
  return INQUIRY_TOPICS.find(topic => topic.id === id)
}

export interface InquiryDraft {
  topic: InquiryTopicId | ''
  name: string
  email: string
  phone: string
  /** 관련 작품·작가 — 작품 상세의 '이 작품 문의'가 채운다 */
  subject: string
  plan: string
  message: string
}

export type InquiryField = 'topic' | 'name' | 'contact' | 'message'

export const EMPTY_INQUIRY: InquiryDraft = {
  topic: '',
  name: '',
  email: '',
  phone: '',
  subject: '',
  plan: '',
  message: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 빠진 칸과 그 이유. 비어 있으면 보낼 수 있다 */
export function validateInquiry(draft: InquiryDraft): Partial<Record<InquiryField, string>> {
  const errors: Partial<Record<InquiryField, string>> = {}
  if (!draft.topic) errors.topic = '용건을 골라 주세요.'
  if (!draft.name.trim()) errors.name = '이름을 적어 주세요.'
  const email = draft.email.trim()
  if (!email && !draft.phone.trim()) {
    errors.contact = '답을 받으실 이메일이나 전화번호 중 하나를 적어 주세요.'
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.contact = '이메일 주소 형식을 확인해 주세요.'
  }
  if (!draft.message.trim()) errors.message = '문의 내용을 적어 주세요.'
  return errors
}

/** 메일 본문이 너무 길면 일부 메일 앱이 주소를 자른다 — 본문을 이만큼에서 끊는다 */
export const MAILTO_BODY_LIMIT = 1800

export function inquirySubject(draft: InquiryDraft): string {
  const topic = findInquiryTopic(draft.topic)?.label ?? '문의'
  const about = draft.subject.trim()
  return `[문의] ${topic}${about ? ` — ${about}` : ''}`
}

export function inquiryBody(draft: InquiryDraft): string {
  const optional: Array<[string, string]> = [
    ['이메일', draft.email],
    ['전화', draft.phone],
    ['관련 작품·작가', draft.subject],
    ['예산·일정', draft.plan],
  ]
  return [
    `용건: ${findInquiryTopic(draft.topic)?.label ?? ''}`,
    `이름: ${draft.name.trim()}`,
    ...optional
      .filter(([, value]) => value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`),
    '',
    draft.message.trim(),
    '',
    '— orientalcalligraphy.org 문의서에서 작성',
  ].join('\n')
}

/**
 * 글자 단위로 자른다. slice() 는 이모지·확장 한자(서로게이트 쌍) 가운데를 끊을 수 있고,
 * 끊긴 문자열은 encodeURIComponent 에서 URIError 를 낸다 (Codex #214).
 */
export function clipText(text: string, maxUnits: number): string {
  let out = ''
  for (const char of text) {
    if (out.length + char.length > maxUnits) break
    out += char
  }
  return out
}

/** 메일 앱에 넘길 본문 — 길면 끊고 끊었다고 적는다 */
export function mailtoBody(draft: InquiryDraft): string {
  const body = inquiryBody(draft)
  if (body.length <= MAILTO_BODY_LIMIT) return body
  return `${clipText(body, MAILTO_BODY_LIMIT)}\n…(내용이 길어 일부가 잘렸습니다. 나머지는 이어서 적어 주세요.)`
}

/** 작품·작가 상세에서 문의서를 채워 여는 주소 */
export function inquiryHref(topic: InquiryTopicId, subject?: string): string {
  const params = new URLSearchParams({ topic })
  if (subject) params.set('about', subject)
  return `/contact?${params.toString()}#inquiry`
}

/** 주소의 ?topic=&about= — 알 수 없는 용건은 버리고, 관련 작품은 글자로만 받는다 */
export function draftFromSearch(search: string): Partial<InquiryDraft> {
  const params = new URLSearchParams(search)
  const topic = findInquiryTopic(params.get('topic'))?.id
  const about = clipText((params.get('about') ?? '').trim(), 120)
  return {
    ...(topic ? { topic } : {}),
    ...(about ? { subject: about } : {}),
  }
}
