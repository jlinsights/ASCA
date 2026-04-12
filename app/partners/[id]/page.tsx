import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  Landmark,
  BookOpen,
  Palette,
  Handshake,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  FileText,
} from 'lucide-react'
import { getPartnerById } from '@/lib/db/queries/partners'

type PartnerDetail = {
  id: string
  name: string
  categoryId: string
  categoryName: string
  description: string
  website?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
  established?: string
  relationshipType: string
  relatedResources: Array<{ label: string; href: string }>
}

const categoryIcons: Record<string, typeof Building2> = {
  organizations: Building2,
  museums: Landmark,
  publications: BookOpen,
  galleries: Palette,
  partners: Handshake,
}

const partnerDetails: Record<string, PartnerDetail> = {
  'munhwa-cheyuk': {
    id: 'munhwa-cheyuk',
    name: '문화체육관광부',
    categoryId: 'organizations',
    categoryName: '관련 기관 및 단체',
    description:
      '대한민국의 문화, 체육, 관광 분야를 총괄하는 중앙행정기관으로, 서예를 포함한 전통문화 예술의 진흥과 지원을 담당합니다. 동양서예협회는 문화체육관광부 산하 사단법인으로 등록되어 있습니다.',
    website: 'https://www.mcst.go.kr',
    address: '세종특별자치시 어진동 388',
    phone: '044-203-2000',
    established: '1998년',
    relationshipType: '주무부처',
    relatedResources: [
      {
        label: '문화예술 정책',
        href: 'https://www.mcst.go.kr/kor/s_policy/dept/deptMain.jsp?pMenuCD=0404000000',
      },
      { label: '전통문화 진흥', href: 'https://www.mcst.go.kr' },
    ],
  },
  yechong: {
    id: 'yechong',
    name: '한국예술문화단체총연합회',
    categoryId: 'organizations',
    categoryName: '관련 기관 및 단체',
    description:
      '대한민국의 예술문화 분야 최상위 연합 단체로, 문학, 미술, 음악, 무용, 연극, 영화, 국악, 사진, 건축, 서예 등 10개 예술 분야의 협회가 소속되어 있습니다.',
    website: 'http://www.yechong.or.kr/',
    address: '서울특별시 강남구 테헤란로 7길 22',
    phone: '02-741-0281',
    established: '1961년',
    relationshipType: '상급단체',
    relatedResources: [{ label: '회원단체 현황', href: 'http://www.yechong.or.kr/' }],
  },
  arko: {
    id: 'arko',
    name: '한국문화예술위원회',
    categoryId: 'organizations',
    categoryName: '관련 기관 및 단체',
    description:
      '문화예술 진흥을 위한 사업과 활동을 지원하는 기관으로, 동양서예협회의 전시 및 문화교류 프로그램에 대한 지원을 받고 있습니다.',
    website: 'https://www.arko.or.kr/',
    address: '서울특별시 종로구 대학로 116 예술가의집',
    phone: '02-760-4500',
    established: '2005년',
    relationshipType: '지원기관',
    relatedResources: [
      { label: '예술지원사업', href: 'https://www.arko.or.kr/' },
      { label: '예술가의집', href: 'https://www.arko.or.kr/arthouse/' },
    ],
  },
  sac: {
    id: 'sac',
    name: '예술의전당',
    categoryId: 'museums',
    categoryName: '미술관 및 박물관',
    description:
      '대한민국을 대표하는 종합예술기관으로, 서예박물관을 운영하며 매년 다수의 서예 기획전과 초대전을 개최합니다. 동양서예협회는 이곳에서 연례 동양서예대전을 개최합니다.',
    website: 'https://www.sac.or.kr',
    address: '서울특별시 서초구 남부순환로 2406',
    phone: '02-580-1300',
    hours: '화–일 11:00–20:00 (월요일 휴관)',
    established: '1988년',
    relationshipType: '전시 협력',
    relatedResources: [
      { label: '서예박물관', href: 'https://www.sac.or.kr' },
      { label: '전시 일정', href: 'https://www.sac.or.kr' },
    ],
  },
  'national-museum': {
    id: 'national-museum',
    name: '국립중앙박물관',
    categoryId: 'museums',
    categoryName: '미술관 및 박물관',
    description:
      '대한민국 최대의 박물관으로 서화 컬렉션을 통해 한국 서예의 역사를 조명하고 있습니다. 소장품에는 추사 김정희를 비롯한 조선 시대 명필가들의 작품이 포함되어 있습니다.',
    website: 'https://www.museum.go.kr',
    address: '서울특별시 용산구 서빙고로 137',
    phone: '02-2077-9000',
    hours: '월·화·목·금 10:00–18:00, 수·토 10:00–21:00, 일·공휴일 10:00–19:00',
    established: '1945년',
    relationshipType: '소장품 연구 협력',
    relatedResources: [{ label: '서화 컬렉션', href: 'https://www.museum.go.kr' }],
  },
  'hanja-research': {
    id: 'hanja-research',
    name: '사단법인 대한민국한자교육연구회 | 대한검정회',
    categoryId: 'partners',
    categoryName: '파트너',
    description:
      '한자 교육과 한자 능력 검정을 전문으로 하는 단체로, 서예 교육과 한자 학습의 접점에서 동양서예협회와 긴밀한 협력 관계를 유지하고 있습니다.',
    website: 'https://www.hanja.ne.kr',
    address: '서울특별시 종로구',
    established: '1990년대',
    relationshipType: '교육 파트너',
    relatedResources: [{ label: '한자 검정 시험', href: 'https://www.hanja.ne.kr' }],
  },
  eimbook: {
    id: 'eimbook',
    name: '이아임디자인 | 이아임북',
    categoryId: 'partners',
    categoryName: '파트너',
    description:
      '서예 관련 도서 출판 및 디자인 전문 업체로, 동양서예협회의 전시 도록, 작품집, 홍보물 제작을 담당합니다.',
    website: 'http://eimbook.com/',
    relationshipType: '출판 파트너',
    relatedResources: [{ label: '출판 카탈로그', href: 'http://eimbook.com/' }],
  },
}

