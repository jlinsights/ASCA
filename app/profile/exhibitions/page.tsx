import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ExhibitionManagementClient } from './exhibition-management-client'

export default function ExhibitionManagementPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
        <ExhibitionManagementClient />
      </Suspense>
      <Footer />
    </>
  )
}
