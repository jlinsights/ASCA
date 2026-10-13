'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import { BrandSection } from './brand-section'
import { CLASSICAL_COMPOUNDS, LOGO_RULE_KEYS, LOGO_VARIANTS, OFFICIAL_NAMES } from './brand-data'

/** 01 브랜드 정신 — 네 개의 사자성어와 풀이 */
export function BrandEssence({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='essence'
      index={index}
      eyebrow='Essence'
      title={t('brandEssenceTitle')}
      lede={t('brandEssenceLede')}
    >
      <ul className='brand-compounds'>
        {CLASSICAL_COMPOUNDS.map(compound => (
          <li key={compound.tc} className='brand-compound'>
            <p className='brand-compound__tc' lang='zh-Hant'>
              {compound.tc}
            </p>
            <p className='brand-compound__gloss'>{t(compound.glossKey)}</p>
          </li>
        ))}
      </ul>
    </BrandSection>
  )
}

/** 02 공식 명칭 — BRAND.md §1 */
export function BrandNames({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='names'
      index={index}
      eyebrow='Naming'
      title={t('brandNamesTitle')}
      lede={t('brandNamesLede')}
    >
      <table className='brand-table brand-table--names'>
        <thead>
          <tr>
            <th scope='col'>{t('brandNameForm')}</th>
            <th scope='col'>{t('brandNameValue')}</th>
            <th scope='col'>{t('brandNameUse')}</th>
          </tr>
        </thead>
        <tbody>
          {OFFICIAL_NAMES.map(name => (
            <tr key={name.labelKey}>
              <th scope='row'>{t(name.labelKey)}</th>
              <td>
                <span className='brand-name' lang={name.lang}>
                  {name.value}
                </span>
              </td>
              <td className='brand-table__use'>{t(name.useKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </BrandSection>
  )
}

/** 03 로고 — 바탕별 세 가지 색 */
export function BrandLogo({ index }: { index: number }) {
  const { t } = useLanguage()
  return (
    <BrandSection
      id='logo'
      index={index}
      eyebrow='Logo'
      title={t('brandLogoTitle')}
      lede={t('brandLogoLede')}
    >
      <ul className='brand-logos'>
        {LOGO_VARIANTS.map(variant => (
          <li key={variant.src} className='brand-logo'>
            <div className={cn('brand-logo__plate', `brand-logo__plate--${variant.ground}`)}>
              <Image
                src={variant.src}
                alt={`Oriental Calligraphy — ${t(variant.labelKey)}`}
                width={505}
                height={325}
              />
            </div>
            <p className='brand-logo__label'>{t(variant.labelKey)}</p>
          </li>
        ))}
      </ul>
      <ol className='brand-rules' style={{ marginTop: '2rem' }}>
        {LOGO_RULE_KEYS.map(key => (
          <li key={key}>{t(key)}</li>
        ))}
      </ol>
    </BrandSection>
  )
}
