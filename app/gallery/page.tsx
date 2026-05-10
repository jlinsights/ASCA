import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import galleryMeta from '@/lib/data/gallery-data.json'
import type { GalleryData } from '@/lib/types/gallery/gallery-legacy'
import GalleryPageClient from '@/components/gallery/GalleryPageClient'

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
const meta = galleryMeta as unknown as GalleryData
const availableYears = meta.metadata.availableYears ?? []
const categories = meta.categories ?? []
const totalImages = meta.metadata.totalImages

export default function GalleryPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* ── Hero ── */}
      <section className='border-b border-border bg-background'>
        <div className='max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 text-center space-y-6'>
          <div className='flex justify-center'>
            <Image
              src='/logo/Logo & Tagline_white BG.png'
              alt='동양서예협회 로고'
              width={360}
              height={144}
              className='h-20 md:h-28 w-auto object-contain'
              priority
            />
          </div>

          <h1 className='text-3xl md:text-5xl font-bold text-foreground tracking-tight'>
            동양서예 갤러리
          </h1>
          <p className='text-muted-foreground text-lg'>正法의 계승, 創新의 조화</p>

          {/* 통계 */}
          <div className='flex items-center justify-center gap-6 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Camera className='w-4 h-4' />
              <strong className='text-foreground'>{totalImages}</strong> 활동사진
            </span>
            <div className='w-px h-4 bg-border' />
            <span className='flex items-center gap-1.5'>
              <Palette className='w-4 h-4' />
              <strong className='text-foreground'>{categories.length}</strong> 카테고리
            </span>
            <div className='w-px h-4 bg-border' />
            <span className='flex items-center gap-1.5'>
              <strong className='text-foreground'>{availableYears.join(', ')}</strong>년
            </span>
          </div>

          <div className='flex gap-3 justify-center'>
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
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id='gallery' className='py-12 md:py-16'>
        <div className='max-w-7xl mx-auto px-6 md:px-12'>
          {/*
            useSearchParams()를 쓰는 Client Component는 반드시 Suspense 안에 있어야 합니다.
            ssr:false dynamic은 Server Component에서 사용 불가 (Next.js 16).
          */}
          <Suspense fallback={<GallerySkeleton />}>
            <GalleryPageClient
              availableYears={availableYears}
              categories={categories}
            />
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
