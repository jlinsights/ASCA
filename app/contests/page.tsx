'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, Award, MapPin, Search, Filter, Clock, Trophy, Star, ChevronRight
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchContests } from '@/lib/api/contests'
import { 
  Contest, 
  ContestStatus, 
  ContestCategory,
  CONTEST_STATUS_LABELS,
  CONTEST_CATEGORY_LABELS,
  getContestDeadlineInfo,
  getContestStatusColor
} from '@/types/contest-new'

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Load contests
  useEffect(() => {
    const loadContests = async () => {
      setLoading(true)
      const { data, error } = await fetchContests({
        status: ['announced', 'open', 'closed', 'judging', 'completed']
      })
      
      if (data) {
        setContests(data)
        setFilteredContests(data)
      }
      
      setLoading(false)
    }

    loadContests()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...contests]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(contest =>
        contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.organizer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(contest => contest.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(contest => contest.status === selectedStatus)
    }

    setFilteredContests(filtered)
  }, [contests, searchQuery, selectedCategory, selectedStatus])

  const featuredContests = contests.filter(c => c.isFeatured)
  const openContests = contests.filter(c => c.status === 'open')
  const upcomingContests = contests.filter(c => c.status === 'announced')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrize = (amount?: number) => {
    if (!amount) return '-'
    return `${(amount / 10000).toLocaleString()}만원`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            공모전
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            다양한 예술 공모전에 도전하고 여러분의 재능을 펼쳐보세요
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-celadon-green" />
              <div className="text-2xl font-bold text-foreground">{contests.length}</div>
              <div className="text-sm text-muted-foreground">전체 공모전</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-foreground">{openContests.length}</div>
              <div className="text-sm text-muted-foreground">접수중</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-foreground">{upcomingContests.length}</div>
              <div className="text-sm text-muted-foreground">예정</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-temple-gold" />
              <div className="text-2xl font-bold text-foreground">{featuredContests.length}</div>
              <div className="text-sm text-muted-foreground">주요 공모전</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Contests */}
        {featuredContests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-temple-gold" />
              주요 공모전
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredContests.slice(0, 2).map((contest) => {
                const deadline = getContestDeadlineInfo(contest.endDate)
                return (
                  <Card key={contest.id} className="border-celadon-green/30 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getContestStatusColor(contest.status)}>
                          {CONTEST_STATUS_LABELS[contest.status]?.ko}
                        </Badge>
                        {deadline.isSoon && !deadline.isExpired && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {deadline.daysRemaining}일 남음
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif">
                        <Link href={`/contests/${contest.id}`} className="hover:text-celadon-green transition-colors">
                          {contest.title}
                        </Link>
                      </CardTitle>
                      {contest.subtitle && (
                        <p className="text-sm text-muted-foreground">{contest.subtitle}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {contest.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(contest.startDate)} ~ {formatDate(contest.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{contest.organizer}</span>
                        </div>
                        {contest.totalPrizeAmount && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Award className="w-4 h-4" />
                            <span>총 상금 {formatPrize(contest.totalPrizeAmount)}</span>
                          </div>
                        )}
                      </div>

                      <Link href={`/contests/${contest.id}`}>
                        <Button className="w-full mt-4 bg-celadon-green hover:bg-celadon-green/90">
                          상세보기
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="공모전 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {Object.entries(CONTEST_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ko}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="announced">발표됨</SelectItem>
                  <SelectItem value="open">접수중</SelectItem>
                  <SelectItem value="closed">마감</SelectItem>
                  <SelectItem value="judging">심사중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contest List */}
        {filteredContests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                공모전을 찾을 수 없습니다
              </h3>
              <p className="text-muted-foreground">
                다른 검색어나 필터를 시도해보세요
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => {
              const deadline = getContestDeadlineInfo(contest.endDate)
              return (
                <Card key={contest.id} className="hover:shadow-md transition-shadow">
                  {contest.posterImageUrl && (
                    <div className="relative h-48 bg-celadon-green/10">
                      <Image
                        src={contest.posterImageUrl}
                        alt={contest.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getContestStatusColor(contest.status)}>
                        {CONTEST_STATUS_LABELS[contest.status]?.ko}
                      </Badge>
                      {contest.isFeatured && (
                        <Star className="w-4 h-4 text-temple-gold fill-current" />
                      )}
                    </div>
                    <CardTitle className="text-lg font-serif line-clamp-2">
                      <Link href={`/contests/${contest.id}`} className="hover:text-celadon-green transition-colors">
                        {contest.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {CONTEST_CATEGORY_LABELS[contest.category]?.ko}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {contest.description}
                    </p>

                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>~ {formatDate(contest.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{contest.organizer}</span>
                      </div>
                      {contest.entryFee > 0 && (
                        <div className="flex items-center gap-2">
                          <span>참가비: {formatPrize(contest.entryFee)}</span>
                        </div>
                      )}
                    </div>

                    {deadline.isSoon && !deadline.isExpired && (
                      <Badge variant="destructive" className="w-full justify-center mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        마감 {deadline.daysRemaining}일 전
                      </Badge>
                    )}

                    <Link href={`/contests/${contest.id}`}>
                      <Button variant="outline" className="w-full">
                        자세히 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}