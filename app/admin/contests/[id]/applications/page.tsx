'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, Eye, Check, X, Award } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { getSupabaseClient } from '@/lib/supabase'
import { fetchContestById, fetchContestApplications, reviewApplication } from '@/lib/api/contests'
import {
  Contest,
  ContestApplicationWithDetails,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusColor,
  ApplicationStatus
} from '@/types/contest-new'

export default function AdminContestApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [contest, setContest] = useState<Contest | null>(null)
  const [applications, setApplications] = useState<ContestApplicationWithDetails[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ContestApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApp, setSelectedApp] = useState<ContestApplicationWithDetails | null>(null)
  const [judgeNotes, setJudgeNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) {
          router.push('/sign-in')
          return
        }

        // Check admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/sign-in')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
          router.push('/')
          return
        }

        // Load contest
        const { data: contestData } = await fetchContestById(contestId)
        setContest(contestData)

        // Load applications
        const { data: appsData } = await fetchContestApplications(contestId)
        setApplications(appsData || [])
        setFilteredApplications(appsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [contestId, router])

  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [searchTerm, statusFilter, applications])

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdating(true)
      const { error } = await reviewApplication(appId, {
        status: newStatus,
        judgeNotes: judgeNotes || undefined
      })

      if (error) {
        throw new Error('상태 업데이트 실패')
      }

      // Update local state
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status: newStatus, judgeNotes } : app
      ))
      setSelectedApp(null)
      setJudgeNotes('')
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    winner: applications.filter(a => a.status === 'winner').length,
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/contests">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공모전 목록
            </Button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            {contest?.title} - 신청 관리
          </h1>
          <p className="text-muted-foreground">
            총 {applications.length}개의 신청서
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 신청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">접수됨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">검토중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">승인됨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-celadon-green">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">수상</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-temple-gold">{stats.winner}</div>
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
                    placeholder="작가 이름 또는 신청 번호 검색..."
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
                  <SelectItem value="submitted">접수됨</SelectItem>
                  <SelectItem value="under_review">검토중</SelectItem>
                  <SelectItem value="accepted">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                  <SelectItem value="winner">수상</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>작가</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>작품 수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    신청서가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-sm">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell className="font-medium">{app.artistName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.submittedAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>{app.artworkIds.length}</TableCell>
                    <TableCell>
                      <Badge className={getApplicationStatusColor(app.status)}>
                        {APPLICATION_STATUS_LABELS[app.status]?.ko}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {app.status === 'submitted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'under_review')}
                          >
                            <Check className="w-4 h-4 text-celadon-green" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Review Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>신청서 검토 - {selectedApp.applicationNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">작가 정보</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">이름:</span> {selectedApp.artistName}</p>
                    <p><span className="text-muted-foreground">이메일:</span> {selectedApp.artistEmail}</p>
                    <p><span className="text-muted-foreground">연락처:</span> {selectedApp.artistPhone || 'N/A'}</p>
                    <p><span className="text-muted-foreground">작품 수:</span> {selectedApp.artworkIds.length}</p>
                  </div>
                </div>

                {selectedApp.artistStatement && (
                  <div>
                    <h3 className="font-semibold mb-2">작가 노트</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApp.artistStatement}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">심사 노트</h3>
                  <Textarea
                    placeholder="심사 의견을 입력하세요..."
                    value={judgeNotes}
                    onChange={(e) => setJudgeNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(null)
                      setJudgeNotes('')
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="outline"
                    className="text-scholar-red"
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    disabled={updating}
                  >
                    <X className="w-4 h-4 mr-2" />
                    거부
                  </Button>
                  <Button
                    variant="outline"
                    className="text-celadon-green"
                    onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                    disabled={updating}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                  <Button
                    className="bg-temple-gold hover:bg-temple-gold/90"
                    onClick={() => handleUpdateStatus(selectedApp.id, 'winner')}
                    disabled={updating}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    수상 선정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
