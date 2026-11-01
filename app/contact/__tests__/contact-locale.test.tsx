import { render, screen, within } from '@testing-library/react'
import {
  CHANNELS,
  OBJECTION_DEADLINES,
  OBJECTION_DISMISSALS,
  OBJECTION_FIELDS,
  OBJECTION_SOURCES,
  OBJECTION_TYPES,
  OFFICE_SOURCES,
  TOPICS,
} from '../_components/contact-data'
import { CONTACT_COPY } from '../_components/contact-locale'
import { inquiryTranslations } from '@/lib/i18n/translations/inquiry'
import { SIMPLIFIED_ONLY_CHARS } from '@/lib/i18n/simplified-only'
import { ContactView } from '../_components/contact-view'

let language: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language, t: (key: string) => key }),
}))
jest.mock('next/navigation', () => ({ usePathname: () => '/contact' }))
jest.mock('@/components/faq/site-faq-list', () => ({ SiteFaqList: () => null }))
jest.mock('../_components/inquiry-composer', () => ({ InquirySection: () => null }))

afterEach(() => {
  language = 'ko'
})

describe('/contact 번역 목록', () => {
  it.each(['en', 'ja', 'zh'] as const)('%s 목록이 한국어 원본과 같은 순서·길이다', lang => {
    const copy = CONTACT_COPY[lang]
    expect(copy.topics.items).toHaveLength(TOPICS.length)
    expect(copy.channels.items).toHaveLength(CHANNELS.length)
    expect(copy.objection.fields).toHaveLength(OBJECTION_FIELDS.length)
    expect(copy.objection.deadlines).toHaveLength(OBJECTION_DEADLINES.length)
    expect(copy.objection.types).toHaveLength(OBJECTION_TYPES.length)
    expect(copy.objection.dismissals).toHaveLength(OBJECTION_DISMISSALS.length)
    expect(copy.objection.sources).toHaveLength(OBJECTION_SOURCES.length)
    expect(copy.address.sources).toHaveLength(OFFICE_SOURCES.length)
  })

  it('중국어는 번체만 쓴다 (AGENTS.md — 간체 금지)', () => {
    const text = JSON.stringify(CONTACT_COPY.zh) + JSON.stringify(inquiryTranslations.zh)
    expect(SIMPLIFIED_ONLY_CHARS.filter(char => text.includes(char))).toStrictEqual([])
  })

  it('한국어는 규정 대조 원본(contact-data)을 그대로 쓴다', () => {
    expect(CONTACT_COPY.ko.objection.fields).toEqual(OBJECTION_FIELDS)
    expect(CONTACT_COPY.ko.objection.dismissals).toEqual(OBJECTION_DISMISSALS)
    expect(CONTACT_COPY.ko.topics.items.map(item => item.title)).toEqual(
      TOPICS.map(topic => topic.title)
    )
  })
})

describe('ContactView', () => {
  it('영어를 고르면 영어로 보이고, 링크·규정 근거 주소는 그대로다', () => {
    language = 'en'
    render(<ContactView />)
    expect(screen.getByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()

    const topics = screen.getByRole('region', { name: 'How can we help?' })
    expect(within(topics).getByRole('link', { name: /Contest entries/ })).toHaveAttribute(
      'href',
      '/application'
    )

    const objection = screen.getByRole('region', { name: 'Objection procedure' })
    expect(within(objection).getByRole('link', { name: 'Art. 4' })).toHaveAttribute(
      'href',
      '/regulations/objections#a4'
    )
    expect(within(objection).getByText('Within 14 business days of receipt')).toBeInTheDocument()
  })

  it('번호·이메일처럼 번역하지 않는 값은 원래 값으로 보인다', () => {
    language = 'ja'
    render(<ContactView />)
    const channels = screen.getByRole('region', { name: 'どちらにご連絡いただけますか' })
    const email = CHANNELS.find(channel => channel.title === '이메일')
    expect(within(channels).getByText(email?.value ?? '')).toBeInTheDocument()
  })
})
