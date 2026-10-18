/**
 * Badge hover 회귀 테스트
 *
 * tailwind.config.ts 가 var 색에 투명도를 붙일 수 있게 된 뒤(#69) 배지 variant 의
 * hover:bg-primary/80 이 처음으로 렌더되어, className 으로 배경을 바꾼 배지가 hover 시
 * 남색 면에 글자가 묻혔다. 배지 variant 는 hover 배경을 두지 않는다.
 */
import { render, screen } from '@testing-library/react'

import { Badge } from '@/components/ui/badge'

describe('Badge — variant 에 hover 배경이 없다', () => {
  it.each(['default', 'secondary', 'destructive'] as const)(
    '%s variant 에 hover:bg-* 클래스가 없다',
    variant => {
      render(<Badge variant={variant}>라벨</Badge>)
      expect(screen.getByText('라벨').className).not.toMatch(/hover:bg-/)
    }
  )

  it('className 으로 준 hover 는 그대로 남는다 (클릭되는 배지용)', () => {
    render(<Badge className='cursor-pointer hover:bg-muted'>필터</Badge>)
    expect(screen.getByText('필터').className).toMatch(/hover:bg-muted/)
  })
})
