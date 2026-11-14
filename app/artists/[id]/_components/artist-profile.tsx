'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroScrolls } from '@/components/layout/page-hero'
import { useLanguage } from '@/contexts/language-context'
import { artistNationalityLabel, artistRoleLabel } from '../../_components/artist-filter-options'
import { artNameLabel, type ArtistDbRow } from '@/lib/api/artist-mapper'
import { artistDisplayName } from '@/lib/api/artist-life'
import { artistNativeName } from '@/lib/api/artist-name'
import { parseArtistCareer } from './artist-career'
import { ArtistHero, type ArtistHeroFact } from './artist-hero'
import { workYearSpan, type ArtistWork } from './artist-works'
import { FounderBand } from './founder-band'
import { ArtistWorksWall, ShareButton } from './artist-works-wall'
import { FOUNDER, isFounder } from '@/lib/content/founder'
import './artist-profile.css'

type Language = 'ko' | 'en' | 'ja' | 'zh'

interface ArtistProfileProps {
  artist: ArtistDbRow
  works: ArtistWork[]
}

const HAN = /[㐀-鿿豈-﫿]/

/** 한자 이름이 따로 있으면 그것으로 題簽을 세운다. 없으면 작가 페이지 공통 題簽 */
function hanjaName(artist: ArtistDbRow): string | null {
  const zh = artist.name_zh?.trim()
  return zh && zh !== artist.name && HAN.test(zh) ? zh : null
}

/** membership_type('초대작가, 심사위원')·title 을 겹치지 않게 한 줄로 — 값은 DB 의 한국어, 화면에는 고른 언어로 */
function artistRoles(artist: ArtistDbRow, language: Language): string[] {
  const roles = [artist.membership_type, artist.title]
    .flatMap(value => (value ?? '').split(','))
    .map(role => role.trim())
    .filter(Boolean)
    .map(role => artistRoleLabel(role, language))
  return [...new Set(roles)]
}

function localized(
  language: Language,
  values: Record<Language, string | null | undefined>
): string | null {
  return values[language]?.trim() || values.ko?.trim() || null
}

function workTitle(work: ArtistWork, language: Language): string {
  return language === 'en' && work.titleEn ? work.titleEn : work.title
}

type Translate = (key: string) => string

function lifeFact(artist: ArtistDbRow, t: Translate): string | null {
  if (artist.death_year) {
    return artist.birth_year
      ? `${artist.birth_year}–${artist.death_year}`
      : t('adDied').replace('{year}', String(artist.death_year))
  }
  return artist.birth_year ? t('adBorn').replace('{year}', String(artist.birth_year)) : null
}

/** 숫자 뒤 단위 — 영어는 띄어 쓰고(6 works), 한·중·일은 붙여 쓴다(6점·6点·6件) */
function unitAfterNumber(unit: string, language: Language): string {
  return language === 'en' ? ` ${unit}` : unit
}

/** 구역 제목 곁 漢字(作品·作家) — 제목이 이미 한자인 일본어·중국어에서는 같은 글자가 겹쳐 빼다 */
function showsHanjaMark(language: Language): boolean {
  return language === 'ko' || language === 'en'
}

