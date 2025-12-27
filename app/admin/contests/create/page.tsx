import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ContestForm } from '@/components/admin/contest-form'

export const metadata: Metadata = {
  title: '공모전 생성 - ASCA Admin',
  description: '새로운 공모전을 생성합니다',
}

export default function AdminContestCreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/contests">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공모전 목록
            </Button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            공모전 생성
          </h1>
          <p className="text-muted-foreground mt-2">
            새로운 공모전을 생성합니다. 초안으로 저장 후 나중에 수정할 수 있습니다.
          </p>
        </div>

        <ContestForm />
      </main>

      <Footer />
    </div>
  )
}
