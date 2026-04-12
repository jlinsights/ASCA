import { Handshake } from 'lucide-react'

export function PartnershipCta() {
  return (
    <div id='partnership' className='scroll-mt-24'>
      <div className='rounded-xl border bg-gradient-to-br from-scholar-red/5 via-background to-scholar-red/5 p-8 md:p-12 text-center'>
        <div className='flex justify-center mb-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-scholar-red/10 text-scholar-red'>
            <Handshake className='h-6 w-6' />
          </div>
        </div>
        <h2 className='text-2xl font-bold mb-3'>교육 협력 기관 모집</h2>
        <p className='text-muted-foreground max-w-lg mx-auto mb-6 text-sm leading-relaxed'>
          동양서예협회와 협력관계를 희망하시는
          <br />
          서예, 현대서예, 캘리그라피, 서각/전각 및 문인화 부문
          <br />
          인가받은 교육기관의 연락을 기다립니다.
        </p>
        <a
          href='https://cal.com/orientalcalligraphy/academy'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center rounded-md bg-scholar-red px-6 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
        >
          제휴 문의하기
        </a>
      </div>
    </div>
  )
}
