'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

// 시안의 JoinForm 은 전송 대상이 없어 옮기지 않았다.
// 입회는 /membership, 문의는 /contact(채널톡)로 보낸다.
export function HomeJoin() {
  const { t } = useLanguage()

  return (
    <section id='join' className='asca-join on-ink' aria-labelledby='asca-join-title'>
      <div className='asca-join__rule' aria-hidden='true' />
      <div className='asca-join__inner'>
        <div>
          <p className='asca-eyebrow'>{t('homeJoinEyebrow')}</p>
          <p className='asca-join__tc' lang='zh-Hant'>
            入會 · 洽詢
          </p>
          <h2 id='asca-join-title' className='asca-join__title'>
            {t('homeJoinTitle')}
          </h2>
          <p className='asca-join__lede'>{t('homeJoinLede')}</p>
        </div>
        <div className='asca-join__cta'>
          <Link href='/membership' className='asca-btn asca-btn--gold'>
            {t('homeJoinCta')} <ArrowUpRight aria-hidden='true' />
          </Link>
          <Link href='/contact' className='asca-btn asca-btn--on-ink'>
            {t('homeJoinContact')}
          </Link>
        </div>
      </div>
    </section>
  )
}
