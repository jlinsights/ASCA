import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InquiryComposer } from '../_components/inquiry-composer'
import { inquiryTranslations } from '@/lib/i18n/translations/inquiry'

let language: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language,
    t: (key: string) => inquiryTranslations[language]?.[key] ?? key,
  }),
}))

describe('InquiryComposer', () => {
  afterEach(() => {
    language = 'ko'
    window.history.replaceState(null, '', '/')
    jest.restoreAllMocks()
  })

  it('빈 채로 보내면 오류를 칸에 연결하고 첫 칸에 초점을 둔다', async () => {
    const user = userEvent.setup()
    render(<InquiryComposer />)
    await user.click(screen.getByRole('button', { name: '메일로 보내기' }))

    expect(screen.getByText('용건을 골라 주세요.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /작품 구입·소장/ })).toHaveFocus()
    expect(screen.getByLabelText(/이름/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/이름/).getAttribute('aria-describedby')).toContain(
      'inquiry-name-error'
    )
  })

  it('견적이 필요한 용건에서만 예산·일정 칸을 보이고, 안내가 있는 용건은 안내를 권한다', async () => {
    const user = userEvent.setup()
    render(<InquiryComposer />)
    expect(screen.queryByLabelText(/예산·희망 일정/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /휘호·작품 의뢰/ }))
    expect(screen.getByLabelText(/예산·희망 일정/)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /강좌·교육/ }))
    expect(screen.queryByLabelText(/예산·희망 일정/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /강좌 안내 먼저 보기/ })).toHaveAttribute(
      'href',
      '/academy'
    )
  })

  it('작품 상세에서 온 주소로 용건과 관련 작품을 채운다', async () => {
    window.history.replaceState(null, '', '/contact?topic=artwork&about=난초')
    render(<InquiryComposer />)
    await waitFor(() => expect(screen.getByRole('radio', { name: /작품 구입·소장/ })).toBeChecked())
    expect(screen.getByLabelText(/관련 작품·작가/)).toHaveValue('난초')
  })

  it('카카오톡: 복사가 막히면 직접 복사할 글을 보여 준다', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    })
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<InquiryComposer />)

    await user.click(screen.getByRole('radio', { name: /그 밖의 문의/ }))
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.type(screen.getByLabelText('전화번호'), '010-1234-5678')
    await user.type(screen.getByLabelText(/문의 내용/), '안녕하세요')
    await user.click(screen.getByRole('button', { name: /카카오톡으로 보내기/ }))

    const copy = await screen.findByLabelText('보낼 문의 내용')
    expect((copy as HTMLTextAreaElement).value).toContain('이름: 홍길동')
    expect(open).not.toHaveBeenCalled()
  })

  it('카카오톡: 복사되면 팝업을 띄우지 않고 채널 열기 링크로 초점을 옮긴다', async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<InquiryComposer />)

    await user.click(screen.getByRole('radio', { name: /그 밖의 문의/ }))
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
    await user.type(screen.getByLabelText(/문의 내용/), '안녕하세요')
    await user.click(screen.getByRole('button', { name: /카카오톡으로 보내기/ }))

    expect(await screen.findByText(/문의 내용을 복사했습니다/)).toBeInTheDocument()
    expect(writeText.mock.calls[0][0]).toContain('[문의] 그 밖의 문의')
    // 비동기 복사 뒤의 window.open 은 팝업 차단될 수 있어 쓰지 않는다
    expect(open).not.toHaveBeenCalled()
    const channel = screen.getByRole('link', { name: /카카오톡 채널 열기/ })
    expect(channel).toHaveAttribute('href', expect.stringContaining('pf.kakao.com'))
    expect(channel).toHaveFocus()
  })

  it('선택한 언어로 보이되, 사무국에 보내는 글은 한국어로 남긴다', async () => {
    language = 'en'
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<InquiryComposer />)

    await user.click(screen.getByRole('button', { name: 'Send by email' }))
    expect(screen.getByText('Please choose a topic.')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Commission a work/ }))
    await user.type(screen.getByLabelText(/^Name/), 'Lee')
    await user.type(screen.getByLabelText('Email'), 'lee@example.com')
    await user.type(screen.getByLabelText(/^Message/), 'Hello')
    await user.click(screen.getByRole('button', { name: /Send via KakaoTalk/ }))

    expect(await screen.findByRole('link', { name: /Open KakaoTalk channel/ })).toHaveFocus()
    expect(writeText.mock.calls[0][0]).toContain('[문의] 휘호·작품 의뢰')
  })

  it('4개 언어의 문의서 키가 빠짐없이 같다', () => {
    const keys = Object.keys(inquiryTranslations.ko).sort()
    for (const lang of ['en', 'ja', 'zh'] as const) {
      expect(Object.keys(inquiryTranslations[lang]).sort()).toEqual(keys)
    }
  })
})
