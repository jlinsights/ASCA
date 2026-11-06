import { fireEvent, render, screen, within } from '@testing-library/react'
import { FaqView } from '../_components/faq-view'
import { FAQ_GROUPS, SITE_FAQ } from '@/lib/content/site-faq'

let language = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language }),
}))

afterEach(() => {
  language = 'ko'
  window.history.replaceState(null, '', '/faq')
})

describe('/faq 화면', () => {
  it('주제 묶음마다 제목과 질문 수를 보이고, 모든 질문을 버튼으로 둔다', () => {
    render(<FaqView />)
    for (const group of FAQ_GROUPS) {
      const region = screen.getByRole('region', { name: group.titleKey })
      expect(within(region).getAllByRole('button')).toHaveLength(group.ids.length)
    }
    expect(screen.getAllByRole('button')).toHaveLength(SITE_FAQ.length)
  })

  it('처음엔 모두 접혀 있고, 질문을 누르면 답과 근거가 열린다', () => {
    render(<FaqView />)
    const awards = SITE_FAQ.find(item => item.id === 'awards')
    const trigger = screen.getByRole('button', { name: new RegExp(awards?.q ?? '') })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/삼체상: 4명/)).toBeInTheDocument()
    expect(screen.getByText('faqSources')).toBeInTheDocument()
  })

  it('주소의 #id 가 가리키는 질문은 펼친 채로 연다', () => {
    window.history.replaceState(null, '', '/faq#dues')
    Element.prototype.scrollIntoView = jest.fn()
    render(<FaqView />)
    const dues = SITE_FAQ.find(item => item.id === 'dues')
    expect(screen.getByRole('button', { name: new RegExp(dues?.q ?? '') })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('다른 언어에서는 질문·답·근거 이름을 번역으로 보이고, 근거 주소는 원문 그대로다', () => {
    language = 'en'
    render(<FaqView />)
    const trigger = screen.getByRole('button', { name: /What are the awards and prize money/ })
    fireEvent.click(trigger)
    expect(screen.getByText(/Three-Script Prize: 4 winners/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Regulations on Operation and Judging, Art. 7' })
    ).toHaveAttribute('href', '/regulations/operation-judging#a7')
    expect(screen.queryByText('faqAnswerLanguage')).not.toBeInTheDocument()
  })

  // 회귀: 상담 시간이 한국어 상수(월–금 오전 10시 – 오후 5시)로 고정돼 모든 언어에 찍혔다
  it('상담 시간은 고른 언어의 번역으로 보인다', () => {
    render(<FaqView />)
    expect(screen.getByText(/contactOfficeHours/)).toBeInTheDocument()
    expect(screen.queryByText(/오전 10시/)).not.toBeInTheDocument()
  })

  // 회귀: FAQ 상담 시간(10 am – 5 pm)과 연락처 카드(10 AM – 5 PM (KST))가 언어마다 달랐다
  it('상담 시간 번역은 연락처 카드와 같은 글자다', () => {
    const { translations } = jest.requireActual('@/lib/i18n/translations')
    const { CONTACT_LABELS } = jest.requireActual('@/app/contests/_components/contest-i18n')
    for (const lang of ['ko', 'en', 'ja', 'zh']) {
      expect(translations[lang].contactOfficeHours).toBe(CONTACT_LABELS[lang].bookingBody)
    }
  })

  it('사무국 메일과 문의 페이지로 가는 길을 둔다', () => {
    render(<FaqView />)
    expect(screen.getByRole('link', { name: 'info@orientalcalligraphy.org' })).toHaveAttribute(
      'href',
      'mailto:info@orientalcalligraphy.org'
    )
    expect(screen.getByRole('link', { name: /faqContactPage/ })).toHaveAttribute('href', '/contact')
  })
})
