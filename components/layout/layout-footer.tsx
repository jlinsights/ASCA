'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { footerLinks, footerSections } from './footer-data'
import { footerCopy } from './footer-copy'

interface LayoutFooterProps {
  variant?: 'default' | 'simple'
}
const linkStyle =
  'inline-flex min-h-11 items-center py-2 text-sm leading-relaxed text-rice-paper/80 transition-colors hover:text-rice-paper hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

export function LayoutFooter({ variant = 'default' }: LayoutFooterProps) {
  const { t, language } = useLanguage()
  const copy = footerCopy[language]
  const label = (key: string) => (key in copy ? copy[key as keyof typeof copy] : t(key))
  return (
    <footer className='bg-ink-black text-rice-paper'>
      <div className='container mx-auto px-6 py-12 md:px-8 md:py-16 lg:py-20'>
        <div
          className={variant === 'default' ? 'grid gap-12 lg:grid-cols-3 lg:gap-16' : 'max-w-xl'}
        >
          <div className='min-w-0'>
            <Link
              href='/'
              className='inline-block max-w-full rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
            >
              <Image
                src='/logo/asca-hanja-white.avif'
                alt={copy.name}
                width={480}
                height={68}
                className='h-auto w-full max-w-sm object-contain'
              />
            </Link>
            <p className='mt-8 text-sm text-rice-paper/80'>{t('siteFtRegNo')} 209-82-11380</p>
            <address className='mt-6 space-y-6 text-sm not-italic leading-loose text-rice-paper/80'>
              <p>
                <span className='mb-1 block font-medium text-rice-paper'>{copy.headquarters}</span>
                〒02873
                <br />
                {copy.address}
                <br />
                {copy.building}
              </p>
              <p>
                <span className='mb-1 block font-medium text-rice-paper'>{copy.office}</span>
                〒10467
                <br />
                {copy.officeAddress}
                <br />
                {copy.officeBuilding}
              </p>
              <div>
                <a href='tel:050255508700' className={linkStyle}>
                  {copy.phone} 0502-5550-8700
                </a>
                <p>FAX 0504-256-6600</p>
                <a href='mailto:info@orientalcalligraphy.org' className={`${linkStyle} break-all`}>
                  info@orientalcalligraphy.org
                </a>
              </div>
            </address>
            <p className='mt-6 text-sm leading-loose text-rice-paper/80'>
              <span className='block font-medium text-rice-paper'>{t('siteFtBank')}</span>
              100-028-611714
            </p>
            <a
              href='https://pf.kakao.com/_xkchGj'
              target='_blank'
              rel='noopener noreferrer'
              className='mt-6 inline-flex items-center gap-4 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
            >
              <Image
                src='/logo/kakao-channel-qr.png'
                alt={copy.qrAlt}
                width={112}
                height={112}
                unoptimized
                className='h-28 w-28 shrink-0 bg-white object-contain'
              />
              <span className='text-sm leading-relaxed'>
                {copy.kakao}
                <span className='mt-1 block text-xs text-rice-paper/70'>{copy.qrHelp}</span>
              </span>
            </a>
          </div>
          {variant === 'default' && (
            <nav
              aria-label={copy.navigation}
              className='grid content-start gap-x-12 gap-y-12 sm:grid-cols-2 lg:col-span-2 lg:gap-y-16'
            >
              {footerSections.map(section => (
                <section key={section.titleKey}>
                  <h2 className='mb-5 font-serif text-2xl font-normal leading-snug'>
                    {label(section.titleKey)}
                  </h2>
                  <ul className='grid grid-cols-2 gap-x-4 gap-y-2'>
                    {section.items.map(item => (
                      <li key={item.labelKey} className='min-w-0'>
                        <Link
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          className={linkStyle}
                        >
                          {label(item.labelKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <div className='flex flex-wrap gap-x-6 gap-y-2 border-t border-rice-paper/20 pt-6 sm:col-span-2'>
                {[
                  { labelKey: 'siteFtExhibitions', href: '/exhibitions' },
                  { labelKey: 'siteFtArtworks', href: '/artworks' },
                  { labelKey: 'siteNavContests', href: '/contests' },
                  { labelKey: 'siteNavGallery', href: '/gallery' },
                ].map(item => (
                  <Link key={item.labelKey} href={item.href} className={linkStyle}>
                    {t(item.labelKey)}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
        <div className='mt-12 border-t border-rice-paper/20 pt-6 md:mt-16'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <a
              href='https://orientalcalligraphy.stibee.com/subscribe/'
              target='_blank'
              rel='noopener noreferrer'
              className={linkStyle}
            >
              {t('siteFtNewsletter')}
            </a>
            <ul className='flex flex-wrap gap-x-6 gap-y-1'>
              {footerLinks.legal.map(item => (
                <li key={item.labelKey}>
                  <Link href={item.href} className={linkStyle}>
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className='mt-12 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between'>
            <p className='order-2 text-xs leading-relaxed text-rice-paper/70 xl:order-1'>
              © The Asian Society of Calligraphic Arts (ASCA). All rights reserved.
            </p>
            <ul className='order-1 grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:gap-8 xl:order-2 xl:shrink-0'>
              {footerLinks.sponsors.map(item => (
                <li key={item.labelKey}>
                  <a
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-20 items-center justify-center rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-32'
                  >
                    {item.logo ? (
                      <Image
                        src={item.logo.src}
                        alt={t(item.labelKey)}
                        width={item.logo.width}
                        height={item.logo.height}
                        sizes='128px'
                        className='h-20 w-32 max-w-full object-contain'
                      />
                    ) : (
                      <span className='text-sm text-rice-paper/80'>{t(item.labelKey)}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
