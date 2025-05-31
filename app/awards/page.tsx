'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Calendar, 
  User, 
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Share2,
  Crown,
  Sparkles,
  Target,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

// 수상 등급 정의
const awardGrades = [
  { 
    id: 'grand-prize', 
    name: { ko: '대상', en: 'Grand Prize' }, 
    icon: Crown, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    description: { ko: '전 부문 최고점 (95점 이상)', en: 'Highest score across all categories (95+ points)' },
    count: 1
  },
  { 
    id: 'excellence', 
    name: { ko: '최우수상', en: 'Excellence Award' }, 
    icon: Trophy, 
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    description: { ko: '90점 이상', en: '90+ points' },
    count: 2
  },
  { 
    id: 'merit', 
    name: { ko: '우수상', en: 'Merit Award' }, 
    icon: Medal, 
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: { ko: '85점 이상', en: '85+ points' },
    count: 5
  },
  { 
    id: 'five-scripts', 
    name: { ko: '오체상', en: 'Five Scripts Award' }, 
    icon: Sparkles, 
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    description: { ko: '해서, 행서, 초서, 예서, 전서 각 부문 최고점', en: 'Highest in Regular, Running, Cursive, Clerical, Seal scripts' },
    count: 5
  },
  { 
    id: 'three-scripts', 
    name: { ko: '삼체상', en: 'Three Scripts Award' }, 
    icon: Star, 
    color: 'text-green-600 bg-green-50 border-green-200',
    description: { ko: '혼합 서체 부문 최고점', en: 'Highest in mixed script categories' },
    count: 3
  },
  { 
    id: 'special', 
    name: { ko: '특선', en: 'Special Selection' }, 
    icon: Award, 
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description: { ko: '75점 이상', en: '75+ points' },
    count: 30
  },
  { 
    id: 'selected', 
    name: { ko: '입선', en: 'Selected Works' }, 
    icon: CheckCircle, 
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    description: { ko: '70점 이상', en: '70+ points' },
    count: 100
  }
]

// 수상작 데이터
const awardWinners = [
  {
    id: '1',
    year: 2024,
    grade: 'grand-prize',
    title: '정법과 창신의 조화',
    titleEn: 'Harmony of Orthodox Dharma and Innovation',
    artist: '김서예',
    artistEn: 'Kim Seoye',
    script: '해행초',
    scriptEn: 'Regular-Running-Cursive',
    description: '전통 서법의 정수를 현대적 감각으로 재해석한 역작',
    descriptionEn: 'A masterpiece reinterpreting the essence of traditional calligraphy with modern sensibility',
    image: '/images/awards/grand-prize-2024.jpg',
    score: 97,
    judgeComment: '완벽한 기법과 독창적 표현이 조화를 이룬 최고의 작품',
    judgeCommentEn: 'The finest work harmonizing perfect technique with original expression'
  },
  {
    id: '2',
    year: 2024,
    grade: 'excellence',
    title: '묵향의 정취',
    titleEn: 'The Essence of Ink Fragrance',
    artist: '이묵향',
    artistEn: 'Lee Mukhyang',
    script: '행서',
    scriptEn: 'Running Script',
    description: '행서의 유려함을 극대화한 우아한 작품',
    descriptionEn: 'An elegant work maximizing the fluidity of running script',
    image: '/images/awards/excellence-2024-1.jpg',
    score: 94,
    judgeComment: '자연스러운 필치와 균형잡힌 구성이 돋보임',
    judgeCommentEn: 'Outstanding natural brushwork and balanced composition'
  },
  {
    id: '3',
    year: 2024,
    grade: 'excellence',
    title: '현대의 서정',
    titleEn: 'Modern Lyricism',
    artist: '박문인',
    artistEn: 'Park Munin',
    script: '초서',
    scriptEn: 'Cursive Script',
    description: '현대적 감성을 담은 혁신적인 초서 작품',
    descriptionEn: 'Innovative cursive work containing modern sensibility',
    image: '/images/awards/excellence-2024-2.jpg',
    score: 92,
    judgeComment: '전통과 현대의 절묘한 조화',
    judgeCommentEn: 'Exquisite harmony of tradition and modernity'
  },
  {
    id: '4',
    year: 2024,
    grade: 'five-scripts',
    title: '해서의 정수',
    titleEn: 'Essence of Regular Script',
    artist: '정서법',
    artistEn: 'Jung Seobeop',
    script: '해서',
    scriptEn: 'Regular Script',
    description: '해서의 기본기가 완벽하게 구현된 모범작',
    descriptionEn: 'Exemplary work with perfect implementation of regular script fundamentals',
    image: '/images/awards/five-scripts-2024-1.jpg',
    score: 89,
    judgeComment: '정확한 필법과 안정된 구조',
    judgeCommentEn: 'Accurate brushwork and stable structure'
  },
  {
    id: '5',
    year: 2023,
    grade: 'grand-prize',
    title: '천지자연',
    titleEn: 'Heaven and Earth Nature',
    artist: '최한글',
    artistEn: 'Choi Hangeul',
    script: '전서',
    scriptEn: 'Seal Script',
    description: '전서의 고아한 품격을 현대에 되살린 작품',
    descriptionEn: 'Work reviving the elegant dignity of seal script in modern times',
    image: '/images/awards/grand-prize-2023.jpg',
    score: 96,
    judgeComment: '고전적 아름다움의 완벽한 재현',
    judgeCommentEn: 'Perfect reproduction of classical beauty'
  }
]

