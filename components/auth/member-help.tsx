'use client'

import { useLanguage } from '@/contexts/language-context'
import { EMAIL, PHONE } from '@/lib/content/contact-info'

export function MemberHelp() {
  const { t } = useLanguage()
  return (
    <aside className='asca-member-help' aria-label={t('authNativeOffice')}>
      <p>{t('authNativeHelp')}</p>
      <a href={PHONE.href}>
        {t('authNativeOffice')} ☎ {PHONE.display}
      </a>
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </aside>
  )
}
