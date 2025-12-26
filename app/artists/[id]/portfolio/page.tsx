import { Suspense } from 'react'
import { PortfolioClient } from './portfolio-client'

export default function ArtistPortfolioPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PortfolioClient artistId={params.id} />
    </Suspense>
  )
}
