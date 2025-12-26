'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { createCareerEntry } from '@/lib/api/career'
import { getSupabaseClient } from '@/lib/supabase'
import type { CareerEntryType, CareerEntryFormData } from '@/types/career'
import { CAREER_ENTRY_TYPE_LABELS } from '@/types/career'

export function CareerEntryFormClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CareerEntryFormData>({
    type: 'exhibition',
    title: '',
    titleEn: '',
    organization: '',
    organizationEn: '',
    year: new Date().getFullYear(),
    month: undefined,
    description: '',
    descriptionEn: '',
    location: '',
    role: '',
    externalUrl: '',
    isFeatured: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = getSupabaseClient()
    if (!supabase) {
      alert('인증이 필요합니다.')
      router.push('/login')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await createCareerEntry(user.id, formData)

      if (error) {
        alert('이력 등록에 실패했습니다.')
        console.error(error)
      } else {
        alert('이력이 성공적으로 등록되었습니다!')
        router.push('/profile/career')
      }
    } catch (error) {
      alert('이력 등록 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
            
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              이력 추가
            </h1>
            <p className="text-muted-foreground">
              새로운 이력을 등록하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">이력 타입</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CareerEntryType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CAREER_ENTRY_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label.ko} ({label.en})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목 (한글) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">제목 (영문)</Label>
                    <Input
                      id="titleEn"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">기관/단체</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">장소</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">연도 *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">월</Label>
                    <Select
                      value={formData.month?.toString() || ''}
                      onValueChange={(value) => setFormData({ ...formData, month: value ? parseInt(value) : undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">없음</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {m}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">설명 (한글)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">설명 (영문)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Type-specific fields */}
            {formData.type === 'exhibition' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">전시 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exhibitionType">전시 타입</Label>
                      <Select
                        value={formData.exhibitionType || ''}
                        onValueChange={(value) => setFormData({ ...formData, exhibitionType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">개인전</SelectItem>
                          <SelectItem value="group">단체전</SelectItem>
                          <SelectItem value="online">온라인</SelectItem>
                          <SelectItem value="international">국제전</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">전시장</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curator">큐레이터</Label>
                    <Input
                      id="curator"
                      value={formData.curator}
                      onChange={(e) => setFormData({ ...formData, curator: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.type === 'award' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">수상 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="awardType">수상 타입</Label>
                    <Select
                      value={formData.awardType || ''}
                      onValueChange={(value) => setFormData({ ...formData, awardType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prize">상</SelectItem>
                        <SelectItem value="grant">보조금</SelectItem>
                        <SelectItem value="scholarship">장학금</SelectItem>
                        <SelectItem value="recognition">인정</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prizeAmount">상금</Label>
                      <Input
                        id="prizeAmount"
                        type="number"
                        value={formData.prizeAmount || ''}
                        onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">통화</Label>
                      <Select
                        value={formData.currency || 'KRW'}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KRW">KRW (원)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.type === 'education' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">학력 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">학위</Label>
                      <Input
                        id="degree"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="예: 학사, 석사, 박사"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">전공</Label>
                      <Input
                        id="major"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">추가 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">외부 링크</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isFeatured">대표 이력으로 설정</Label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-celadon-green hover:bg-celadon-green/90 text-ink-black"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? '저장 중...' : '이력 저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
