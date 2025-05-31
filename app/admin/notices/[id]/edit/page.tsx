'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Calendar,
  Pin,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { getNoticeById, updateNotice } from '@/lib/supabase/cms'
import type { Notice, NoticeFormData } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

const categoryOptions = [
  { value: 'exhibition', label: '전시회' },
  { value: 'education', label: '교육' },
  { value: 'competition', label: '공모전' },
  { value: 'general', label: '일반' },
  { value: 'meeting', label: '총회' },
  { value: 'exchange', label: '교류전' }
]

export default function EditNoticePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const noticeId = params.id as string

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  
  const [formData, setFormData] = useState<Partial<NoticeFormData>>({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    author_name: '',
    is_published: false,
    is_pinned: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 기존 공지사항 데이터 로드
  useEffect(() => {
    const loadNotice = async () => {
      try {
        setInitialLoading(true)
        setError(null)

        // 관리자용으로 직접 supabase에서 가져오기 (published 체크 없이)
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .eq('id', noticeId)
          .single()

        if (error) throw error
        if (!data) throw new Error('공지사항을 찾을 수 없습니다.')

        setNotice(data)
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          category: data.category,
          author_name: data.author_name,
          is_published: data.is_published,
          is_pinned: data.is_pinned
        })
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.')
        console.error('Error loading notice:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    if (noticeId) {
      loadNotice()
    }
  }, [noticeId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = '제목을 입력해주세요.'
    }
    if (!formData.content?.trim()) {
      newErrors.content = '내용을 입력해주세요.'
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.'
    }
    if (!formData.author_name?.trim()) {
      newErrors.author_name = '작성자명을 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return

    try {
      setLoading(true)
      setError(null)

      const submitData: Partial<NoticeFormData> = {
        title: formData.title || '',
        content: formData.content || '',
        excerpt: formData.excerpt || formData.content?.substring(0, 200) || '',
        category: formData.category as any || 'general',
        author_name: formData.author_name || '',
        is_published: isDraft ? false : (formData.is_published || false),
        is_pinned: formData.is_pinned || false
      }

      await updateNotice(noticeId, submitData)
      
      router.push('/admin/notices')
    } catch (err) {
      setError('공지사항 수정에 실패했습니다.')
      console.error('Error updating notice:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof NoticeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (initialLoading) {
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

  if (error && !notice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/admin/notices">
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
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/notices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ko' ? '공지사항 수정' : 'Edit Notice'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' ? '공지사항을 수정합니다.' : 'Edit the notice.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? '편집' : '미리보기'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              임시저장
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              {loading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 폼 */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  공지사항 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPreview ? (
                  <>
                    {/* 제목 */}
                    <div className="space-y-2">
                      <Label htmlFor="title">제목 *</Label>
                      <Input
                        id="title"
                        placeholder="공지사항 제목을 입력하세요"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* 요약 */}
                    <div className="space-y-2">
                      <Label htmlFor="excerpt">요약</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="공지사항 요약을 입력하세요 (선택사항)"
                        value={formData.excerpt || ''}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        요약을 입력하지 않으면 본문의 처음 200자가 자동으로 사용됩니다.
                      </p>
                    </div>

                    {/* 내용 */}
                    <div className="space-y-2">
                      <Label htmlFor="content">내용 *</Label>
                      <Textarea
                        id="content"
                        placeholder="공지사항 내용을 입력하세요"
                        value={formData.content || ''}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        rows={15}
                        className={errors.content ? 'border-red-500' : ''}
                      />
                      {errors.content && (
                        <p className="text-sm text-red-600">{errors.content}</p>
                      )}
                    </div>
                  </>
                ) : (
                  /* 미리보기 */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {formData.title || '제목 없음'}
                      </h2>
                      {formData.excerpt && (
                        <p className="text-lg text-muted-foreground mb-6 p-4 bg-muted rounded-lg">
                          {formData.excerpt}
                        </p>
                      )}
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        {formData.content ? (
                          <div className="whitespace-pre-wrap">
                            {formData.content}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">내용이 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 발행 설정 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  발행 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_published">발행 상태</Label>
                  <Switch
                    id="is_published"
                    checked={formData.is_published || false}
                    onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_pinned" className="flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    상단 고정
                  </Label>
                  <Switch
                    id="is_pinned"
                    checked={formData.is_pinned || false}
                    onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 분류 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>분류</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">작성자 *</Label>
                  <Input
                    id="author_name"
                    placeholder="작성자명"
                    value={formData.author_name || ''}
                    onChange={(e) => handleInputChange('author_name', e.target.value)}
                    className={errors.author_name ? 'border-red-500' : ''}
                  />
                  {errors.author_name && (
                    <p className="text-sm text-red-600">{errors.author_name}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 메타 정보 */}
            {notice && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>메타 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">작성일:</span>
                    <p className="font-medium">
                      {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">수정일:</span>
                    <p className="font-medium">
                      {new Date(notice.updated_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">조회수:</span>
                    <p className="font-medium">{notice.views.toLocaleString()}회</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 도움말 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>수정 도움말</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• 수정 후 반드시 저장 버튼을 클릭하세요</p>
                  <p>• 임시저장으로 작업 내용을 보관할 수 있습니다</p>
                  <p>• 발행 상태를 변경하면 즉시 반영됩니다</p>
                  <p>• 미리보기로 최종 결과를 확인하세요</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 