const validPartnerIds = Object.keys(partnerDetails)

export function generateStaticParams() {
  return validPartnerIds.map(id => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const partner = partnerDetails[id]
  if (!partner) {
    return { title: '유관단체를 찾을 수 없습니다 | 동양서예협회' }
  }
  return {
    title: `${partner.name} | 유관단체 | 동양서예협회`,
    description: partner.description,
    openGraph: {
      title: `${partner.name} | 동양서예협회`,
      description: partner.description,
    },
  }
}

const categoryNameMap: Record<string, string> = {
  government: '관련 기관 및 단체',
  museum: '미술관 및 박물관',
  gallery: '갤러리',
  publication: '출판',
  education: '교육',
  partner: '파트너',
  sponsor: '후원사',
}

const categoryToIconKey: Record<string, string> = {
  government: 'organizations',
  museum: 'museums',
  gallery: 'galleries',
  publication: 'publications',
  education: 'organizations',
  partner: 'partners',
  sponsor: 'partners',
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let partner = partnerDetails[id] ?? null

  if (!partner) {
    try {
      const dbPartner = await getPartnerById(id)
      if (dbPartner) {
        partner = {
          id: dbPartner.id,
          name: dbPartner.name,
          categoryId: categoryToIconKey[dbPartner.category] ?? 'partners',
          categoryName: categoryNameMap[dbPartner.category] ?? dbPartner.category,
          description: dbPartner.description ?? '',
          website: dbPartner.website ?? undefined,
          address: dbPartner.address ?? undefined,
          phone: dbPartner.phone ?? undefined,
          email: dbPartner.email ?? undefined,
          relationshipType: dbPartner.relationshipType ?? '',
          relatedResources: dbPartner.website
            ? [{ label: '공식 웹사이트', href: dbPartner.website }]
            : [],
        }
      }
    } catch {
      // DB 연결 실패 시 mock fallback
    }
  }

  if (!partner) return notFound()

  const CategoryIcon = categoryIcons[partner.categoryId] ?? Building2

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6'>
            <Link href='/partners' className='hover:text-foreground transition-colors'>
              유관단체
            </Link>
            <span>/</span>
            <span className='text-foreground'>{partner.name}</span>
          </div>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-scholar-red/10 mb-4'>
              <CategoryIcon className='w-8 h-8 text-scholar-red' />
            </div>
            <h1 className='text-2xl md:text-4xl font-bold mb-3'>{partner.name}</h1>
            <div className='flex items-center justify-center gap-3 flex-wrap'>
              <Badge variant='secondary'>{partner.categoryName}</Badge>
              <Badge variant='outline' className='border-scholar-red/30 text-scholar-red'>
                {partner.relationshipType}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6'>
            <Link href='/partners'>
              <Button variant='outline' size='sm' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                전체 유관단체 보기
              </Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-scholar-red' />
                    소개
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground leading-relaxed'>{partner.description}</p>
                </CardContent>
              </Card>

              {partner.relatedResources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Globe className='h-5 w-5 text-scholar-red' />
                      관련 자료
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='divide-y'>
                      {partner.relatedResources.map((resource, idx) => (
                        <Link
                          key={idx}
                          href={resource.href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center justify-between py-3 hover:text-scholar-red transition-colors group'
                        >
                          <span className='text-sm'>{resource.label}</span>
                          <ExternalLink className='h-4 w-4 text-muted-foreground group-hover:text-scholar-red transition-colors' />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>연락처 정보</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {partner.address && (
                    <div className='flex items-start gap-3'>
                      <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                      <span className='text-sm text-muted-foreground'>{partner.address}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className='flex items-center gap-3'>
                      <Phone className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                      <span className='text-sm text-muted-foreground'>{partner.phone}</span>
                    </div>
                  )}
                  {partner.email && (
                    <div className='flex items-center gap-3'>
                      <Mail className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                      <span className='text-sm text-muted-foreground'>{partner.email}</span>
                    </div>
                  )}
                  {partner.hours && (
                    <div className='flex items-start gap-3'>
                      <Clock className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                      <span className='text-sm text-muted-foreground'>{partner.hours}</span>
                    </div>
                  )}
                  {partner.established && (
                    <div className='flex items-center gap-3'>
                      <Building2 className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                      <span className='text-sm text-muted-foreground'>
                        설립 {partner.established}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {partner.website && (
                <Link
                  href={partner.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block'
                >
                  <Button className='w-full bg-scholar-red hover:bg-scholar-red/90 text-white flex items-center gap-2'>
                    <ExternalLink className='h-4 w-4' />
                    공식 웹사이트 방문
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
