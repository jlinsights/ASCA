'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import { BrandSection } from './brand-section'
import { COLOR_LADDERS, CORE_SWATCHES, SEMANTIC_ROLES } from './brand-data'

/** 색상값을 클립보드에 복사하고, 화면 낭독기에 알린다. 복사가 막힌 환경(권한·http)은 조용히 넘어간다. */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      window.setTimeout(() => setCopied(current => (current === hex ? null : current)), 1600)
    } catch {
      setCopied(null)
    }
  }
  return { copied, copy }
}

/** 04 색 — 핵심 색, 단계, 화면 역할(라이트/다크) */
export function BrandColor({ index }: { index: number }) {
  const { t } = useLanguage()
  const { copied, copy } = useCopy()

  return (
    <BrandSection
      id='color'
      index={index}
      eyebrow='Colour'
      title={t('brandColorTitle')}
      lede={t('brandColorLede')}
    >
      <p className='sr-only' aria-live='polite'>
        {copied ? `${t('brandCopied')} ${copied}` : ''}
      </p>

      <h3 className='brand-subhead'>{t('brandColorCore')}</h3>
      <ul className='brand-core'>
        {CORE_SWATCHES.map(swatch => (
          <li key={swatch.hex}>
            <button
              type='button'
              className='brand-chip'
              onClick={() => copy(swatch.hex)}
              aria-label={`${t('brandCopyHex')} ${swatch.name} ${swatch.hex}`}
            >
              <span
                className={cn('brand-chip__fill', `brand-chip__fill--${swatch.on}`)}
                style={{ background: swatch.hex }}
              >
                <span>{copied === swatch.hex ? t('brandCopied') : swatch.hex}</span>
              </span>
              <span className='brand-chip__meta'>
                <span className='brand-chip__name'>{swatch.name}</span>
                <span className='brand-chip__usage'>{t(swatch.usageKey)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {COLOR_LADDERS.map(ladder => (
        <div key={ladder.titleKey}>
          <h3 className='brand-subhead'>{t(ladder.titleKey)}</h3>
          <ul className='brand-ladder'>
            {ladder.steps.map(step => (
              <li key={step.hex} style={{ display: 'grid' }}>
                <button
                  type='button'
                  className={cn('brand-step', `brand-step--${step.on}`)}
                  style={{ background: step.hex }}
                  onClick={() => copy(step.hex)}
                  aria-label={`${t('brandCopyHex')} ${step.name} ${step.hex}`}
                >
                  <span className='brand-step__name'>{step.name}</span>
                  <span className='brand-step__hex'>
                    {copied === step.hex ? t('brandCopied') : step.hex}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className='brand-note'>{t('brandColorRule')}</p>

      <h3 className='brand-subhead'>{t('brandColorSemantic')}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className='brand-table'>
          <thead>
            <tr>
              <th scope='col'>{t('brandColorRole')}</th>
              <th scope='col'>{t('brandColorLight')}</th>
              <th scope='col'>{t('brandColorDark')}</th>
            </tr>
          </thead>
          <tbody>
            {SEMANTIC_ROLES.map(role => (
              <tr key={role.token}>
                <th scope='row'>
                  <code className='brand-mono'>--{role.token}</code>
                </th>
                <td>
                  <span className='brand-dot' style={{ background: role.light }} />
                  <span className='brand-mono'>{role.light}</span>
                </td>
                <td>
                  <span className='brand-dot' style={{ background: role.dark }} />
                  <span className='brand-mono'>{role.dark}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BrandSection>
  )
}
