"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Pin, Eye, MessageCircle, Search, Filter, ChevronLeft, ChevronRight, User, Clock } from "lucide-react"
import { getNotices } from "@/lib/supabase/cms"
import { searchNotices, AdvancedSearchFilters } from "@/lib/supabase/search"
import SimpleSearch from "@/components/search/SimpleSearch"
import type { Notice, SearchFilters, PaginationParams } from "@/types/cms"
import Link from "next/link"

const categoryColors = {
  general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  announcement: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}
const categoryLabels = {
  general: '일반',
  event: '행사',
  announcement: '공지',
  urgent: '긴급'
}

export default function NoticePage() {
  const { t } = useLanguage()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`
    return formatDate(dateString)
  }

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true)
      
      if (searchQuery.trim()) {
        // 검색어가 있는 경우
        const searchFilters: SearchFilters = {}
        if (selectedCategory !== "all") searchFilters.category = selectedCategory
        searchFilters.status = 'published'
        
        const response = await searchNotices(searchQuery.trim(), searchFilters)
        setNotices(response.data)
        setTotalPages(Math.ceil(response.data.length / 10))
      } else {
        // 일반 목록 조회
        const filters: SearchFilters = {}
        if (selectedCategory !== "all") filters.category = selectedCategory

        const pagination: PaginationParams = {
          page: currentPage,
          limit: 10,
          sortBy: 'published_at',
          sortOrder: 'desc'
        }

        const response = await getNotices(filters, pagination)
        setNotices(response.data)
        setTotalPages(response.totalPages)
      }
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.')
      
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, currentPage])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pinnedNotices = notices.filter(notice => notice.is_pinned)
  const regularNotices = notices.filter(notice => !notice.is_pinned)

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">공지사항을 불러오는 중...</p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              <Button onClick={fetchNotices} className="mt-4" variant="outline">
                다시 시도
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground tracking-tight">
              {t("notice")}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              사단법인 동양서예협회 공지사항
            </p>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <SimpleSearch
                    onSearch={(query) => {
                      setSearchQuery(query);
                      setCurrentPage(1);
                    }}
                    placeholder="공지사항 검색..."
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:w-auto border-border/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>

              {showFilters && (
                <div className="border-t border-border/30 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">카테고리</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="border-border/50">
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="exhibition">전시회</SelectItem>
                          <SelectItem value="education">교육</SelectItem>
                          <SelectItem value="competition">공모전</SelectItem>
                          <SelectItem value="general">일반</SelectItem>
                          <SelectItem value="meeting">총회</SelectItem>
                          <SelectItem value="exchange">교류전</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 중요 공지 (고정) */}
          {pinnedNotices.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Pin className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold text-foreground">{t("importantNotice")}</h2>
              </div>
              <div className="space-y-4">
                {pinnedNotices.map((notice) => (
                  <Link key={notice.id} href={`/notice/${notice.id}`} className="block">
                    <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 shadow-sm hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge className={categoryColors[notice.category as keyof typeof categoryColors]}>
                              {categoryLabels[notice.category as keyof typeof categoryLabels]}
                            </Badge>
                            {notice.is_pinned && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Pin className="h-3 w-3" />
                                고정
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">{notice.views}</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary cursor-pointer transition-colors">
                          {notice.title}
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
                          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {notice.excerpt || notice.content.substring(0, 200) + '...'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(notice.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{notice.author_name || '관리자'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(notice.published_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 일반 공지 */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-foreground">{t("generalNotice")}</h2>
            <div className="space-y-4">
              {regularNotices.length === 0 ? (
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    등록된 공지사항이 없습니다.
                  </CardContent>
                </Card>
              ) : (
                regularNotices.map((notice) => (
                  <Link key={notice.id} href={`/notice/${notice.id}`} className="block">
                    <Card className="border-border/50 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge className={categoryColors[notice.category as keyof typeof categoryColors]}>
                              {categoryLabels[notice.category as keyof typeof categoryLabels]}
                            </Badge>
                            {notice.is_pinned && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Pin className="h-3 w-3" />
                                고정
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">{notice.views}</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary cursor-pointer transition-colors">
                          {notice.title}
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
                          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {notice.excerpt || notice.content.substring(0, 200) + '...'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(notice.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{notice.author_name || '관리자'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(notice.published_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? "" : "border-border/50"}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border/50"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 문의 정보 */}
          <div className="mt-12">
            <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-2 text-foreground">{t("noticeInquiry")}</h3>
                <p className="text-muted-foreground mb-2">
                  {t("noticeInquiryText")}
                </p>
                <p className="text-muted-foreground font-medium">
                  전화: 02-1234-5678 | 이메일: info@asca.or.kr
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 