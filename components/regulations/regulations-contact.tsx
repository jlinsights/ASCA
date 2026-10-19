'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function RegulationsContact() {
  const { t } = useLanguage()
  return (
    <section className='asca-regs-contact' aria-labelledby='regs-contact-title'>
      <div>
        <h2 id='regs-contact-title'>{t('regsContactTitle')}</h2>
        <p>{t('regsContactBody')}</p>
      </div>
      <Link href='/contact' className='asca-btn asca-btn--primary'>
        {t('regsContactCta')} <ArrowUpRight aria-hidden='true' />
      </Link>
    </section>
  )
}
