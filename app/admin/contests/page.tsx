'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Users, Eye } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getSupabaseClient } from '@/lib/supabase'
import { fetchContests, deleteContest } from '@/lib/api/contests'
import { Contest, CONTEST_STATUS_LABELS, getContestStatusColor } from '@/types/contest-new'

export default function AdminContestsPage() {
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          router.push('/sign-in')
          return
        }

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/sign-in')
          return
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
          router.push('/')
          return
        }

        setIsAdmin(true)

        // Load all contests
        const { data: contestsData, error: fetchError } = await fetchContests({})
        if (fetchError) {
          throw new Error(typeof fetchError === 'string' ? fetchError : '데이터를 불러오는데 실패했습니다.')
        }

        setContests(contestsData || [])
        setFilteredContests(contestsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoad()
  }, [router])

  useEffect(() => {
    let filtered = contests

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contest =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contest => contest.status === statusFilter)
    }

    setFilteredContests(filtered)
  }, [searchTerm, statusFilter, contests])

  const handleDelete = async (id: string) => {
    if (!confirm('이 공모전을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const { error: deleteError } = await deleteContest(id)
      if (deleteError) {
        throw new Error('삭제에 실패했습니다.')
      }

      setContests(contests.filter(c => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const stats = {
    total: contests.length,
    open: contests.filter(c => c.status === 'open').length,
    applications: contests.reduce((sum, c) => sum + c.applicantCount, 0),
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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              공모전 관리
            </h1>
            <p className="text-muted-foreground">
              공모전을 생성하고 관리하세요
            </p>
          </div>
          <Link href="/admin/contests/create">
            <Button className="bg-celadon-green hover:bg-celadon-green/90">
              <Plus className="w-4 h-4 mr-2" />
              공모전 생성
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 공모전
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                진행중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-celadon-green">{stats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 신청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.applications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="공모전 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
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

        {/* Contests Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">신청자</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    공모전이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredContests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{contest.title}</div>
                        {contest.titleEn && (
                          <div className="text-xs text-muted-foreground">{contest.titleEn}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getContestStatusColor(contest.status)}>
                        {CONTEST_STATUS_LABELS[contest.status]?.ko}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(contest.startDate).toLocaleDateString('ko-KR')} ~{' '}
                      {new Date(contest.endDate).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{contest.applicantCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/contests/${contest.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              보기
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/contests/${contest.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              수정
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/contests/${contest.id}/applications`}>
                              <Users className="w-4 h-4 mr-2" />
                              신청자 ({contest.applicantCount})
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(contest.id)}
                            className="text-scholar-red"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
