'use client'

import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'
import { ExhibitionHero } from './exhibition-hero'
import { ExhibitionMetaBand } from './exhibition-meta-band'
import { ExhibitionDescription } from './exhibition-description'
import { ExhibitionArtworkGrid } from './exhibition-artwork-grid'
import { ExhibitionVisitInfo } from './exhibition-visit-info'
import { ExhibitionShareBar } from './exhibition-share-bar'

interface ExhibitionDetailBodyProps {
  exhibition: ExhibitionFull
  isOwner: boolean
  onDelete: () => Promise<void>
}

export function ExhibitionDetailBody({
  exhibition,
  isOwner,
  onDelete,
}: ExhibitionDetailBodyProps) {
  const ownerActions = isOwner ? (
    <>
      <Link href={`/exhibitions/${exhibition.id}/edit`}>
        <Button variant="outline" size="sm" className="bg-rice-paper/90 hover:bg-rice-paper">
          <Edit className="w-4 h-4 mr-2" /> 수정
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="bg-rice-paper/90 hover:bg-rice-paper text-scholar-red hover:text-scholar-red"
      >
        <Trash2 className="w-4 h-4 mr-2" /> 삭제
      </Button>
    </>
  ) : null

  return (
    <article>
      {/* Breadcrumb + ShareBar 줄 */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <nav aria-label="현재 위치" className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground">홈</Link>
          <span className="opacity-40">/</span>
          <Link href="/exhibitions" className="hover:text-foreground">전시</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-medium line-clamp-1 max-w-[40ch]">{exhibition.title}</span>
        </nav>
        <ExhibitionShareBar title={exhibition.title} />
      </div>

      <ExhibitionHero
        title={exhibition.title}
        subtitle={exhibition.subtitle}
        status={exhibition.status}
        startDate={exhibition.startDate}
        endDate={exhibition.endDate}
        isFeatured={exhibition.isFeatured}
        featuredImageUrl={exhibition.featuredImageUrl}
        ownerActions={ownerActions}
      />

      <ExhibitionMetaBand
        startDate={exhibition.startDate}
        endDate={exhibition.endDate}
        status={exhibition.status}
        location={exhibition.location}
        venue={exhibition.venue}
        curator={exhibition.curator}
        views={exhibition.views}
        ticketPrice={exhibition.ticketPrice}
      />

      <ExhibitionDescription description={exhibition.description} />

      <ExhibitionArtworkGrid artworks={exhibition.artworks} />

      {exhibition.location && (
        <ExhibitionVisitInfo
          location={exhibition.location}
          venue={exhibition.venue}
          ticketPrice={exhibition.ticketPrice}
        />
      )}

      {/* CTAStrip은 본 사이클에서 호출 안 함 — 도록 PDF 데이터 추가 시 활성화 */}
    </article>
  )
}
