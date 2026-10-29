import Image from 'next/image'
import Link from 'next/link'
import type { Block, Inline } from '@/lib/regulations/types'
import { REGULATION_FIGURES } from './regulation-figures'

// 규정 본문 렌더러. 파서가 만든 트리만 그린다 — HTML 문자열을 끼워 넣는 경로가 없다.

interface InlinesProps {
  inlines: Inline[]
}

export function Inlines({ inlines }: InlinesProps) {
  return (
    <>
      {inlines.map((inline, index) => {
        switch (inline.kind) {
          case 'text':
            return inline.text
          case 'break':
            return <br key={index} />
          case 'strong':
            return (
              <strong key={index}>
                <Inlines inlines={inline.children} />
              </strong>
            )
          case 'em':
            return (
              <em key={index}>
                <Inlines inlines={inline.children} />
              </em>
            )
          case 'link':
            // mailto:·tel: 은 라우터를 거치지 않는 그냥 링크
            if (/^(mailto|tel):/.test(inline.href)) {
              return (
                <a key={index} href={inline.href}>
                  <Inlines inlines={inline.children} />
                </a>
              )
            }
            return inline.external ? (
              <a key={index} href={inline.href} target='_blank' rel='noopener noreferrer'>
                <Inlines inlines={inline.children} />
              </a>
            ) : (
              <Link key={index} href={inline.href}>
                <Inlines inlines={inline.children} />
              </Link>
            )
        }
      })}
    </>
  )
}

/** 이 글자 수 이하인 표 칸(구분 이름·금액)은 줄바꿈하지 않는다 */
const SHORT_CELL_MAX = 8

function cellLength(inlines: Inline[]): number {
  return inlines.reduce((sum, inline) => {
    if (inline.kind === 'text') return sum + inline.text.trim().length
    if (inline.kind === 'break') return sum + 1
    return sum + cellLength(inline.children)
  }, 0)
}

// 일본어·중국어는 아무 글자 사이에서나 줄을 바꿀 수 있어, 긴 설명 칸이 표 너비를 가져가면
// 짧은 칸이 한두 글자 폭으로 줄어 "青年 / 作家"처럼 쪼개진다
function shortCellClass(inlines: Inline[]): string | undefined {
  return cellLength(inlines) <= SHORT_CELL_MAX ? 'asca-regs-table__short' : undefined
}

type HeadingLevel = 2 | 3 | 4

interface BlocksProps {
  blocks: Block[]
  tableLabel: string
  /** 본문 속 소제목(### 비조문)의 제목 단계 — 감싸는 제목보다 한 단계 아래 */
  headingLevel?: HeadingLevel
}

export function Blocks({ blocks, tableLabel, headingLevel = 3 }: BlocksProps) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} tableLabel={tableLabel} headingLevel={headingLevel} />
      ))}
    </>
  )
}

function BlockView({
  block,
  tableLabel,
  headingLevel,
}: Required<Omit<BlocksProps, 'blocks'>> & { block: Block }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p>
          <Inlines inlines={block.inlines} />
        </p>
      )
    case 'subheading': {
      const Heading = `h${headingLevel}` as const
      return (
        <Heading className='asca-regs-subhead'>
          <Inlines inlines={block.inlines} />
        </Heading>
      )
    }
    case 'note':
      return (
        <aside className='asca-regs-note'>
          <Blocks blocks={block.blocks} tableLabel={tableLabel} headingLevel={headingLevel} />
        </aside>
      )
    case 'list': {
      const items = block.items.map((item, index) => (
        <li key={index}>
          <Blocks blocks={item} tableLabel={tableLabel} headingLevel={headingLevel} />
        </li>
      ))
      return block.ordered ? (
        <ol start={block.start === 1 ? undefined : block.start}>{items}</ol>
      ) : (
        <ul>{items}</ul>
      )
    }
    case 'table':
      return (
        // 좁은 화면에서 표만 가로로 밀린다. 키보드로도 밀 수 있게 초점을 받는다.
        <div className='asca-regs-table' role='region' aria-label={tableLabel} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {block.header.map((cell, index) => (
                  <th key={index} scope='col'>
                    <Inlines inlines={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={shortCellClass(cell)}>
                      <Inlines inlines={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'figures':
      return (
        <div className='asca-regs-figures'>
          {block.figures.map(figure => {
            const image = REGULATION_FIGURES[figure.file]
            if (!image) return null
            return (
              <figure key={figure.file}>
                <Image src={image} alt={figure.alt} sizes='(min-width: 1024px) 22rem, 90vw' />
                <figcaption>{figure.alt}</figcaption>
              </figure>
            )
          })}
        </div>
      )
  }
}
