'use client'

import { useState, useCallback, useRef } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  X,
  Plus,
  Folder,
  BookOpen,
  ClipboardList,
  Scale
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { PDFViewer } from '@/components/PDFViewer'
import UnsplashImagePicker from '@/components/UnsplashImagePicker'
import type { UnsplashImage } from '@/lib/unsplash'

// 파일 카테고리 정의 (Supabase 스키마와 일치)
const fileCategories = [
  { 
    value: 'all', 
    label: { ko: '전체', en: 'All' },
    icon: Folder,
    description: { ko: '모든 파일', en: 'All files' }
  },
  { 
    value: 'document', 
    label: { ko: '문서', en: 'Document' },
    icon: FileText,
    description: { ko: '일반 문서 파일', en: 'General document files' }
  },
  { 
    value: 'form', 
    label: { ko: '양식', en: 'Form' },
    icon: ClipboardList,
    description: { ko: '신청서 및 양식', en: 'Application forms and templates' }
  },
  { 
    value: 'rule', 
    label: { ko: '회칙', en: 'Rules' },
    icon: Scale,
    description: { ko: '회칙 및 규정', en: 'Rules and regulations' }
  },
  { 
    value: 'notice', 
    label: { ko: '공지', en: 'Notice' },
    icon: AlertCircle,
    description: { ko: '공지사항 관련 파일', en: 'Notice-related files' }
  },
  { 
    value: 'other', 
    label: { ko: '기타', en: 'Other' },
    icon: File,
    description: { ko: '기타 파일', en: 'Other files' }
  }
]

// 파일 형식 정의
const fileFormats = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: 'pdf', label: { ko: 'PDF', en: 'PDF' } },
  { value: 'doc', label: { ko: 'DOC', en: 'DOC' } },
  { value: 'docx', label: { ko: 'DOCX', en: 'DOCX' } },
  { value: 'hwp', label: { ko: 'HWP', en: 'HWP' } },
  { value: 'xlsx', label: { ko: 'XLSX', en: 'XLSX' } },
  { value: 'pptx', label: { ko: 'PPTX', en: 'PPTX' } },
  { value: 'zip', label: { ko: 'ZIP', en: 'ZIP' } }
]

// 임시 파일 데이터 (실제로는 Supabase에서 가져옴)
const mockFiles = [
  {
    id: '1',
    title: '회원가입 신청서',
    title_en: 'Membership Application Form',
    filename: 'membership_application_form.pdf',
    file_format: 'pdf',
    file_size: 2048576,
    category: 'form',
    description: '신규 회원가입을 위한 신청서 양식입니다.',
    description_en: 'Application form for new membership registration.',
    file_url: '/documents/membership-form.pdf',
    download_count: 142,
    is_public: true,
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    title: '동양서예협회 회칙',
    title_en: 'ASCA Constitution',
    filename: 'asca_constitution.pdf',
    file_format: 'pdf',
    file_size: 5242880,
    category: 'rule',
    description: '사단법인 동양서예협회의 정관 및 회칙입니다.',
    description_en: 'Constitution and bylaws of the Asian Society of Calligraphic Arts.',
    file_url: '/documents/constitution.pdf',
    download_count: 89,
    is_public: true,
    created_at: '2024-03-14T15:45:00Z',
    updated_at: '2024-03-14T15:45:00Z'
  },
  {
    id: '3',
    title: '전시회 참가신청서',
    title_en: 'Exhibition Participation Form',
    filename: 'exhibition_participation_form.docx',
    file_format: 'docx',
    file_size: 1572864,
    category: 'form',
    description: '전시회 참가를 위한 신청서 양식입니다.',
    description_en: 'Application form for exhibition participation.',
    file_url: '/documents/exhibition-form.docx',
    download_count: 67,
    is_public: true,
    created_at: '2024-03-13T09:20:00Z',
    updated_at: '2024-03-13T09:20:00Z'
  },
  {
    id: '4',
    title: '2024년 사업계획서',
    title_en: '2024 Business Plan',
    filename: '2024_business_plan.pdf',
    file_format: 'pdf',
    file_size: 3145728,
    category: 'document',
    description: '2024년도 주요 사업 계획 및 예산안입니다.',
    description_en: '2024 major business plans and budget proposal.',
    file_url: '/documents/business-plan-2024.pdf',
    download_count: 156,
    is_public: false,
    created_at: '2024-03-12T14:15:00Z',
    updated_at: '2024-03-12T14:15:00Z'
  },
  {
    id: '5',
    title: '서예 심사 기준',
    title_en: 'Calligraphy Judging Criteria',
    filename: 'judging_criteria.pdf',
    file_format: 'pdf',
    file_size: 1048576,
    category: 'rule',
    description: '서예 작품 심사를 위한 평가 기준 및 규정입니다.',
    description_en: 'Evaluation criteria and regulations for calligraphy work judging.',
    file_url: '/documents/judging-criteria.pdf',
    download_count: 234,
    is_public: true,
    created_at: '2024-03-11T11:30:00Z',
    updated_at: '2024-03-11T11:30:00Z'
  },
  {
    id: '6',
    title: '공지사항 템플릿',
    title_en: 'Notice Template',
    filename: 'notice_template.hwp',
    file_format: 'hwp',
    file_size: 524288,
    category: 'notice',
    description: '공지사항 작성을 위한 표준 템플릿입니다.',
    description_en: 'Standard template for writing notices.',
    file_url: '/documents/notice-template.hwp',
    download_count: 78,
    is_public: false,
    created_at: '2024-03-10T16:45:00Z',
    updated_at: '2024-03-10T16:45:00Z'
  }
]

