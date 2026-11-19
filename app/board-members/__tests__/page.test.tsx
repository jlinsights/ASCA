import { render, screen, within } from '@testing-library/react'
import BoardMembersPage from '../page'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/about/about-motion', () => ({ AboutMotion: () => null }))
jest.mock('@/components/about/about-nav', () => ({ AboutNav: () => null }))

// 큰 글자(호)·이름·직책을 한 사람 단위로 읽는다
function people(sectionTitle: string) {
  const section = screen.getByRole('heading', { level: 3, name: sectionTitle }).closest('section')!
  return within(section)
    .getAllByRole('listitem')
    .map(item => ({
      art: item.querySelector('.ab-person__art')?.textContent,
      name: item.querySelector('.ab-person__name')?.textContent,
      role: item.querySelector('.ab-person__role')?.textContent,
    }))
}

describe('/board-members 임원진', () => {
  it('호는 한자로 보이고, 화면 읽기 프로그램에는 한글 읽기를 준다', () => {
    render(<BoardMembersPage />)

    expect(people('이사장 | 운영위원장')).toEqual([
      { art: '宇晨', name: '임재홍 (호 우신)', role: '이사장' },
    ])
    expect(people('고문').map(p => p.art)).toEqual(['土偶', '知庸', '中觀', '虎岩'])
    expect(people('심사위원장')[0]).toMatchObject({ art: '芽南', name: '배옥영 (호 아남)' })
  })

  it('한자가 없는 순우리말 호(한솔)만 한글로 둔다', () => {
    render(<BoardMembersPage />)
    const hangulArtNames = [...document.querySelectorAll('.ab-person__art')]
      .map(el => el.textContent ?? '')
      .filter(text => /[가-힣]/.test(text))
    expect(hangulArtNames).toEqual(['한솔'])
  })

  it('청주 지부장은 등곡 김진헌이고, 전임 서천 김정희는 싣지 않는다 (2026-11-01)', () => {
    render(<BoardMembersPage />)
    const branch = people('지부장')
    expect(branch.find(p => p.role === '청주 지부장')).toEqual({
      art: '登谷',
      name: '김진헌 (호 등곡)',
      role: '청주 지부장',
    })
    expect(screen.queryByText(/김정희/)).not.toBeInTheDocument()
  })
})
