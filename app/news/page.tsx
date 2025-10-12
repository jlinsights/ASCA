'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Calendar, 
  Eye, 
  Heart, 
  Share2,
  Clock,
  User,
  Tag,
  ArrowRight,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

// 뉴스 데이터
const newsData = [
  {
    id: '1',
    title: '2024 동양서예협회 정기전 성황리 개막',
    titleEn: '2024 ASCA Annual Exhibition Opens Successfully',
    summary: '전통과 현대가 조화를 이루는 뜻깊은 전시가 서울시립미술관에서 시작되었습니다.',
    summaryEn: 'A meaningful exhibition harmonizing tradition and modernity has begun at Seoul Museum of Art.',
    content: `2024년 동양서예협회 정기전 '정법과 창신의 조화'가 3월 15일 서울시립미술관에서 성황리에 개막했습니다.

이번 전시는 전통 서예의 정법을 계승하면서도 현대적 창신을 추구하는 작가들의 작품 24점을 선보입니다. 김서예, 이묵향, 박문인 등 8명의 작가가 참여하여 각자의 독창적인 작품 세계를 펼쳐 보입니다.

개막식에는 200여 명의 서예 애호가들이 참석하여 뜨거운 관심을 보였으며, 특히 젊은 관람객들의 참여가 눈에 띄게 증가했습니다.

전시는 4월 15일까지 계속되며, 매주 토요일 오후 2시에는 작가와의 만남 시간이 마련됩니다.`,
    contentEn: `The 2024 ASCA Annual Exhibition 'Harmony of Orthodox Dharma and Innovation' opened successfully on March 15 at Seoul Museum of Art.

This exhibition showcases 24 works by artists who pursue modern innovation while inheriting the orthodox dharma of traditional calligraphy. Eight artists including Kim Seoye, Lee Mukhyang, and Park Munin participate to unfold their unique artistic worlds.

About 200 calligraphy enthusiasts attended the opening ceremony, showing great interest, and the participation of young visitors has notably increased.

The exhibition continues until April 15, with artist meetings scheduled every Saturday at 2 PM.`,
    category: 'exhibition',
    author: '동양서예협회',
    authorEn: 'ASCA',
    publishedAt: '2024-03-15',
    featuredImage: '/images/news/news-001.jpg',
    tags: ['전시회', '정기전', '서울시립미술관'],
    tagsEn: ['exhibition', 'annual', 'seoul-museum'],
    views: 1250,
    likes: 89,
    comments: 23,
    isFeatured: true,
    isBreaking: false
  },
  {
    id: '2',
    title: '한중일 서예 교류전 5월 개최 예정',
    titleEn: 'Korea-China-Japan Calligraphy Exchange Exhibition Scheduled for May',
    summary: '동아시아 3개국 서예 문화의 만남을 통해 상호 이해와 교류를 증진하는 국제 전시가 준비되고 있습니다.',
    summaryEn: 'An international exhibition to promote mutual understanding and exchange through the meeting of calligraphy cultures from three East Asian countries is being prepared.',
    content: `오는 5월 1일부터 6월 30일까지 국립현대미술관에서 '동아시아 서예 교류전'이 개최됩니다.

이번 교류전은 한국, 중국, 일본 3개국의 대표 서예 작가 12명이 참여하는 대규모 국제 전시로, 각국의 서예 전통과 현대적 해석을 한자리에서 비교 감상할 수 있는 귀중한 기회입니다.

한국에서는 김서예, 이묵향 작가가 참여하며, 중국에서는 왕서법, 리묵화 작가, 일본에서는 다나카 쇼도, 사토 후데 작가 등이 참여할 예정입니다.

전시 기간 중에는 3개국 작가들의 공동 작품 제작 퍼포먼스와 서예 워크숍도 진행될 예정입니다.`,
    contentEn: `The 'East Asian Calligraphy Exchange Exhibition' will be held from May 1 to June 30 at the National Museum of Modern and Contemporary Art.

This exchange exhibition is a large-scale international exhibition featuring 12 representative calligraphy artists from Korea, China, and Japan, offering a valuable opportunity to compare and appreciate each country's calligraphy traditions and modern interpretations in one place.

From Korea, artists Kim Seoye and Lee Mukhyang will participate, from China, Wang Shufa and Li Mohua, and from Japan, Tanaka Shodo and Sato Fude are scheduled to participate.

During the exhibition period, collaborative artwork creation performances and calligraphy workshops by artists from the three countries are also planned.`,
    category: 'event',
    author: '편집부',
    authorEn: 'Editorial Team',
    publishedAt: '2024-03-10',
    featuredImage: '/images/news/news-002.jpg',
    tags: ['국제교류', '한중일', '국립현대미술관'],
    tagsEn: ['international', 'korea-china-japan', 'mmca'],
    views: 890,
    likes: 67,
    comments: 15,
    isFeatured: true,
    isBreaking: false
  },
  {
    id: '3',
    title: '젊은 서예가들의 실험적 도전',
    titleEn: 'Experimental Challenges by Young Calligraphers',
    summary: '전통의 경계를 넘나드는 젊은 작가들의 혁신적인 작품들이 주목받고 있습니다.',
    summaryEn: 'Innovative works by young artists transcending traditional boundaries are gaining attention.',
    content: `최근 젊은 서예가들 사이에서 전통 서예의 경계를 넘나드는 실험적 작품들이 늘어나고 있습니다.

박문인, 최현대, 정실험 등의 작가들은 디지털 기술과 전통 서예를 결합하거나, 새로운 재료와 기법을 도입하여 서예의 새로운 가능성을 탐구하고 있습니다.

특히 박문인 작가의 '서예의 미래' 시리즈는 LED와 인터랙티브 기술을 활용하여 관람객이 직접 참여할 수 있는 작품으로 큰 화제를 모았습니다.

이러한 실험적 시도들은 전통 서예계에서도 긍정적인 반응을 얻고 있으며, 서예의 현대적 계승 방안에 대한 새로운 담론을 제시하고 있습니다.`,
    contentEn: `Recently, experimental works that transcend the boundaries of traditional calligraphy are increasing among young calligraphers.

Artists such as Park Munin, Choi Hyeondae, and Jung Silheom are exploring new possibilities in calligraphy by combining digital technology with traditional calligraphy or introducing new materials and techniques.

In particular, artist Park Munin's 'Future of Calligraphy' series, which utilizes LED and interactive technology to allow direct audience participation, has attracted great attention.

These experimental attempts are receiving positive responses even in traditional calligraphy circles and are presenting new discourse on modern succession methods of calligraphy.`,
    category: 'artist',
    author: '김기자',
    authorEn: 'Reporter Kim',
    publishedAt: '2024-03-05',
    featuredImage: '/images/news/news-003.jpg',
    tags: ['젊은작가', '실험', '현대서예'],
    tagsEn: ['young-artists', 'experimental', 'modern-calligraphy'],
    views: 654,
    likes: 45,
    comments: 8,
    isFeatured: false,
    isBreaking: false
  },
  {
    id: '4',
    title: '서예 교육의 디지털 전환',
    titleEn: 'Digital Transformation in Calligraphy Education',
    summary: 'AI와 VR 기술을 활용한 새로운 서예 교육 방법이 도입되고 있습니다.',
    summaryEn: 'New calligraphy education methods utilizing AI and VR technology are being introduced.',
    content: `동양서예협회가 AI와 VR 기술을 활용한 혁신적인 서예 교육 프로그램을 개발했습니다.

이 프로그램은 AI가 학습자의 붓놀림을 실시간으로 분석하여 개인 맞춤형 피드백을 제공하며, VR 환경에서는 명작 서예를 3D로 체험할 수 있습니다.

특히 코로나19 이후 비대면 교육의 필요성이 증가하면서, 이러한 디지털 기술의 도입은 서예 교육의 접근성을 크게 향상시킬 것으로 기대됩니다.

시범 운영 결과, 학습 효과가 기존 대비 30% 향상되었으며, 젊은 세대의 서예에 대한 관심도 크게 증가했습니다.`,
    contentEn: `The Asian Calligraphy Association has developed an innovative calligraphy education program utilizing AI and VR technology.

This program provides personalized feedback by having AI analyze learners' brush movements in real-time, and allows 3D experience of masterpiece calligraphy in VR environments.

Especially as the need for non-contact education has increased since COVID-19, the introduction of such digital technology is expected to greatly improve accessibility to calligraphy education.

Pilot operation results showed a 30% improvement in learning effectiveness compared to existing methods, and interest in calligraphy among younger generations has also significantly increased.`,
    category: 'education',
    author: '이기자',
    authorEn: 'Reporter Lee',
    publishedAt: '2024-02-28',
    featuredImage: '/images/news/news-004.jpg',
    tags: ['교육', 'AI', 'VR', '디지털'],
    tagsEn: ['education', 'ai', 'vr', 'digital'],
    views: 432,
    likes: 28,
    comments: 12,
    isFeatured: false,
    isBreaking: true
  },
  {
    id: '5',
    title: '제22회 대한민국 동양서예대전 공모전 수상자 명단 발표',
    titleEn: '22nd Korea Oriental Calligraphy Competition Winners Announced',
    summary: '제22회 대한민국 동양서예대전 공모전의 수상자 명단이 발표되었습니다. 대상을 비롯해 총 146점의 수상작이 선정되었습니다.',
    summaryEn: 'The winners of the 22nd Korea Oriental Calligraphy Competition have been announced. A total of 146 winning works were selected, including the Grand Prize.',
    content: `제22회 대한민국 동양서예대전 공모전 수상자 명단이 발표되었습니다.

■ 대상 (1점)
- 한문서예 부문: 《秋日登濟川亭》 徐居正 - 일묵문선(一墨文宣)

■ 최우수상 (2점)
- 한글서예 부문: 고린도전서 13장 1절~7절 - 소담 금혜란(小潭 金惠蘭)

■ 우수상 (3점)
- 십수부의 사랑하면 나를라 - 단비 鄭殷智(丹雨 鄭殷智) [한글서예 부문]
- 체정 西山大師 讚詩 - 晴峰 韓永美(晴峰 韓永美) [한문서예 부문]  
- 김용택의 '달이 뜨다고 전화를 주시다니요' - 실음 金善子(實音 金善子) [캘리그라피 부문]

■ 오체상 (2점)
- 沼堂 都在鶴(沼堂 都在鶴)
- 雪花 李寶淑(雪花 李寶淑)

■ 특선 (24점)
전통서예 부문 (13점):
樂川 金鎭會, 竹山 金善浩, 曉山 金載福, 素雲 金靜我, 꽃비 金玄喆, 소담 金惠蘭, 兼善 閔千植

현대·캘리 부문 (11점):
湖間 姜明姬, 照勳 孔慶順, 如法 金均福, 陶以 柳志美, 燭政 朴惠貞, 如倪 申承和, 效仁 李濟淡, 금꽃 李英姬, 雲潭 陸千植, 松河 林琮希

■ 입선 (114점)
전통서예 부문 (27점), 현대·캘리 부문 (22점) 등 총 49점의 입선작이 선정되었습니다.

수상작 전시회는 추후 공지될 예정이며, 모든 수상자에게는 상장과 부상이 수여됩니다.

이번 공모전에는 전국에서 많은 작가들이 참여하여 한국 서예 문화의 발전과 계승에 기여하는 뜻깊은 행사가 되었습니다.`,
    contentEn: `The winners of the 22nd Korea Oriental Calligraphy Competition have been announced.

■ Grand Prize (1 work)
- Chinese Calligraphy Division: "Autumn Day Climbing Jeicheon Pavilion" by Seo Geo-jeong - Ilmuk Munseon

■ Excellence Award (2 works)  
- Korean Calligraphy Division: Gorindo Jeonseo Chapter 13, Verses 1-7 - Sodam Geum Hye-ran

■ Merit Award (3 works)
- "If You Love the Ten-Number Department" - Danbi Jeong Eun-ji [Korean Calligraphy Division]
- "Chejeong Xishan Master's Praise Poem" - Jeongbong Han Yeong-mi [Chinese Calligraphy Division]
- Kim Yong-taek's "Calling to Say the Moon is Rising" - Sileum Kim Seon-ja [Calligraphy Art Division]

■ Five Scripts Award (2 works)
- Jodang Do Jae-hak
- Seolhwa Lee Bo-suk

■ Special Selection (24 works)
Traditional Calligraphy Division (13 works):
Nakcheon Kim Jin-hoe, Juksan Kim Seon-ho, Hyosan Kim Jae-bok, Soun Kim Jeong-a, Kkotbi Kim Hyeon-cheol, Sodam Kim Hye-ran, Gyeonseon Min Cheon-sik

Modern & Calligraphy Division (11 works):
Hogan Gang Myeong-hui, Johun Gong Gyeong-sun, Yeobeop Kim Gyun-bok, Doui Ryu Ji-mi, Chokjeong Park Hye-jeong, Yeoye Shin Seung-hwa, Hyoin Lee Je-dam, Geumkkot Lee Yeong-hui, Undam Yuk Cheon-sik, Songha Lim Jong-hui

■ Selected Works (114 works)
A total of 49 selected works were chosen, including 27 from the Traditional Calligraphy Division and 22 from the Modern & Calligraphy Division.

The exhibition of winning works will be announced later, and all winners will receive certificates and prizes.

This competition saw participation from many artists nationwide, making it a meaningful event contributing to the development and succession of Korean calligraphy culture.`,
    category: 'award',
    author: '동양서예협회',
    authorEn: 'ASCA',
    publishedAt: '2024-03-25',
    featuredImage: '/images/news/award-winners-2024.jpg',
    tags: ['제22회', '공모전', '수상자', '명단', '대상', '최우수상'],
    tagsEn: ['22nd', 'competition', 'winners', 'list', 'grand-prize', 'excellence-award'],
    views: 3250,
    likes: 198,
    comments: 67,
    isFeatured: true,
    isBreaking: true
  },
  {
    id: '6',
    title: '서예 공모전 심사 기준과 평가 방법 공개',
    titleEn: 'Calligraphy Competition Judging Criteria and Evaluation Methods Revealed',
    summary: '투명하고 공정한 심사를 위한 세부 기준과 절차가 공개되었습니다.',
    summaryEn: 'Detailed criteria and procedures for transparent and fair judging have been disclosed.',
    content: `동양서예협회가 공모전의 투명성과 공정성을 높이기 위해 심사 기준과 평가 방법을 상세히 공개했습니다.

■ 심사 기준 (총 100점)
1. 서법의 정확성 (30점): 전통 서법에 대한 이해와 정확한 구사
2. 조형미 (25점): 전체적인 구성과 균형, 시각적 아름다움
3. 창의성 (20점): 개성적 표현과 독창적 해석
4. 기법의 숙련도 (15점): 붓놀림의 자연스러움과 기법의 완성도
5. 작품의 완성도 (10점): 전체적인 마무리와 세부 처리

■ 수상 등급별 기준
- 대상: 95점 이상 (전 부문 최고점)
- 최우수상: 90점 이상
- 우수상: 85점 이상
- 오체상: 각 서체별 80점 이상 최고점
- 삼체상: 혼합 서체 80점 이상 최고점
- 특선: 75점 이상
- 입선: 70점 이상

■ 심사 절차
1차 서류심사 → 2차 작품심사 → 3차 최종심사 → 심사위원 합의

모든 심사는 익명으로 진행되며, 심사위원들의 점수는 평균화하여 최종 점수를 산출합니다.`,
    contentEn: `The Asian Calligraphy Association has disclosed detailed judging criteria and evaluation methods to enhance transparency and fairness in competitions.

■ Judging Criteria (Total 100 points)
1. Accuracy of Calligraphy (30 points): Understanding and accurate execution of traditional calligraphy
2. Aesthetic Beauty (25 points): Overall composition, balance, and visual beauty
3. Creativity (20 points): Individual expression and original interpretation
4. Technical Proficiency (15 points): Natural brush movement and technical completion
5. Work Completion (10 points): Overall finishing and detail processing

■ Award Grade Standards
- Grand Prize: 95+ points (highest score across all categories)
- Excellence Award: 90+ points
- Merit Award: 85+ points
- Five Scripts Award: 80+ points highest in each script category
- Three Scripts Award: 80+ points highest in mixed script category
- Special Selection: 75+ points
- Selected Works: 70+ points

■ Judging Process
1st Document Review → 2nd Work Evaluation → 3rd Final Review → Judge Consensus

All judging is conducted anonymously, and judges' scores are averaged to calculate final scores.`,
    category: 'award',
    author: '심사위원회',
    authorEn: 'Judging Committee',
    publishedAt: '2024-02-15',
    featuredImage: '/images/news/news-006.jpg',
    tags: ['심사기준', '공모전', '평가', '투명성'],
    tagsEn: ['judging-criteria', 'competition', 'evaluation', 'transparency'],
    views: 876,
    likes: 67,
    comments: 28,
    isFeatured: false,
    isBreaking: false
  }
]

