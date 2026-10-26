'use client'

import { AboutHero } from '@/components/about/about-layout'
import { useLanguage } from '@/contexts/language-context'

export function IntroductionsHero() {
  const { t } = useLanguage()

  return (
    <AboutHero tc='槪要' title={t('introTitle')} lede={t('introLede')}>
      <p>{t('introMotto')}</p>
      <p>Where Tradition Flows Contemporary</p>
    </AboutHero>
  )
}
