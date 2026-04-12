import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, User, Award, Calendar } from 'lucide-react'

const countryData: Record<
  string,
  {
    name: string
    nameEn: string
    flag: string
    description: string
  }
> = {
  korea: {
    name: '한국',
    nameEn: 'Korea',
    flag: '🇰🇷',
    description:
      '한국 서예는 궁체와 민체 등 고유한 한글 서예와 함께, 해서·행서·초서 등 한문 서예의 깊은 전통을 이어가고 있습니다.',
  },
  china: {
    name: '중국',
    nameEn: 'China',
    flag: '🇨🇳',
    description:
      '서예의 본고장으로, 수천 년의 역사 속에서 왕희지, 안진경 등 수많은 대가를 배출한 서예 문화의 중심지입니다.',
  },
  japan: {
    name: '일본',
    nameEn: 'Japan',
    flag: '🇯🇵',
    description:
      '일본 서도(書道)는 히라가나·가타카나의 독자적 서풍과 함께 중국 서예의 전통을 일본적으로 계승·발전시켜 왔습니다.',
  },
}

const countryArtists: Record<
  string,
  Array<{
    id: string
    name: string
    nameEn: string
    birthYear: number
    specialties: string[]
    membershipType: string
    artistType: string
    title?: string
    awards: number
    bio: string
    profileImage: string
  }>
> = {
  korea: [
    {
      id: 'kr1',
      name: '김영진',
      nameEn: 'Kim Young-jin',
      birthYear: 1965,
      specialties: ['해서', '행서'],
      membershipType: '정회원',
      artistType: '초대작가',
      title: '이사',
      awards: 5,
      bio: '전통 해서와 행서를 중심으로 활동하며, 정법의 계승을 위해 후학 양성에 힘쓰고 있습니다.',
      profileImage: '/images/artists/kimjeongrye.png',
    },
    {
      id: 'kr2',
      name: '이정화',
      nameEn: 'Lee Jeong-hwa',
      birthYear: 1972,
      specialties: ['현대서예', '초서'],
      membershipType: '정회원',
      artistType: '추천작가',
      awards: 3,
      bio: '초서를 기반으로 현대적 감각의 서예 작품을 선보이고 있으며, 다수의 국제 전시에 참여했습니다.',
      profileImage: '/images/artists/leekwonjae.avif',
    },
    {
      id: 'kr3',
      name: '박정수',
      nameEn: 'Park Jeong-su',
      birthYear: 1968,
      specialties: ['전각', '전서'],
      membershipType: '정회원',
      artistType: '초대작가',
      title: '심사위원',
      awards: 7,
      bio: '전각과 전서 분야에서 40년 이상의 경력을 가진 대한민국 대표 전각 작가입니다.',
      profileImage: '/images/artists/parkseongho.avif',
    },
    {
      id: 'kr4',
      name: '윤서영',
      nameEn: 'Yun Seo-young',
      birthYear: 1985,
      specialties: ['한글서예', '행서'],
      membershipType: '준회원',
      artistType: '청년작가',
      awards: 2,
      bio: '한글 궁체와 행서를 결합한 새로운 한글 서예의 가능성을 탐구하고 있습니다.',
      profileImage: '/images/artists/yungyeonghee.avif',
    },
    {
      id: 'kr5',
      name: '최민정',
      nameEn: 'Choi Min-jeong',
      birthYear: 1978,
      specialties: ['해서', '예서'],
      membershipType: '정회원',
      artistType: '공모작가',
      awards: 4,
      bio: '해서와 예서에 대한 깊은 이해를 바탕으로 고전 임서와 창작을 병행하고 있습니다.',
      profileImage: '/images/artists/choieunju.png',
    },
  ],
  china: [
    {
      id: 'cn1',
      name: '王明',
      nameEn: 'Wang Ming',
      birthYear: 1960,
      specialties: ['해서', '행서', '초서'],
      membershipType: '특별회원',
      artistType: '초대작가',
      title: '고문',
      awards: 12,
      bio: '중국서법가협회 회원으로, 한·중·일 동양서예대전에 다수 참가하였습니다.',
      profileImage: '/images/artists/kangdaehee.avif',
    },
    {
      id: 'cn2',
      name: '李雪梅',
      nameEn: 'Li Xue-mei',
      birthYear: 1975,
      specialties: ['전서', '예서'],
      membershipType: '특별회원',
      artistType: '추천작가',
      awards: 6,
      bio: '전서와 예서를 전공하며, 고대 금석문 연구에도 깊은 조예를 가지고 있습니다.',
      profileImage: '/images/artists/kimhyeongseok.png',
    },
    {
      id: 'cn3',
      name: '张伟',
      nameEn: 'Zhang Wei',
      birthYear: 1982,
      specialties: ['현대서예', '행서'],
      membershipType: '준회원',
      artistType: '공모작가',
      awards: 3,
      bio: '현대 서법의 새로운 방향을 모색하며, 서양 현대미술과의 접점을 탐구합니다.',
      profileImage: '/images/artists/kimjeonghee.png',
    },
  ],
  japan: [
    {
      id: 'jp1',
      name: '田中雅子',
      nameEn: 'Tanaka Masako',
      birthYear: 1958,
      specialties: ['해서', '한글서예'],
      membershipType: '특별회원',
      artistType: '초대작가',
      title: '자문위원',
      awards: 9,
      bio: '일본서도원 소속으로, 한·일 서예 교류에 30년 이상 헌신해 왔습니다.',
      profileImage: '/images/artists/mingyeongbae.png',
    },
    {
      id: 'jp2',
      name: '佐藤健一',
      nameEn: 'Sato Kenichi',
      birthYear: 1970,
      specialties: ['초서', '현대서예'],
      membershipType: '특별회원',
      artistType: '추천작가',
      awards: 5,
      bio: '전통 초서와 현대 서도의 융합을 통해 독자적인 예술 세계를 구축하고 있습니다.',
      profileImage: '/images/artists/baeogyeong.png',
    },
  ],
}

