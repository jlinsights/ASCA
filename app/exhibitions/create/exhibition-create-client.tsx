'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUploader } from '@/components/ui/image-uploader'
import { ArtworkSelector } from '@/components/exhibition/artwork-selector'
import { getSupabaseClient } from '@/lib/supabase'
import { fetchArtworksByArtist } from '@/lib/api/artworks'
import { createExhibition } from '@/lib/api/exhibitions'
import type { Artwork } from '@/types/artwork'
import type { ExhibitionFormData } from '@/types/exhibition'

interface SelectedArtwork extends Artwork {
  displayOrder: number
  isFeatured: boolean
}

export function ExhibitionCreateClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtworks, setSelectedArtworks] = useState<SelectedArtwork[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    curator: '',
    isFeatured: false,
  })

  // Load user's artworks
  useEffect(() => {
    const loadArtworks = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await fetchArtworksByArtist(user.id)
      if (data) {
        setArtworks(data)
      }
    }

    loadArtworks()
  }, [router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('종료일은 시작일 이후여야 합니다.')
      return
    }

    setLoading(true)

    try {
      // TODO: Upload images to Supabase Storage
      // For now, using placeholder URLs
      const featuredImageUrl = featuredImage ? '/placeholder/exhibition-main.jpg' : undefined
      const galleryImageUrls = galleryImages.map((_, i) => `/placeholder/gallery-${i}.jpg`)

      const exhibitionData: ExhibitionFormData = {
        ...formData,
        featuredImage: featuredImageUrl,
        galleryImages: galleryImageUrls,
        artworkIds: selectedArtworks.map((a) => a.id),
      }

      const { data, error } = await createExhibition(exhibitionData)

      if (error) {
        console.error('Exhibition creation error:', error)
        alert('전시 생성 중 오류가 발생했습니다.')
        return
      }

      alert('전시가 성공적으로 생성되었습니다!')
      router.push(`/exhibitions/${data?.id}`)
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              새 전시 만들기
            </h1>
            <p className="text-muted-foreground">
              작품을 선택하고 전시 정보를 입력하여 새로운 전시를 생성하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="required">
                    전시 제목 *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="예: 2024 동양서예 특별전"
                    required
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">부제목</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="예: 전통과 현대의 만남"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="required">
                    전시 설명 *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="전시의 주제, 의미, 특징 등을 설명해주세요..."
                    rows={4}
                    required
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="required">
                      시작일 *
                    </Label>
                    <div className="relative">
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="required">
                      종료일 *
                    </Label>
                    <div className="relative">
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Location & Venue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">장소 (도시/지역)</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="예: 서울"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">전시장</Label>
                    <Input
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="예: 세종문화회관"
                    />
                  </div>
                </div>

                {/* Curator */}
                <div className="space-y-2">
                  <Label htmlFor="curator">큐레이터</Label>
                  <Input
                    id="curator"
                    name="curator"
                    value={formData.curator}
                    onChange={handleInputChange}
                    placeholder="큐레이터 이름"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">대표 이미지</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  maxFiles={1}
                  onFilesSelected={(files) => setFeaturedImage(files[0] || null)}
                  acceptedFormats={['JPG', 'PNG', 'WEBP']}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  전시의 대표 이미지를 업로드하세요 (권장 비율: 16:9)
                </p>
              </CardContent>
            </Card>

            {/* Artworks Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">전시 작품 선택</CardTitle>
              </CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-dashed border-celadon-green/30 rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      등록된 작품이 없습니다.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/artworks/upload')}
                    >
                      작품 등록하기
                    </Button>
                  </div>
                ) : (
                  <ArtworkSelector
                    artworks={artworks}
                    selectedArtworks={selectedArtworks}
                    onSelectionChange={setSelectedArtworks}
                    allowFeatured={true}
                  />
                )}
              </CardContent>
            </Card>

            {/* Gallery Images */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">갤러리 이미지</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  maxFiles={10}
                  onFilesSelected={setGalleryImages}
                  acceptedFormats={['JPG', 'PNG', 'WEBP']}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  전시 공간 또는 추가 이미지를 업로드하세요 (최대 10개)
                </p>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-celadon-green hover:bg-celadon-green/90"
                disabled={loading}
              >
                {loading ? '생성 중...' : '전시 생성'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
