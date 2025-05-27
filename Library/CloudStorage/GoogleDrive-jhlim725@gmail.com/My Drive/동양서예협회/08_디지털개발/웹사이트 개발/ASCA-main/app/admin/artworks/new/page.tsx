'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Upload, X, Save, Eye, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  createArtwork, 
  uploadImage, 
  getAllArtists,
  type Artist 
} from '@/lib/admin-api'
import { toast } from '@/hooks/use-toast'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'

export default function NewArtworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [artists, setArtists] = useState<Artist[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    title_ja: '',
    title_zh: '',
    description: '',
    description_en: '',
    artist_id: '',
    category: '',
    style: '',
    year: '',
    materials: [] as string[],
    dimensions: {
      width: '',
      height: '',
      depth: '',
      unit: 'cm' as 'cm' | 'mm' | 'inch'
    },
    price: {
      amount: '',
      currency: 'KRW' as 'KRW' | 'USD' | 'EUR' | 'JPY'
    },
    availability: 'available' as 'available' | 'sold' | 'reserved',
    featured: false,
    condition: '',
    technique: '',
    authenticity_certificate: false
  })

  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [newMaterial, setNewMaterial] = useState('')

  // 작가 목록 로드
  useEffect(() => {
    const loadArtists = async () => {
      try {
        const artistsData = await getAllArtists()
        setArtists(artistsData)
      } catch (error) {
        console.error('Error loading artists:', error)
        toast({
          title: "작가 목록 로드 실패",
          description: "작가 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      }
    }
    loadArtists()
  }, [])

  const handleInputChange = (field: string, value: string | boolean | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImage(file, 'artworks'))
    const uploadedUrls = await Promise.all(uploadPromises)
    return uploadedUrls
  }



  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials([...materials, newMaterial.trim()])
      setNewMaterial('')
    }
  }

  const removeMaterial = (materialToRemove: string) => {
    setMaterials(materials.filter(material => material !== materialToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 필드 검증
    if (!formData.title.trim()) {
      toast({
        title: "필수 입력 항목",
        description: "작품명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!formData.artist_id) {
      toast({
        title: "필수 입력 항목",
        description: "작가를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "필수 입력 항목",
        description: "작품 설명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (images.length === 0) {
      toast({
        title: "필수 입력 항목",
        description: "최소 1개의 이미지를 업로드해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const artworkData = {
        title: formData.title,
        title_en: formData.title_en || null,
        title_ja: formData.title_ja || null,
        title_zh: formData.title_zh || null,
        description: formData.description,
        description_en: formData.description_en || null,
        artist_id: formData.artist_id,
        category: formData.category as 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media',
        style: formData.style as 'traditional' | 'contemporary' | 'modern',
        year: formData.year ? parseInt(formData.year) : new Date().getFullYear(),
        materials: materials.length > 0 ? materials : ['혼합매체'],
        dimensions: {
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0,
          depth: formData.dimensions.depth ? parseFloat(formData.dimensions.depth) : undefined,
          unit: formData.dimensions.unit
        },
        price: formData.price.amount ? {
          amount: parseFloat(formData.price.amount),
          currency: formData.price.currency
        } : null,
        availability: formData.availability,
        featured: formData.featured,
        tags: tags.length > 0 ? tags : [],
        images: images,
        thumbnail: images[0], // 첫 번째 이미지를 썸네일로 사용
        condition: formData.condition || null,
        technique: formData.technique || null,
        authenticity_certificate: formData.authenticity_certificate
      }

      await createArtwork(artworkData)
      
      toast({
        title: "작품 등록 완료",
        description: "새 작품이 성공적으로 등록되었습니다.",
      })
      
      router.push('/admin')
    } catch (error) {
      console.error('Error creating artwork:', error)
      toast({
        title: "등록 실패",
        description: "작품 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    const previewData = {
      ...formData,
      tags: tags,
      materials: materials,
      images: images
    }
    console.log('미리보기:', previewData)
    alert('미리보기 기능은 개발 중입니다.')
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
          <div>
            <h1 className="text-3xl font-bold">새 작품 등록</h1>
            <p className="text-muted-foreground">작품의 상세 정보를 입력해주세요</p>
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
                      <Label htmlFor="title">작품명 (한국어) *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="작품 제목을 입력하세요"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_en">작품명 (영어)</Label>
                      <Input
                        id="title_en"
                        value={formData.title_en}
                        onChange={(e) => handleInputChange('title_en', e.target.value)}
                        placeholder="Artwork Title in English"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artist">작가 *</Label>
                    <Select value={formData.artist_id} onValueChange={(value) => handleInputChange('artist_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="작가를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">제작연도</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        placeholder="2024"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calligraphy">서예</SelectItem>
                          <SelectItem value="painting">회화</SelectItem>
                          <SelectItem value="sculpture">조각</SelectItem>
                          <SelectItem value="mixed-media">혼합매체</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="style">스타일 *</Label>
                      <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="스타일 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traditional">전통</SelectItem>
                          <SelectItem value="contemporary">현대</SelectItem>
                          <SelectItem value="modern">모던</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">작품 설명 (한국어) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="작품에 대한 상세 설명을 입력하세요"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_en">작품 설명 (영어)</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => handleInputChange('description_en', e.target.value)}
                      placeholder="Artwork description in English"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 재료 및 기법 */}
              <Card>
                <CardHeader>
                  <CardTitle>재료 및 기법</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>사용 재료</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        placeholder="예: 한지, 먹, 수채화 물감"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                      />
                      <Button type="button" onClick={addMaterial} disabled={!newMaterial.trim()}>
                        추가
                      </Button>
                    </div>
                  </div>
                  {materials.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {material}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeMaterial(material)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="technique">기법</Label>
                    <Input
                      id="technique"
                      value={formData.technique}
                      onChange={(e) => handleInputChange('technique', e.target.value)}
                      placeholder="예: 수묵화, 채색화, 금박"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">작품 상태</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">최상</SelectItem>
                        <SelectItem value="good">양호</SelectItem>
                        <SelectItem value="fair">보통</SelectItem>
                        <SelectItem value="poor">불량</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 크기 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>크기 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">가로</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.width}
                        onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">세로</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.height}
                        onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depth">깊이 (선택)</Label>
                      <Input
                        id="depth"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.depth}
                        onChange={(e) => handleInputChange('dimensions.depth', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">단위</Label>
                      <Select value={formData.dimensions.unit} onValueChange={(value) => handleInputChange('dimensions.unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="mm">mm</SelectItem>
                          <SelectItem value="inch">inch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 가격 및 판매 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>가격 및 판매 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">가격</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price.amount}
                        onChange={(e) => handleInputChange('price.amount', e.target.value)}
                        placeholder="가격을 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">통화</Label>
                      <Select value={formData.price.currency} onValueChange={(value) => handleInputChange('price.currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KRW">KRW (원)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">판매 상태</Label>
                    <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">판매 가능</SelectItem>
                        <SelectItem value="sold">판매 완료</SelectItem>
                        <SelectItem value="reserved">예약됨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked as boolean)}
                    />
                    <Label htmlFor="featured">추천 작품으로 표시</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="authenticity_certificate"
                      checked={formData.authenticity_certificate}
                      onCheckedChange={(checked) => handleInputChange('authenticity_certificate', checked as boolean)}
                    />
                    <Label htmlFor="authenticity_certificate">인증서 보유</Label>
                  </div>
                </CardContent>
              </Card>

              {/* 태그 */}
              <Card>
                <CardHeader>
                  <CardTitle>태그</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>작품 태그</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="태그 추가"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                        추가
                      </Button>
                    </div>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              
              {/* 작품 이미지 */}
              <Card>
                <CardHeader>
                  <CardTitle>작품 이미지 *</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiImageUpload
                    value={images}
                    onChange={setImages}
                    onUpload={handleImageUpload}
                    disabled={loading}
                    maxSize={10}
                    maxFiles={5}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                    previewSize={150}
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
                        작품 등록
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handlePreview} disabled={loading}>
                    <Eye className="h-4 w-4 mr-2" />
                    미리보기
                  </Button>
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