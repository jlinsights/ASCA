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
  Calendar,
  MapPin,
  User,
  AlertCircle,
  Users,
  DollarSign,
  Clock
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { createEvent } from '@/lib/supabase/cms'
import type { EventFormData } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

const eventTypeOptions = [
  { value: 'workshop', label: '워크숍' },
  { value: 'lecture', label: '강연' },
  { value: 'competition', label: '공모전' },
  { value: 'exhibition', label: '전시' },
  { value: 'ceremony', label: '시상식' },
  { value: 'meeting', label: '총회' },
  { value: 'other', label: '기타' }
]

export default function NewEventPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    event_date: '',
    location: '',
    venue: '',
    organizer: '',
    featured_image_url: '',
    event_type: 'workshop',
    is_featured: false,
    is_published: false,
    registration_fee: '',
    max_participants: '',
    registration_deadline: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = '행사 제목을 입력해주세요.'
    }
    if (!formData.description?.trim()) {
      newErrors.description = '행사 설명을 입력해주세요.'
    }
    if (!formData.event_date) {
      newErrors.event_date = '행사 일시를 선택해주세요.'
    }
    if (!formData.location?.trim()) {
      newErrors.location = '행사 장소를 입력해주세요.'
    }
    if (!formData.organizer?.trim()) {
      newErrors.organizer = '주최자를 입력해주세요.'
    }
    if (!formData.event_type) {
      newErrors.event_type = '행사 유형을 선택해주세요.'
    }

    // 등록 마감일이 행사 일시보다 늦으면 안됨
    if (formData.registration_deadline && formData.event_date && 
        formData.registration_deadline > formData.event_date) {
      newErrors.registration_deadline = '등록 마감일은 행사 일시보다 빨라야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return

    try {
      setLoading(true)
      setError(null)

      const submitData: EventFormData = {
        title: formData.title || '',
        description: formData.description || '',
        event_date: formData.event_date || '',
        location: formData.location || '',
        venue: formData.venue || '',
        organizer: formData.organizer || '',
        featured_image_url: formData.featured_image_url || '',
        event_type: formData.event_type as any || 'workshop',
        is_featured: formData.is_featured || false,
        is_published: isDraft ? false : (formData.is_published || false),
        registration_fee: formData.registration_fee ? parseFloat(formData.registration_fee) : undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        registration_deadline: formData.registration_deadline || undefined,
        registration_required: !!formData.registration_fee || !!formData.max_participants
      }

      await createEvent(submitData)
      
      router.push('/admin/events')
    } catch (err) {
      setError('행사 저장에 실패했습니다.')
      console.error('Error creating event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return ''
    return dateString.slice(0, 16) // YYYY-MM-DDTHH:MM 형식
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/events">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ko' ? '새 행사 등록' : 'Create New Event'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' ? '새로운 행사를 등록합니다.' : 'Create a new event.'}
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
              <Calendar className="h-4 w-4 mr-2" />
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
                  <Calendar className="h-5 w-5" />
                  행사 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPreview ? (
                  <>
                    {/* 제목 */}
                    <div className="space-y-2">
                      <Label htmlFor="title">행사 제목 *</Label>
                      <Input
                        id="title"
                        placeholder="행사 제목을 입력하세요"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* 설명 */}
                    <div className="space-y-2">
                      <Label htmlFor="description">행사 설명 *</Label>
                      <Textarea
                        id="description"
                        placeholder="행사에 대한 상세한 설명을 입력하세요"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={8}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    {/* 행사 일시 */}
                    <div className="space-y-2">
                      <Label htmlFor="event_date">행사 일시 *</Label>
                      <Input
                        id="event_date"
                        type="datetime-local"
                        value={formatDateTimeForInput(formData.event_date || '')}
                        onChange={(e) => handleInputChange('event_date', e.target.value)}
                        className={errors.event_date ? 'border-red-500' : ''}
                      />
                      {errors.event_date && (
                        <p className="text-sm text-red-600">{errors.event_date}</p>
                      )}
                    </div>

                    {/* 장소 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">행사 장소 *</Label>
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
                          placeholder="예: 동양서예협회 강의실"
                          value={formData.venue || ''}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 주최자 및 행사 유형 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organizer">주최자 *</Label>
                        <Input
                          id="organizer"
                          placeholder="주최자명을 입력하세요"
                          value={formData.organizer || ''}
                          onChange={(e) => handleInputChange('organizer', e.target.value)}
                          className={errors.organizer ? 'border-red-500' : ''}
                        />
                        {errors.organizer && (
                          <p className="text-sm text-red-600">{errors.organizer}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_type">행사 유형 *</Label>
                        <Select
                          value={formData.event_type || ''}
                          onValueChange={(value) => handleInputChange('event_type', value)}
                        >
                          <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="행사 유형 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.event_type && (
                          <p className="text-sm text-red-600">{errors.event_type}</p>
                        )}
                      </div>
                    </div>

                    {/* 참가비 및 정원 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registration_fee">참가비</Label>
                        <Input
                          id="registration_fee"
                          placeholder="예: 무료, 10,000원"
                          value={formData.registration_fee || ''}
                          onChange={(e) => handleInputChange('registration_fee', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_participants">정원</Label>
                        <Input
                          id="max_participants"
                          type="number"
                          placeholder="예: 30"
                          value={formData.max_participants || ''}
                          onChange={(e) => handleInputChange('max_participants', e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>

                    {/* 등록 마감일 */}
                    <div className="space-y-2">
                      <Label htmlFor="registration_deadline">등록 마감일</Label>
                      <Input
                        id="registration_deadline"
                        type="datetime-local"
                        value={formatDateTimeForInput(formData.registration_deadline || '')}
                        onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                        className={errors.registration_deadline ? 'border-red-500' : ''}
                      />
                      {errors.registration_deadline && (
                        <p className="text-sm text-red-600">{errors.registration_deadline}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        등록 마감일을 설정하지 않으면 행사 당일까지 등록 가능합니다.
                      </p>
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
                        행사 대표 이미지의 URL을 입력하세요.
                      </p>
                    </div>
                  </>
                ) : (
                  /* 미리보기 */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {formData.title || '제목 없음'}
                      </h2>
                      
                      {formData.featured_image_url && (
                        <div className="mb-6">
                          <img
                            src={formData.featured_image_url}
                            alt={formData.title || '행사 이미지'}
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
                            {formData.event_date
                              ? new Date(formData.event_date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '일시 미정'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.location || '장소 미정'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{formData.organizer || '주최자 미정'}</span>
                        </div>
                        {formData.registration_fee && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formData.registration_fee}</span>
                          </div>
                        )}
                        {formData.max_participants && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>정원 {formData.max_participants}명</span>
                          </div>
                        )}
                        {formData.registration_deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              등록 마감: {new Date(formData.registration_deadline).toLocaleDateString('ko-KR')}
                            </span>
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
                    <Calendar className="h-4 w-4" />
                    주요 행사
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
                  <p>• 제목, 설명, 일시, 장소, 주최자는 필수 입력 항목입니다</p>
                  <p>• 행사 일시는 정확한 날짜와 시간을 입력하세요</p>
                  <p>• 주요 행사로 설정하면 홈페이지에 강조 표시됩니다</p>
                  <p>• 등록 마감일은 행사 일시보다 빨라야 합니다</p>
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