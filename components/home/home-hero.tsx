'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { HomeStats } from './home-data'
import { HomePromotions } from './home-promotions'

// 교류국 수는 연혁 원문(1997년 韓·中·日 書藝文化交流聯合會展)에 근거한다.
const EXCHANGE_NATIONS = { count: 3, tc: '韓 · 中 · 日' } as const

interface HomeHeroProps {
  stats: HomeStats
}

export function HomeHero({ stats }: HomeHeroProps) {
  const { t, language } = useLanguage()
  const gloss = t('homeHeroGloss')
  // 영어는 서수 접미사가 숫자마다 달라 단위를 붙이지 않는다(라벨이 'Editions of …').
  // t() 는 빈 문자열을 키 이름으로 돌려주므로 번역표에 '' 를 두지 않고 여기서 거른다.
  const editionUnit = language === 'en' ? null : t('homeStatEditionUnit')

  return (
    <section className='asca-hero' aria-labelledby='asca-hero-title'>
      <div className='asca-hero__frame'>
        <HomePromotions />

        <div className='asca-hero__copy'>
          <p className='asca-eyebrow asca-hero__eyebrow'>{t('homeHeroEyebrow')}</p>
          <h1 id='asca-hero-title' className='asca-hero__title'>
            {t('homeHeroTitle')}
          </h1>
          <p className='asca-hero__slogan'>
            <span lang='zh-Hant'>法古創新 · 人書俱老</span>
            {language !== 'zh' && gloss && <span className='asca-slogan-gloss'>{gloss}</span>}
          </p>
          <p className='asca-hero__lede'>{t('homeHeroLede')}</p>
          <div className='asca-hero__cta'>
            {/* 첫 방문자의 두 행동 — 문의를 시작하거나, 작품부터 둘러본다 (2026-11-01) */}
            <Link href='/contact#inquiry' className='asca-btn asca-btn--primary'>
              {t('homeHeroInquiry')} <ArrowUpRight aria-hidden='true' />
            </Link>
            <Link href='/artworks' className='asca-btn asca-btn--link'>
              {t('homeHeroBrowse')}
            </Link>
          </div>
        </div>
      </div>

      <div className='asca-hero__ledger'>
        <dl className='asca-hero__ledger-inner'>
          <div className='asca-hero__stat'>
            <dt>{t('homeStatSince')}</dt>
            <dd>{stats.sinceYear}</dd>
          </div>
          {stats.grandExhibitionEdition !== null && (
            <div className='asca-hero__stat'>
              <dt>{t('homeStatEdition')}</dt>
              <dd>
                {stats.grandExhibitionEdition}
                {editionUnit && <em>{editionUnit}</em>}
              </dd>
            </div>
          )}
          <div className='asca-hero__stat'>
            <dt>{t('homeStatExhibitions')}</dt>
            <dd>{stats.exhibitionCount}</dd>
          </div>
          <div className='asca-hero__stat'>
            <dt>
              {t('homeStatCountries')} · <span lang='zh-Hant'>{EXCHANGE_NATIONS.tc}</span>
            </dt>
            <dd>{EXCHANGE_NATIONS.count}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