export default function FilesPage() {
  const { language } = useLanguage()
  const [files, setFiles] = useState(mockFiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<typeof mockFiles[0] | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 처리
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }, [])

  // Unsplash 이미지 선택 처리
  const handleUnsplashImageSelect = useCallback((file: File, imageData: UnsplashImage) => {
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
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newFiles = uploadedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        title: file.name.split('.')[0],
        title_en: file.name.split('.')[0],
        filename: file.name,
        file_format: file.name.split('.').pop()?.toLowerCase() || 'other',
        file_size: file.size,
        category: 'other',
        description: '',
        description_en: '',
        file_url: URL.createObjectURL(file),
        download_count: 0,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      setFiles(prev => [...newFiles, ...prev])
      setUploadedFiles([])
      setShowUploadDialog(false)
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
    const title = language === 'ko' ? file.title : file.title_en
    const description = language === 'ko' ? file.description : file.description_en
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    const matchesFormat = selectedFormat === 'all' || file.file_format === selectedFormat
    
    return matchesSearch && matchesCategory && matchesFormat
  })

  // 카테고리별 파일 수 계산
  const getCategoryCount = (category: string) => {
    if (category === 'all') return files.length
    return files.filter(file => file.category === category).length
  }

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

  // 파일 형식 아이콘
  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'hwp':
        return <FileText className="h-5 w-5 text-orange-500" />
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-600" />
      case 'zip':
        return <FolderOpen className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <AdminLayout currentPage="files">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'ko' ? '파일 관리' : 'File Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ko' 
              ? '문서, 양식, 회칙 등의 파일을 관리하세요.' 
              : 'Manage documents, forms, rules and other files.'
            }
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {language === 'ko' ? '새 파일' : 'New File'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {language === 'ko' ? '파일 업로드' : 'Upload Files'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'ko' ? '파일을 업로드하세요' : 'Upload your files'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ko' 
                      ? 'PDF, DOC, DOCX, HWP, XLSX, PPTX, ZIP 파일을 지원합니다.' 
                      : 'Supports PDF, DOC, DOCX, HWP, XLSX, PPTX, ZIP files.'
                    }
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.hwp,.xlsx,.pptx,.zip"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    {language === 'ko' ? '파일 선택' : 'Choose Files'}
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {language === 'ko' ? '업로드할 파일' : 'Files to Upload'}
                  </h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.name.split('.').pop() || '')}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setUploadedFiles([])}>
                      {language === 'ko' ? '취소' : 'Cancel'}
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'ko' ? '업로드 중...' : 'Uploading...'}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {language === 'ko' ? '업로드' : 'Upload'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 카테고리 탭 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          {fileCategories.map((category) => {
            const Icon = category.icon
            const count = getCategoryCount(category.value)
            return (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === 'ko' ? category.label.ko : category.label.en}
                </span>
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* 필터 및 검색 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ko' ? '파일명 또는 내용으로 검색...' : 'Search by filename or content...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={language === 'ko' ? '파일 형식' : 'File Format'} />
            </SelectTrigger>
            <SelectContent>
              {fileFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {language === 'ko' ? format.label.ko : format.label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 파일 목록 */}
        {fileCategories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>
                        {language === 'ko' ? category.label.ko : category.label.en}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === 'ko' ? category.description.ko : category.description.en}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {filteredFiles.length} {language === 'ko' ? '개 파일' : 'files'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '파일이 없습니다.' : 'No files found.'}
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              {getFileIcon(file.file_format)}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">
                                  {language === 'ko' ? file.title : file.title_en}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {file.filename}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {file.is_public ? (
                                <Badge variant="outline" className="text-xs">
                                  {language === 'ko' ? '공개' : 'Public'}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {language === 'ko' ? '비공개' : 'Private'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {language === 'ko' ? file.description : file.description_en}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Download className="h-3 w-3" />
                              {file.download_count}
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {getFileIcon(file.file_format)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {language === 'ko' ? file.title : file.title_en}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.filename}</span>
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>{formatDate(file.created_at)}</span>
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {file.download_count}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.is_public ? (
                              <Badge variant="outline" className="text-xs">
                                {language === 'ko' ? '공개' : 'Public'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {language === 'ko' ? '비공개' : 'Private'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 파일 상세 보기 다이얼로그 */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'ko' ? selectedFile.title : selectedFile.title_en}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">
                    {language === 'ko' ? '파일 정보' : 'File Information'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '파일명' : 'Filename'}:
                      </span>
                      <span>{selectedFile.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '크기' : 'Size'}:
                      </span>
                      <span>{formatFileSize(selectedFile.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '형식' : 'Format'}:
                      </span>
                      <span>{selectedFile.file_format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '다운로드' : 'Downloads'}:
                      </span>
                      <span>{selectedFile.download_count}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    {language === 'ko' ? '설명' : 'Description'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ko' ? selectedFile.description : selectedFile.description_en}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  {language === 'ko' ? '미리보기' : 'Preview'}
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'ko' ? '다운로드' : 'Download'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
} 