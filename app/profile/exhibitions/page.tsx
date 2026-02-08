import { Suspense } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ExhibitionManagementClient } from './exhibition-management-client'

export default function ExhibitionManagementPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
        <ExhibitionManagementClient />
      </Suspense>
      <LayoutFooter />
    </>
  )
}
