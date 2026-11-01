'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroScrolls } from '@/components/layout/page-hero'
import { useLanguage } from '@/contexts/language-context'
import { artNameLabel, type ArtistDbRow } from '@/lib/api/artist-mapper'
import { artistDisplayName } from '@/lib/api/artist-life'
import { artistNativeName } from '@/lib/api/artist-name'
import { parseArtistCareer } from './artist-career'
import { ArtistHero, type ArtistHeroFact } from './artist-hero'
import { workYearSpan, type ArtistWork } from './artist-works'
import { FounderBand } from './founder-band'
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

/** membership_type('초대작가, 심사위원')·title 을 겹치지 않게 한 줄로 */
function artistRoles(artist: ArtistDbRow): string[] {
  const roles = [artist.membership_type, artist.title]
    .flatMap(value => (value ?? '').split(','))
    .map(role => role.trim())
    .filter(Boolean)
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

function lifeFact(artist: ArtistDbRow): string | null {
  if (artist.death_year) {
    return artist.birth_year
      ? `${artist.birth_year}–${artist.death_year}`
      : `${artist.death_year}년 별세`
  }
  return artist.birth_year ? `${artist.birth_year}년생` : null
}

export function ArtistProfile({ artist, works }: ArtistProfileProps) {
  const { language } = useLanguage() as { language: Language }

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
  const roles = founder ? [FOUNDER.role[language], ...artistRoles(artist)] : artistRoles(artist)
  const pictured = works.filter(work => work.imageUrl)

  const ledger: ArtistHeroFact[] = [
    { label: '공개 작품', value: works.length, unit: '점' },
    { label: '작품 연도', value: workYearSpan(works) },
    { label: '경력', value: career.entries.length, unit: '건' },
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
          { label: '생몰', value: lifeFact(artist) },
          { label: '국적', value: artist.nationality?.trim() || null },
        ]}
        ledger={ledger}
        media={media}
      />

      {founder && <FounderBand language={language} />}

      {works.length > 0 && (
        <section className='ap-section ap-works' aria-labelledby='ap-works-title'>
          <header className='ap-head'>
            <h2 id='ap-works-title' className='ap-head__title'>
              작품
              <span className='ap-head__tc' lang='zh-Hant' aria-hidden='true'>
                作品
              </span>
            </h2>
            <p className='ap-head__note'>{works.length}점 · 최근 작품부터</p>
          </header>
          <ul className='ap-works__grid'>
            {works.map(work => (
              <li key={work.id} className='ap-works__item'>
                <WorkCard work={work} title={workTitle(work, language)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasAbout && (
        <section className='ap-section ap-about' aria-labelledby='ap-about-title'>
          <div className='ap-about__layout'>
            <h2 id='ap-about-title' className='ap-head__title ap-about__title'>
              작가 소개
              <span className='ap-head__tc' lang='zh-Hant' aria-hidden='true'>
                作家
              </span>
            </h2>
            <div className='ap-about__body'>
              {career.paragraphs.map((paragraph, index) => (
                <p key={index} className='ap-about__para'>
                  {paragraph}
                </p>
              ))}
              {career.entries.length > 0 && (
                <>
                  <h3 className='ap-career__title'>경력</h3>
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
        <section className='ap-section ap-empty' aria-label='안내'>
          <p className='ap-empty__text'>
            {hasAbout ? '공개된 작품이 아직 없습니다.' : '작가 소개와 작품을 준비하고 있습니다.'}
          </p>
          <Link href='/artists' className='ap-empty__link'>
            다른 작가 보기
          </Link>
        </section>
      )}

      <LayoutFooter />
    </div>
  )
}

function WorkCard({ work, title }: { work: ArtistWork; title: string }) {
  const ratio = work.width && work.height ? `${work.width} / ${work.height}` : '3 / 4'
  const meta = [work.year ? `${work.year}` : null, work.style].filter(Boolean).join(' · ')

  return (
    <Link href={`/artworks/${work.id}`} className='ap-work'>
      <figure className='ap-work__figure'>
        <span className='ap-work__mat'>
          <span className='ap-work__frame' style={{ aspectRatio: ratio }}>
            {work.imageUrl ? (
              <Image
                src={work.imageUrl}
                alt={title}
                fill
                sizes='(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw'
                className='ap-work__img'
              />
            ) : (
              <span className='ap-work__blank' aria-hidden='true'>
                {work.title}
              </span>
            )}
          </span>
        </span>
        <figcaption className='ap-work__caption'>
          <span className='ap-work__title'>{title}</span>
          {(meta || work.award) && (
            <span className='ap-work__meta'>
              {meta && <span>{meta}</span>}
              {work.award && (
                <span className='ap-work__award' lang='zh-Hant'>
                  {work.award}
                </span>
              )}
            </span>
          )}
        </figcaption>
      </figure>
    </Link>
  )
}
