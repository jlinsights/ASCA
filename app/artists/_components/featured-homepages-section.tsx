'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import { useLanguage } from '@/contexts/language-context'
import { artistDisplayName } from '@/lib/api/artist-life'
import type { Language } from '@/lib/i18n/types'
import { featuredHomepagesCopy } from './featured-homepages-copy'
import { INVITE_LINKS, homepageHost, type FeaturedSite } from './featured-homepages'

export interface FeaturedArtist {
  slug: string
  name: string
  nameEn: string | null
  artNameHanja: string | null
  profileImage: string | null
  deathYear: number | null
  sites: readonly FeaturedSite[]
  role: Record<Language, string> | null
  note: 'renewed' | null
}

interface FeaturedHomepagesSectionProps {
  artists: readonly FeaturedArtist[]
}

const INVITE_FAQ_IDS = ['artist-website', 'entry-fees'] as const

/** 사진이 없는 작가는 호(한자)를 세로로 크게 — 빈 칸이 아니라 낙관처럼 보이게 */
function FeaturedPortrait({ artist }: { artist: FeaturedArtist }) {
  if (artist.profileImage) {
    return (
      <Image
        src={artist.profileImage}
        alt={artist.name}
        fill
        sizes='(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw'
        className='object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]'
      />
    )
  }
  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 flex items-center justify-center bg-ink-black'
    >
      <span className='font-serif text-6xl leading-none tracking-[0.3em] text-white/90 [writing-mode:vertical-rl]'>
        {artist.artNameHanja ?? artist.name}
      </span>
      <span className='absolute bottom-5 right-5 h-9 w-9 rounded-sm bg-scholar-red' />
    </div>
  )
}

const SITE_LINK_CLASS = {
  personal: 'bg-ink-black text-white hover:bg-scholar-red',
  group: 'border border-ink-black text-foreground hover:bg-ink-black hover:text-white',
} as const

/** 홈페이지 버튼 — 개인 홈페이지는 진하게, 단체 홈페이지는 테두리만 */
function SiteLink({ site, ownerName }: { site: FeaturedSite; ownerName: string }) {
  const { language } = useLanguage()
  const copy = featuredHomepagesCopy[language]
  const label = site.name ? site.name[language] : copy.visit
  return (
    <a
      href={site.url}
      target='_blank'
      rel='noopener noreferrer'
      className={`inline-flex h-11 items-center gap-1.5 rounded-sm px-5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scholar-red ${SITE_LINK_CLASS[site.kind]}`}
    >
      {label}
      <ArrowUpRight aria-hidden='true' className='h-4 w-4' />
      <span className='sr-only'>
        {site.kind === 'group' ? `${copy.groupSite} — ${ownerName}` : ownerName} {copy.newWindow}
      </span>
    </a>
  )
}

function FeaturedCard({ artist }: { artist: FeaturedArtist }) {
  const { language } = useLanguage()
  const copy = featuredHomepagesCopy[language]
  const displayName = language === 'en' && artist.nameEn ? artist.nameEn : artist.name
  return (
    <li className='group flex flex-col'>
      <div className='relative aspect-[4/5] overflow-hidden rounded-sm bg-muted'>
        <FeaturedPortrait artist={artist} />
        {artist.note === 'renewed' && (
          <span className='absolute left-4 top-4 rounded-sm bg-background/90 px-3 py-1 text-xs font-medium text-foreground'>
            {copy.renewed}
          </span>
        )}
      </div>
      <h3 className='mt-5 font-serif text-2xl text-foreground'>
        {artist.artNameHanja && (
          <span className='mr-2 text-scholar-red'>{artist.artNameHanja}</span>
        )}
        {artistDisplayName(displayName, artist.deathYear)}
      </h3>
      {artist.role && <p className='mt-1 text-sm text-foreground'>{artist.role[language]}</p>}
      <ul className='mt-3 space-y-1 text-sm text-muted-foreground'>
        {artist.sites.map(site => (
          <li key={site.url}>
            {site.name ? `${site.name[language]} · ` : ''}
            {homepageHost(site.url)}
          </li>
        ))}
      </ul>
      <div className='mt-4 flex flex-wrap gap-3'>
        {artist.sites.map(site => (
          <SiteLink key={site.url} site={site} ownerName={displayName} />
        ))}
        <Link
          href={`/artists/${artist.slug}`}
          className='inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-ink-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scholar-red'
        >
          {copy.profile}
          <span className='sr-only'> — {displayName}</span>
        </Link>
      </div>
    </li>
  )
}

function HomepageInvite() {
  const { language } = useLanguage()
  const copy = featuredHomepagesCopy[language]
  const links = [
    { href: INVITE_LINKS.shogyeong, label: copy.linkShogyeong },
    { href: INVITE_LINKS.entryFees, label: copy.linkEntryFees },
    { href: INVITE_LINKS.homepageRule, label: copy.linkHomepageRule },
    { href: INVITE_LINKS.benefitRule, label: copy.linkBenefitRule },
  ]
  return (
    <aside
      aria-labelledby='homepage-invite-title'
      className='relative mt-16 overflow-hidden rounded-sm bg-ink-black px-6 py-10 text-white md:px-12 md:py-14'
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[10rem] leading-none text-white/[0.06] md:text-[14rem]'
      >
        書境
      </span>
      <div className='relative grid gap-10 lg:grid-cols-[1.4fr_1fr]'>
        <div>
          <p className='text-sm tracking-widest text-white/70'>{copy.inviteEyebrow}</p>
          <h2
            id='homepage-invite-title'
            className='mt-3 font-serif text-3xl leading-snug md:text-4xl'
          >
            {copy.inviteTitle}
          </h2>
          <p className='mt-5 max-w-prose text-base leading-relaxed text-white/80'>
            {copy.inviteBody}
          </p>
          <Link
            href={INVITE_LINKS.contact}
            className='mt-8 inline-flex h-12 items-center rounded-sm bg-scholar-red px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-ink-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
          >
            {copy.contact} →
          </Link>
        </div>
        <ul className='self-end divide-y divide-white/15 border-y border-white/15'>
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className='flex items-center justify-between gap-4 py-4 text-sm text-white/90 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
              >
                {link.label}
                <span aria-hidden='true'>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <details className='relative mt-10 rounded-sm bg-background text-foreground'>
        <summary className='cursor-pointer px-5 py-4 text-sm font-medium'>{copy.faqToggle}</summary>
        <div className='px-3 pb-4 md:px-5'>
          <SiteFaqList ids={INVITE_FAQ_IDS} />
        </div>
      </details>
    </aside>
  )
}

/** /artists 맨 위 — 홈페이지를 가진 작가를 먼저, 이어서 書境 개인전·부스전·홈페이지 안내 */
export function FeaturedHomepagesSection({ artists }: FeaturedHomepagesSectionProps) {
  const { language } = useLanguage()
  const copy = featuredHomepagesCopy[language]
  return (
    <section
      aria-labelledby='featured-homepages-title'
      className='gallery-container pt-12 md:pt-20'
    >
      <p className='text-sm tracking-widest text-scholar-red'>{copy.eyebrow}</p>
      <h2
        id='featured-homepages-title'
        className='mt-3 max-w-3xl font-serif text-3xl leading-tight text-foreground md:text-5xl'
      >
        {copy.title}
      </h2>
      <p className='mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground'>{copy.lede}</p>
      {artists.length > 0 && (
        <ul className='mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3'>
          {artists.map(artist => (
            <FeaturedCard key={artist.slug} artist={artist} />
          ))}
        </ul>
      )}
      <HomepageInvite />
    </section>
  )
}
