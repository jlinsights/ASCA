'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Calendar,
  Eye,
  MessageCircle,
  Share2,
  Pin,
  AlertCircle,
  Loader2,
  Send,
  Heart,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { 
  getNoticeById, 
  incrementNoticeViews,
  getNoticeComments,
  createNoticeComment,
  getRelatedNotices
} from '@/lib/supabase/cms'
import type { Notice, NoticeComment } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

export default function NoticeDetailPage() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const noticeId = params.id as string

  const [notice, setNotice] = useState<Notice | null>(null)
  const [comments, setComments] = useState<NoticeComment[]>([])
  const [relatedNotices, setRelatedNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentLoading, setCommentLoading] = useState(false)
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  })

  // 공지사항 데이터 로드
  useEffect(() => {
    const loadNotice = async () => {
      try {
        setLoading(true)
        setError(null)

        // 공지사항 상세 정보 가져오기
        const noticeData = await getNoticeById(noticeId)
        if (!noticeData) {
          throw new Error('공지사항을 찾을 수 없습니다.')
        }

        setNotice(noticeData)

        // 조회수 증가
        await incrementNoticeViews(noticeId)

        // 댓글 가져오기
        const commentsData = await getNoticeComments(noticeId)
        setComments(commentsData)

        // 관련 공지사항 가져오기
        const relatedData = await getRelatedNotices(noticeId, noticeData.category)
        setRelatedNotices(relatedData)

      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.')
        console.error('Error loading notice:', err)
      } finally {
        setLoading(false)
      }
    }

    if (noticeId) {
      loadNotice()
    }
  }, [noticeId])

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.author_name.trim() || !newComment.content.trim()) {
      alert('이름과 댓글 내용을 입력해주세요.')
      return
    }

    try {
      setCommentLoading(true)
      
      await createNoticeComment({
        notice_id: noticeId,
        author_name: newComment.author_name,
        author_email: newComment.author_email,
        content: newComment.content
      })

      // 댓글 목록 새로고침
      const updatedComments = await getNoticeComments(noticeId)
      setComments(updatedComments)

      // 폼 초기화
      setNewComment({
        author_name: '',
        author_email: '',
        content: ''
      })

      alert('댓글이 등록되었습니다.')
    } catch (err) {
      alert('댓글 등록에 실패했습니다.')
      console.error('Error creating comment:', err)
    } finally {
      setCommentLoading(false)
    }
  }

  // 공유 기능
  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = notice?.title || '동양서예협회 공지사항'
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          alert('링크가 복사되었습니다.')
        } catch (err) {
          alert('링크 복사에 실패했습니다.')
        }
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">공지사항을 불러오는 중...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/notice">
              <Button variant="outline">목록으로 돌아가기</Button>
            </Link>
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
        {/* 네비게이션 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/notice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <span>/</span>
            <Link href="/notice" className="hover:text-foreground">공지사항</Link>
            <span>/</span>
            <span className="text-foreground">{notice.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 공지사항 헤더 */}
            <Card className="border-border/50 mb-6">
              <CardHeader className="pb-4">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('copy')}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-foreground mb-4">
                  {notice.title}
                </CardTitle>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(notice.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{notice.views.toLocaleString()}회</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{comments.length}개</span>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {notice.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 댓글 섹션 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  댓글 ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 댓글 작성 폼 */}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author_name">이름 *</Label>
                      <Input
                        id="author_name"
                        placeholder="이름을 입력하세요"
                        value={newComment.author_name}
                        onChange={(e) => setNewComment(prev => ({ ...prev, author_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author_email">이메일 (선택)</Label>
                      <Input
                        id="author_email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={newComment.author_email}
                        onChange={(e) => setNewComment(prev => ({ ...prev, author_email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">댓글 내용 *</Label>
                    <Textarea
                      id="content"
                      placeholder="댓글을 입력하세요"
                      value={newComment.content}
                      onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={commentLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    {commentLoading ? '등록 중...' : '댓글 등록'}
                  </Button>
                </form>

                <Separator />

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border border-border/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{comment.author_name}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 관련 공지사항 */}
            {relatedNotices.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">관련 공지사항</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedNotices.map((relatedNotice) => (
                    <Link
                      key={relatedNotice.id}
                      href={`/notice/${relatedNotice.id}`}
                      className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge 
                          className={`text-xs ${categoryColors[relatedNotice.category as keyof typeof categoryColors]}`}
                        >
                          {categoryLabels[relatedNotice.category as keyof typeof categoryLabels]}
                        </Badge>
                        {relatedNotice.is_pinned && (
                          <Pin className="h-3 w-3 text-muted-foreground mt-0.5" />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {relatedNotice.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(relatedNotice.created_at).toLocaleDateString('ko-KR')}</span>
                        <span>조회 {relatedNotice.views}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 빠른 네비게이션 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">빠른 이동</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/notice">
                  <Button variant="outline" className="w-full justify-start">
                    공지사항 목록
                  </Button>
                </Link>
                <Link href="/exhibitions">
                  <Button variant="outline" className="w-full justify-start">
                    전시회
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    행사
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 