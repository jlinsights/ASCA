import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getArtist, parseArtistKey } from '@/lib/api/artists'
import { PortfolioClient } from './portfolio-client'

export default async function ArtistPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // /artists/<slug>/portfolio 도 받는다 — 포트폴리오 조회는 uuid 로만 하므로 slug 면 먼저 id 로 바꾼다
  const key = parseArtistKey(id)
  let artistId = key.kind === 'id' ? key.value : null
  if (key.kind === 'slug') artistId = (await getArtist(key.value))?.id ?? null
  if (!artistId) notFound()

  return (
    <Suspense
      fallback={<div className='min-h-screen flex items-center justify-center'>Loading...</div>}
    >
      <PortfolioClient artistId={artistId} />
    </Suspense>
  )
}
