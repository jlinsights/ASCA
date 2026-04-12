import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import {
  Users,
  Star,
  Award,
  Crown,
  GraduationCap,
  Brush,
  ChevronRight,
  Phone,
  MessageCircle,
  Globe,
  BookOpen,
  CalendarDays,
  Palette,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '회원 안내 | 동양서예협회',
  description:
    '동양서예협회의 회원 등급별 자격 요건, 연회비, 특전 안내. 청년작가, 일반작가, 추천작가, 초대작가, 임원 등급별 혜택과 가입 방법을 확인하세요.',
  openGraph: {
    title: '회원 안내 | 동양서예협회',
    description:
      '동양서예협회 정회원 가입 안내. 전시 활동, 교육 혜택, 디지털 서비스, 네트워크 등 다양한 특전을 확인하세요.',
  },
}

interface MemberTier {
  id: string
  title: string
  titleEn: string
  icon: React.ElementType
  annualFee: string
  registrationFee: string
  ageOrRequirement: string
  color: string
}

const MEMBER_TIERS: MemberTier[] = [
  {
    id: 'youth',
    title: '청년작가',
    titleEn: 'Youth Artist',
    icon: GraduationCap,
    annualFee: '30,000원',
    registrationFee: '입회비 10,000원',
    ageOrRequirement: '40세 이하 작가로서 협회의 이념과 목적에 동의하는 자',
    color: 'text-emerald-600',
  },
  {
    id: 'general',
    title: '일반작가',
    titleEn: 'General Artist',
    icon: Brush,
    annualFee: '50,000원',
    registrationFee: '입회비 20,000원',
    ageOrRequirement: '41세 이상 작가로서 협회의 이념과 목적에 동의하는 자',
    color: 'text-blue-600',
  },
  {
    id: 'recommended',
    title: '추천작가',
    titleEn: 'Recommended Artist',
    icon: Star,
    annualFee: '80,000원',
    registrationFee: '승급시 등록비 30,000원',
    ageOrRequirement: '3년 이상 청년/일반작가 활동 + 입상 점수 15점 이상 + 이사회 심의',
    color: 'text-amber-600',
  },
  {
    id: 'invited',
    title: '초대작가',
    titleEn: 'Invited Artist',
    icon: Award,
    annualFee: '100,000원',
    registrationFee: '승급시 등록비 50,000원',
    ageOrRequirement: '추천작가 3년 이상 활동 + 입상 점수 15점 이상 후 추가 2회 출품 + 이사회 승인',
    color: 'text-scholar-red',
  },
  {
    id: 'executive',
    title: '임원',
    titleEn: 'Executive',
    icon: Crown,
    annualFee: '200,000원',
    registrationFee: '발전기금 2,000,000원',
    ageOrRequirement: '초대작가 중 별도 활동 기준 충족 + 이사회 추천 + 총회 만장일치 승인',
    color: 'text-purple-600',
  },
]

const MEMBER_BENEFITS = [
  {
    icon: Palette,
    title: '전시 활동',
    items: [
      '대한민국 동양서예대전 출품료 할인',
      '지부/지회 주관 전시회 참가 자격',
      '초대작가/추천작가 승급 기회',
      '한·중·일 연합전시 참가 기회',
    ],
  },
  {
    icon: BookOpen,
    title: '교육 혜택',
    items: [
      '서예문화 학술세미나 참여',
      '명가 초청 특강 우선 참석',
      '서예 전문 교육프로그램 할인',
      '해외 연수 프로그램 참가자격',
    ],
  },
  {
    icon: Globe,
    title: '디지털 서비스',
    items: [
      '작가 홈페이지 제작비 할인',
      '온라인 작품 갤러리 제공',
      'SNS 홍보 지원',
      '디지털 아카이브 등재',
    ],
  },
  {
    icon: Users,
    title: '네트워크',
    items: [
      '서예가 커뮤니티 활동',
      '지역 작가들과 교류',
      '국제 교류전 참가 기회',
      '협회 공식행사 초청',
    ],
  },
]

const SCORING_TABLE = [
  { award: '입선', points: '1점' },
  { award: '특선', points: '3점' },
  { award: '삼체상', points: '5점' },
  { award: '오체상', points: '7점' },
  { award: '우수상', points: '7점' },
  { award: '최우수상', points: '8점' },
  { award: '대상', points: '9점' },
]