export function ArtistProfile({ artist, works }: ArtistProfileProps) {
  const { language, t } = useLanguage() as { language: Language; t: Translate }

  const baseName = localized(language, {
    ko: artistNativeName({
      name: artist.name,
      nationality: artist.nationality,
      nameJa: artist.name_ja,
      nameZh: artist.name_zh,
    }),
    en: artist.name_en,
    ja: artist.name_ja,
    zh: artist.name_zh,
  })
  const name = artistDisplayName(baseName ?? artist.name, artist.death_year)
  const bio = localized(language, {
    ko: artist.bio,
    en: artist.bio_en,
    ja: artist.bio_ja,
    zh: artist.bio_zh,
  })
  const career = parseArtistCareer(bio, { awards: artist.awards, exhibitions: artist.exhibitions })
  const founder = isFounder(artist.slug)
  // 창립자는 DB 직위(title)가 비어 있다 — 협회에서의 자리를 등급보다 앞에 둔다
  const roles = founder
    ? [FOUNDER.role[language], ...artistRoles(artist, language)]
    : artistRoles(artist, language)
  const pictured = works.filter(work => work.imageUrl)

  const ledger: ArtistHeroFact[] = [
    {
      label: t('adLedgerWorks'),
      value: works.length,
      unit: unitAfterNumber(t('adUnitWorks'), language),
    },
    { label: t('adLedgerYears'), value: workYearSpan(works) },
    {
      label: t('adLedgerCareer'),
      value: career.entries.length,
      unit: unitAfterNumber(t('adUnitCareer'), language),
    },
  ]

  const media = artist.profile_image ? (
    <figure className='ap-portrait'>
      <span className='ap-portrait__frame'>
        <Image
          src={artist.profile_image}
          alt={artist.name}
          fill
          priority
          sizes='(max-width: 767px) 80vw, (max-width: 1024px) 50vw, 30vw'
          className='ap-portrait__img'
        />
      </span>
    </figure>
  ) : pictured.length > 0 ? (
    <HeroScrolls
      fit='contain'
      images={pictured.map(work => ({
        src: work.imageUrl as string,
        alt: workTitle(work, language),
        href: `/artworks/${work.id}`,
      }))}
    />
  ) : undefined

  const hasAbout = career.paragraphs.length > 0 || career.entries.length > 0
  const artName = artNameLabel(artist.art_name_ko, artist.art_name_hanja)
  const roleLine = roles.length > 0 ? roles.join(' · ') : null
  // 아호는 이름 바로 아래 — 한국 서예가는 이름보다 호로 불리는 경우가 많다
  const lede =
    artName || roleLine ? (
      <>
        {artName && (
          <span className='ap-ho'>
            <span className='ap-ho__label' lang='zh-Hant'>
              雅號
            </span>
            <span className='ap-ho__name'>{artName}</span>
          </span>
        )}
        {roleLine && <span className='ap-roles'>{roleLine}</span>}
      </>
    ) : undefined

  return (
    <div className='ap'>
      <ArtistHero
        name={name}
        baseName={baseName ?? artist.name}
        hanja={hanjaName(artist)}
        lede={lede}
        facts={[
          { label: t('adFactLife'), value: lifeFact(artist, t) },
          {
            label: t('adFactNationality'),
            value: artist.nationality?.trim()
              ? artistNationalityLabel(artist.nationality, language)
              : null,
          },
        ]}
        ledger={ledger}
        media={media}
        crumbLabel={t('adCrumbList')}
      />

      {founder && <FounderBand language={language} />}

      <div className='ap-actions'>
        {works.length > 0 && (
          <a href='#ap-works-title' className='ap-btn ap-btn--gold'>
            {t('adViewWorks')}
          </a>
        )}
        <ShareButton title={name} t={t} />
      </div>

      {works.length > 0 && (
        <section className='ap-section ap-works' aria-labelledby='ap-works-title'>
          <header className='ap-head'>
            <h2 id='ap-works-title' className='ap-head__title'>
              {t('adWorksTitle')}
              {showsHanjaMark(language) && (
                <span className='ap-head__tc' lang='zh-Hant' aria-hidden='true'>
                  作品
                </span>
              )}
            </h2>
            <p className='ap-head__note'>
              {t('adWorksNote').replace('{count}', String(works.length))}
            </p>
          </header>
          <ArtistWorksWall works={works} titleOf={work => workTitle(work, language)} t={t} />
        </section>
      )}

      {hasAbout && (
        <section className='ap-section ap-about' aria-labelledby='ap-about-title'>
          <div className='ap-about__layout'>
            <h2 id='ap-about-title' className='ap-head__title ap-about__title'>
              {t('adAboutTitle')}
              {showsHanjaMark(language) && (
                <span className='ap-head__tc' lang='zh-Hant' aria-hidden='true'>
                  作家
                </span>
              )}
            </h2>
            <div className='ap-about__body'>
              {career.paragraphs.map((paragraph, index) => (
                <p key={index} className='ap-about__para'>
                  {paragraph}
                </p>
              ))}
              {career.entries.length > 0 && (
                <>
                  <h3 className='ap-career__title'>{t('adCareerTitle')}</h3>
                  <ol className='ap-career'>
                    {career.entries.map((entry, index) => (
                      <li key={index} className='ap-career__item'>
                        <span className='ap-career__year'>{entry.year ?? ''}</span>
                        <span className='ap-career__text'>{entry.text}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {works.length === 0 && (
        <section className='ap-section ap-empty' aria-label={t('adEmptyLabel')}>
          <p className='ap-empty__text'>{hasAbout ? t('adEmptyNoWorks') : t('adEmptyPreparing')}</p>
          <Link href='/artists' className='ap-empty__link'>
            {t('adOtherArtists')}
          </Link>
        </section>
      )}

      <LayoutFooter />
    </div>
  )
}
