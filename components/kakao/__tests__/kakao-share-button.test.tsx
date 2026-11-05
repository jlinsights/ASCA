import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ArtistShareButton, KakaoShareButton } from '../kakao-share-button'
import { shareToKakaoTalk } from '@/lib/kakao'
import { toast } from 'sonner'

let mockLanguage = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: mockLanguage, t: (key: string) => key }),
}))
jest.mock('@/lib/kakao', () => ({ shareToKakaoTalk: jest.fn() }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const share = shareToKakaoTalk as jest.Mock
const sentTemplate = () => share.mock.calls[0][0]

afterEach(() => {
  mockLanguage = 'ko'
  jest.clearAllMocks()
})

describe('KakaoShareButton 문구 번역', () => {
  // 카드 라벨(#228)은 번역했지만 공유 단추·카카오 메시지·알림은 한국어로 남았다
  it('en: 단추·메시지 단추·기본 설명·성공 알림을 영어로 쓴다', async () => {
    mockLanguage = 'en'
    share.mockResolvedValue(true)
    render(<ArtistShareButton title='Kim' description='' webUrl='/artists/1' />)
    fireEvent.click(screen.getByRole('button', { name: 'Share on KakaoTalk' }))
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(sentTemplate().buttons[0].title).toBe('View artist profile')
    expect(sentTemplate().content.description).toMatch(/Asian Society of Calligraphic Arts/)
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Shared to KakaoTalk 📤'))
  })

  it('ja: 실패 알림을 일본어로 쓴다', async () => {
    mockLanguage = 'ja'
    share.mockResolvedValue(false)
    render(<KakaoShareButton title='x' description='d' webUrl='/x' />)
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('共有できませんでした。もう一度お試しください。')
    )
  })

  it('zh: 아이콘 단추의 이름(title)을 번체로 쓴다', () => {
    mockLanguage = 'zh'
    render(<ArtistShareButton title='x' description='d' webUrl='/x' isIconOnly />)
    expect(screen.getByRole('button', { name: '分享至 KakaoTalk' })).toBeInTheDocument()
  })

  it('ko: 기존 한국어 문구를 그대로 쓴다', async () => {
    share.mockResolvedValue(true)
    render(<ArtistShareButton title='김작가' description='' webUrl='/artists/1' />)
    fireEvent.click(screen.getByRole('button', { name: '카카오톡 공유' }))
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(sentTemplate().buttons[0].title).toBe('작가 프로필 보기')
    expect(sentTemplate().content.description).toBe('동양서예협회의 뛰어난 작가를 만나보세요')
  })
})
