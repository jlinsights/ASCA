'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  ImageIcon,
  Ticket
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { createExhibition } from '@/lib/supabase/cms'
import type { ExhibitionFormData } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewExhibitionPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
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
    admission_fee: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

      const submitData: ExhibitionFormData = {
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        description: formData.description || '',
        content: '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        location: formData.location || '',
        venue: formData.venue || '',
        address: '',
        curator: formData.curator || '',
        featured_image_url: formData.featured_image_url || '',
        gallery_images: [],
        status: 'upcoming',
        is_featured: formData.is_featured || false,
        is_published: isDraft ? false : (formData.is_published || false),
        max_capacity: 0,
        ticket_price: 0,
        admission_fee: formData.admission_fee ? (typeof formData.admission_fee === 'string' ? parseFloat(formData.admission_fee) : formData.admission_fee) : 0,
        currency: 'KRW',
        is_free: false,
        opening_hours: '',
        contact: '',
        website: ''
      }

      await createExhibition(submitData)
      
      router.push('/admin/exhibitions')
    } catch (err) {
      setError('전시회 저장에 실패했습니다.')
      
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
                {language === 'ko' ? '새 전시회 등록' : 'Create New Exhibition'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' ? '새로운 전시회를 등록합니다.' : 'Create a new exhibition.'}
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
              {loading ? '저장 중...' : '등록'}
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
                  <Label htmlFor="is_published">즉시 발행</Label>
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

            {/* 도움말 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>등록 도움말</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• 제목과 설명은 필수 입력 항목입니다</p>
                  <p>• 전시 기간을 정확히 입력해주세요</p>
                  <p>• 주요 전시회로 설정하면 홈페이지에 강조 표시됩니다</p>
                  <p>• 대표 이미지는 목록에서 썸네일로 사용됩니다</p>
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