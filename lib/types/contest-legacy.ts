// 공모전 시스템 타입 정의
export interface Contest {
  id: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: ContestCategory[]
  theme?: string
  organizer: string
  sponsors?: string[]
  
  // 일정 관리
  timeline: {
    registrationStart: Date
    registrationEnd: Date
    submissionStart: Date
    submissionEnd: Date
    judgingStart: Date
    judgingEnd: Date
    resultAnnouncement: Date
    exhibitionStart: Date
    exhibitionEnd: Date
  }
  
  // 참가비 및 수수료
  fees: {
    domestic: number      // 국내 참가비
    international: number // 해외 참가비
    student: number      // 학생 할인
    group: number        // 단체 할인
  }
  
  // 심사 정보
  judging: {
    judges: Judge[]
    criteria: JudgingCriteria[]
    maxScore: number
    isBlindJudging: boolean
  }
  
  // 수상 정보
  awards: Award[]
  
  // 전시 정보
  exhibition: {
    venue: string
    venueEn?: string
    isVirtual: boolean
    catalogIncluded: boolean
  }
  
  // 제출 요구사항
  requirements: {
    artworkTypes: ArtworkType[]
    fileFormats: string[]
    maxFileSize: number
    maxSubmissions: number
    minResolution?: string
    additionalDocuments?: string[]
  }
  
  // 상태 관리
  status: ContestStatus
  isPublished: boolean
  isFeatured: boolean
  
  // 메타데이터
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ContestSubmission {
  id: string
  contestId: string
  artistId: string
  
  // 작품 정보
  artwork: {
    title: string
    titleEn?: string
    description: string
    descriptionEn?: string
    category: string
    medium: string
    dimensions: string
    yearCreated: number
    isForSale: boolean
    price?: number
  }
  
  // 파일 정보
  files: {
    mainImage: FileUpload
    additionalImages?: FileUpload[]
    documents?: FileUpload[]
    videoUrl?: string
  }
  
  // 아티스트 정보 (스냅샷)
  artistInfo: {
    name: string
    nameEn?: string
    email: string
    phone: string
    birthYear: number
    nationality: string
    address: string
    bio: string
    website?: string
    instagram?: string
    education?: Education[]
    exhibitions?: Exhibition[]
  }
  
  // 제출 정보
  submissionInfo: {
    category: string
    isStudentEntry: boolean
    previousWins?: string[]
    statement: string
    statementEn?: string
  }
  
  // 결제 정보
  payment: {
    amount: number
    currency: string
    paymentMethod: string
    transactionId: string
    paidAt: Date
    refundRequested?: boolean
    refundedAt?: Date
  }
  
  // 심사 결과
  judging?: {
    scores: JudgeScore[]
    totalScore: number
    rank?: number
    award?: string
    feedback?: string
    isSelected: boolean
  }
  
  // 상태 관리
  status: SubmissionStatus
  submittedAt: Date
  updatedAt: Date
}

export interface Judge {
  id: string
  name: string
  nameEn?: string
  title: string
  bio: string
  profileImage?: string
  credentials: string[]
  specialties: string[]
  contactInfo?: {
    email: string
    phone?: string
  }
}

export interface JudgingCriteria {
  id: string
  name: string
  nameEn?: string
  description: string
  weight: number  // 가중치 (총합 100%)
  maxScore: number
}

export interface JudgeScore {
  judgeId: string
  submissionId: string
  scores: {
    criteriaId: string
    score: number
    comment?: string
  }[]
  overallComment?: string
  recommendForAward?: boolean
  scoredAt: Date
}

export interface Award {
  id: string
  name: string
  nameEn?: string
  description: string
  prize: {
    monetary?: number
    exhibition: boolean
    catalog: boolean
    certificate: boolean
    other?: string[]
  }
  maxWinners: number
  criteria?: string
}

export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
}

export interface Education {
  institution: string
  degree: string
  field: string
  year: number
  country: string
}

export interface Exhibition {
  title: string
  venue: string
  year: number
  type: 'solo' | 'group'
  country: string
}

// Enums
export type ContestCategory = 
  | 'calligraphy' 
  | 'painting' 
  | 'sculpture' 
  | 'photography' 
  | 'digital-art' 
  | 'mixed-media'
  | 'installation'

export type ArtworkType = 
  | 'traditional-painting'
  | 'modern-painting' 
  | 'calligraphy'
  | 'sculpture'
  | 'photography'
  | 'digital-art'
  | 'video-art'
  | 'installation'
  | 'mixed-media'

export type ContestStatus = 
  | 'draft'
  | 'registration-open'
  | 'submission-open' 
  | 'submission-closed'
  | 'judging'
  | 'completed'
  | 'cancelled'

export type SubmissionStatus = 
  | 'draft'
  | 'submitted'
  | 'payment-pending'
  | 'under-review'
  | 'judging'
  | 'selected'
  | 'not-selected'
  | 'withdrawn' 