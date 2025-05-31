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
  Star,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Ticket,
  Users
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
import { getExhibitions, deleteExhibition, updateExhibition } from '@/lib/supabase/cms'
import type { Exhibition, SearchFilters, PaginationParams } from '@/types/cms'
import Link from 'next/link'
import Image from 'next/image'

const statusColors = {
  "upcoming": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  "current": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  "past": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800"
}

const statusLabels = {
  "upcoming": "예정",
  "current": "진행중",
  "past": "종료"
}

export default function ExhibitionsAdminPage() {
  const { language } = useLanguage()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<string>("start_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const fetchExhibitions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: SearchFilters = {}
      if (searchQuery) filters.query = searchQuery
      if (selectedStatus !== "all") filters.status = selectedStatus

      const pagination: PaginationParams = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder
      }

      const response = await getExhibitions(filters, pagination)
      setExhibitions(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.total)
    } catch (err) {
      setError('전시회 정보를 불러오는데 실패했습니다.')
      console.error('Error fetching exhibitions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExhibitions()
  }, [currentPage, selectedStatus, sortBy, sortOrder])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchExhibitions()
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
    if (!confirm('정말로 이 전시회를 삭제하시겠습니까?')) return
    
    try {
      await deleteExhibition(id)
      fetchExhibitions()
    } catch (err) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleToggleFeatured = async (exhibition: Exhibition) => {
    try {
      await updateExhibition(exhibition.id, { is_featured: !exhibition.is_featured })
      fetchExhibitions()
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
              {language === 'ko' ? '전시회 관리' : 'Manage Exhibitions'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ko' ? '전시회를 생성, 수정, 삭제할 수 있습니다.' : 'Create, edit, and delete exhibitions.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {language === 'ko' ? '내보내기' : 'Export'}
            </Button>
            <Link href="/admin/exhibitions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ko' ? '새 전시회' : 'New Exhibition'}
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
                  <p className="text-sm font-medium text-muted-foreground">전체 전시회</p>
                  <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                </div>
                <Star className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">주요 전시회</p>
                  <p className="text-2xl font-bold text-foreground">
                    {exhibitions.filter(e => e.is_featured).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-amber-600 fill-current" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">진행중 전시</p>
                  <p className="text-2xl font-bold text-foreground">
                    {exhibitions.filter(e => e.status === 'current').length}
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
                    {exhibitions.reduce((sum, e) => sum + e.views, 0).toLocaleString()}
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
                  placeholder="전시회 검색..."
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
                    <label className="text-sm font-medium mb-2 block">상태</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="current">진행중</SelectItem>
                        <SelectItem value="upcoming">예정</SelectItem>
                        <SelectItem value="past">종료</SelectItem>
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
                        <SelectItem value="start_date-desc">최신순</SelectItem>
                        <SelectItem value="start_date-asc">오래된순</SelectItem>
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

        {/* 전시회 테이블 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>전시회 목록</span>
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
                <Button onClick={fetchExhibitions} variant="outline">다시 시도</Button>
              </div>
            ) : exhibitions.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">전시회가 없습니다</h3>
                <p className="text-muted-foreground mb-4">첫 번째 전시회를 등록해보세요.</p>
                <Link href="/admin/exhibitions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    새 전시회 등록
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Star className="h-4 w-4" />
                    </TableHead>
                    <TableHead className="w-20">이미지</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        제목
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>큐레이터</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleSort('views')}
                    >
                      <div className="flex items-center gap-2">
                        조회수
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="w-20">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exhibitions.map((exhibition) => (
                    <TableRow key={exhibition.id} className="hover:bg-accent/30">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(exhibition)}
                          className={exhibition.is_featured ? 'text-amber-600' : 'text-muted-foreground'}
                        >
                          <Star className={`h-4 w-4 ${exhibition.is_featured ? 'fill-current' : ''}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted">
                          {exhibition.featured_image_url ? (
                            <Image
                              src={exhibition.featured_image_url}
                              alt={exhibition.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Star className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-foreground truncate">{exhibition.title}</p>
                          {exhibition.subtitle && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {exhibition.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatDate(exhibition.start_date)}</p>
                          <p className="text-muted-foreground">~ {formatDate(exhibition.end_date)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-32">{exhibition.venue || exhibition.location || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{exhibition.curator || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{exhibition.views}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                          {statusLabels[exhibition.status as keyof typeof statusLabels]}
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
                              <Link href={`/exhibitions/${exhibition.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/exhibitions/${exhibition.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(exhibition.id)}
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