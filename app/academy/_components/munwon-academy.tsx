import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, CreditCard, GraduationCap, ExternalLink } from 'lucide-react'

export function MunwonAcademy() {
  return (
    <div id='munwon' className='scroll-mt-24 space-y-8'>
      <div className='text-center'>
        <h2 className='text-2xl md:text-3xl font-bold mb-2'>문원한문서예학원</h2>
        <p className='text-muted-foreground'>⟪대한검정회 한국한문교사중앙연수원⟫</p>
      </div>

      {/* Info Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Card>
          <CardContent className='flex items-start gap-3 p-4'>
            <Clock className='h-5 w-5 text-scholar-red shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-sm'>수업 시간</h4>
              <p className='text-sm text-muted-foreground'>매주 토요일: 09:30 am ~ 12:30 pm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-start gap-3 p-4'>
            <CreditCard className='h-5 w-5 text-scholar-red shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-sm'>수강료</h4>
              <p className='text-sm text-muted-foreground'>
                300,000원 | 1학기 16주 과정 (주 1회 3시간)
              </p>
              <p className='text-xs text-muted-foreground mt-1'>신한은행 110-060-843077</p>
            </div>
          </CardContent>
        </Card>
        <Card className='sm:col-span-2'>
          <CardContent className='flex items-start gap-3 p-4'>
            <MapPin className='h-5 w-5 text-scholar-red shrink-0 mt-0.5' />
            <div>
              <h4 className='font-semibold text-sm'>위치</h4>
              <a
                href='https://naver.me/5Z0Cq9Rw'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1'
              >
                서울특별시 은평구 녹번로4길 6-12 대한검정회
                <ExternalLink className='h-3 w-3' />
              </a>
              <p className='text-xs text-muted-foreground mt-1'>
                지하철 ③ ⑥호선 불광역 3번 출구에서 615m
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <GraduationCap className='h-5 w-5 text-scholar-red' />
            <h3 className='font-bold'>교육 과정 특징</h3>
          </div>
          <ol className='space-y-2 text-sm text-muted-foreground list-decimal list-inside'>
            <li>2012년부터 기존 수강 실적 포함 학기 은행제 실시</li>
            <li>수료증 수여 (하위과정부터 수강)</li>
            <li>서체별 실기 지도</li>
            <li>작품기획법 지도</li>
          </ol>
        </CardContent>
      </Card>

      {/* Completion system infographic */}
      <Card className='overflow-hidden'>
        <CardContent className='p-0'>
          <div className='bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 px-6 py-4 border-b'>
            <h3 className='font-bold text-sm'>서예교육과정 수강연한별 수료 제도</h3>
          </div>
          <div className='p-4'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/images/programs/calligraphy-curriculum.avif'
              alt='서예교육과정 수강연한별 수료 제도 인포그래픽'
              className='rounded-lg w-full max-w-3xl mx-auto'
              loading='lazy'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
