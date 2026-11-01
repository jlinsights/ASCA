import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ContactView } from './_components/contact-view'
import '@/components/apply/apply.css'
import '@/components/apply/support.css'

const DESCRIPTION =
  '동양서예협회 문의 안내. 출품·회원·회비·승급·위원 지원·강좌 등 용건별 안내 페이지와 실시간 상담, 카카오톡, 전화, 이메일 창구, 공모·전시 결과 이의제기 절차, 본부와 사무소 주소를 확인하세요.'

export const metadata: Metadata = {
  title: '문의 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '문의 | 동양서예협회',
    description: DESCRIPTION,
    images: [
      'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
    ],
  },
}

// 화면 문구는 ContactView 가 선택한 언어로 그린다. 서버 렌더·메타데이터는 한국어 (로케일 라우팅 없음)
export default function ContactPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <ContactView />
      <LayoutFooter />
    </div>
  )
}
