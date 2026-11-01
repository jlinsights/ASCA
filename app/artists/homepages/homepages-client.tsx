'use client'

import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { featuredHomepagesCopy } from '../_components/featured-homepages-copy'
import {
  FeaturedHomepagesSection,
  type FeaturedArtist,
} from '../_components/featured-homepages-section'

interface ArtistHomepagesPageProps {
  artists: readonly FeaturedArtist[]
}

/** /artists/homepages — 메뉴 이름(작가의 홈페이지)을 제목으로, 소개 문단을 히어로 소개로 쓴다 */
export function ArtistHomepagesPage({ artists }: ArtistHomepagesPageProps) {
  const { language } = useLanguage()
  const copy = featuredHomepagesCopy[language]
  return (
    <div className='min-h-screen bg-background'>
      <PageHero {...PAGE_HERO_MARKS.artistHomepages} title={copy.eyebrow} lede={copy.lede} />
      <div className='pb-20'>
        <FeaturedHomepagesSection artists={artists} withIntro={false} />
      </div>
      <LayoutFooter />
    </div>
  )
}
