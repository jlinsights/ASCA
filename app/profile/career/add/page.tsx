import { Suspense } from 'react'
import { CareerEntryFormClient } from './career-entry-form-client'

export default function AddCareerEntryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CareerEntryFormClient />
    </Suspense>
  )
}
