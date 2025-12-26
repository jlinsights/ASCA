'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/ui/image-uploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { createArtwork } from '@/lib/api/artworks'
import type { ArtworkCategory, ArtworkStatus } from '@/types/artwork'
import { ARTWORK_CATEGORY_LABELS } from '@/types/artwork'

export function ArtworkUploadClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: '' as ArtworkCategory,
    medium: '',
    width: '',
    height: '',
    depth: '',
    unit: 'cm' as 'cm' | 'mm' | 'inch',
    yearCreated: new Date().getFullYear(),
    isForSale: false,
    price: '',
    currency: 'KRW',
    tags: '',
    status: 'draft' as ArtworkStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadedImages.length === 0) {
      alert('최소 1개의 이미지를 업로드해주세요.')
      return
    }

    if (!formData.title || !formData.description || !formData.category || !formData.medium) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      // Prepare artwork data
      const artworkData = {
        title: formData.title,
        titleEn: formData.titleEn || undefined,
        description: formData.description,
        descriptionEn: formData.descriptionEn || undefined,
        category: formData.category,
        medium: formData.medium,
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          depth: formData.depth ? parseFloat(formData.depth) : undefined,
          unit: formData.unit
        },
        yearCreated: formData.yearCreated,
        isForSale: formData.isForSale,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: formData.status
      }

      // Create images object (simplified - in production, upload to storage first)
      const images = {
        main: {
          url: URL.createObjectURL(uploadedImages[0]!),
          alt: formData.title,
          width: 1200,
          height: 800
        },
        additional: uploadedImages.slice(1).map(img => ({
          url: URL.createObjectURL(img),
          alt: formData.title,
          width: 1200,
          height: 800
        }))
      }

      const { data, error } = await createArtwork(artworkData, images)

      if (error) {
        alert('작품 등록에 실패했습니다.')
        console.error(error)
      } else {
        alert('작품이 성공적으로 등록되었습니다!')
        router.push('/artworks')
      }
    } catch (error) {
      alert('작품 등록 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    alert('미리보기 기능은 곧 추가될 예정입니다.')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
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
              작품 등록
            </h1>
            <p className="text-muted-foreground">
              새로운 작품을 등록하고 포트폴리오를 확장하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">작품 이미지</CardTitle>
                <CardDescription>
                  작품의 이미지를 업로드하세요. 첫 번째 이미지가 대표 이미지로 설정됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onFilesSelected={setUploadedImages}
                  maxFiles={10}
                  maxFileSize={10}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">작품명 (한글) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="예: 춘하추동"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">작품명 (영문)</Label>
                    <Input
                      id="titleEn"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="예: Four Seasons"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">작품 설명 (한글) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="작품에 대한 설명을 입력하세요"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">작품 설명 (영문)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Artwork description in English"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Category and Medium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ArtworkCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ARTWORK_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label.ko}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">재료/기법 *</Label>
                    <Input
                      id="medium"
                      value={formData.medium}
                      onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                      placeholder="예: 한지에 먹"
                      required
                    />
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">제작연도 *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.yearCreated}
                    onChange={(e) => setFormData({ ...formData, yearCreated: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">크기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">가로 *</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">세로 *</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth">두께</Label>
                    <Input
                      id="depth"
                      type="number"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">단위</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value as any })}
                    >
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

            {/* Price */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">판매 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isForSale"
                    checked={formData.isForSale}
                    onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isForSale">판매 가능</Label>
                </div>

                {formData.isForSale && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">가격</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">통화</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
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
                )}
              </CardContent>
            </Card>

            {/* Tags and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">추가 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">태그</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="태그를 쉼표로 구분하여 입력하세요"
                  />
                  <p className="text-xs text-muted-foreground">
                    예: 서예, 전통, 현대적
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">공개 상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ArtworkStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">임시저장</SelectItem>
                      <SelectItem value="published">공개</SelectItem>
                      <SelectItem value="archived">보관</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={loading}
              >
                <Eye className="w-4 h-4 mr-2" />
                미리보기
              </Button>
              <Button
                type="submit"
                className="bg-celadon-green hover:bg-celadon-green/90 text-ink-black"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? '등록 중...' : '작품 등록'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
