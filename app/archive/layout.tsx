import type { Metadata } from 'next'
import { ArchiveNav } from '@/components/archive/archive-nav'
export const metadata: Metadata = {
  title: '회원 작가 아카이브 | ASCA',
  description: '동양서예협회 회원 작가의 작품과 수상·전시 이력을 만납니다.',
}
export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='archive-shell min-h-screen bg-background text-foreground pt-28 pb-20'>
      <div className='container max-w-screen-2xl'>
        <ArchiveNav />
        {children}
      </div>
    </section>
  )
}
