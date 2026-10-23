import Link from 'next/link'
import type { RegSource } from './academy-data'

interface RegCiteProps {
  sources: readonly RegSource[]
}

/** 근거 조문 — 인용한 문구의 원문을 /regulations 해당 조에서 바로 확인할 수 있게 잇는다 */
export function RegCite({ sources }: RegCiteProps) {
  if (sources.length === 0) return null
  return (
    <p className='asca-ac__cite'>
      <span className='asca-ac__cite-label'>근거</span>
      {sources.map((source, index) => (
        <span key={source.href}>
          {index > 0 && <span aria-hidden='true'> · </span>}
          <Link href={source.href} className='asca-ac__cite-link'>
            {source.label}
          </Link>
        </span>
      ))}
    </p>
  )
}
