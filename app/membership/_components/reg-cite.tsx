import Link from 'next/link'
import type { RegSource } from './membership-data'

interface RegCiteProps {
  sources: readonly RegSource[]
  className?: string
}

/** 근거 조문 — 읽는 사람이 원문을 바로 확인할 수 있게 /regulations 해당 조로 잇는다 */
export function RegCite({ sources, className }: RegCiteProps) {
  if (sources.length === 0) return null
  return (
    <p className={['asca-mb__cite', className].filter(Boolean).join(' ')}>
      <span className='asca-mb__cite-label'>근거</span>
      {sources.map((source, index) => (
        <span key={source.href}>
          {index > 0 && <span aria-hidden='true'> · </span>}
          <Link href={source.href} className='asca-mb__cite-link'>
            {source.label}
          </Link>
        </span>
      ))}
    </p>
  )
}
