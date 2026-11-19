import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AcademyHero, AcademyToc } from './_components/academy-hero'
import { AcademyIntro } from './_components/academy-intro'
import { AcademySubjects } from './_components/academy-subjects'
import { MunwonAcademy } from './_components/munwon-academy'
import { SacAcademy } from './_components/sac-academy'
import { PartnershipCta } from './_components/partnership-cta'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'
import './_components/academy.css'

const metadata: Metadata = {
  alternates: { canonical: '/academy' },
  title: '강좌 | 동양서예협회',
  description:
    '동양서예협회가 연결하는 서예 강좌 안내. 문원한문서예학원 토요 정규 과정과 예술의전당 서화아카데미 2026 가을정규 시간표, 수강료, 협회 수강생 출품료 할인을 확인하세요.',
  openGraph: {
    title: '강좌 | 동양서예협회',
    description:
      '한문·한글서예, 문인화, 캘리그라피, 민화, 전각. 협회가 승인한 교육기관의 강좌와 시간표를 한곳에서 안내합니다.',
  },
}

export default function AcademyPage() {
  return (
    <div className='asca-ac min-h-screen'>
      <AcademyHero />
      <div className='asca-ac__body'>
        <AcademyToc />
        <AcademyIntro />
        <AcademySubjects />
        <MunwonAcademy />
        <SacAcademy />
        <PartnershipCta />
      </div>
      <LayoutFooter />
    </div>
  )
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/academy', metadata)
