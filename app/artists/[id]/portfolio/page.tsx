import { Suspense } from 'react'
import { PortfolioClient } from './portfolio-client'

export default async function ArtistPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PortfolioClient artistId={id} />
    </Suspense>
  )
}
