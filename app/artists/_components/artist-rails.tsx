import Image from 'next/image'
import Link from 'next/link'
import type { PublicArtist } from '@/lib/api/artist-mapper'
import { artistNativeName } from '@/lib/api/artist-name'
import type { Language } from '@/lib/i18n/types'
import { artistGradeLabel, artistTitleLabel, regulationGrade } from './artist-filter-options'
import type { ArtistRail, ArtistRailItem } from './load-artist-rails'
import './artist-rails.css'

type Translate = (key: string) => string

interface ArtistRailsProps {
  rails: ArtistRail[]
  t: Translate
  language: Language
}

/**
 * 이름 아래 한 줄 — 직위가 있으면 첫 직위, 없으면 규정 등급. 값은 DB 의 한국어라 고른 언어의 라벨로 바꾼다
 * (ArtistCard 와 같은 표를 쓴다)
 */
export function railRole(artist: PublicArtist, language: Language): string | null {
  if (artist.title) return artistTitleLabel(artist.title, language).split(', ')[0] || null
  const grade = regulationGrade(artist.membershipType)
  return grade ? artistGradeLabel(grade, language) : null
}

/** 사진이 없을 때 원 안에 쓸 한 글자 — 호(한자) → 한자 이름 → 이름 */
export function railInitial(artist: PublicArtist): string {
  const source = artist.artNameHanja || artist.nameZh || artist.name
  return [...source.trim()][0] ?? ''
}

function artistHref(artist: PublicArtist): string {
  return `/artists/${encodeURIComponent(artist.slug ?? artist.id)}`
}

/**
 * 작가 탐색 레일 — 줄마다 옆으로 넘겨 본다.
 * 직함·등급 줄은 둥근 초상, '새로 걸린 작품' 줄은 작품을 원래 비율 그대로 건다.
 */
export function ArtistRails({ rails, t, language }: ArtistRailsProps) {
  if (rails.length === 0) return null
  return (
    <div className='ar'>
      {rails.map(rail => (
        <section key={rail.key} className='ar-rail' aria-labelledby={`ar-${rail.key}`}>
          <div className='ar-rail__head'>
            <h2 id={`ar-${rail.key}`} className='ar-rail__title'>
              {t(rail.labelKey)}
            </h2>
            {rail.href && (
              <Link href={rail.href} className='ar-rail__all'>
                {t('arSeeAll')}
                <span className='sr-only'> — {t(rail.labelKey)}</span>
              </Link>
            )}
          </div>
          <ul className='ar-rail__list' aria-label={t(rail.labelKey)} tabIndex={0}>
            {rail.items.map(item => (
              <li key={item.artist.id} className='ar-rail__item'>
                {item.cover ? (
                  <WorkTile item={item} />
                ) : (
                  <PortraitTile artist={item.artist} language={language} />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function PortraitTile({ artist, language }: { artist: PublicArtist; language: Language }) {
  const role = railRole(artist, language)
  return (
    <Link href={artistHref(artist)} className='ar-tile'>
      <span className='ar-tile__face'>
        {artist.profileImage ? (
          <Image
            src={artist.profileImage}
            alt=''
            fill
            sizes='(max-width: 767px) 128px, 168px'
            className='ar-tile__img'
          />
        ) : (
          <span className='ar-tile__initial' lang='zh-Hant' aria-hidden='true'>
            {railInitial(artist)}
          </span>
        )}
      </span>
      <span className='ar-tile__name'>{artistNativeName(artist)}</span>
      {role && <span className='ar-tile__role'>{role}</span>}
    </Link>
  )
}

// 작품 칸 높이 — artist-rails.css 의 .ar-work__frame 과 같이 바꿀 것
const WORK_HEIGHT_MOBILE = 220
const WORK_HEIGHT = 280

function WorkTile({ item }: { item: ArtistRailItem }) {
  const cover = item.cover as NonNullable<ArtistRailItem['cover']>
  const ratio = cover.width && cover.height ? cover.width / cover.height : 3 / 4
  return (
    <Link href={artistHref(item.artist)} className='ar-work'>
      <span className='ar-work__mat'>
        <span className='ar-work__frame' style={{ aspectRatio: `${ratio}` }}>
          <Image
            src={cover.src}
            alt=''
            fill
            sizes={`(max-width: 767px) ${Math.ceil(WORK_HEIGHT_MOBILE * ratio)}px, ${Math.ceil(WORK_HEIGHT * ratio)}px`}
            className='ar-work__img'
          />
        </span>
      </span>
      <span className='ar-tile__name'>{artistNativeName(item.artist)}</span>
      {item.artist.artNameHanja && (
        <span className='ar-tile__role' lang='zh-Hant'>
          {item.artist.artNameHanja}
        </span>
      )}
    </Link>
  )
}
