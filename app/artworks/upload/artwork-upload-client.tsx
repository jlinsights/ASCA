'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { createArtwork } from '@/lib/api/artworks'
import type { ArtworkCategory, ArtworkStatus } from '@/lib/types/artwork-legacy'
import { error as logError } from '@/lib/logging'
import type { ArtworkFormData } from './_components/types'
import { ArtworkBasicInfoSection } from './_components/ArtworkBasicInfoSection'
import { ArtworkDimensionsSection } from './_components/ArtworkDimensionsSection'
import { ArtworkSaleSection } from './_components/ArtworkSaleSection'
import { ArtworkExtraSection } from './_components/ArtworkExtraSection'
import { ArtworkPreviewDialog } from './_components/ArtworkPreviewDialog'

export function ArtworkUploadClient() {
  const router = useRouter()
  const { user: clerkUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: '' as ArtworkCategory,
    medium: '',
    width: '',
    height: '',
    depth: '',
    unit: 'cm',
    yearCreated: new Date().getFullYear(),
    isForSale: false,
    price: '',
    currency: 'KRW',
    tags: '',
    status: 'draft' as ArtworkStatus,
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
          unit: formData.unit,
        },
        yearCreated: formData.yearCreated,
        isForSale: formData.isForSale,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        status: formData.status,
      }

      // Create images object (simplified - in production, upload to storage first)
      const images = {
        main: {
          url: URL.createObjectURL(uploadedImages[0]!),
          alt: formData.title,
          width: 1200,
          height: 800,
        },
        additional: uploadedImages.slice(1).map(img => ({
          url: URL.createObjectURL(img),
          alt: formData.title,
          width: 1200,
          height: 800,
        })),
      }

      const { data, error } = await createArtwork(artworkData, images, clerkUser?.id ?? '')

      if (error) {
        alert('작품 등록에 실패했습니다.')
        logError('Artwork create failed', error instanceof Error ? error : undefined)
      } else {
        alert('작품이 성공적으로 등록되었습니다!')
        router.push('/artworks')
      }
    } catch (error) {
      alert('작품 등록 중 오류가 발생했습니다.')
      logError('Artwork upload error', error instanceof Error ? error : undefined)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    if (!formData.title || uploadedImages.length === 0) {
      alert('미리보기를 위해 최소한 제목과 이미지를 입력해주세요.')
      return
    }
    setPreviewOpen(true)
  }

  return (
    <div className='min-h-screen bg-transparent flex flex-col'>
      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              뒤로 가기
            </Button>

            <h1 className='text-4xl font-serif font-bold text-foreground mb-2'>작품 등록</h1>
            <p className='text-muted-foreground'>새로운 작품을 등록하고 포트폴리오를 확장하세요</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className='font-serif'>작품 이미지</CardTitle>
                <CardDescription>
                  작품의 이미지를 업로드하세요. 첫 번째 이미지가 대표 이미지로 설정됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader onFilesSelected={setUploadedImages} maxFiles={10} maxFileSize={10} />
              </CardContent>
            </Card>

            <ArtworkBasicInfoSection formData={formData} setFormData={setFormData} />
            <ArtworkDimensionsSection formData={formData} setFormData={setFormData} />
            <ArtworkSaleSection formData={formData} setFormData={setFormData} />
            <ArtworkExtraSection formData={formData} setFormData={setFormData} />

            {/* Actions */}
            <div className='flex gap-4 justify-end'>
              <Button type='button' variant='outline' onClick={handlePreview} disabled={loading}>
                <Eye className='w-4 h-4 mr-2' />
                미리보기
              </Button>
              <Button
                type='submit'
                className='bg-celadon-green hover:bg-celadon-green/90 text-ink-black'
                disabled={loading}
              >
                <Save className='w-4 h-4 mr-2' />
                {loading ? '등록 중...' : '작품 등록'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <LayoutFooter />

      <ArtworkPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formData={formData}
        uploadedImages={uploadedImages}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
