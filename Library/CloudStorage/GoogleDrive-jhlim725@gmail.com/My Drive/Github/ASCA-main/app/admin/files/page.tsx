'use client'

import { useState, useCallback, useRef } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { useDropzone } from 'react-dropzone' // 제거됨
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Copy,
  Share2,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { PDFViewer } from '@/components/PDFViewer'
import UnsplashImagePicker from '@/components/UnsplashImagePicker'
import type { UnsplashImage } from '@/lib/unsplash'

// 임시 파일 데이터
const mockFiles = [
  {
    id: '1',
    name: 'exhibition-poster-2024.jpg',
    type: 'image',
    size: 2048576,
    uploadedAt: '2024-03-15T10:30:00Z',
    url: '/images/news/news-001.jpg',
    category: 'exhibition',
    tags: ['poster', '2024', 'exhibition']
  },
  {
    id: '2',
    name: 'artist-portfolio.pdf',
    type: 'pdf',
    size: 5242880,
    uploadedAt: '2024-03-14T15:45:00Z',
    url: '/documents/sample.pdf',
    category: 'artist',
    tags: ['portfolio', 'artist', 'document']
  },
  {
    id: '3',
    name: 'calligraphy-guide.pdf',
    type: 'pdf',
    size: 3145728,
    uploadedAt: '2024-03-13T09:20:00Z',
    url: '/documents/guide.pdf',
    category: 'education',
    tags: ['guide', 'calligraphy', 'education']
  },
  {
    id: '4',
    name: 'award-ceremony.jpg',
    type: 'image',
    size: 1572864,
    uploadedAt: '2024-03-12T14:15:00Z',
    url: '/images/news/news-002.jpg',
    category: 'event',
    tags: ['award', 'ceremony', 'event']
  }
]

const categories = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: 'exhibition', label: { ko: '전시', en: 'Exhibition' } },
  { value: 'artist', label: { ko: '작가', en: 'Artist' } },
  { value: 'artwork', label: { ko: '작품', en: 'Artwork' } },
  { value: 'event', label: { ko: '행사', en: 'Event' } },
  { value: 'education', label: { ko: '교육', en: 'Education' } },
  { value: 'news', label: { ko: '뉴스', en: 'News' } }
]

