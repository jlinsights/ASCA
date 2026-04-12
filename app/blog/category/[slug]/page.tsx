import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowLeft, ArrowRight, Tag, BookOpen } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  thumbnail: string | null
  category: string
  tags: string[]
}

interface CategoryInfo {
  slug: string
  name: string
  nameEn: string
  description: string
}

const categories: CategoryInfo[] = [
  {
    slug: 'association-news',
    name: '협회소식',
    nameEn: 'Association News',
    description: '사단법인 동양서예협회의 공식 소식과 활동을 전합니다.',
  },
  {
    slug: 'exhibition-guide',
    name: '전시안내',
    nameEn: 'Exhibition Guide',
    description: '국내외 서예 전시회 소식과 관람 안내입니다.',
  },
  {
    slug: 'calligraphy-education',
    name: '서예교육',
    nameEn: 'Calligraphy Education',
    description: '서예 교육 프로그램, 강좌 소개 및 학습 자료입니다.',
  },
  {
    slug: 'artist-interview',
    name: '작가인터뷰',
    nameEn: 'Artist Interview',
    description: '저명한 서예가들과의 인터뷰 및 작가 이야기입니다.',
  },
  {
    slug: 'cultural-exchange',
    name: '문화교류',
    nameEn: 'Cultural Exchange',
    description: '한·중·일 문화교류 프로그램 및 국제 행사 소식입니다.',
  },
]

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: '제22회 대한민국 동양서예대전 출품 안내',
    excerpt:
      '2025년 하반기 개최 예정인 제22회 대한민국 동양서예대전의 출품 요강 및 접수 일정을 안내드립니다.',
    author: '동양서예협회',
    publishedAt: '2025-03-15',
    thumbnail: null,
    category: 'association-news',
    tags: ['공모전', '서예대전', '출품안내'],
  },
  {
    id: '2',
    title: '2025년 정기총회 개최 결과 보고',
    excerpt:
      '사단법인 동양서예협회 2025년 정기총회가 성공적으로 개최되었습니다. 주요 안건과 결의 사항을 공유합니다.',
    author: '사무국',
    publishedAt: '2025-02-20',
    thumbnail: null,
    category: 'association-news',
    tags: ['총회', '협회소식'],
  },
  {
    id: '3',
    title: '제21회 동양서예대전 수상작 특별전시회',
    excerpt:
      '제21회 대한민국 동양서예대전 수상작 전시회가 예술의전당에서 개최됩니다. 대상, 최우수상 등 주요 수상작을 감상하세요.',
    author: '전시기획팀',
    publishedAt: '2025-04-01',
    thumbnail: null,
    category: 'exhibition-guide',
    tags: ['전시회', '수상작', '예술의전당'],
  },
  {
    id: '4',
    title: '한·중·일 동양서예 교류전 개최 안내',
    excerpt:
      '제22회 한·중·일 동양서예 교류전이 2025년 하반기 도쿄에서 개최됩니다. 참가 신청 방법을 안내합니다.',
    author: '국제교류팀',
    publishedAt: '2025-03-20',
    thumbnail: null,
    category: 'exhibition-guide',
    tags: ['교류전', '국제전시', '한중일'],
  },
  {
    id: '5',
    title: '초보자를 위한 해서 기초 강좌 개설',
    excerpt:
      '해서(楷書)의 기초부터 차근차근 배울 수 있는 초보자 강좌가 SAC 아카데미에서 개설되었습니다.',
    author: '교육팀',
    publishedAt: '2025-03-10',
    thumbnail: null,
    category: 'calligraphy-education',
    tags: ['해서', '초보자', '강좌'],
  },
  {
    id: '6',
    title: '온라인 서예 교실 - 행서 집중 과정',
    excerpt: '행서의 유려한 필법을 체계적으로 학습할 수 있는 8주 온라인 집중 과정을 소개합니다.',
    author: '온라인교육팀',
    publishedAt: '2025-02-28',
    thumbnail: null,
    category: 'calligraphy-education',
    tags: ['행서', '온라인강좌', '집중과정'],
  },
  {
    id: '7',
    title: '[인터뷰] 김서예 작가 - "정법과 창신의 조화"',
    excerpt:
      '제21회 대한민국 동양서예대전 대상 수상자 김서예 작가를 만나 서예 철학과 작품 세계에 대해 이야기를 나눴습니다.',
    author: '편집부',
    publishedAt: '2025-01-15',
    thumbnail: null,
    category: 'artist-interview',
    tags: ['대상수상자', '작가인터뷰', '서예철학'],
  },
  {
    id: '8',
    title: '[인터뷰] 최한글 작가 - "전서의 아름다움"',
    excerpt:
      '제20회 대상 수상자 최한글 작가가 전서(篆書)의 매력과 현대적 해석에 대해 이야기합니다.',
    author: '편집부',
    publishedAt: '2024-12-20',
    thumbnail: null,
    category: 'artist-interview',
    tags: ['전서', '작가인터뷰'],
  },
  {
    id: '9',
    title: '2025 한·일 서예 문화교류 프로그램 참가자 모집',
    excerpt:
      '올해 일본 교토에서 진행되는 서예 문화교류 프로그램 참가자를 모집합니다. 일본 서도 체험과 합동 전시 기회를 제공합니다.',
    author: '국제교류팀',
    publishedAt: '2025-04-05',
    thumbnail: null,
    category: 'cultural-exchange',
    tags: ['일본교류', '문화교류', '교토'],
  },
  {
    id: '10',
    title: '중국 서법 학회와 학술 교류 MOU 체결',
    excerpt:
      '사단법인 동양서예협회가 중국서법학회와 학술 교류 및 협력을 위한 양해각서(MOU)를 체결했습니다.',
    author: '국제교류팀',
    publishedAt: '2025-03-01',
    thumbnail: null,
    category: 'cultural-exchange',
    tags: ['중국교류', 'MOU', '학술교류'],
  },
]

