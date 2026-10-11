'use client'

import { useLanguage } from '@/contexts/language-context'

export function HistoryHero() {
  const { t } = useLanguage()

  return (
    <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
      <div className='container mx-auto px-4 text-center'>
        <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
          {t('historyEyebrow')}
        </p>
        <h1 className='text-3xl md:text-4xl font-bold mb-4'>{t('historyTitle')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
          {t('historyLede')}
        </p>
      </div>
    </section>
  )
}
