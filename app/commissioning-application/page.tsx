import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { CommissioningView } from './_components/commissioning-view'
import '@/components/apply/apply.css'

const DESCRIPTION =
  '대한민국 동양서예대전 심사위원·운영위원·모집위원 위촉 지원서를 온라인으로 작성하거나 한글·PDF 양식으로 제출하세요. 위원별 자격, 위촉 절차, 수당, 공정성 원칙을 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  alternates: { canonical: '/commissioning-application' },
  title: '위원 위촉 지원 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '위원 위촉 지원 | 동양서예협회', description: DESCRIPTION },
}

export default function CommissioningApplicationPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <CommissioningView />
      <LayoutFooter />
    </div>
  )
}
