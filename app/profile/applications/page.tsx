'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, FileText, Award, Eye, Trash2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { fetchMyApplications, withdrawApplication } from '@/lib/api/contests'
import { getSupabaseClient } from '@/lib/supabase'
import {
  ContestApplicationWithDetails,
  APPLICATION_STATUS_LABELS,
  getApplicationStatusColor
} from '@/types/contest-new'

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<ContestApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        if (!supabase) {
          throw new Error('인증 시스템을 사용할 수 없습니다.')
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?redirect=/profile/applications')
          return
        }

        setUserId(user.id)

        const { data, error: fetchError } = await fetchMyApplications(user.id)
        if (fetchError) {
          throw new Error('신청 내역을 불러오는데 실패했습니다.')
        }

        setApplications(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [router])

  const handleWithdraw = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      const { error: withdrawError } = await withdrawApplication(deleteId)
      if (withdrawError) {
        throw new Error('신청 철회에 실패했습니다.')
      }

      // Remove from list
      setApplications(applications.filter(app => app.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            내 공모전 신청
          </h1>
          <p className="text-muted-foreground">
            공모전 신청 내역을 확인하고 관리하세요
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold text-foreground">{applications.length}</div>
              <div className="text-sm text-muted-foreground">총 신청</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-foreground">
                {applications.filter(a => a.status === 'under_review').length}
              </div>
              <div className="text-sm text-muted-foreground">검토중</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-celadon-green" />
              <div className="text-2xl font-bold text-foreground">
                {applications.filter(a => a.status === 'accepted').length}
              </div>
              <div className="text-sm text-muted-foreground">승인됨</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-temple-gold" />
              <div className="text-2xl font-bold text-foreground">
                {applications.filter(a => a.status === 'winner').length}
              </div>
              <div className="text-sm text-muted-foreground">수상</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                신청 내역이 없습니다
              </h3>
              <p className="text-muted-foreground mb-6">
                공모전에 지원하여 여러분의 작품을 선보이세요
              </p>
              <Link href="/contests">
                <Button className="bg-celadon-green hover:bg-celadon-green/90">
                  공모전 둘러보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getApplicationStatusColor(application.status)}>
                          {APPLICATION_STATUS_LABELS[application.status]?.ko}
                        </Badge>
                        {application.applicationNumber && (
                          <span className="text-sm text-muted-foreground">
                            #{application.applicationNumber}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif">
                        <Link 
                          href={`/contests/${application.contestId}`}
                          className="hover:text-celadon-green transition-colors"
                        >
                          {application.contest?.title || '공모전'}
                        </Link>
                      </CardTitle>
                    </div>
                    {application.status === 'submitted' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(application.id)}
                        className="text-scholar-red hover:text-scholar-red/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>신청일: {formatDate(application.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>제출 작품: {application.artworkIds.length}개</span>
                      </div>
                      {application.paymentStatus && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>결제: {application.paymentStatus === 'completed' ? '완료' : application.paymentStatus === 'waived' ? '면제' : '대기중'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {application.result && (
                        <div className="p-3 bg-celadon-green/10 rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1">심사 결과</p>
                          <p className="text-sm text-muted-foreground">{application.result}</p>
                        </div>
                      )}
                      {application.judgeNotes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1">심사 의견</p>
                          <p className="text-sm text-muted-foreground">{application.judgeNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <Link href={`/contests/${application.contestId}`}>
                      <Button variant="outline" size="sm">
                        공모전 보기
                      </Button>
                    </Link>
                    {application.artistStatement && (
                      <Button variant="ghost" size="sm">
                        작가 노트 보기
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>신청을 철회하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 신청서가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={deleting}
              className="bg-scholar-red hover:bg-scholar-red/90"
            >
              {deleting ? '처리중...' : '철회하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
