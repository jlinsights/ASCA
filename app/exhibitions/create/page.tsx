import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ExhibitionCreateClient } from './exhibition-create-client'

export default function ExhibitionCreatePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
        <ExhibitionCreateClient />
      </Suspense>
      <Footer />
    </>
  )
}