const categories = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: 'exhibition', label: { ko: '전시', en: 'Exhibition' } },
  { value: 'event', label: { ko: '행사', en: 'Event' } },
  { value: 'artist', label: { ko: '작가', en: 'Artist' } },
  { value: 'education', label: { ko: '교육', en: 'Education' } },
  { value: 'award', label: { ko: '수상', en: 'Award' } }
]

export default function NewsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNews, setSelectedNews] = useState<typeof newsData[0] | null>(null)
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set())

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredNews = filteredNews.filter(news => news.isFeatured)
  const regularNews = filteredNews.filter(news => !news.isFeatured)
  const breakingNews = newsData.filter(news => news.isBreaking)

  const toggleLike = (newsId: string) => {
    setLikedNews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(newsId)) {
        newSet.delete(newsId)
      } else {
        newSet.add(newsId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      exhibition: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      event: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      artist: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      education: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      award: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }
    
    const labels = {
      exhibition: { ko: '전시', en: 'Exhibition' },
      event: { ko: '행사', en: 'Event' },
      artist: { ko: '작가', en: 'Artist' },
      education: { ko: '교육', en: 'Education' },
      award: { ko: '수상', en: 'Award' }
    }
    
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[category as keyof typeof labels]?.[language as 'ko' | 'en'] || category}
      </Badge>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-celadon/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-celadon text-white">
              {language === 'ko' ? '뉴스' : 'News'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              {language === 'ko' ? '뉴스' : 'News'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'ko' 
                ? '동양서예협회의 최신 소식을 확인하세요'
                : 'Stay updated with the latest news from ASCA'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 속보 섹션 */}
      {breakingNews.length > 0 && (
        <section className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500 text-white animate-pulse">
                {language === 'ko' ? '속보' : 'Breaking'}
              </Badge>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 truncate">
                  {language === 'ko' ? breakingNews[0]?.title : breakingNews[0]?.titleEn}
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-red-200 text-red-800 hover:bg-red-100">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 필터 및 검색 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ko' ? '뉴스 제목, 내용, 태그로 검색...' : 'Search by title, content, tags...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* 카테고리 필터 */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label[language as 'ko' | 'en']}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 결과 정보 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {language === 'ko' 
              ? `총 ${filteredNews.length}개의 뉴스`
              : `${filteredNews.length} news articles found`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {language === 'ko' ? '주요뉴스' : 'Featured'} ({featuredNews.length})
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              {language === 'ko' ? '인기' : 'Trending'}
            </Button>
          </div>
        </div>

        {/* 주요 뉴스 */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {language === 'ko' ? '주요 뉴스' : 'Featured News'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredNews.map((news) => (
                <Card key={news.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    {/* 이미지 */}
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                      <Image
                        src={news.featuredImage}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* 오버레이 */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                      
                      {/* 액션 버튼들 */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={() => setSelectedNews(news)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => toggleLike(news.id)}
                        >
                          <Heart className={`h-4 w-4 ${likedNews.has(news.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* 카테고리 배지 */}
                      <div className="absolute top-3 left-3">
                        {getCategoryBadge(news.category)}
                      </div>
                      
                      {/* 속보 배지 */}
                      {news.isBreaking && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 text-white animate-pulse">
                            {language === 'ko' ? '속보' : 'Breaking'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* 콘텐츠 */}
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-celadon transition-colors">
                          {language === 'ko' ? news.title : news.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {language === 'ko' ? news.summary : news.summaryEn}
                        </p>
                      </div>
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {language === 'ko' ? news.author : news.authorEn}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(news.publishedAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(language === 'ko' ? news.tags : news.tagsEn).slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* 통계 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {news.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {news.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {news.comments}
                          </span>
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedNews(news)}>
                            {language === 'ko' ? '자세히 보기' : 'Read More'}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 일반 뉴스 */}
        {regularNews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {language === 'ko' ? '최신 뉴스' : 'Latest News'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNews.map((news) => (
                <Card key={news.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* 이미지 */}
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                      <Image
                        src={news.featuredImage}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* 카테고리 배지 */}
                      <div className="absolute top-2 left-2">
                        {getCategoryBadge(news.category)}
                      </div>
                      
                      {/* 속보 배지 */}
                      {news.isBreaking && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white animate-pulse text-xs">
                            {language === 'ko' ? '속보' : 'Breaking'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* 콘텐츠 */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-sm group-hover:text-celadon transition-colors">
                          {language === 'ko' ? news.title : news.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {language === 'ko' ? news.summary : news.summaryEn}
                        </p>
                      </div>
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(news.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {news.views}
                        </span>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedNews(news)}>
                            {language === 'ko' ? '자세히 보기' : 'Read More'}
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'ko' ? '뉴스를 찾을 수 없습니다' : 'No news found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ko' 
                ? '검색 조건을 변경해보세요'
                : 'Try changing your search criteria'
              }
            </p>
          </div>
        )}
      </section>

      {/* 뉴스 상세 모달 */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold pr-8">
                  {language === 'ko' ? selectedNews.title : selectedNews.titleEn}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 헤더 이미지 */}
                <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedNews.featuredImage}
                    alt={selectedNews.title}
                    fill
                    className="object-cover"
                  />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    {getCategoryBadge(selectedNews.category)}
                    {selectedNews.isBreaking && (
                      <Badge className="bg-red-500 text-white">
                        {language === 'ko' ? '속보' : 'Breaking'}
                      </Badge>
                    )}
                    </div>
                </div>
                
                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {language === 'ko' ? selectedNews.author : selectedNews.authorEn}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedNews.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {language === 'ko' ? '5분 읽기' : '5 min read'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedNews.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {selectedNews.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {selectedNews.comments}
                    </span>
                  </div>
                    </div>
                
                {/* 요약 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'ko' ? selectedNews.summary : selectedNews.summaryEn}
                  </p>
                        </div>
                
                {/* 수상자 명단 이미지 (ID가 5인 뉴스에만 표시) */}
                {selectedNews && selectedNews.id === '5' && (
                  <div className="my-6">
                    <div className="bg-gradient-to-r from-celadon/10 to-transparent p-6 rounded-lg border border-celadon/20">
                      <h3 className="text-lg font-semibold mb-4 text-celadon">
                        {language === 'ko' ? '제22회 대한민국 동양서예대전 공모전 수상자 명단' : '22nd Korea Oriental Calligraphy Competition Winners List'}
                      </h3>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <Image 
                          src="/images/news/award-winners-2024.jpg" 
                          alt={language === 'ko' ? '제22회 수상자 명단' : '22nd Competition Winners List'}
                          className="w-full h-auto rounded-lg border border-gray-200"
                          width={800}
                          height={600}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {language === 'ko' 
                          ? '※ 상기 명단은 제22회 대한민국 동양서예대전 공모전의 최종 심사 결과입니다.'
                          : '※ The above list is the final judging result of the 22nd Korea Oriental Calligraphy Competition.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* 본문 */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line leading-relaxed">
                    {language === 'ko' ? selectedNews.content : selectedNews.contentEn}
                  </div>
              </div>
                
                {/* 태그 */}
                <div>
                  <h4 className="font-medium mb-3">{language === 'ko' ? '태그' : 'Tags'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(language === 'ko' ? selectedNews.tags : selectedNews.tagsEn).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
          ))}
        </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={() => toggleLike(selectedNews.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${likedNews.has(selectedNews.id) ? 'fill-current' : ''}`} />
                    {language === 'ko' ? '좋아요' : 'Like'}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '공유' : 'Share'}
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '댓글' : 'Comments'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}