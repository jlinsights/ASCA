import { Suspense } from 'react'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, HeroScrolls, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import galleryMeta from '@/lib/data/gallery-data.json'
import type { GalleryData } from '@/lib/types/gallery/gallery-legacy'
import GalleryPageClient from '@/components/gallery/GalleryPageClient'
import { resolveGalleryData } from '@/lib/gallery-media'
import { collapseSimilar } from '@/lib/gallery-similar-data'

function GallerySkeleton() {
  return (
    <div className='columns-2 md:columns-3 lg:columns-4 gap-3'>
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className='mb-3 break-inside-avoid rounded-xl bg-muted animate-pulse'
          style={{ height: [200, 160, 220, 180][i % 4] }}
        />
      ))}
    </div>
  )
}

// 서버에서 메타데이터만 읽음 (items 배열 클라이언트로 전달 없음)
const meta = resolveGalleryData(galleryMeta as unknown as GalleryData)
const availableYears = meta.metadata.availableYears ?? []
const totalImages = meta.metadata.totalImages
// 목록은 연속 촬영으로 비슷한 사진을 대표 한 장으로 접어 보인다 — 칩·히어로 숫자도 같은 기준으로
const { items: representatives } = collapseSimilar(meta.items.filter(item => item.mediaKey))
const representativeCount = representatives.length
const categories = (meta.categories ?? []).map(category => ({
  ...category,
  count: representatives.filter(item => item.category === category.id).length,
}))

// 히어로 사진 — 업로드된 사진의 대표만(같은 장면이 나란히 걸리지 않게)
const heroImages = representatives.map(item => ({ src: item.src, alt: item.title }))

const heroLedger: PageHeroStat[] = [
  { label: '대표 사진', value: representativeCount, unit: `/ ${totalImages}장` },
  { label: '카테고리', value: categories.length },
  ...(availableYears.length > 0
    ? [
        {
          label: '활동 연도',
          value: `${Math.min(...availableYears)}–${Math.max(...availableYears)}`,
          unit: '년',
        },
      ]
    : []),
]

export default function GalleryPage() {
  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        {...PAGE_HERO_MARKS.gallery}
        title='동양서예 갤러리'
        lede='正法의 계승, 創新의 조화'
        ledger={heroLedger}
        media={
          heroImages.length > 0 ? (
            <HeroScrolls images={heroImages} fit='cover' max={3} />
          ) : undefined
        }
      >
        <div className='flex gap-3'>
          <Button asChild size='sm'>
            <Link href='#gallery'>
              <Camera className='w-4 h-4 mr-1.5' />
              갤러리 보기
            </Link>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <Link href='/events'>행사 안내</Link>
          </Button>
        </div>
      </PageHero>

      {/* ── Gallery ── */}
      <section id='gallery' className='py-10 md:py-16'>
        <div className='container'>
          {/*
            useSearchParams()를 쓰는 Client Component는 반드시 Suspense 안에 있어야 합니다.
            ssr:false dynamic은 Server Component에서 사용 불가 (Next.js 16).
          */}
          <Suspense fallback={<GallerySkeleton />}>
            <GalleryPageClient availableYears={availableYears} categories={categories} />
          </Suspense>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

// ── 메타데이터 ──────────────────────────────────────────
export const metadata = {
  title: '갤러리 | 동양서예협회',
  description: `동양서예협회의 종합 활동 갤러리. ${totalImages}장의 전시회, 심사위원회, 휘호대회, 시상식 등 협회 활동 사진을 감상하세요.`,
  keywords: ['동양서예', '서예갤러리', '전시회', '휘호대회', '심사위원회', '시상식'],
  openGraph: {
    title: '갤러리 | 동양서예협회',
    description: `${totalImages}개의 서예 작품 및 협회 활동 종합 갤러리`,
    type: 'website',
  },
}
