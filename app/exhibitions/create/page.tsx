import { Suspense } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ExhibitionCreateClient } from './exhibition-create-client'

export default function ExhibitionCreatePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
        <ExhibitionCreateClient />
      </Suspense>
      <LayoutFooter />
    </>
  )
}
