import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { getSupabaseClient } from '@/lib/supabase'
import { artworkImageUrl } from '@/lib/api/artwork-image'

/**
 * 작품 상세 — artworks 테이블(ASCA-2026)에서 읽는다.
 * 예전엔 손으로 만든 샘플 9점(실제 회원 작품 이미지에 지어낸 작가명·가격)만 찾아서,
 * /artworks 목록의 실제 작품 134점은 모두 404 였다(2026-10-24).
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ArtworkDetail {
  id: string
  title: string
  title_en: string | null
  description: string | null
  medium: string | null
  dimensions: unknown
  year_created: number | null
  images: unknown
  artist: { id: string; name: string; name_en: string | null } | null
}

async function loadArtwork(id: string): Promise<ArtworkDetail | null> {
  if (!UUID.test(id)) return null
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('artworks')
    .select('id,title,title_en,description,medium,dimensions,year_created,images,artist_id')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null
  const { data: artist } = await supabase
    .from('artists')
    .select('id,name,name_en')
    .eq('id', data.artist_id)
    .maybeSingle()
  return { ...data, artist: artist ?? null }
}

/** dimensions jsonb — { width, height, unit } 꼴이면 "70×135cm", 아니면 보이지 않는다 */
function formatDimensions(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const { width, height, unit } = value as { width?: unknown; height?: unknown; unit?: unknown }
  if (typeof width !== 'number' || typeof height !== 'number') return null
  return `${width}×${height}${typeof unit === 'string' ? unit : 'cm'}`
}

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const artwork = await loadArtwork((await params).id)
  if (!artwork) return { title: '작품을 찾을 수 없습니다 | 동양서예협회' }
  const by = artwork.artist ? ` — ${artwork.artist.name}` : ''
  return {
    title: `${artwork.title}${by} | 동양서예협회`,
    description: artwork.description?.slice(0, 150) || `${artwork.title}${by}`,
  }
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const artwork = await loadArtwork((await params).id)
  if (!artwork) notFound()

  const image = artworkImageUrl(artwork.images)
  const size = formatDimensions(artwork.dimensions)

  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        {...PAGE_HERO_MARKS.artworks}
        tier='band'
        title={artwork.title}
        crumbs={[{ label: '작품', href: '/artworks' }, { label: artwork.title }]}
      >
        <HeroFacts
          facts={[
            { label: '작가', value: artwork.artist?.name ?? null },
            {
              label: '제작 연도',
              value: artwork.year_created ? `${artwork.year_created}년` : null,
            },
            { label: '규격', value: size },
          ]}
        />
      </PageHero>

      <section className='container grid gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
        <div className='relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted'>
          {image ? (
            <Image
              src={image}
              alt={`${artwork.title}${artwork.artist ? ` — ${artwork.artist.name}` : ''}`}
              fill
              sizes='(max-width: 1024px) 100vw, 60vw'
              className='object-contain'
              priority
            />
          ) : (
            <p className='flex h-full items-center justify-center text-sm text-muted-foreground'>
              작품 이미지가 아직 없습니다
            </p>
          )}
        </div>

        <div className='space-y-8'>
          <dl className='divide-y border-y text-sm'>
            {[
              ['작가', artwork.artist?.name],
              ['영문 제목', artwork.title_en],
              ['재료', artwork.medium],
              ['규격', size],
              ['제작 연도', artwork.year_created ? `${artwork.year_created}년` : null],
            ]
              .filter((row): row is [string, string] => Boolean(row[1]))
              .map(([term, detail]) => (
                <div key={term} className='grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-3'>
                  <dt className='text-muted-foreground'>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
          </dl>
          {artwork.description && (
            <p className='whitespace-pre-line leading-relaxed'>{artwork.description}</p>
          )}
          <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
            {artwork.artist && (
              <Link href={`/artists/${artwork.artist.id}`} className='underline underline-offset-4'>
                {artwork.artist.name} 작가 소개
              </Link>
            )}
            <Link href='/artworks' className='underline underline-offset-4'>
              작품 목록으로
            </Link>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
