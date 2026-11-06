import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { FundraisingView } from './_components/fundraising-view'
import '@/components/apply/apply.css'
import '@/components/apply/support.css'

const DESCRIPTION =
  '동양서예협회 연회비·등록비·발전기금을 온라인 결제, 무통장입금, CMS 자동이체로 납부하세요. 등급별 회비와 납부 기한, 회비가 쓰이는 협회 사업, 예산·결산·회계감사 절차를 정관과 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '회비·후원 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '회비·후원 | 동양서예협회',
    description: DESCRIPTION,
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function FundraisingPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <FundraisingView />
      <LayoutFooter />
    </div>
  )
}