export default function MembershipPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Membership Guide
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>회원 안내</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            동양서예협회 정회원으로 가입하시면 전시 활동, 교육 혜택, 디지털 서비스, 네트워크 등
            다양한 특전을 누리실 수 있습니다.
          </p>
          <div className='flex justify-center gap-3 mt-6'>
            <Link
              href='https://orientalcalligraphy.channel.io'
              target='_blank'
              className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
            >
              <MessageCircle className='h-4 w-4' />
              상담 문의
            </Link>
            <Link
              href='https://cal.com/orientalcalligraphy'
              target='_blank'
              className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
            >
              <CalendarDays className='h-4 w-4' />
              상담 예약
            </Link>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12 space-y-16'>
        <div>
          <h2 className='text-2xl font-bold mb-2 text-center'>회원 등급 및 연회비</h2>
          <p className='text-sm text-muted-foreground text-center mb-8'>
            회원 종류별 연회비와 가입/승급 요건을 안내합니다.
          </p>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {MEMBER_TIERS.map(tier => (
              <Card key={tier.id} className='relative overflow-hidden'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <tier.icon className={`h-6 w-6 ${tier.color}`} />
                    <div>
                      <CardTitle className='text-lg'>{tier.title}</CardTitle>
                      <p className='text-xs text-muted-foreground'>{tier.titleEn}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-2xl font-bold'>{tier.annualFee}</span>
                    <span className='text-xs text-muted-foreground'>/ 연</span>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {tier.registrationFee}
                  </Badge>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    {tier.ageOrRequirement}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-2xl font-bold mb-2 text-center'>회원 특전</h2>
          <p className='text-sm text-muted-foreground text-center mb-8'>
            정회원으로 가입하시면 다양한 혜택을 누리실 수 있습니다.
          </p>
          <div className='grid gap-6 sm:grid-cols-2'>
            {MEMBER_BENEFITS.map(benefit => (
              <Card key={benefit.title}>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <benefit.icon className='h-5 w-5 text-scholar-red' />
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2'>
                    {benefit.items.map(item => (
                      <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
                        <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='mt-6 border-scholar-red/20 bg-muted/30'>
            <CardContent className='pt-6'>
              <div className='flex items-start gap-3'>
                <Star className='h-5 w-5 text-scholar-red shrink-0 mt-0.5' />
                <div>
                  <h4 className='font-semibold mb-1'>삼성금융네트웍스 제휴·후원 혜택</h4>
                  <p className='text-sm text-muted-foreground'>
                    연회비, 출품료, 수강료 50~100% 할인 — 금융상품 가입 조건에 따라 차등 적용
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className='text-2xl font-bold mb-2 text-center'>작가 승급 기준</h2>
          <p className='text-sm text-muted-foreground text-center mb-8'>
            대한민국 동양서예대전 입상작 배점 기준
          </p>
          <Card>
            <CardContent className='pt-6'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 pr-4 font-medium'>수상 등급</th>
                      <th className='text-right py-2 font-medium'>배점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCORING_TABLE.map(row => (
                      <tr key={row.award} className='border-b last:border-0'>
                        <td className='py-2 pr-4'>{row.award}</td>
                        <td className='text-right py-2 font-medium'>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-6 space-y-3 text-sm'>
                <div className='rounded-lg border p-4'>
                  <h4 className='font-medium mb-2'>승급 기준 점수</h4>
                  <ul className='space-y-1 text-muted-foreground'>
                    <li>1점 ~ 9점: 공모작가, 청년작가, 일반작가</li>
                    <li>
                      10점 ~ 14점: <strong className='text-foreground'>추천작가</strong>
                    </li>
                    <li>
                      15점 이상: <strong className='text-foreground'>초대작가</strong>
                    </li>
                  </ul>
                </div>
                <p className='text-muted-foreground'>
                  수상작 배점을 합산하여 추천 및 초대작가에 선정 가능한 작가는 자격심사위원회에서
                  서류심사와 작품심사로 구분하여 유자격 심사위원 전원의 3분의 2이상 찬성으로 자격을
                  부여합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className='text-2xl font-bold mb-2 text-center'>평생회원 제도</h2>
          <p className='text-sm text-muted-foreground text-center mb-8'>
            발전기금 완납 시 연회비 납부 의무를 영구히 면제받습니다.
          </p>
          <Card>
            <CardContent className='pt-6 space-y-4 text-sm'>
              <div className='flex gap-2'>
                <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                <span>
                  임원 발전기금 <strong>2백만원</strong>을 완납한 정회원은 평생회원 자격을 자동
                  취득하며, 이후 연회비 납부 의무를 영구히 면제받습니다.
                </span>
              </div>
              <div className='flex gap-2'>
                <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                <span>
                  초대작가의 평생회비는 <strong>1백만원</strong>(연회비 10만원 × 10년)으로, 이사회
                  승인을 거쳐 납부 가능합니다.
                </span>
              </div>
              <div className='flex gap-2'>
                <ChevronRight className='h-4 w-4 shrink-0 mt-0.5 text-scholar-red' />
                <span>
                  발전기금은 최대 <strong>20개월</strong>까지 CMS를 통해 분할 납부가 가능합니다.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className='text-2xl font-bold mb-2 text-center'>가입 방법</h2>
          <p className='text-sm text-muted-foreground text-center mb-8'>
            입회원서를 작성하신 후 사무국에 제출해 주세요.
          </p>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Link
              href='/forms#oc-registration-form'
              className='group flex flex-col items-center gap-3 rounded-xl border p-6 hover:bg-muted/50 transition-colors text-center'
            >
              <ExternalLink className='h-8 w-8 text-muted-foreground group-hover:text-scholar-red transition-colors' />
              <div>
                <h3 className='font-semibold mb-1'>입회원서 다운로드</h3>
                <p className='text-xs text-muted-foreground'>PDF / 한컴독스 양식</p>
              </div>
            </Link>
            <Link
              href='tel:+8250255508700'
              className='group flex flex-col items-center gap-3 rounded-xl border p-6 hover:bg-muted/50 transition-colors text-center'
            >
              <Phone className='h-8 w-8 text-muted-foreground group-hover:text-scholar-red transition-colors' />
              <div>
                <h3 className='font-semibold mb-1'>전화 상담</h3>
                <p className='text-xs text-muted-foreground'>0502-5550-8700</p>
              </div>
            </Link>
            <Link
              href='https://orientalcalligraphy.channel.io'
              target='_blank'
              className='group flex flex-col items-center gap-3 rounded-xl border p-6 hover:bg-muted/50 transition-colors text-center'
            >
              <MessageCircle className='h-8 w-8 text-muted-foreground group-hover:text-scholar-red transition-colors' />
              <div>
                <h3 className='font-semibold mb-1'>실시간 온라인 상담</h3>
                <p className='text-xs text-muted-foreground'>1년 365일 언제든 문의 가능</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