export default function FilesPage() {
  const { language } = useLanguage()
  const [files, setFiles] = useState(mockFiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFileType, setSelectedFileType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<typeof mockFiles[0] | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 처리
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }, [])

  // Unsplash 이미지 선택 처리
  const handleUnsplashImageSelect = useCallback((file: File, imageData: UnsplashImage) => {
    // 파일에 Unsplash 메타데이터 추가
    const fileWithMetadata = Object.assign(file, {
      unsplashData: {
        id: imageData.id,
        author: imageData.user.name,
        authorUsername: imageData.user.username,
        description: imageData.alt_description || imageData.description,
        likes: imageData.likes,
        downloads: imageData.downloads
      }
    })
    setUploadedFiles(prev => [...prev, fileWithMetadata])
  }, [])

  // 파일 업로드 처리
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    try {
      // 실제로는 Supabase Storage나 다른 클라우드 스토리지에 업로드
      await new Promise(resolve => setTimeout(resolve, 2000)) // 시뮬레이션

      // 업로드된 파일들을 파일 목록에 추가
      const newFiles = uploadedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
        category: 'uncategorized',
        tags: []
      }))

      setFiles(prev => [...newFiles, ...prev])
      setUploadedFiles([])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 파일 삭제
  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // 파일 필터링
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    const matchesType = selectedFileType === 'all' || file.type === selectedFileType
    
    return matchesSearch && matchesCategory && matchesType
  })

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // 파일 타입 아이콘
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'ko' ? '파일 관리' : 'File Management'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ko' 
                ? '이미지와 PDF 파일을 업로드하고 관리하세요.'
                : 'Upload and manage images and PDF files.'
              }
            </p>
          </div>

          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="files">
                {language === 'ko' ? '파일 목록' : 'File List'}
              </TabsTrigger>
              <TabsTrigger value="upload">
                {language === 'ko' ? '파일 업로드' : 'Upload Files'}
              </TabsTrigger>
            </TabsList>

            {/* 파일 목록 탭 */}
            <TabsContent value="files" className="space-y-6">
              {/* 필터 및 검색 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* 검색 */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={language === 'ko' ? '파일명 또는 태그로 검색...' : 'Search by filename or tags...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* 카테고리 필터 */}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label[language as 'ko' | 'en']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* 파일 타입 필터 */}
                    <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {language === 'ko' ? '모든 타입' : 'All Types'}
                        </SelectItem>
                        <SelectItem value="image">
                          {language === 'ko' ? '이미지' : 'Images'}
                        </SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* 뷰 모드 토글 */}
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 파일 목록 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {language === 'ko' 
                      ? `총 ${filteredFiles.length}개의 파일`
                      : `${filteredFiles.length} files found`
                    }
                  </p>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          {/* 파일 미리보기 */}
                          <div className="relative aspect-square bg-muted overflow-hidden">
                            {file.type === 'image' ? (
                              <Image
                                src={file.url}
                                alt={file.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                                <FileText className="h-16 w-16 text-red-500" />
                              </div>
                            )}
                            
                            {/* 오버레이 액션 */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="secondary" onClick={() => setSelectedFile(file)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              <Button size="sm" variant="secondary">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleDelete(file.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* 파일 정보 */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm truncate flex-1 mr-2">
                                {file.name}
                              </h3>
                              {getFileIcon(file.type)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{formatDate(file.uploadedAt)}</span>
                              </div>
                              
                              <Badge variant="outline" className="text-xs">
                                {categories.find(c => c.value === file.category)?.label[language as 'ko' | 'en'] || file.category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {filteredFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{file.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>{formatDate(file.uploadedAt)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {categories.find(c => c.value === file.category)?.label[language as 'ko' | 'en'] || file.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedFile(file)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(file.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {language === 'ko' ? '파일이 없습니다' : 'No files found'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'ko' 
                        ? '검색 조건을 변경하거나 새 파일을 업로드하세요'
                        : 'Try changing your search criteria or upload new files'
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 파일 업로드 탭 */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ko' ? '파일 업로드' : 'Upload Files'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 파일 업로드 영역 */}
                  <div className="space-y-4">
                    {/* 로컬 파일 업로드 */}
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:border-celadon hover:bg-celadon/5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {language === 'ko' ? '파일을 클릭하여 업로드' : 'Click to upload files'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ko' 
                          ? '이미지 (JPG, PNG, GIF, WebP) 및 PDF 파일 지원 (최대 10MB)'
                          : 'Supports images (JPG, PNG, GIF, WebP) and PDF files (max 10MB)'
                        }
                      </p>
                    </div>

                    {/* 구분선 */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {language === 'ko' ? '또는' : 'OR'}
                        </span>
                      </div>
                    </div>

                    {/* Unsplash 이미지 선택 */}
                    <UnsplashImagePicker onImageSelect={handleUnsplashImageSelect} />
                  </div>

                  {/* 업로드 대기 파일 목록 */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        {language === 'ko' ? '업로드 대기 파일' : 'Files Ready to Upload'}
                      </h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => {
                          const isUnsplashImage = (file as any).unsplashData
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <FileText className="h-5 w-5 text-red-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                    {isUnsplashImage && (
                                      <Badge variant="secondary" className="text-xs">
                                        Unsplash
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatFileSize(file.size)}</span>
                                    {isUnsplashImage && (
                                      <>
                                        <span>•</span>
                                        <span>by {(file as any).unsplashData.author}</span>
                                        <span>•</span>
                                        <span>❤️ {(file as any).unsplashData.likes}</span>
                                      </>
                                    )}
                                  </div>
                                  {isUnsplashImage && (file as any).unsplashData.description && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      {(file as any).unsplashData.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpload} 
                          disabled={isUploading}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              {language === 'ko' ? '업로드 중...' : 'Uploading...'}
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {language === 'ko' ? '업로드 시작' : 'Start Upload'}
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setUploadedFiles([])}
                          disabled={isUploading}
                        >
                          {language === 'ko' ? '모두 제거' : 'Clear All'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 파일 미리보기 모달 */}
          <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              {selectedFile && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getFileIcon(selectedFile.type)}
                      {selectedFile.name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* 파일 정보 */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-4">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>{formatDate(selectedFile.uploadedAt)}</span>
                      <Badge variant="outline">
                        {categories.find(c => c.value === selectedFile.category)?.label[language as 'ko' | 'en'] || selectedFile.category}
                      </Badge>
                    </div>
                    
                    {/* 파일 미리보기 */}
                    <div className="max-h-[60vh] overflow-auto">
                      {selectedFile.type === 'image' ? (
                        <div className="relative w-full">
                          <Image
                            src={selectedFile.url}
                            alt={selectedFile.name}
                            width={800}
                            height={600}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      ) : selectedFile.type === 'pdf' ? (
                        <PDFViewer fileUrl={selectedFile.url} />
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                          <div className="text-center">
                            <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              {language === 'ko' ? '미리보기를 사용할 수 없습니다' : 'Preview not available'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        {language === 'ko' ? '다운로드' : 'Download'}
                      </Button>
                      <Button variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        {language === 'ko' ? 'URL 복사' : 'Copy URL'}
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        {language === 'ko' ? '공유' : 'Share'}
                      </Button>
                      <Button variant="destructive" onClick={() => {
                        handleDelete(selectedFile.id)
                        setSelectedFile(null)
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === 'ko' ? '삭제' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>

        <Footer />
      </div>
    </AdminProtectedRoute>
  )
} 