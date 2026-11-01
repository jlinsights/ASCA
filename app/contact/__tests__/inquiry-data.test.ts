import {
  EMPTY_INQUIRY,
  MAILTO_BODY_LIMIT,
  draftFromSearch,
  inquiryBody,
  inquiryHref,
  inquirySubject,
  mailtoBody,
  validateInquiry,
} from '../_components/inquiry-data'

const filled = {
  ...EMPTY_INQUIRY,
  topic: 'artwork' as const,
  name: '홍길동',
  email: 'hong@example.com',
  message: '소장 가능한지 궁금합니다.',
}

describe('validateInquiry', () => {
  it('빈 문의서는 용건·이름·연락처·내용을 모두 요구한다', () => {
    expect(Object.keys(validateInquiry(EMPTY_INQUIRY)).sort()).toEqual(
      ['contact', 'message', 'name', 'topic'].sort()
    )
  })

  it('전화번호만 있어도 연락처로 받는다', () => {
    expect(validateInquiry({ ...filled, email: '', phone: '010-1234-5678' })).toEqual({})
  })

  it('이메일 형식이 틀리면 알린다', () => {
    expect(validateInquiry({ ...filled, email: 'hong@' }).contact).toMatch('형식')
  })
})

describe('보낼 글', () => {
  it('제목에 용건과 관련 작품을 담는다', () => {
    expect(inquirySubject({ ...filled, subject: '난초 — 김작가' })).toBe(
      '[문의] 작품 구입·소장 — 난초 — 김작가'
    )
  })

  it('비어 있는 칸은 본문에 넣지 않는다', () => {
    const body = inquiryBody(filled)
    expect(body).toContain('이메일: hong@example.com')
    expect(body).not.toContain('전화:')
    expect(body).not.toContain('예산·일정')
    expect(body.split('\n').slice(0, 3)).toEqual([
      '용건: 작품 구입·소장',
      '이름: 홍길동',
      '이메일: hong@example.com',
    ])
  })

  it('긴 본문은 잘랐다고 적는다', () => {
    const body = mailtoBody({ ...filled, message: '가'.repeat(MAILTO_BODY_LIMIT * 2) })
    expect(body).toContain('일부가 잘렸습니다')
    expect(body.length).toBeLessThan(MAILTO_BODY_LIMIT + 100)
  })
})

describe('주소로 채우기', () => {
  it('inquiryHref 로 만든 주소를 다시 읽는다', () => {
    const href = inquiryHref('artwork', '난초 — 김작가')
    const search = href.slice(href.indexOf('?'), href.indexOf('#'))
    expect(draftFromSearch(search)).toEqual({ topic: 'artwork', subject: '난초 — 김작가' })
  })

  it('모르는 용건은 버리고 관련 작품은 120자로 자른다', () => {
    const draft = draftFromSearch(`?topic=hack&about=${'가'.repeat(200)}`)
    expect(draft.topic).toBeUndefined()
    expect(draft.subject).toHaveLength(120)
  })
})
