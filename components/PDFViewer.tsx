'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  Maximize,
  Minimize,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface PDFViewerProps {
  fileUrl: string
  className?: string
}

export function PDFViewer({ fileUrl, className = '' }: PDFViewerProps) {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  const handleError = useCallback(() => {
    setError('Failed to load PDF')
    setIsLoading(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  const openInNewTab = useCallback(() => {
    window.open(fileUrl, '_blank')
  }, [fileUrl])

  const downloadFile = useCallback(() => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileUrl.split('/').pop() || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [fileUrl])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {language === 'ko' ? 'PDF 로드 실패' : 'Failed to load PDF'}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {language === 'ko' 
            ? 'PDF 파일을 불러올 수 없습니다. 브라우저에서 직접 열어보세요.'
            : 'Unable to load PDF file. Try opening it directly in your browser.'
          }
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            {language === 'ko' ? '새 탭에서 열기' : 'Open in New Tab'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download className="h-4 w-4 mr-2" />
            {language === 'ko' ? '다운로드' : 'Download'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-background border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className}`}>
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        {/* 왼쪽 정보 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            PDF {language === 'ko' ? '문서' : 'Document'}
          </Badge>
          {isLoading && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {language === 'ko' ? '로딩 중' : 'Loading'}
            </Badge>
          )}
        </div>

        {/* 오른쪽 컨트롤 */}
        <div className="flex items-center gap-2">
          {/* 새 탭에서 열기 */}
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            title={language === 'ko' ? '새 탭에서 열기' : 'Open in new tab'}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          {/* 전체화면 */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={language === 'ko' ? '전체화면' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>

          {/* 다운로드 */}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadFile}
            title={language === 'ko' ? '다운로드' : 'Download'}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF 뷰어 영역 */}
      <div className="relative bg-gray-100 dark:bg-gray-900" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '500px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-celadon" />
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? 'PDF 로딩 중...' : 'Loading PDF...'}
              </p>
            </div>
          </div>
        )}

        <iframe
          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
          className="w-full h-full border-0"
          title="PDF Viewer"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            background: 'white'
          }}
        />
      </div>

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            {language === 'ko' ? 'PDF 뷰어' : 'PDF Viewer'}
          </span>
          <span>
            {language === 'ko' ? '브라우저 내장 뷰어 사용' : 'Using browser built-in viewer'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {language === 'ko' 
              ? '더 많은 기능을 위해 새 탭에서 열어보세요'
              : 'Open in new tab for more features'
            }
          </span>
        </div>
      </div>
    </div>
  )
} 