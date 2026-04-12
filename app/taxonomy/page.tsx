import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brush, Layers, MapPin, Palette, BookOpen, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '분류 체계 | 동양서예협회',
  description:
    '동양서예협회의 작품 및 작가 분류 체계를 한눈에 살펴보세요. 서체별, 유형별, 국가별로 탐색할 수 있습니다.',
  openGraph: {
    title: '분류 체계 | 동양서예협회',
    description: '서체별, 유형별, 국가별 분류 체계를 통해 동양서예의 다양한 세계를 탐색하세요.',
  },
}

const taxonomySections = [
  {
    id: 'genres',
    title: '서체별 분류',
    titleEn: 'By Genre / Script',
    icon: Brush,
    description: '동양 서예의 다섯 가지 기본 서체와 한글서예, 현대서예, 전각을 포함한 분류입니다.',
    items: [
      { slug: 'haeseo', name: '해서', sub: '楷書 · Regular Script', count: 4 },
      { slug: 'hangseo', name: '행서', sub: '行書 · Semi-cursive', count: 3 },
      { slug: 'choseo', name: '초서', sub: '草書 · Cursive Script', count: 2 },
      { slug: 'jeonseo', name: '전서', sub: '篆書 · Seal Script', count: 2 },
      { slug: 'yeseo', name: '예서', sub: '隸書 · Clerical Script', count: 2 },
      { slug: 'hangul', name: '한글서예', sub: '韓文書藝 · Hangul', count: 3 },
      { slug: 'modern', name: '현대서예', sub: '現代書藝 · Modern', count: 3 },
      { slug: 'jeongak', name: '전각', sub: '篆刻 · Seal Carving', count: 2 },
    ],
    basePath: '/artworks/genre',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    id: 'types',
    title: '유형별 분류',
    titleEn: 'By Type',
    icon: Layers,
    description: '작품의 성격과 시대적 맥락에 따른 분류입니다.',
    items: [
      { slug: 'traditional', name: '전통', sub: 'Traditional · 正法 계승', count: 6 },
      { slug: 'contemporary', name: '현대', sub: 'Contemporary · 創新 융합', count: 4 },
      { slug: 'experimental', name: '실험', sub: 'Experimental · 경계 확장', count: 3 },
    ],
    basePath: '/artworks/type',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/20',
  },
  {
    id: 'countries',
    title: '국가별 분류',
    titleEn: 'By Country',
    icon: MapPin,
    description: '한국, 중국, 일본 — 동양 서예 3국의 작가와 작품을 국가별로 살펴봅니다.',
    items: [
      { slug: 'korea', name: '🇰🇷 한국', sub: 'Korea · 한글서예와 한문서예', count: 5 },
      { slug: 'china', name: '🇨🇳 중국', sub: 'China · 서예의 본고장', count: 3 },
      { slug: 'japan', name: '🇯🇵 일본', sub: 'Japan · 서도(書道)의 전통', count: 2 },
    ],
    basePath: '/artists/country',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  {
    id: 'categories',
    title: '카테고리별 분류',
    titleEn: 'By Category',
    icon: Palette,
    description: '서예, 회화, 조각, 혼합매체 등 작품의 매체와 형식에 따른 분류입니다.',
    items: [
      { slug: 'calligraphy', name: '서예', sub: 'Calligraphy · 문자 예술', count: 12 },
      { slug: 'painting', name: '회화', sub: 'Painting · 동양화 · 수묵화', count: 6 },
      { slug: 'sculpture', name: '조각', sub: 'Sculpture · 입체 조형', count: 3 },
      { slug: 'mixed-media', name: '혼합매체', sub: 'Mixed Media · 실험적 작품', count: 4 },
    ],
    basePath: '/artworks/category',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50/50 dark:bg-rose-950/20',
  },
]

export default function TaxonomyPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Taxonomy
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>분 류 체 계</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            동양서예협회의 작품과 작가를 다양한 분류 기준으로 탐색하세요. 서체, 유형, 국가, 카테고리
            등 체계적인 분류를 통해 동양 서예의 넓은 세계를 발견할 수 있습니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-5xl mx-auto space-y-10'>
          {taxonomySections.map(section => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id}>
                <div className='flex items-center gap-3 mb-5'>
                  <div
                    className={`w-10 h-10 rounded-lg bg-scholar-red/10 flex items-center justify-center`}
                  >
                    <Icon className='w-5 h-5 text-scholar-red' />
                  </div>
                  <div>
                    <h2 className='text-xl font-bold'>{section.title}</h2>
                    <p className='text-xs text-muted-foreground'>{section.titleEn}</p>
                  </div>
                </div>
                <p className='text-sm text-muted-foreground mb-4 ml-[52px]'>
                  {section.description}
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ml-0 md:ml-[52px]'>
                  {section.items.map(item => (
                    <Link
                      key={item.slug}
                      href={`${section.basePath}/${item.slug}`}
                      className='group'
                    >
                      <Card
                        className={`border hover:shadow-md transition-all duration-200 hover:border-scholar-red/30 ${section.bgColor}`}
                      >
                        <CardContent className='p-4 flex items-center justify-between'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <h3 className='font-medium text-sm'>{item.name}</h3>
                              <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                                {item.count}
                              </Badge>
                            </div>
                            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>
                              {item.sub}
                            </p>
                          </div>
                          <ChevronRight className='h-4 w-4 text-muted-foreground group-hover:text-scholar-red transition-colors flex-shrink-0' />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className='bg-muted/30 border-t border-border'>
        <div className='container mx-auto px-4 py-8 md:py-12'>
          <div className='max-w-3xl mx-auto text-center'>
            <BookOpen className='h-8 w-8 mx-auto text-scholar-red mb-4' />
            <h2 className='text-lg font-semibold mb-2'>동양 서예의 세계를 탐험하세요</h2>
            <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
              동양서예협회는 한국, 중국, 일본 3국의 서예 문화를 아우르며, 전통의 계승과 현대적
              창신을 동시에 추구합니다.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Link href='/artworks'>
                <Badge
                  variant='outline'
                  className='text-sm px-4 py-2 cursor-pointer hover:bg-muted transition-colors'
                >
                  작품 둘러보기 →
                </Badge>
              </Link>
              <Link href='/artists'>
                <Badge
                  variant='outline'
                  className='text-sm px-4 py-2 cursor-pointer hover:bg-muted transition-colors'
                >
                  작가 둘러보기 →
                </Badge>
              </Link>
              <Link href='/partners'>
                <Badge
                  variant='outline'
                  className='text-sm px-4 py-2 cursor-pointer hover:bg-muted transition-colors'
                >
                  유관단체 보기 →
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
