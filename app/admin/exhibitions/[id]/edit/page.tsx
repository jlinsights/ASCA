'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Save,
  Eye,
  Star,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  Loader2,
  Ticket
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { getExhibitionById, updateExhibition } from '@/lib/supabase/cms'
import type { Exhibition, ExhibitionFormData } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { notFound } from 'next/navigation'

export default function EditExhibitionPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const exhibitionId = params.id as string

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  
  const [formData, setFormData] = useState<Partial<ExhibitionFormData>>({
    title: '',
    subtitle: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    curator: '',
    featured_image_url: '',
    is_featured: false,
    is_published: false,
    admission_fee: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 기존 전시회 데이터 로드
  useEffect(() => {
    const loadExhibition = async () => {
      try {
        setInitialLoading(true)
        setError(null)

        // 관리자용으로 직접 supabase에서 가져오기 (published 체크 없이)
        const { supabase } = await import('@/lib/supabase')
        const exhibition = await supabase
          ?.from('exhibitions')
          .select('*')
          .eq('id', params.id)
          .single()

        if (!supabase || !exhibition?.data) {
          notFound()
        }

        setExhibition(exhibition.data)
        setFormData({
          title: exhibition.data.title,
          subtitle: exhibition.data.subtitle || '',
          description: exhibition.data.description,
          start_date: exhibition.data.start_date,
          end_date: exhibition.data.end_date,
          location: exhibition.data.location,
          venue: exhibition.data.venue || '',
          curator: exhibition.data.curator || '',
          featured_image_url: exhibition.data.featured_image_url || '',
          is_featured: exhibition.data.is_featured,
          is_published: exhibition.data.is_published,
          admission_fee: exhibition.data.admission_fee || 0
        })
      } catch (err) {
        setError('전시회를 불러오는데 실패했습니다.')
        console.error('Error loading exhibition:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    if (exhibitionId) {
      loadExhibition()
    }
  }, [exhibitionId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = '전시회 제목을 입력해주세요.'
    }
    if (!formData.description?.trim()) {
      newErrors.description = '전시회 설명을 입력해주세요.'
    }
    if (!formData.start_date) {
      newErrors.start_date = '시작일을 선택해주세요.'
    }
    if (!formData.end_date) {
      newErrors.end_date = '종료일을 선택해주세요.'
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = '종료일은 시작일보다 늦어야 합니다.'
    }
    if (!formData.location?.trim()) {
      newErrors.location = '전시 장소를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return

    try {
      setLoading(true)
      setError(null)

      const submitData: Partial<ExhibitionFormData> = {
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        description: formData.description || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        location: formData.location || '',
        venue: formData.venue || '',
        curator: formData.curator || '',
        featured_image_url: formData.featured_image_url || '',
        is_featured: formData.is_featured || false,
        is_published: isDraft ? false : (formData.is_published || false),
        admission_fee: formData.admission_fee ? (typeof formData.admission_fee === 'string' ? parseFloat(formData.admission_fee) : formData.admission_fee) : undefined
      }

      await updateExhibition(exhibitionId, submitData)
      
      router.push('/admin/exhibitions')
    } catch (err) {
      setError('전시회 수정에 실패했습니다.')
      console.error('Error updating exhibition:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ExhibitionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    return dateString.split('T')[0]
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">전시회를 불러오는 중...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !exhibition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/admin/exhibitions">
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
            <Link href="/admin/exhibitions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ko' ? '전시회 수정' : 'Edit Exhibition'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' ? '전시회 정보를 수정합니다.' : 'Edit the exhibition.'}
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
              <Star className="h-4 w-4 mr-2" />
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
                  <Star className="h-5 w-5" />
                  전시회 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPreview ? (
                  <>
                    {/* 제목 */}
                    <div className="space-y-2">
                      <Label htmlFor="title">전시회 제목 *</Label>
                      <Input
                        id="title"
                        placeholder="전시회 제목을 입력하세요"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* 부제목 */}
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">부제목</Label>
                      <Input
                        id="subtitle"
                        placeholder="전시회 부제목을 입력하세요 (선택사항)"
                        value={formData.subtitle || ''}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      />
                    </div>

                    {/* 설명 */}
                    <div className="space-y-2">
                      <Label htmlFor="description">전시회 설명 *</Label>
                      <Textarea
                        id="description"
                        placeholder="전시회에 대한 상세한 설명을 입력하세요"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={8}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    {/* 전시 기간 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">시작일 *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formatDateForInput(formData.start_date || '')}
                          onChange={(e) => handleInputChange('start_date', e.target.value)}
                          className={errors.start_date ? 'border-red-500' : ''}
                        />
                        {errors.start_date && (
                          <p className="text-sm text-red-600">{errors.start_date}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">종료일 *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formatDateForInput(formData.end_date || '')}
                          onChange={(e) => handleInputChange('end_date', e.target.value)}
                          className={errors.end_date ? 'border-red-500' : ''}
                        />
                        {errors.end_date && (
                          <p className="text-sm text-red-600">{errors.end_date}</p>
                        )}
                      </div>
                    </div>

                    {/* 장소 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">전시 장소 *</Label>
                        <Input
                          id="location"
                          placeholder="예: 서울시 종로구"
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && (
                          <p className="text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venue">상세 장소</Label>
                        <Input
                          id="venue"
                          placeholder="예: 동양서예협회 전시관"
                          value={formData.venue || ''}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 큐레이터 및 입장료 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="curator">큐레이터</Label>
                        <Input
                          id="curator"
                          placeholder="큐레이터명을 입력하세요"
                          value={formData.curator || ''}
                          onChange={(e) => handleInputChange('curator', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admission_fee">입장료</Label>
                        <Input
                          id="admission_fee"
                          placeholder="예: 무료, 5,000원"
                          value={formData.admission_fee || ''}
                          onChange={(e) => handleInputChange('admission_fee', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 대표 이미지 */}
                    <div className="space-y-2">
                      <Label htmlFor="featured_image_url">대표 이미지 URL</Label>
                      <Input
                        id="featured_image_url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.featured_image_url || ''}
                        onChange={(e) => handleInputChange('featured_image_url', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        전시회 대표 이미지의 URL을 입력하세요.
                      </p>
                    </div>
                  </>
                ) : (
                  /* 미리보기 */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {formData.title || '제목 없음'}
                      </h2>
                      {formData.subtitle && (
                        <p className="text-lg text-muted-foreground mb-4">
                          {formData.subtitle}
                        </p>
                      )}
                      
                      {formData.featured_image_url && (
                        <div className="mb-6">
                          <img
                            src={formData.featured_image_url}
                            alt={formData.title || '전시회 이미지'}
                            className="w-full h-64 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formData.start_date && formData.end_date
                              ? `${new Date(formData.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(formData.end_date).toLocaleDateString('ko-KR')}`
                              : '기간 미정'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.location || '장소 미정'}</span>
                        </div>
                        {formData.curator && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{formData.curator}</span>
                          </div>
                        )}
                        {formData.admission_fee && (
                          <div className="flex items-center gap-2 text-sm">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span>{formData.admission_fee}</span>
                          </div>
                        )}
                      </div>

                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        {formData.description ? (
                          <div className="whitespace-pre-wrap">
                            {formData.description}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">설명이 없습니다.</p>
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
                  <Label htmlFor="is_featured" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    주요 전시회
                  </Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured || false}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 메타 정보 */}
            {exhibition && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>메타 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">등록일:</span>
                    <p className="font-medium">
                      {new Date(exhibition.created_at).toLocaleDateString('ko-KR', {
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
                      {new Date(exhibition.updated_at).toLocaleDateString('ko-KR', {
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
                    <p className="font-medium">{exhibition.views.toLocaleString()}회</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">상태:</span>
                    <p className="font-medium">
                      {exhibition.status === 'upcoming' && '예정'}
                      {exhibition.status === 'current' && '진행중'}
                      {exhibition.status === 'past' && '종료'}
                    </p>
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
                  <p>• 전시 기간 변경 시 상태가 자동으로 업데이트됩니다</p>
                  <p>• 주요 전시회 설정은 홈페이지 노출에 영향을 줍니다</p>
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