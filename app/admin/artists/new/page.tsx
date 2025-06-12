'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Upload, X, Save, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createArtist, uploadImage } from '@/lib/admin-api'
import { toast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/ui/image-upload'
import { ArtistPreview } from '@/components/ArtistPreview'

export default function NewArtistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_ja: '',
    name_zh: '',
    bio: '',
    bio_en: '',
    bio_ja: '',
    bio_zh: '',
    birth_year: '',
    nationality: '',
    specialties: [] as string[],
    awards: [] as string[],
    exhibitions: [] as string[],
    profile_image: '',
    membership_type: '준회원' as '준회원' | '정회원' | '특별회원' | '명예회원',
    artist_type: '일반작가' as '공모작가' | '청년작가' | '일반작가' | '추천작가' | '초대작가',
    title: null as '이사' | '상임이사' | '감사' | '고문' | '상임고문' | '자문위원' | '운영위원' | '심사위원' | '운영위원장' | '심사위원장' | '이사장' | '명예이사장' | '부회장' | '회장' | null
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [awards, setAwards] = useState<string[]>([])
  const [newAward, setNewAward] = useState('')
  const [exhibitions, setExhibitions] = useState<string[]>([])
  const [newExhibition, setNewExhibition] = useState('')

  // 폼 진행률 계산
  const calculateProgress = useCallback(() => {
    const requiredFields = ['name', 'bio', 'membership_type', 'artist_type']
    const optionalFields = ['name_en', 'birth_year', 'nationality', 'profile_image']
    
    let completed = 0
    const total = requiredFields.length + optionalFields.length + 3 // +3 for skills, awards, exhibitions
    
    // 필수 필드 체크
    requiredFields.forEach(field => {
      if (formData[field as keyof typeof formData] && 
          String(formData[field as keyof typeof formData]).trim()) {
        completed++
      }
    })
    
    // 선택 필드 체크
    optionalFields.forEach(field => {
      if (formData[field as keyof typeof formData] && 
          String(formData[field as keyof typeof formData]).trim()) {
        completed++
      }
    })
    
    // 배열 필드 체크
    if (skills.length > 0) completed++
    if (awards.length > 0) completed++
    if (exhibitions.length > 0) completed++
    
    return Math.round((completed / total) * 100)
  }, [formData, skills, awards, exhibitions])

  // 초기 진행률 설정
  useEffect(() => {
    setSaveProgress(calculateProgress())
  }, [calculateProgress])

  const handleInputChange = (field: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 진행률 업데이트
    setTimeout(() => {
      setSaveProgress(calculateProgress())
    }, 100)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const imageResult = await uploadImage(file, 'artists')
    const imageUrl = imageResult.url
    setFormData(prev => ({ ...prev, profile_image: imageUrl }))
    return imageUrl
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
      setTimeout(() => setSaveProgress(calculateProgress()), 100)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
    setTimeout(() => setSaveProgress(calculateProgress()), 100)
  }

  const addAward = () => {
    if (newAward.trim() && !awards.includes(newAward.trim())) {
      setAwards([...awards, newAward.trim()])
      setNewAward('')
      setTimeout(() => setSaveProgress(calculateProgress()), 100)
    }
  }

  const removeAward = (awardToRemove: string) => {
    setAwards(awards.filter(award => award !== awardToRemove))
    setTimeout(() => setSaveProgress(calculateProgress()), 100)
  }

  const addExhibition = () => {
    if (newExhibition.trim() && !exhibitions.includes(newExhibition.trim())) {
      setExhibitions([...exhibitions, newExhibition.trim()])
      setNewExhibition('')
      setTimeout(() => setSaveProgress(calculateProgress()), 100)
    }
  }

  const removeExhibition = (exhibitionToRemove: string) => {
    setExhibitions(exhibitions.filter(exhibition => exhibition !== exhibitionToRemove))
    setTimeout(() => setSaveProgress(calculateProgress()), 100)
  }

  // 폼 검증 함수
  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push("작가명(한국어)은 필수 입력 항목입니다.")
    }

    if (!formData.bio.trim()) {
      errors.push("작가 약력(한국어)은 필수 입력 항목입니다.")
    }

    if (formData.birth_year && (parseInt(formData.birth_year) < 1900 || parseInt(formData.birth_year) > new Date().getFullYear())) {
      errors.push("올바른 출생년도를 입력해주세요.")
    }

    // 직위 검증: 정회원이면서 추천작가/초대작가가 아닌 경우 직위 불가
    if (formData.title && (formData.membership_type !== '정회원' || 
        (formData.artist_type !== '추천작가' && formData.artist_type !== '초대작가'))) {
      errors.push("직위는 정회원이면서 추천작가 또는 초대작가만 가질 수 있습니다.")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 검증
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "입력 오류",
        description: validationErrors.join('\n'),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const artistData = {
        name: formData.name.trim(),
        name_en: formData.name_en.trim() || null,
        name_ja: formData.name_ja.trim() || null,
        name_zh: formData.name_zh.trim() || null,
        bio: formData.bio.trim(),
        bio_en: formData.bio_en.trim() || null,
        bio_ja: formData.bio_ja.trim() || null,
        bio_zh: formData.bio_zh.trim() || null,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
        nationality: formData.nationality || null,
        specialties: skills.length > 0 ? skills : null,
        awards: awards.length > 0 ? awards : null,
        exhibitions: exhibitions.length > 0 ? exhibitions : null,
        profile_image: formData.profile_image || null,
        membership_type: formData.membership_type,
        artist_type: formData.artist_type,
        title: formData.title
      }

      await createArtist(artistData)
      
      toast({
        title: "작가 등록 완료",
        description: `${formData.name} 작가가 성공적으로 등록되었습니다.`,
      })
      
      router.push('/admin')
    } catch (error) {
      
      toast({
        title: "등록 실패",
        description: "작가 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // 기본 검증
    if (!formData.name.trim()) {
      toast({
        title: "미리보기 불가",
        description: "작가명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setPreviewOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드로 돌아가기
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">새 작가 등록</h1>
            <p className="text-muted-foreground">작가의 상세 정보를 입력해주세요</p>
            
            {/* 진행률 표시 */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">입력 진행률</span>
                <span className="text-sm text-muted-foreground">{saveProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${saveProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 메인 정보 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">작가명 (한국어) *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="작가 이름을 입력하세요"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_en">작가명 (영어)</Label>
                      <Input
                        id="name_en"
                        value={formData.name_en}
                        onChange={(e) => handleInputChange('name_en', e.target.value)}
                        placeholder="Artist Name in English"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name_ja">작가명 (일본어)</Label>
                      <Input
                        id="name_ja"
                        value={formData.name_ja}
                        onChange={(e) => handleInputChange('name_ja', e.target.value)}
                        placeholder="アーティスト名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_zh">작가명 (중국어)</Label>
                      <Input
                        id="name_zh"
                        value={formData.name_zh}
                        onChange={(e) => handleInputChange('name_zh', e.target.value)}
                        placeholder="艺术家姓名"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_year">출생년도</Label>
                      <Input
                        id="birth_year"
                        type="number"
                        value={formData.birth_year}
                        onChange={(e) => handleInputChange('birth_year', e.target.value)}
                        placeholder="1980"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">국적</Label>
                      <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="국적 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="한국">한국</SelectItem>
                          <SelectItem value="일본">일본</SelectItem>
                          <SelectItem value="중국">중국</SelectItem>
                          <SelectItem value="미국">미국</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="membership_type">회원 구분 *</Label>
                      <Select value={formData.membership_type} onValueChange={(value) => handleInputChange('membership_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="회원 구분 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="준회원">준회원</SelectItem>
                          <SelectItem value="정회원">정회원</SelectItem>
                          <SelectItem value="특별회원">특별회원</SelectItem>
                          <SelectItem value="명예회원">명예회원</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artist_type">작가 유형 *</Label>
                      <Select value={formData.artist_type} onValueChange={(value) => handleInputChange('artist_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="작가 유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="공모작가">공모작가</SelectItem>
                          <SelectItem value="청년작가">청년작가</SelectItem>
                          <SelectItem value="일반작가">일반작가</SelectItem>
                          <SelectItem value="추천작가">추천작가</SelectItem>
                          <SelectItem value="초대작가">초대작가</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 직위 구분 - 조건부 표시 */}
                  {formData.membership_type === '정회원' && 
                   (formData.artist_type === '추천작가' || formData.artist_type === '초대작가') && (
                    <div className="space-y-2">
                      <Label htmlFor="title">직위 구분</Label>
                      <Select value={formData.title || ''} onValueChange={(value) => handleInputChange('title', value || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="직위 선택 (선택사항)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">직위 없음</SelectItem>
                          <SelectItem value="이사">이사</SelectItem>
                          <SelectItem value="상임이사">상임이사</SelectItem>
                          <SelectItem value="감사">감사</SelectItem>
                          <SelectItem value="고문">고문</SelectItem>
                          <SelectItem value="상임고문">상임고문</SelectItem>
                          <SelectItem value="자문위원">자문위원</SelectItem>
                          <SelectItem value="운영위원">운영위원</SelectItem>
                          <SelectItem value="심사위원">심사위원</SelectItem>
                          <SelectItem value="운영위원장">운영위원장</SelectItem>
                          <SelectItem value="심사위원장">심사위원장</SelectItem>
                          <SelectItem value="이사장">이사장</SelectItem>
                          <SelectItem value="명예이사장">명예이사장</SelectItem>
                          <SelectItem value="부회장">부회장</SelectItem>
                          <SelectItem value="회장">회장</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        * 정회원이면서 추천작가 또는 초대작가만 직위를 가질 수 있습니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 작가 소개 */}
              <Card>
                <CardHeader>
                  <CardTitle>작가 소개</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">작가 약력 (한국어) *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="작가의 약력을 입력하세요"
                      rows={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio_en">작가 약력 (영어)</Label>
                    <Textarea
                      id="bio_en"
                      value={formData.bio_en}
                      onChange={(e) => handleInputChange('bio_en', e.target.value)}
                      placeholder="Artist biography in English"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 전문 분야 */}
              <Card>
                <CardHeader>
                  <CardTitle>전문 분야</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>전문 기술/스타일</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="예: 행서, 해서, 초서"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} disabled={!newSkill.trim()}>
                        추가
                      </Button>
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 수상 경력 */}
              <Card>
                <CardHeader>
                  <CardTitle>수상 경력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>수상 내역</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newAward}
                        onChange={(e) => setNewAward(e.target.value)}
                        placeholder="수상 내역을 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
                      />
                      <Button type="button" onClick={addAward} disabled={!newAward.trim()}>
                        추가
                      </Button>
                    </div>
                  </div>
                  {awards.length > 0 && (
                    <div className="space-y-2">
                      {awards.map((award, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{award}</span>
                          <X 
                            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                            onClick={() => removeAward(award)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 전시 경력 */}
              <Card>
                <CardHeader>
                  <CardTitle>전시 경력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>주요 전시</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newExhibition}
                        onChange={(e) => setNewExhibition(e.target.value)}
                        placeholder="전시 정보를 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExhibition())}
                      />
                      <Button type="button" onClick={addExhibition} disabled={!newExhibition.trim()}>
                        추가
                      </Button>
                    </div>
                  </div>
                  {exhibitions.length > 0 && (
                    <div className="space-y-2">
                      {exhibitions.map((exhibition, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{exhibition}</span>
                          <X 
                            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                            onClick={() => removeExhibition(exhibition)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              
              {/* 프로필 이미지 */}
              <Card>
                <CardHeader>
                  <CardTitle>프로필 이미지</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.profile_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, profile_image: url || '' }))}
                    onUpload={handleImageUpload}
                    disabled={loading}
                    maxSize={5}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                    previewSize={200}
                  />
                </CardContent>
              </Card>

              {/* 작업 버튼 */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        등록 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        작가 등록
                      </>
                    )}
                  </Button>
                  
                  {/* 미리보기 Dialog */}
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        disabled={loading}
                        onClick={handlePreview}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        미리보기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>작가 정보 미리보기</DialogTitle>
                      </DialogHeader>
                      <ArtistPreview 
                        formData={formData}
                        skills={skills}
                        awards={awards}
                        exhibitions={exhibitions}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button type="button" variant="ghost" className="w-full" asChild disabled={loading}>
                    <Link href="/admin">취소</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
} 