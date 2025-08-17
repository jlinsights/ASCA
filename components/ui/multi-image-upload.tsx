'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, ImageIcon, AlertCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  onUpload?: (files: File[]) => Promise<string[]>
  disabled?: boolean
  className?: string
  maxSize?: number // MB
  maxFiles?: number
  acceptedTypes?: string[]
  showPreview?: boolean
  previewSize?: number
}

export function MultiImageUpload({
  value = [],
  onChange,
  onUpload,
  disabled = false,
  className,
  maxSize = 5,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true,
  previewSize = 150
}: MultiImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 파일 검증 함수 (memoized)
  const validateFiles = useCallback((files: File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    // 최대 파일 수 검증
    if (value.length + files.length > maxFiles) {
      errors.push(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`)
      return { valid, errors }
    }

    files.forEach(file => {
      // 파일 크기 검증
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: 파일 크기가 ${maxSize}MB를 초과합니다.`)
        return
      }

      // 파일 형식 검증
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`)
        return
      }

      valid.push(file)
    })

    return { valid, errors }
  }, [value.length, maxFiles, maxSize, acceptedTypes])

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (files: File[]) => {
    const { valid, errors } = validateFiles(files)
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: "파일 업로드 실패",
          description: error,
          variant: "destructive",
        })
      })
    }

    if (valid.length === 0) return

    if (!onUpload) {
      toast({
        title: "업로드 실패",
        description: "업로드 함수가 정의되지 않았습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const urls = await onUpload(valid)
      onChange([...value, ...urls])
      toast({
        title: "이미지 업로드 완료",
        description: `${urls.length}개의 이미지가 성공적으로 업로드되었습니다.`,
      })
    } catch (error) {
      
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [onUpload, onChange, value, validateFiles])

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileUpload(Array.from(files))
    }
  }

  // 드래그 앤 드롭 처리
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || loading) return

    const files = e.dataTransfer.files
    if (files) {
      handleFileUpload(Array.from(files))
    }
  }, [disabled, loading, handleFileUpload])

  // 이미지 제거
  const handleRemove = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove)
    onChange(newUrls)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const canAddMore = value.length < maxFiles

  return (
    <div className={cn("space-y-4", className)}>
      {/* 업로드된 이미지 미리보기 */}
      {value.length > 0 && showPreview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`업로드된 이미지 ${index + 1}`}
                width={previewSize}
                height={previewSize}
                className="w-full aspect-square object-cover rounded-lg border"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {canAddMore && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-muted-foreground/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {loading ? (
              <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin" />
            ) : dragActive ? (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm font-medium text-primary">
                  파일을 여기에 놓으세요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {loading ? '업로드 중...' : '클릭하거나 드래그하여 이미지 업로드'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} (최대 {maxSize}MB, {maxFiles}개)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    현재 {value.length}/{maxFiles}개 업로드됨
                  </p>
                </div>
              </div>
            )}
            
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    이미지 추가
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 숨겨진 파일 입력 */}
          <Input
            ref={inputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || loading}
            multiple
          />
        </div>
      )}

      {/* 도움말 텍스트 */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div>
          <p>• 권장 크기: 최소 800x600px</p>
          <p>• 첫 번째 이미지가 대표 이미지로 사용됩니다</p>
          <p>• 최대 {maxFiles}개까지 업로드 가능</p>
          <p>• 각 파일 최대 크기: {maxSize}MB</p>
        </div>
      </div>
    </div>
  )
} 