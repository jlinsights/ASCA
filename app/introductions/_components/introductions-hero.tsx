'use client'

import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'

export function IntroductionsHero() {
  const { t } = useLanguage()

  return (
    <PageHero {...PAGE_HERO_MARKS.introductions} title={t('introTitle')} lede={t('introLede')}>
      <p className='text-sm italic text-scholar-red/80'>{t('introMotto')}</p>
      <p className='text-xs text-muted-foreground'>Where Tradition Flows Contemporary</p>
    </PageHero>
  )
}