const validSlugs = categories.map(c => c.slug)

export function generateStaticParams() {
  return categories.map(cat => ({ slug: cat.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find(c => c.slug === slug)
  if (!category) {
    return { title: '카테고리를 찾을 수 없습니다 - ASCA' }
  }
  return {
    title: `${category.name} | 블로그 - ASCA`,
    description: category.description,
    openGraph: {
      title: `${category.name} - 동양서예협회 블로그`,
      description: category.description,
    },
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories.find(c => c.slug === slug)

  if (!category) {
    notFound()
  }

  const posts = mockPosts.filter(p => p.category === category.slug)

  return (
    <main className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-transparent'>
        <div className='container mx-auto px-4 text-center'>
          <Badge className='mb-4 bg-scholar-red text-white hover:bg-scholar-red/90'>
            <Tag className='h-3 w-3 mr-1' />
            {category.nameEn}
          </Badge>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4'>
            {category.name}
          </h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>{category.description}</p>
        </div>
      </section>

      <div className='container mx-auto px-4 pt-8'>
        <Link
          href='/blog'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          블로그 목록으로 돌아가기
        </Link>
      </div>

      <section className='container mx-auto px-4 py-8'>
        <div className='flex flex-wrap gap-2 mb-8'>
          {categories.map(cat => (
            <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
              <Badge
                variant={cat.slug === category.slug ? 'default' : 'outline'}
                className={
                  cat.slug === category.slug
                    ? 'bg-scholar-red hover:bg-scholar-red/90 cursor-pointer'
                    : 'cursor-pointer hover:bg-muted'
                }
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {posts.map(post => (
              <Card
                key={post.id}
                className='group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border-border/60'
              >
                <div className='relative aspect-[16/9] bg-muted overflow-hidden'>
                  <div className='absolute inset-0 flex items-center justify-center bg-secondary/30'>
                    <BookOpen className='w-12 h-12 text-muted-foreground/30' />
                  </div>
                  <div className='absolute top-3 left-3'>
                    <Badge variant='secondary' className='text-xs'>
                      {category.name}
                    </Badge>
                  </div>
                </div>

                <CardContent className='flex flex-col flex-1 p-4 md:p-6'>
                  <div className='text-xs text-muted-foreground mb-3 flex items-center gap-2'>
                    <Calendar className='w-3 h-3' />
                    {formatDate(post.publishedAt)}
                    <span className='mx-1'>•</span>
                    <User className='w-3 h-3' />
                    {post.author}
                  </div>

                  <h3 className='text-lg font-bold mb-3 line-clamp-2 group-hover:text-scholar-red transition-colors'>
                    {post.title}
                  </h3>

                  <p className='text-muted-foreground text-sm line-clamp-3 mb-4 flex-1'>
                    {post.excerpt}
                  </p>

                  <div className='mt-auto pt-4 border-t border-border/50 flex justify-between items-center'>
                    {post.tags.length > 0 && (
                      <div className='flex gap-2 overflow-hidden'>
                        {post.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className='text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground truncate max-w-[80px]'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='ml-auto hover:bg-scholar-red/10 hover:text-scholar-red'
                    >
                      읽기 <ArrowRight className='w-4 h-4 ml-1' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center py-20'>
            <BookOpen className='h-16 w-16 text-muted-foreground/30 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-foreground mb-2'>
              해당 카테고리에 게시글이 없습니다
            </h3>
            <p className='text-muted-foreground mb-6'>
              아직 이 카테고리에 등록된 게시글이 없습니다. 다른 카테고리를 확인해보세요.
            </p>
            <Link href='/blog'>
              <Button variant='outline'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                블로그로 돌아가기
              </Button>
            </Link>
          </div>
        )}
      </section>

      <LayoutFooter />
    </main>
  )
}
