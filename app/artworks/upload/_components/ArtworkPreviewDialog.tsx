import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ARTWORK_CATEGORY_LABELS } from '@/lib/types/artwork-legacy'
import type { ArtworkFormData } from './types'

interface ArtworkPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: ArtworkFormData
  uploadedImages: File[]
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function ArtworkPreviewDialog({
  open,
  onOpenChange,
  formData,
  uploadedImages,
  onSubmit,
}: ArtworkPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='font-serif text-2xl'>작품 미리보기</DialogTitle>
          <DialogDescription>등록될 작품의 미리보기 화면입니다.</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Image Preview */}
          <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-secondary/10'>
            {uploadedImages.length > 0 && uploadedImages[0] ? (
              <Image
                src={URL.createObjectURL(uploadedImages[0])}
                alt={formData.title}
                fill
                className='object-contain'
                unoptimized
              />
            ) : (
              <div className='flex h-full items-center justify-center text-muted-foreground'>
                이미지가 없습니다
              </div>
            )}
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <h3 className='text-xl font-bold mb-2'>{formData.title || '제목 없음'}</h3>
              <p className='text-sm text-muted-foreground mb-4'>{formData.titleEn}</p>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between border-b pb-1'>
                  <span className='text-muted-foreground'>카테고리</span>
                  <span>
                    {formData.category ? ARTWORK_CATEGORY_LABELS[formData.category].ko : '-'}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-1'>
                  <span className='text-muted-foreground'>재료/기법</span>
                  <span>{formData.medium || '-'}</span>
                </div>
                <div className='flex justify-between border-b pb-1'>
                  <span className='text-muted-foreground'>크기</span>
                  <span>
                    {formData.height} x {formData.width}{' '}
                    {formData.depth ? `x ${formData.depth}` : ''} {formData.unit}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-1'>
                  <span className='text-muted-foreground'>제작연도</span>
                  <span>{formData.yearCreated}</span>
                </div>
                {formData.isForSale && (
                  <div className='flex justify-between border-b pb-1 font-semibold'>
                    <span className='text-muted-foreground'>가격</span>
                    <span>
                      {formData.price ? new Intl.NumberFormat().format(Number(formData.price)) : 0}{' '}
                      {formData.currency}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>작품 설명</h4>
              <p className='text-sm whitespace-pre-wrap text-muted-foreground min-h-[100px] p-3 bg-secondary/10 rounded-md'>
                {formData.description || '설명이 없습니다.'}
              </p>
              {formData.tags && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {formData.tags.split(',').map((tag, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      #{tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button
            onClick={onSubmit}
            className='bg-celadon-green hover:bg-celadon-green/90 text-white'
          >
            등록하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
