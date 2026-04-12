import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AcademySidebar } from './_components/academy-sidebar'
import { AcademyIntro } from './_components/academy-intro'
import { MunwonAcademy } from './_components/munwon-academy'
import { InstructorAnam } from './_components/instructor-anam'
import { SacAcademy } from './_components/sac-academy'
import { PartnershipCta } from './_components/partnership-cta'

export const metadata: Metadata = {
  title: '동양서화 아카데미 | 전통서예, 현대서예, 문인화, 수묵화, 캘리그라피 전문 교육기관',
  description:
    '대한민국 정통 동양의 전통서예부터 현대서예, 문인화, 수묵화, 캘리그라피, 전각까지 전문적인 교육을 제공하는 동양서화 아카데미.',
  openGraph: {
    title: '동양서화 아카데미 | 전문 교육기관 - ASCA',
    description:
      '전통과 현대를 아우르는 동양 예술의 모든 것을 배울 수 있는 최고의 교육 기관입니다.',
    images: [
      'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
    ],
  },
}

export default function AcademyPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      {/* Hero */}
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-4'>강 좌</h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            전통의 깊이와 현대의 감각을 잇는 체계적인 서예 교육
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <AcademySidebar />

          <main className='flex-1 min-w-0 space-y-16'>
            {/* 동양서화 아카데미 소개 + 커리큘럼 */}
            <AcademyIntro />

            {/* 문원한문서예학원 */}
            <MunwonAcademy />

            {/* 아남 배옥영 교수 프로필 */}
            <InstructorAnam />

            {/* 예술의전당 서화아카데미 */}
            <SacAcademy />

            {/* 교육 협력 기관 모집 */}
            <PartnershipCta />
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
