import { Suspense } from 'react'
import { CareerManagementClient } from './career-management-client'

export default function CareerManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CareerManagementClient />
    </Suspense>
  )
}
