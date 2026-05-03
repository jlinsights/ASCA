'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { footerLinks } from './footer-data'
import { TranslatedContent } from '../translated-content'

interface LayoutFooterProps {
  variant?: 'default' | 'simple'
}

function SponsorLogo({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc,
  fallbackClassName,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
  fallbackClassName?: string
}) {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [usingFallback, setUsingFallback] = useState(false)

  const handleImageError = () => {
    if (fallbackSrc && currentSrc === src) {
      setCurrentSrc(fallbackSrc)
      setUsingFallback(true)
    } else {
      setImageError(true)
    }
  }

  if (imageError) {
    return (
      <div className={`flex items-center justify-center text-xs ${className}`} style={{ color: 'var(--framer-ink-muted)' }}>
        {alt}
      </div>
    )
  }

  const imageClassName = usingFallback && fallbackClassName ? fallbackClassName : className
  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      onError={handleImageError}
    />
  )
}

export function LayoutFooter({ variant = 'default' }: LayoutFooterProps) {
  const { t } = useLanguage()

  if (variant === 'simple') {
    return (
      <footer
        style={{
          backgroundColor: 'var(--framer-canvas)',
          borderTop: '1px solid var(--framer-hairline-soft)',
          padding: '48px 30px',
        }}
      >
        <div style={{ maxWidth: '1199px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            <div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '-0.14px',
                  color: 'var(--framer-ink)',
                  marginBottom: '12px',
                }}
              >
                ASCA
              </h3>
              <p className='framer-caption'>
                正法의 계승, 創新의 조화
                <br />
                동양 서예 문화의 발전과 보급을 선도합니다.
              </p>
            </div>
          </div>
          <hr className='framer-divider' style={{ margin: '32px 0 24px' }} />
          <p className='framer-micro' style={{ textAlign: 'center' }}>
            © 2024 사단법인 동양서예협회 (ASCA). All rights reserved.
          </p>
        </div>
      </footer>
    )
  }

  const footerSections = [
    { title: '전시', items: footerLinks.exhibitions },
    { title: '작품', items: footerLinks.artworks },
    { title: '작가', items: footerLinks.artists },
    { title: '소개', items: footerLinks.about },
    { title: '소식', items: footerLinks.news },
  ]

  return (
    <footer
      style={{
        backgroundColor: 'var(--framer-canvas)',
        borderTop: '1px solid var(--framer-hairline-soft)',
        padding: '64px 32px 40px',
      }}
    >
      <div style={{ maxWidth: '1199px', margin: '0 auto' }}>
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr repeat(5, 1fr)',
            gap: '32px',
            marginBottom: '56px',
          }}
        >
          {/* Brand column */}
          <div>
            <Link href='/' style={{ display: 'inline-block', marginBottom: '20px' }}>
              <Image
                src='/logo/Logo & Tagline_black BG.png'
                alt='동양서예협회 | Oriental Calligraphy Association'
                width={160}
                height={64}
                style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
                priority
              />
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                '고유번호: 209-82-11380',
                '☎︎ 0502-5550-8700',
                'FAX: 0504-256-6600',
                'info@orientalcalligraphy.org',
                '〒02872 서울시 성북구 보문로 105',
                '보림빌딩',
                '신한은행 100-028-611714',
              ].map((line, i) => (
                <p key={i} className='framer-micro'>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--framer-ink)',
                  marginBottom: '16px',
                }}
              >
                {section.title}
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                {section.items.map(item => (
                  <li key={item.title}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='framer-caption framer-link'
                        style={{
                          color: 'var(--framer-ink-muted)',
                          textDecoration: 'none',
                          transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink)'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink-muted)'
                        }}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className='framer-caption'
                        style={{
                          color: 'var(--framer-ink-muted)',
                          textDecoration: 'none',
                          transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink)'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink-muted)'
                        }}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr className='framer-divider' style={{ marginBottom: '28px' }} />

        {/* Bottom row — legal + newsletter */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {footerLinks.legal.map(item => (
              <Link
                key={item.title}
                href={item.href}
                className='framer-caption'
                style={{
                  color: 'var(--framer-ink-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink-muted)'
                }}
              >
                {item.title}
              </Link>
            ))}
          </div>
          <a
            href='https://orientalcalligraphy.stibee.com/subscribe/'
            target='_blank'
            rel='noopener noreferrer'
            className='btn-framer-secondary'
            style={{ padding: '7px 14px', minHeight: '32px', fontSize: '12px' }}
          >
            <TranslatedContent textKey='subscribeNewsletter' />
          </a>
        </div>

        {/* Sponsors */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            marginBottom: '24px',
            opacity: 0.45,
          }}
        >
          {footerLinks.sponsors.map(item => (
            <a
              key={item.title}
              href={item.href}
              target='_blank'
              rel='noopener noreferrer'
              className='framer-micro'
              style={{
                color: 'var(--framer-ink-muted)',
                textDecoration: 'none',
                transition: 'opacity 0.12s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.opacity = '1'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.opacity = ''
              }}
            >
              {item.title}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className='framer-micro' style={{ textAlign: 'center' }}>
          © The Asian Society of Calligraphic Arts (ASCA). All rights reserved.
        </p>
      </div>
    </footer>
  )
}
