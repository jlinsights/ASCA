'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  onUpload?: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
  maxSize?: number // MB
  acceptedTypes?: string[]
  showPreview?: boolean
  previewSize?: number
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true,
  previewSize = 200
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 파일 검증 함수
  const validateFile = (file: File): string | null => {
    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      return `파일 크기가 ${maxSize}MB를 초과합니다.`
    }

    // 파일 형식 검증
    if (!acceptedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${acceptedTypes.map(type => type.split('/')[1]).join(', ')}만 지원)`
    }

    return null
  }

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast({
        title: "파일 업로드 실패",
        description: validationError,
        variant: "destructive",
      })
      return
    }

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
      const url = await onUpload(file)
      onChange(url)
      toast({
        title: "이미지 업로드 완료",
        description: "프로필 이미지가 성공적으로 업로드되었습니다.",
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
  }, [onUpload, onChange, validateFile])

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
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
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }, [disabled, loading, handleFileUpload])

  // 이미지 제거
  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 업로드 영역 */}
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
        {value && showPreview ? (
          // 이미지 미리보기
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={value}
                alt="업로드된 이미지"
                width={previewSize}
                height={previewSize}
                className="mx-auto rounded-lg object-cover border"
                style={{ width: previewSize, height: previewSize }}
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={loading}
              >
                이미지 변경
              </Button>
            )}
          </div>
        ) : (
          // 업로드 인터페이스
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
                    {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} (최대 {maxSize}MB)
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
                    <Upload className="h-4 w-4 mr-2" />
                    이미지 선택
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <Input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading}
        />
      </div>

      {/* 도움말 텍스트 */}
      {!value && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <p>• 권장 크기: 정사각형 (1:1 비율)</p>
            <p>• 최소 해상도: 400x400px</p>
            <p>• 최대 파일 크기: {maxSize}MB</p>
          </div>
        </div>
      )}
    </div>
  )
} 