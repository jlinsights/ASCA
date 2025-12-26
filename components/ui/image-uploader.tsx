'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedFormats?: string[]
  maxFileSize?: number // in MB
  existingImages?: string[]
}

export function ImageUploader({
  onFilesSelected,
  maxFiles = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10,
  existingImages = []
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `${file.name}: 지원하지 않는 파일 형식입니다.`
    }
    
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `${file.name}: 파일 크기가 ${maxFileSize}MB를 초과합니다.`
    }
    
    return null
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    setError(null)
    const fileArray = Array.from(files)
    
    if (images.length + fileArray.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    const newImages: ImageFile[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(validationError)
        return
      }

      const preview = URL.createObjectURL(file)
      newImages.push({
        file,
        preview,
        id: `${Date.now()}-${Math.random()}`
      })
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onFilesSelected(updatedImages.map(img => img.file))
    }
  }, [images, maxFiles, onFilesSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemove = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    setImages(updatedImages)
    onFilesSelected(updatedImages.map(img => img.file))
    
    // Clean up object URL
    const removedImage = images.find(img => img.id === id)
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
          isDragging
            ? 'border-celadon-green bg-celadon-green/10'
            : 'border-stone-gray/30 hover:border-celadon-green/50 bg-rice-paper dark:bg-card'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center text-center"
        >
          <div className="mb-4 p-4 rounded-full bg-celadon-green/10">
            <Upload className="w-8 h-8 text-celadon-green" />
          </div>
          
          <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
            이미지 업로드
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            이미지를 드래그하거나 클릭하여 선택하세요
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-stone-gray/10 rounded">
              JPG, PNG, WEBP
            </span>
            <span className="px-2 py-1 bg-stone-gray/10 rounded">
              최대 {maxFileSize}MB
            </span>
            <span className="px-2 py-1 bg-stone-gray/10 rounded">
              최대 {maxFiles}개
            </span>
          </div>
        </label>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-scholar-red/10 border border-scholar-red/20 rounded-lg">
          <p className="text-sm text-scholar-red whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-celadon-green/20 hover:border-celadon-green/50 transition-all"
            >
              <Image
                src={image.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* 메인 이미지 표시 */}
              {index === 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-temple-gold text-ink-black text-xs font-semibold rounded">
                    대표 이미지
                  </span>
                </div>
              )}
              
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-scholar-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-scholar-red/90"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/10 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* 기존 이미지 (수정 모드) */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">기존 이미지</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-stone-gray/20"
              >
                <Image
                  src={url}
                  alt={`Existing ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                 <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-temple-gold text-ink-black text-xs font-semibold rounded">
                      대표 이미지
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="p-4 bg-celadon-green/5 border border-celadon-green/10 rounded-lg">
        <div className="flex items-start gap-3">
          <FileImage className="w-5 h-5 text-celadon-green mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>• 첫 번째 이미지가 대표 이미지로 설정됩니다</p>
            <p>• 고해상도 이미지를 권장합니다 (최소 1200px 이상)</p>
            <p>• 작품의 전체적인 모습이 잘 보이도록 촬영해주세요</p>
          </div>
        </div>
      </div>
    </div>
  )
}
