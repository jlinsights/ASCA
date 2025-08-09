import { Suspense } from 'react'
import { ArtworksClient } from './artworks-client'

export default function ArtworksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtworksClient />
    </Suspense>
  )
} 