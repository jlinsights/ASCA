import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InquiryComposer, InquirySection } from '../_components/inquiry-composer'
import { inquiryTranslations } from '@/lib/i18n/translations/inquiry'
import { INQUIRY_LIMITS } from '@/lib/inquiries/schema'

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

  it('문의서 영역 제목도 선택한 언어로 보인다', () => {
    language = 'ja'
    render(<InquirySection />)
    expect(
      screen.getByRole('region', { name: '作品・ご依頼・展覧会のお問い合わせ' })
    ).toHaveAttribute('id', 'inquiry')
  })

  describe('사이트로 보내기', () => {
    const fill = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole('radio', { name: /휘호·작품 의뢰/ }))
      await user.type(screen.getByLabelText(/^이름/), '홍길동')
      await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
      await user.type(screen.getByLabelText(/예산·희망 일정/), '내년 봄')
      await user.type(screen.getByLabelText(/문의 내용/), '현판을 부탁드립니다')
    }
    // jsdom 에는 fetch·Response 가 없다 — 쓰는 만큼만 흉내 낸다
    const respond = (status: number, body: unknown) => {
      const fetchMock = jest.fn().mockResolvedValue({ status, json: async () => body })
      Object.defineProperty(global, 'fetch', {
        configurable: true,
        writable: true,
        value: fetchMock,
      })
      return fetchMock
    }

    it('동의하지 않으면 보내지 않고 동의 칸으로 초점을 옮긴다', async () => {
      const user = userEvent.setup()
      const fetchMock = respond(201, { ok: true, id: 'x' })
      render(<InquiryComposer />)
      await fill(user)
      await user.click(screen.getByRole('button', { name: '문의 보내기' }))

      expect(fetchMock).not.toHaveBeenCalled()
      expect(screen.getByRole('checkbox', { name: /개인정보 수집·이용에 동의/ })).toHaveFocus()
      expect(screen.getByText(/동의해 주세요/)).toBeInTheDocument()
    })

    it('201 이면 접수 완료를 알리고 문의서를 비운다', async () => {
      const user = userEvent.setup()
      const fetchMock = respond(201, { ok: true, id: 'abc' })
      render(<InquiryComposer />)
      await fill(user)
      await user.click(screen.getByRole('checkbox', { name: /개인정보 수집·이용에 동의/ }))
      await user.click(screen.getByRole('button', { name: '문의 보내기' }))

      expect(await screen.findByText('문의를 접수했습니다.')).toBeInTheDocument()
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('/api/inquiries')
      expect(JSON.parse(String(init.body))).toMatchObject({
        topic: 'commission',
        name: '홍길동',
        plan: '내년 봄',
        language: 'ko',
        consent: true,
        website: '',
      })
      expect(screen.getByLabelText(/^이름/)).toHaveValue('')
      expect(screen.getByRole('status')).toHaveFocus()
    })

    it('실패하면 접수됐다고 하지 않고, 글을 그대로 둔 채 메일·카카오톡을 권한다', async () => {
      const user = userEvent.setup()
      respond(503, { code: 'UNAVAILABLE' })
      render(<InquiryComposer />)
      await fill(user)
      await user.click(screen.getByRole('checkbox', { name: /개인정보 수집·이용에 동의/ }))
      await user.click(screen.getByRole('button', { name: '문의 보내기' }))

      expect(await screen.findByText(/사이트로 보내지 못했습니다/)).toBeInTheDocument()
      expect(screen.queryByText('문의를 접수했습니다.')).not.toBeInTheDocument()
      expect(screen.getByLabelText(/^이름/)).toHaveValue('홍길동')
      expect(screen.getByRole('button', { name: '메일로 보내기' })).toBeInTheDocument()
    })

    it('201 이어도 ok 가 없으면 실패로 본다', async () => {
      const user = userEvent.setup()
      respond(201, {})
      render(<InquiryComposer />)
      await fill(user)
      await user.click(screen.getByRole('checkbox', { name: /개인정보 수집·이용에 동의/ }))
      await user.click(screen.getByRole('button', { name: '문의 보내기' }))
      expect(await screen.findByText(/사이트로 보내지 못했습니다/)).toBeInTheDocument()
    })

    it('응답을 기다리는 동안 입력을 잠그고 다시 보내지 않는다 (Codex #216)', async () => {
      const user = userEvent.setup()
      let finish: (value: { status: number; json: () => Promise<unknown> }) => void = () => {}
      const fetchMock = jest.fn(() => new Promise(resolve => (finish = resolve)))
      Object.defineProperty(global, 'fetch', {
        configurable: true,
        writable: true,
        value: fetchMock,
      })
      render(<InquiryComposer />)
      await fill(user)
      await user.click(screen.getByRole('checkbox', { name: /개인정보 수집·이용에 동의/ }))
      await user.click(screen.getByRole('button', { name: '문의 보내기' }))

      const message = screen.getByLabelText(/문의 내용/)
      expect(message).toBeDisabled()
      expect(screen.getByRole('button', { name: '보내는 중…' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '메일로 보내기' })).toBeDisabled()
      fireEvent.submit(message.closest('form') as HTMLFormElement)
      expect(fetchMock).toHaveBeenCalledTimes(1)

      await act(async () => finish({ status: 201, json: async () => ({ ok: true, id: 'abc' }) }))
      expect(await screen.findByText('문의를 접수했습니다.')).toBeInTheDocument()
      expect(screen.getByLabelText(/문의 내용/)).not.toBeDisabled()
    })

    it('칸마다 서버와 같은 길이 제한을 건다 (Codex #216)', async () => {
      const user = userEvent.setup()
      render(<InquiryComposer />)
      await user.click(screen.getByRole('radio', { name: /휘호·작품 의뢰/ }))
      const limits: [RegExp | string, number][] = [
        [/^이름/, INQUIRY_LIMITS.name],
        ['이메일', INQUIRY_LIMITS.email],
        ['전화번호', INQUIRY_LIMITS.phone],
        [/관련 작품/, INQUIRY_LIMITS.subject],
        [/예산·희망 일정/, INQUIRY_LIMITS.plan],
        [/문의 내용/, INQUIRY_LIMITS.message],
      ]
      for (const [label, max] of limits)
        expect(screen.getByLabelText(label)).toHaveAttribute('maxlength', String(max))
    })

    it('덫 칸은 화면 읽기 도구와 키보드에서 숨어 있다', () => {
      render(<InquiryComposer />)
      const trap = document.getElementById('inquiry-website')
      expect(trap).toHaveAttribute('tabindex', '-1')
      expect(trap?.closest('[aria-hidden="true"]')).not.toBeNull()
    })
  })
})
