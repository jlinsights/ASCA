import { render, screen } from '@testing-library/react'
import type { Block } from '@/lib/regulations/types'
import { Blocks } from '../regulation-body'

// 회귀: 일본어·중국어 표에서 "青年作家"·"10万ウォン" 같은 짧은 칸이 글자 단위로 쪼개졌다.
// 긴 설명 칸이 표 너비를 다 가져가면 짧은 칸이 한두 글자 폭으로 줄어든다 — 짧은 칸은 줄바꿈하지 않는다.

const text = (value: string) => [{ kind: 'text' as const, text: value }]

const table: Block = {
  kind: 'table',
  header: [text('区分'), text('資格'), text('年会費')],
  rows: [
    [
      text('青年作家'),
      text('当該年の1月1日基準で満40歳以下の作家であって、協会の理念と目的に賛同する者'),
      text('10万ウォン'),
    ],
    [text('Officer'), text('Elected by the General Assembly'), text('KRW 100,000')],
  ],
}

describe('Blocks — 규정 표', () => {
  beforeEach(() => render(<Blocks blocks={[table]} tableLabel='표' />))

  it('짧은 칸(11자 이하)은 줄바꿈하지 않는다', () => {
    expect(screen.getByText('青年作家')).toHaveClass('asca-regs-table__short')
    expect(screen.getByText('10万ウォン')).toHaveClass('asca-regs-table__short')
    expect(screen.getByText('KRW 100,000')).toHaveClass('asca-regs-table__short')
  })

  it('긴 설명 칸은 그대로 줄바꿈한다', () => {
    expect(screen.getByText(/当該年の1月1日基準/)).not.toHaveClass('asca-regs-table__short')
  })
})
