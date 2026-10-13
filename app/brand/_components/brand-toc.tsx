'use client'

import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { BRAND_SECTIONS } from './brand-data'

/** 목차 — 데스크톱은 왼쪽 고정 세로 목록, 좁은 화면은 가로로 넘기는 띠 */
export function BrandToc() {
  const { t } = useLanguage()
  const [active, setActive] = useState<string>(BRAND_SECTIONS[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    )
    for (const section of BRAND_SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav className='brand-toc' aria-label={t('brandOnThisPage')}>
      <p className='brand-toc__label'>{t('brandOnThisPage')}</p>
      <ol className='brand-toc__list'>
        {BRAND_SECTIONS.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className='brand-toc__link'
              aria-current={active === section.id ? 'true' : undefined}
            >
              {t(section.navKey)}
            </a>
          </li>
        ))}
      </ol>
      <a
        className='brand-toc__contact'
        href='mailto:info@orientalcalligraphy.org?subject=Brand%20guidelines'
      >
        <Mail aria-hidden='true' className='h-4 w-4' strokeWidth={1.5} />
        {t('brandContact')}
      </a>
    </nav>
  )
}
