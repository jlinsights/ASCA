'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export type AuthVariant = 'sign-in' | 'sign-up'

interface AuthArt {
  src: string
  phrase: string
  labelKey: string
  glossKey: string
  altKey: string
}

// 패널 글귀는 이미지에 실제로 쓰인 것(입춘첩) 또는 협회 표어만 쓴다.
const ART: Record<AuthVariant, AuthArt> = {
  'sign-in': {
    src: '/images/artworks/calligraphy-scene-3.jpg',
    phrase: '立春大吉 建陽多慶',
    labelKey: 'authArtSignInLabel',
    glossKey: 'authArtSignInGloss',
    altKey: 'authArtSignInAlt',
  },
  'sign-up': {
    src: '/images/artworks/calligraphy-scene-5.jpg',
    phrase: '法古創新 · 人書俱老',
    labelKey: 'authArtSignUpLabel',
    glossKey: 'homeHeroGloss',
    altKey: 'authArtSignUpAlt',
  },
}

const COPY = {
  'sign-in': {
    eyebrow: 'authSignInEyebrow',
    title: 'authSignInTitle',
    lede: 'authSignInLede',
    switchText: 'authSignInSwitch',
    switchLink: 'authSignInSwitchLink',
    switchHref: '/sign-up',
  },
  'sign-up': {
    eyebrow: 'authSignUpEyebrow',
    title: 'authSignUpTitle',
    lede: 'authSignUpLede',
    switchText: 'authSignUpSwitch',
    switchLink: 'authSignUpSwitchLink',
    switchHref: '/sign-in',
  },
} as const

interface AuthShellProps {
  variant: AuthVariant
  children: ReactNode
}

export function AuthShell({ variant, children }: AuthShellProps) {
  const { t, language } = useLanguage()
  const copy = COPY[variant]
  const art = ART[variant]
  const captionId = `asca-auth-caption-${variant}`
  // 중국어는 글귀 자체가 원문이라 풀이를 되풀이하지 않는다.
  const showGloss = language !== 'zh'

  return (
    <div className='asca-auth' data-variant={variant}>
      <section className='asca-auth__form' aria-labelledby='asca-auth-title'>
        <div className='asca-auth__form-inner'>
          <p className='asca-auth__eyebrow'>{t(copy.eyebrow)}</p>
          <h1 id='asca-auth-title' className='asca-auth__title'>
            {t(copy.title)}
          </h1>
          <p className='asca-auth__lede'>{t(copy.lede)}</p>

          <div className='asca-auth__widget'>{children}</div>

          <p className='asca-auth__switch'>
            {t(copy.switchText)}{' '}
            <Link href={copy.switchHref} className='asca-auth__link'>
              {t(copy.switchLink)}
            </Link>
          </p>
        </div>

        <footer className='asca-auth__legal'>
          <Link href='/'>{t('authHome')}</Link>
          <Link href='/terms-of-service'>{t('authTerms')}</Link>
          <Link href='/privacy-policy'>{t('authPrivacy')}</Link>
        </footer>
      </section>

      <figure className='asca-auth__art' aria-labelledby={captionId}>
        <Image
          src={art.src}
          alt={t(art.altKey)}
          fill
          priority
          sizes='(max-width: 1024px) 0px, 50vw'
          className='asca-auth__art-img'
        />
        <span className='asca-auth__seal' lang='zh-Hant' aria-hidden='true'>
          印
        </span>
        <figcaption id={captionId} className='asca-auth__caption'>
          <span className='asca-auth__caption-label'>{t(art.labelKey)}</span>
          <span className='asca-auth__caption-phrase' lang='zh-Hant'>
            {art.phrase}
          </span>
          {showGloss && <span className='asca-auth__caption-gloss'>{t(art.glossKey)}</span>}
        </figcaption>
      </figure>
    </div>
  )
}
