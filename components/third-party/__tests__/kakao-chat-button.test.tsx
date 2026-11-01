import { render, screen } from '@testing-library/react'
import { KakaoChatButton } from '../kakao-chat-button'
import { KAKAO_CHAT_URL } from '@/lib/content/contact-info'

describe('KakaoChatButton', () => {
  it('운영 중인 카카오톡 채널의 1:1 채팅으로 새 탭에서 연결한다', () => {
    render(<KakaoChatButton />)

    const link = screen.getByRole('link', { name: '카카오톡 상담 (새 탭)' })
    expect(link).toHaveAttribute('href', KAKAO_CHAT_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('채팅 주소가 채널 _xkchGj 의 chat 경로다', () => {
    expect(KAKAO_CHAT_URL).toBe('https://pf.kakao.com/_xkchGj/chat')
  })
})
