'use client'

import { useLanguage } from '@/contexts/language-context'

export function IntroductionsHero() {
  const { t } = useLanguage()

  return (
    <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
      <div className='container mx-auto px-4 text-center'>
        <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
          {t('introEyebrow')}
        </p>
        <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-4'>{t('introTitle')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>{t('introLede')}</p>
        <p className='mt-3 text-sm italic text-scholar-red/80'>{t('introMotto')}</p>
        <p className='text-xs text-muted-foreground mt-1'>Where Tradition Flows Contemporary</p>
      </div>
    </section>
  )
}
