import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface HomeSectionHeadProps {
  id: string
  eyebrow: string
  tc: string
  title: string
  more: { label: string; href: string }
}

export function HomeSectionHead({ id, eyebrow, tc, title, more }: HomeSectionHeadProps) {
  return (
    <div className='asca-section__head'>
      <div>
        <p className='asca-eyebrow'>{eyebrow}</p>
        <p className='asca-section__tc' lang='zh-Hant'>
          {tc}
        </p>
        <h2 id={id} className='asca-section__title'>
          {title}
        </h2>
      </div>
      <Link href={more.href} className='asca-btn asca-btn--ghost'>
        {more.label} <ArrowUpRight aria-hidden='true' />
      </Link>
    </div>
  )
}
