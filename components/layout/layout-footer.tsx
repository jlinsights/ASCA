'use client'

import Link from 'next/link'
import { TranslatedContent } from '../translated-content'
import Image from 'next/image'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'

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
      <div className={`flex items-center justify-center text-xs text-[#fcfcfc]/40 ${className}`}>
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

import { footerLinks } from './footer-data'

export function LayoutFooter({ variant = 'default' }: LayoutFooterProps) {
  const { t } = useLanguage()

  if (variant === 'simple') {
    return (
      <footer className='gallery-card bg-ink-black text-rice-paper mt-16'>
        <div className='gallery-container py-12'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-8 h-8 bg-celadon-green rounded-full flex items-center justify-center'>
                  <span className='font-calligraphy text-rice-paper font-bold'>書</span>
                </div>
                <h3 className='font-calligraphy text-lg font-bold'>ASCA</h3>
              </div>
              <p className='text-rice-paper/80 text-sm leading-relaxed'>
                <span className='font-calligraphy text-temple-gold'>正法</span>의 계승,
                <span className='font-calligraphy text-celadon-green'>創新</span>의 조화 - 동양 서예
                문화의 발전과 보급을 선도합니다.
              </p>
            </div>

            <div>
              <h4 className='font-semibold mb-4 text-temple-gold'>퀵 링크</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    href='/exhibitions'
                    className='text-rice-paper/80 hover:text-celadon-green transition-colors'
                  >
                    {t('exhibition')}
                  </Link>
                </li>
                <li>
                  <Link
                    href='/artworks'
                    className='text-rice-paper/80 hover:text-celadon-green transition-colors'
                  >
                    {t('artworks')}
                  </Link>
                </li>
                <li>
                  <Link
                    href='/artists'
                    className='text-rice-paper/80 hover:text-celadon-green transition-colors'
                  >
                    {t('artists')}
                  </Link>
                </li>
                <li>
                  <Link
                    href='/about'
                    className='text-rice-paper/80 hover:text-celadon-green transition-colors'
                  >
                    {t('about')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold mb-4 text-temple-gold'>연락처</h4>
              <div className='text-sm text-rice-paper/80 space-y-2'>
                <p>사단법인 동양서예협회</p>
                <p>서울특별시 중구</p>
                <p>전화: 02-123-4567</p>
                <p>이메일: info@orientalcalligraphy.org</p>
              </div>
            </div>
          </div>

          <div className='border-t border-rice-paper/20 mt-8 pt-8 text-center'>
            <p className='text-rice-paper/60 text-sm'>
              © 2024 사단법인 동양서예협회 (ASCA). All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className='bg-[#222222] text-[#fcfcfc] dark:bg-[#111111] py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-12'>
          <div className='md:col-span-1 lg:col-span-1'>
            <Link href='/' className='block mb-4'>
              <Image
                src='/logo/Logo & Tagline_black BG.png'
                alt='동양서예협회 | Oriental Calligraphy Association'
                width={200}
                height={80}
                className='h-16 w-auto object-contain'
                priority
              />
            </Link>
            <div className='mt-4 space-y-1'>
              <p className='text-xs text-[#fcfcfc]/70'>고유번호: 209-82-11380</p>
              <p className='text-xs text-[#fcfcfc]/70'>☎︎ 0502-5550-8700</p>
              <p className='text-xs text-[#fcfcfc]/70'>FAX: 0504-256-6600</p>
              <p className='text-xs text-[#fcfcfc]/70'>info@orientalcalligraphy.org</p>
              <p className='text-xs text-[#fcfcfc]/70'>〒02872 서울시 성북구 보문로 105</p>
              <p className='text-xs text-[#fcfcfc]/70'>보림빌딩</p>
              <p className='text-xs text-[#fcfcfc]/70'>무통장 입금계좌: 신한은행 100-028-611714</p>
            </div>
          </div>

          {[
            { title: '전시', items: footerLinks.exhibitions },
            { title: '작품', items: footerLinks.artworks },
            { title: '작가', items: footerLinks.artists },
            { title: '소개', items: footerLinks.about },
            { title: '소식', items: footerLinks.news },
          ].map(section => (
            <div key={section.title}>
              <h3 className='text-sm font-medium mb-4'>{section.title}</h3>
              <ul className='space-y-2'>
                {section.items.map(item => (
                  <li key={item.title}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-[#fcfcfc]/70 hover:text-[#fcfcfc] transition-colors'
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className='text-xs text-[#fcfcfc]/70 hover:text-[#fcfcfc] transition-colors'
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

        <div className='border-t border-[#fcfcfc]/10 pt-6 mt-8'>
          <div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-6'>
            <Link
              href='https://orientalcalligraphy.stibee.com/subscribe/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs uppercase tracking-wider hover:text-[#fcfcfc]/80 transition-colors'
            >
              <TranslatedContent textKey='subscribeNewsletter' />
            </Link>

            <div className='hidden md:block w-px h-8 bg-[#fcfcfc]/20'></div>

            <div className='flex flex-wrap justify-center gap-4 md:gap-6'>
              {footerLinks.legal.map(item => (
                <Link
                  key={item.title}
                  href={item.href}
                  className='text-xs text-[#fcfcfc]/70 hover:text-[#fcfcfc] transition-colors'
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='border-t border-[#fcfcfc]/10 pt-6 mt-6'>
          <div className='flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-60 mb-6'>
            {footerLinks.sponsors.map(item => (
              <Link
                key={item.title}
                href={item.href}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-[#fcfcfc]/40 hover:text-[#fcfcfc]/70 transition-colors'
              >
                {item.title}
              </Link>
            ))}
          </div>

          <div className='text-center'>
            <p className='text-xs text-[#fcfcfc]/60'>
              © The Asian Society of Calligraphic Arts (ASCA). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
