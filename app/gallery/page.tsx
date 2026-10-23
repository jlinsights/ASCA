import { Suspense } from 'react'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, HeroScrolls, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import galleryMeta from '@/lib/data/gallery-data.json'
import galleryMedia from '@/lib/data/gallery-media.json'
import type { GalleryData } from '@/lib/types/gallery/gallery-legacy'
import GalleryPageClient from '@/components/gallery/GalleryPageClient'
import { galleryMediaKey, resolveGalleryData, resolveGalleryItems } from '@/lib/gallery-media'

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
const categories = meta.categories ?? []
const totalImages = meta.metadata.totalImages

// 히어로 사진 — 업로드가 확인된 실제 사진만 건다(미연결 항목은 제외)
const mediaMap = galleryMedia as Record<string, unknown>
const heroImages = resolveGalleryItems(
  (galleryMeta as unknown as GalleryData).items.filter(item => {
    const key = galleryMediaKey(item.src)
    return key !== null && key in mediaMap
  })
).map(item => ({ src: item.src, alt: item.title }))

const heroLedger: PageHeroStat[] = [
  { label: '활동사진', value: totalImages },
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
        <div className='max-w-7xl mx-auto px-6 md:px-12'>
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
  title: '동양서예 갤러리 | 사단법인 동양서예협회',
  description: `동양서예협회의 종합 활동 갤러리. ${totalImages}장의 전시회, 심사위원회, 휘호대회, 시상식 등 협회 활동 사진을 감상하세요.`,
  keywords: ['동양서예', '서예갤러리', '전시회', '휘호대회', '심사위원회', '시상식'],
  openGraph: {
    title: '동양서예 갤러리 | 사단법인 동양서예협회',
    description: `${totalImages}개의 서예 작품 및 협회 활동 종합 갤러리`,
    type: 'website',
  },
}
