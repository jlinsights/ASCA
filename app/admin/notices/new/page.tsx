'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertCircle
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { createNotice } from '@/lib/supabase/cms'
import type { NoticeFormData } from '@/types/cms'
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

export default function NewNoticePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
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

      const submitData: NoticeFormData = {
        title: formData.title || '',
        content: formData.content || '',
        excerpt: formData.excerpt || formData.content?.substring(0, 200) || '',
        category: formData.category as any || 'general',
        author_name: formData.author_name || '',
        is_published: isDraft ? false : (formData.is_published || false),
        is_pinned: formData.is_pinned || false
      }

      await createNotice(submitData)
      
      router.push('/admin/notices')
    } catch (err) {
      setError('공지사항 저장에 실패했습니다.')
      
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
                {language === 'ko' ? '새 공지사항 작성' : 'Create New Notice'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' ? '새로운 공지사항을 작성합니다.' : 'Create a new notice.'}
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
              {loading ? '저장 중...' : '발행'}
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
                  <Label htmlFor="is_published">즉시 발행</Label>
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

            {/* 도움말 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>작성 도움말</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• 제목은 명확하고 간결하게 작성하세요</p>
                  <p>• 요약은 검색 결과에 표시됩니다</p>
                  <p>• 중요한 공지는 상단 고정을 활용하세요</p>
                  <p>• 임시저장으로 작성 중인 내용을 보관할 수 있습니다</p>
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