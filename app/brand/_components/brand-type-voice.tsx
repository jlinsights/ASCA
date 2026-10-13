'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import { BrandSection } from './brand-section'
import {
  TYPE_RULE_KEYS,
  TYPE_SCALE,
  TYPE_SPECIMENS,
  VOICE_DO_KEYS,
  VOICE_DONT_KEYS,
} from './brand-data'

/** 05 글꼴 — 역할별 견본, 크기 단계, 한자 조판 규칙 */
export function BrandType({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='type'
      index={index}
      eyebrow='Typography'
      title={t('brandTypeTitle')}
      lede={t('brandTypeLede')}
    >
      <ul className='brand-specs'>
        {TYPE_SPECIMENS.map(spec => (
          <li key={spec.roleKey} className='brand-spec'>
            <p className='brand-spec__role'>
              {t(spec.roleKey)}
              <span className='brand-spec__family' lang='en'>
                {spec.family}
              </span>
            </p>
            <p className={cn('brand-spec__sample', spec.className)} lang={spec.lang}>
              {spec.sample ?? t('brandTypeSample')}
            </p>
          </li>
        ))}
      </ul>

      <h3 className='brand-subhead'>{t('brandTypeScale')}</h3>
      <div className='brand-scale' aria-hidden='true'>
        {TYPE_SCALE.map(px => (
          <div key={px} className='brand-scale__row'>
            <span className='brand-scale__px'>{px}px</span>
            <span className='brand-scale__sample' style={{ fontSize: `${px}px` }}>
              Calligraphy <span lang='zh-Hant'>書藝</span>
            </span>
          </div>
        ))}
      </div>

      <ol className='brand-rules' style={{ marginTop: '2rem' }}>
        {TYPE_RULE_KEYS.map(key => (
          <li key={key}>{t(key)}</li>
        ))}
      </ol>
    </BrandSection>
  )
}

/** 06 말투 — 이렇게 / 이렇게 쓰지 않음 */
export function BrandVoice({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='voice'
      index={index}
      eyebrow='Voice'
      title={t('brandVoiceTitle')}
      lede={t('brandVoiceLede')}
    >
      <div className='brand-voice'>
        <div className='brand-voice__col brand-voice__col--do'>
          <p className='brand-voice__head'>
            <Check aria-hidden='true' strokeWidth={1.5} />
            {t('brandVoiceDo')}
          </p>
          <ul className='brand-voice__list'>
            {VOICE_DO_KEYS.map(key => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className='brand-voice__col brand-voice__col--dont'>
          <p className='brand-voice__head'>
            <X aria-hidden='true' strokeWidth={1.5} />
            {t('brandVoiceDont')}
          </p>
          <ul className='brand-voice__list'>
            {VOICE_DONT_KEYS.map(key => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </div>
    </BrandSection>
  )
}