// 공모전 정보
const competitionInfo = {
  ko: {
    title: '대한민국 동양서예대전',
    subtitle: '전통과 현대가 만나는 서예의 축제',
    description: '매년 개최되는 국내 최대 규모의 서예 공모전으로, 전통 서예의 계승과 발전을 위해 노력하고 있습니다.',
    eligibility: '국내외 서예 애호가 누구나 참여 가능',
    deadline: '매년 12월 31일까지',
    announcement: '다음 해 3월 중 발표',
    ceremony: '4월 중 시상식 및 전시회 개최'
  },
  en: {
    title: 'Korea Oriental Calligraphy Competition',
    subtitle: 'A Festival of Calligraphy Where Tradition Meets Modernity',
    description: 'The largest annual calligraphy competition in Korea, dedicated to the succession and development of traditional calligraphy.',
    eligibility: 'Open to all calligraphy enthusiasts worldwide',
    deadline: 'Until December 31st every year',
    announcement: 'Announced in March of the following year',
    ceremony: 'Award ceremony and exhibition held in April'
  }
}

export default function AwardsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedWinner, setSelectedWinner] = useState<typeof awardWinners[0] | null>(null)

  const years = ['all', ...Array.from(new Set(awardWinners.map(w => w.year))).sort((a, b) => b - a)]
  
  const filteredWinners = awardWinners.filter(winner => {
    const matchesSearch = winner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         winner.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         winner.script.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesYear = selectedYear === 'all' || winner.year.toString() === selectedYear
    const matchesGrade = selectedGrade === 'all' || winner.grade === selectedGrade
    
    return matchesSearch && matchesYear && matchesGrade
  })

  const getGradeInfo = (gradeId: string) => {
    return awardGrades.find(grade => grade.id === gradeId)
  }

  const getGradeStats = () => {
    return awardGrades.map(grade => ({
      ...grade,
      winners: awardWinners.filter(w => w.grade === grade.id).length
    }))
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-celadon/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-celadon text-white">
              {language === 'ko' ? '수상작' : 'Awards'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              {competitionInfo[language as 'ko' | 'en'].title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {competitionInfo[language as 'ko' | 'en'].subtitle}
            </p>
            <p className="text-lg text-muted-foreground">
              {competitionInfo[language as 'ko' | 'en'].description}
            </p>
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="winners" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="winners">
              {language === 'ko' ? '수상작' : 'Winners'}
            </TabsTrigger>
            <TabsTrigger value="grades">
              {language === 'ko' ? '수상 등급' : 'Award Grades'}
            </TabsTrigger>
            <TabsTrigger value="competition">
              {language === 'ko' ? '공모전 정보' : 'Competition Info'}
            </TabsTrigger>
          </TabsList>

          {/* 수상작 탭 */}
          <TabsContent value="winners" className="space-y-6">
            {/* 필터 및 검색 */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ko' ? '작품명, 작가명, 서체로 검색...' : 'Search by title, artist, script...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ko' ? '전체 연도' : 'All Years'}</SelectItem>
                  {years.slice(1).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ko' ? '전체 등급' : 'All Grades'}</SelectItem>
                  {awardGrades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name[language as 'ko' | 'en']}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 수상작 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWinners.map((winner) => {
                const gradeInfo = getGradeInfo(winner.grade)
                const IconComponent = gradeInfo?.icon || Award
                
                return (
                  <Card key={winner.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      {/* 이미지 */}
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        <Image
                          src={winner.image}
                          alt={winner.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* 수상 등급 배지 */}
                        <div className="absolute top-3 left-3">
                          <Badge className={`${gradeInfo?.color} border`}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {gradeInfo?.name[language as 'ko' | 'en']}
                          </Badge>
                        </div>
                        
                        {/* 연도 배지 */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary">
                            {winner.year}
                          </Badge>
                        </div>
                        
                        {/* 점수 */}
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-black/70 text-white">
                            {winner.score}점
                          </Badge>
                        </div>
                      </div>
                      
                      {/* 콘텐츠 */}
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {language === 'ko' ? winner.title : winner.titleEn}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === 'ko' ? winner.artist : winner.artistEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ko' ? winner.script : winner.scriptEn}
                          </p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {language === 'ko' ? winner.description : winner.descriptionEn}
                        </p>
                        
                        {/* 액션 버튼 */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedWinner(winner)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {language === 'ko' ? '상세보기' : 'View Details'}
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredWinners.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {language === 'ko' ? '수상작을 찾을 수 없습니다' : 'No winners found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ko' ? '검색 조건을 변경해보세요' : 'Try changing your search criteria'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* 수상 등급 탭 */}
          <TabsContent value="grades" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getGradeStats().map((grade) => {
                const IconComponent = grade.icon
                
                return (
                  <Card key={grade.id} className={`border-2 ${grade.color.split(' ').slice(1).join(' ')}`}>
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 rounded-full ${grade.color.split(' ')[1]} mx-auto mb-4 flex items-center justify-center`}>
                        <IconComponent className={`h-8 w-8 ${grade.color.split(' ')[0]}`} />
                      </div>
                      <CardTitle className="text-lg">
                        {grade.name[language as 'ko' | 'en']}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {grade.description[language as 'ko' | 'en']}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>{language === 'ko' ? '선정 수' : 'Selection Count'}:</span>
                        <span className="font-medium">{grade.count}{language === 'ko' ? '점' : ' works'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{language === 'ko' ? '역대 수상' : 'Total Winners'}:</span>
                        <span className="font-medium">{grade.winners}{language === 'ko' ? '점' : ' works'}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* 공모전 정보 탭 */}
          <TabsContent value="competition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 공모전 개요 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {language === 'ko' ? '공모전 개요' : 'Competition Overview'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{language === 'ko' ? '참가 자격' : 'Eligibility'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {competitionInfo[language as 'ko' | 'en'].eligibility}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{language === 'ko' ? '접수 마감' : 'Deadline'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {competitionInfo[language as 'ko' | 'en'].deadline}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{language === 'ko' ? '결과 발표' : 'Announcement'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {competitionInfo[language as 'ko' | 'en'].announcement}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{language === 'ko' ? '시상식' : 'Ceremony'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {competitionInfo[language as 'ko' | 'en'].ceremony}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 심사 기준 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {language === 'ko' ? '심사 기준' : 'Judging Criteria'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === 'ko' ? '서법의 정확성' : 'Accuracy of Calligraphy'}</span>
                    <Badge variant="outline">30{language === 'ko' ? '점' : 'pts'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === 'ko' ? '조형미' : 'Aesthetic Beauty'}</span>
                    <Badge variant="outline">25{language === 'ko' ? '점' : 'pts'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === 'ko' ? '창의성' : 'Creativity'}</span>
                    <Badge variant="outline">20{language === 'ko' ? '점' : 'pts'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === 'ko' ? '기법의 숙련도' : 'Technical Proficiency'}</span>
                    <Badge variant="outline">15{language === 'ko' ? '점' : 'pts'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === 'ko' ? '작품의 완성도' : 'Work Completion'}</span>
                    <Badge variant="outline">10{language === 'ko' ? '점' : 'pts'}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>{language === 'ko' ? '총점' : 'Total'}</span>
                      <Badge>100{language === 'ko' ? '점' : 'pts'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 참가 안내 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'ko' ? '참가 안내' : 'Participation Guide'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">{language === 'ko' ? '제출 서류' : 'Required Documents'}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {language === 'ko' ? '참가 신청서' : 'Application form'}</li>
                      <li>• {language === 'ko' ? '작품 사진 (고해상도)' : 'High-resolution artwork photos'}</li>
                      <li>• {language === 'ko' ? '작가 프로필' : 'Artist profile'}</li>
                      <li>• {language === 'ko' ? '작품 설명서' : 'Artwork description'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">{language === 'ko' ? '작품 규격' : 'Artwork Specifications'}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• {language === 'ko' ? '최소 크기: 50cm × 70cm' : 'Minimum size: 50cm × 70cm'}</li>
                      <li>• {language === 'ko' ? '최대 크기: 200cm × 300cm' : 'Maximum size: 200cm × 300cm'}</li>
                      <li>• {language === 'ko' ? '전통 재료 사용 권장' : 'Traditional materials recommended'}</li>
                      <li>• {language === 'ko' ? '액자 또는 족자 형태' : 'Framed or scroll format'}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '참가 신청서 다운로드' : 'Download Application Form'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '공모요강 보기' : 'View Competition Guidelines'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* 수상작 상세 모달 */}
      <Dialog open={!!selectedWinner} onOpenChange={() => setSelectedWinner(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWinner && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold pr-8">
                  {language === 'ko' ? selectedWinner.title : selectedWinner.titleEn}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 작품 이미지 */}
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedWinner.image}
                    alt={selectedWinner.title}
                    fill
                    className="object-cover"
                  />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    {(() => {
                      const gradeInfo = getGradeInfo(selectedWinner.grade)
                      const IconComponent = gradeInfo?.icon || Award
                      return (
                        <Badge className={`${gradeInfo?.color} border`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {gradeInfo?.name[language as 'ko' | 'en']}
                        </Badge>
                      )
                    })()}
                    <Badge variant="secondary">
                      {selectedWinner.year}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/70 text-white text-lg px-3 py-1">
                      {selectedWinner.score}점
                    </Badge>
                  </div>
                </div>
                
                {/* 작품 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{language === 'ko' ? '작가' : 'Artist'}</h4>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? selectedWinner.artist : selectedWinner.artistEn}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{language === 'ko' ? '서체' : 'Script'}</h4>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? selectedWinner.script : selectedWinner.scriptEn}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{language === 'ko' ? '수상 연도' : 'Award Year'}</h4>
                      <p className="text-muted-foreground">{selectedWinner.year}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{language === 'ko' ? '작품 설명' : 'Description'}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {language === 'ko' ? selectedWinner.description : selectedWinner.descriptionEn}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{language === 'ko' ? '심사평' : 'Judge Comment'}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {language === 'ko' ? selectedWinner.judgeComment : selectedWinner.judgeCommentEn}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '좋아요' : 'Like'}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '공유' : 'Share'}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '다운로드' : 'Download'}
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