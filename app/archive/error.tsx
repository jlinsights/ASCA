'use client'
import { useLanguage } from '@/contexts/language-context'
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useLanguage()
  return (
    <div role='alert' className='py-20 text-center'>
      <h1 className='text-2xl font-serif mb-4'>{t('arUnavailable')}</h1>
      <p className='text-muted-foreground mb-6'>{t('arUnavailableHint')}</p>
      <button onClick={reset} className='bg-primary text-primary-foreground rounded-md px-6 py-3'>
        {t('retry')}
      </button>
    </div>
  )
}
