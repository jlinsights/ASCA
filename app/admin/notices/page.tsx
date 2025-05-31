'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Pin,
  Calendar,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Settings,
  Download,
  Upload
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/contexts/language-context'
import { getNotices, deleteNotice, updateNotice } from '@/lib/supabase/cms'
import type { Notice, SearchFilters, PaginationParams } from '@/types/cms'
import Link from 'next/link'

const categoryColors = {
  "exhibition": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
  "education": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  "competition": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  "general": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800",
  "meeting": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800",
  "exchange": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800"
}

const categoryLabels = {
  "exhibition": "전시회",
  "education": "교육",
  "competition": "공모전",
  "general": "일반",
  "meeting": "총회",
  "exchange": "교류전"
}

export default function NoticesAdminPage() {
  const { language } = useLanguage()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<string>("published_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchNotices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: SearchFilters = {}
      if (searchQuery) filters.query = searchQuery
      if (selectedCategory !== "all") filters.category = selectedCategory
      if (selectedStatus !== "all") filters.status = selectedStatus

      const pagination: PaginationParams = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder
      }

      const response = await getNotices(filters, pagination)
      setNotices(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.total)
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.')
      console.error('Error fetching notices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [currentPage, selectedCategory, selectedStatus, sortBy, sortOrder])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchNotices()
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return
    
    try {
      await deleteNotice(id)
      fetchNotices()
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleTogglePin = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { is_pinned: !notice.is_pinned })
      fetchNotices()
    } catch (err) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'ko' ? '공지사항 관리' : 'Manage Notices'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ko' ? '공지사항을 생성, 수정, 삭제할 수 있습니다.' : 'Create, edit, and delete notices.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {language === 'ko' ? '내보내기' : 'Export'}
            </Button>
            <Link href="/admin/notices/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ko' ? '새 공지사항' : 'New Notice'}
              </Button>
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">전체 공지사항</p>
                  <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">고정 공지</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notices.filter(n => n.is_pinned).length}
                  </p>
                </div>
                <Pin className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">이번 달 작성</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notices.filter(n => {
                      const date = new Date(n.published_at)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notices.reduce((sum, n) => sum + n.views, 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6 border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="공지사항 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>

            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">카테고리</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">상태</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="published">발행됨</SelectItem>
                        <SelectItem value="draft">임시저장</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">정렬</label>
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                      const [field, order] = value.split('-')
                      setSortBy(field)
                      setSortOrder(order as 'asc' | 'desc')
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="정렬 방식" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published_at-desc">최신순</SelectItem>
                        <SelectItem value="published_at-asc">오래된순</SelectItem>
                        <SelectItem value="views-desc">조회수 높은순</SelectItem>
                        <SelectItem value="views-asc">조회수 낮은순</SelectItem>
                        <SelectItem value="title-asc">제목 가나다순</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 공지사항 테이블 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>공지사항 목록</span>
              <span className="text-sm font-normal text-muted-foreground">
                총 {totalCount}개
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="ml-3 text-muted-foreground">로딩 중...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchNotices} variant="outline">다시 시도</Button>
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">공지사항이 없습니다</h3>
                <p className="text-muted-foreground mb-4">첫 번째 공지사항을 작성해보세요.</p>
                <Link href="/admin/notices/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    새 공지사항 작성
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Pin className="h-4 w-4" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        제목
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleSort('published_at')}
                    >
                      <div className="flex items-center gap-2">
                        작성일
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleSort('views')}
                    >
                      <div className="flex items-center gap-2">
                        조회수
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-20">상태</TableHead>
                    <TableHead className="w-20">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.id} className="hover:bg-accent/30">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(notice)}
                          className={notice.is_pinned ? 'text-red-600' : 'text-muted-foreground'}
                        >
                          <Pin className={`h-4 w-4 ${notice.is_pinned ? 'fill-current' : ''}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-foreground truncate">{notice.title}</p>
                          {notice.excerpt && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {notice.excerpt}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[notice.category as keyof typeof categoryColors]}>
                          {categoryLabels[notice.category as keyof typeof categoryLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{notice.author_name || '관리자'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(notice.published_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{notice.views}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notice.is_published ? 'default' : 'secondary'}>
                          {notice.is_published ? '발행됨' : '임시저장'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>액션</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/notice/${notice.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/notices/${notice.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(notice.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalCount)} / {totalCount}개
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
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
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
} 