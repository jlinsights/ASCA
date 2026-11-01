import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { KakaoChatButton } from '../kakao-chat-button'
import { KAKAO_CHAT_URL } from '@/lib/content/contact-info'

function renderIn(lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <KakaoChatButton />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('KakaoChatButton', () => {
  it('운영 중인 카카오톡 채널의 1:1 채팅으로 새 탭에서 연결한다', async () => {
    renderIn('ko')

    const link = await screen.findByRole('link', { name: '카카오톡 상담 (새 탭)' })
    expect(link).toHaveAttribute('href', KAKAO_CHAT_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('title', '카카오톡 상담')
  })

  it('채팅 주소가 채널 _xkchGj 의 chat 경로다', () => {
    expect(KAKAO_CHAT_URL).toBe('https://pf.kakao.com/_xkchGj/chat')
  })

  it.each([
    ['en', 'Chat on KakaoTalk (opens in a new tab)', 'Chat on KakaoTalk'],
    ['ja', 'カカオトークで相談（新しいタブで開く）', 'カカオトークで相談'],
    ['zh', 'KakaoTalk 諮詢（在新分頁開啟）', 'KakaoTalk 諮詢'],
  ])('%s 로 바꾸면 접근 이름과 툴팁도 그 언어다', async (lang, name, title) => {
    renderIn(lang)

    const link = await screen.findByRole('link', { name })
    expect(link).toHaveAttribute('title', title)
  })
})
