import { Suspense } from 'react'
import { ArtworkUploadClient } from './artwork-upload-client'

export default function ArtworkUploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtworkUploadClient />
    </Suspense>
  )
}
