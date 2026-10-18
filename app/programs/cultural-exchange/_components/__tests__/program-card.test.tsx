/**
 * ProgramCard 날짜·금액 고정 형식 테스트 — 하이드레이션 불일치 회귀 방지
 *
 * toLocaleDateString() 을 인자 없이 쓰면 실행 환경의 로케일·시간대를 따른다.
 * 서버(Vercel: en-US·UTC)와 브라우저(ko-KR·Asia/Seoul, 또는 다른 나라)가 다른 글자를 만들어
 * React #418 하이드레이션 오류가 났고, 미국 동부 브라우저에서는 하루 앞당겨 보였다.
 * 환경과 무관하게 같은 글자가 나와야 한다. (확인: LANG=en_US.UTF-8 TZ=America/New_York 로 실행)
 */
import { render, screen } from '@testing-library/react'

import { ProgramCard } from '../program-card'
import { mockPrograms } from '../program-data'

describe('ProgramCard — 환경과 무관한 날짜·금액 형식', () => {
  it('시작일을 한국 형식·서울 날짜로 보여 준다', () => {
    render(<ProgramCard program={mockPrograms[0]!} onSelect={() => {}} />)
    expect(screen.getByText('2025. 3. 15.')).toBeInTheDocument()
  })

  it('참가비를 한국 형식 천 단위 구분으로 보여 준다', () => {
    render(<ProgramCard program={mockPrograms[0]!} onSelect={() => {}} />)
    const fee = mockPrograms[0]!.fee
    expect(screen.getByText(`₩${new Intl.NumberFormat('ko-KR').format(fee)}`)).toBeInTheDocument()
  })
})