const validCountries = Object.keys(countryData) as Array<keyof typeof countryData>

export function generateStaticParams() {
  return validCountries.map(country => ({ country }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}): Promise<Metadata> {
  const { country } = await params
  const countryInfo = countryData[country]
  if (!countryInfo) {
    return { title: '국가를 찾을 수 없습니다 | 동양서예협회' }
  }
  return {
    title: `${countryInfo.flag} ${countryInfo.name} 작가 | 동양서예협회`,
    description: countryInfo.description,
    openGraph: {
      title: `${countryInfo.name} 작가 | 동양서예협회`,
      description: countryInfo.description,
    },
  }
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const countryInfo = countryData[country]
  if (!countryInfo) return notFound()

  const artists = countryArtists[country] ?? []

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4'>
            <Link href='/artists' className='hover:text-foreground transition-colors'>
              작가
            </Link>
            <span>/</span>
            <span className='text-foreground'>국가별</span>
            <span>/</span>
            <span className='text-foreground'>{countryInfo.name}</span>
          </div>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            {countryInfo.nameEn}
          </p>
          <h1 className='text-3xl md:text-5xl font-bold mb-2'>
            <span className='mr-3 text-4xl md:text-6xl'>{countryInfo.flag}</span>
            {countryInfo.name} 작가
          </h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4'>
            {countryInfo.description}
          </p>
          <p className='text-sm text-muted-foreground mt-4'>총 {artists.length}명의 작가</p>
        </div>
      </section>

      <section className='border-b border-border bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/artists'>
              <Button variant='outline' size='sm' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                전체 작가 보기
              </Button>
            </Link>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-scholar-red' />
              <span className='text-sm font-medium'>
                {countryInfo.flag} {countryInfo.name}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        {artists.length === 0 ? (
          <div className='text-center py-16'>
            <User className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
            <p className='text-lg font-medium mb-2'>등록된 작가가 없습니다</p>
            <p className='text-sm text-muted-foreground'>곧 새로운 작가가 등록될 예정입니다.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
            {artists.map(artist => (
              <Card
                key={artist.id}
                className='group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300'
              >
                <div className='relative aspect-square overflow-hidden'>
                  <Image
                    src={artist.profileImage}
                    alt={artist.name}
                    fill
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
                  <div className='absolute bottom-3 left-3 right-3'>
                    <h3 className='font-bold text-lg text-white'>{artist.name}</h3>
                    <p className='text-xs text-white/80'>{artist.nameEn}</p>
                  </div>
                </div>
                <CardContent className='p-5 space-y-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>{artist.membershipType}</span>
                    <span className='font-medium'>{artist.artistType}</span>
                  </div>

                  {artist.title && (
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>직위</span>
                      <span className='font-medium'>{artist.title}</span>
                    </div>
                  )}

                  <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>b. {artist.birthYear}</span>
                  </div>

                  <div className='flex flex-wrap gap-1.5'>
                    {artist.specialties.map(specialty => (
                      <Badge key={specialty} variant='outline' className='text-xs px-2.5 py-0.5'>
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {artist.awards > 0 && (
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50'>
                      <Award className='h-3.5 w-3.5' />
                      <span>수상 {artist.awards}회</span>
                    </div>
                  )}

                  <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                    {artist.bio}
                  </p>

                  <Link href={`/artists/${artist.id}`}>
                    <Button
                      variant='outline'
                      className='w-full mt-2 hover:bg-scholar-red hover:text-white hover:border-scholar-red transition-all duration-200'
                    >
                      작가 상세보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className='bg-muted/30 border-t border-border'>
        <div className='container mx-auto px-4 py-8 md:py-12'>
          <h2 className='text-lg md:text-xl font-semibold mb-6 text-center'>다른 국가 둘러보기</h2>
          <div className='grid grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto'>
            {validCountries.map(key => {
              const c = countryData[key]!
              return (
                <Link
                  key={key}
                  href={`/artists/country/${key}`}
                  className={`p-4 text-center rounded-lg border transition-all hover:shadow-md ${
                    key === country
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  <span className='text-2xl block mb-1'>{c.flag}</span>
                  <h3 className='font-medium text-sm'>{c.name}</h3>
                  <p className='text-xs opacity-80 mt-0.5'>{c.nameEn}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
