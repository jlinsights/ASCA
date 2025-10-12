'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen, 
  Globe, 
  Edit, 
  Save, 
  Upload, 
  Download,
  Star,
  Trophy,
  Users,
  GraduationCap,
  Languages,
  Shield,
  Eye,
  EyeOff,
  Camera,
  FileText,
  Heart,
  Activity,
  Clock,
  Target,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  MemberProfile, 
  MembershipTierInfo,
  CalligraphyStyle,
  Achievement,
  CalligraphyCertification,
  MemberActivityLog
} from '@/lib/types/membership'

// Mock 사용자 데이터
const mockMemberProfile: MemberProfile = {
  id: 'member1',
  userId: 'user1',
  membershipNumber: 'ASCA-2025-001',
  tierLevel: 3,
  tierId: 'tier3',
  status: 'active',
  joinDate: new Date('2023-01-15'),
  lastActivityDate: new Date('2025-01-20'),
  
  // 개인 정보
  fullName: '김서예',
  fullNameKo: '김서예',
  fullNameEn: 'Kim Seo-ye',
  fullNameCn: '金書藝',
  fullNameJp: 'キム・ソイェ',
  dateOfBirth: new Date('1985-03-15'),
  gender: 'female',
  nationality: 'KR',
  
  // 연락처
  phoneNumber: '010-1234-5678',
  alternateEmail: 'kim.seoye.art@gmail.com',
  emergencyContactName: '김부모',
  emergencyContactPhone: '010-9876-5432',
  
  // 주소 필드들 (스키마와 일치)
  address: '서울특별시 중구 인사동길 12',
  addressKo: '서울특별시 중구 인사동길 12',
  addressEn: '12 Insadong-gil, Jung-gu, Seoul',
  city: '서울',
  state: '서울특별시',
  postalCode: '04519',
  country: 'KR',
  
  // 서예 정보
  // 서예 관련 정보 (스키마 필드와 일치)
  calligraphyExperience: 12,
  specializations: JSON.stringify(['kaishu', 'xingshu', 'caoshu']),
  preferredStyles: JSON.stringify(['kaishu', 'xingshu']),
  teachingExperience: 5,
  certifications: JSON.stringify([
    {
      name: 'ASCA 서예 인증서 3급',
      issuingOrganization: '사단법인 동양서예협회',
      level: 'advanced',
      issuedDate: '2022-06-15',
      certificateNumber: 'ASCA-CERT-2022-156'
    }
  ]),
  achievements: JSON.stringify([
    {
      type: 'award',
      title: '제47회 대한민국서예대전 특선',
      description: '행서 부문 특선 수상',
      date: '2023-10-15',
      organization: '대한민국서예협회',
      rank: '특선',
      significance: 'national'
    },
    {
      type: 'exhibition',
      title: '서울서예비엔날레 2024 참가',
      description: '개인 작품 3점 전시',
      date: '2024-05-20',
      organization: '서울문화재단',
      significance: 'local'
    }
  ]),
  
  // 교육 배경 (JSON 형태)
  educationBackground: JSON.stringify({
    general: [
      {
        level: 'bachelor',
        institution: '서울대학교',
        field: '동양화학과',
        graduationYear: 2008,
        country: 'KR'
      }
    ],
    calligraphy: [
      {
        type: 'formal',
        institution: '동양서예아카데미',
        teacher: '박서예 선생',
        duration: 24,
        startDate: '2018-03-01',
        endDate: '2020-02-28',
        level: 'advanced',
        focus: ['kaishu', 'xingshu']
      }
    ]
  }),
  
  // 관심사 및 기타 (JSON 형태)
  interests: JSON.stringify(['전통문화', '붓글씨', '한문학', '차문화']),
  culturalBackground: '한국 전통 서예 가문 출신',
  languages: JSON.stringify(['ko', 'en', 'zh']),
  
  // 멤버십 정보 (JSON 형태)
  membershipHistory: JSON.stringify([
    {
      date: '2023-01-15',
      action: 'joined',
      toTier: 1,
      reason: '신규 가입'
    },
    {
      date: '2023-06-15',
      action: 'upgraded',
      fromTier: 1,
      toTier: 2,
      reason: '6개월 활동 우수'
    },
    {
      date: '2024-01-15',
      action: 'upgraded',
      fromTier: 2,
      toTier: 3,
      reason: '인증서 취득 및 작품 활동'
    }
  ]),
  paymentHistory: JSON.stringify([
    {
      date: '2025-01-01',
      amount: 200000,
      currency: 'KRW',
      paymentMethod: 'bank_transfer',
      purpose: 'annual_fee',
      status: 'completed',
      receiptNumber: 'ASCA-2025-001-001'
    }
  ]),
  participationScore: 450,
  contributionScore: 120,
  
  // 프라이버시 설정
  privacySettings: JSON.stringify({
    profileVisibility: 'members_only',
    contactInfoVisible: false,
    achievementsVisible: true,
    participationHistoryVisible: true,
    allowDirectMessages: true,
    showOnlinStatus: false
  }),
  marketingConsent: true,
  dataProcessingConsent: true,
  
  // 메타 정보
  profileCompleteness: 95,
  lastProfileUpdate: new Date('2025-01-15'),
  notes: '',
  
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2025-01-20')
}

const mockTierInfo: MembershipTierInfo = {
  id: 'tier3',
  name: 'certified_master',
  nameKo: '인증 서예가',
  nameEn: 'Certified Master',
  level: 3,
  color: '#8B5CF6',
  icon: '🏆',
  annualFee: 200000,
  currency: 'KRW',
  requirements: JSON.stringify([]),
  benefits: JSON.stringify([]),
  isActive: true,
  sortOrder: 3,
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockActivities: MemberActivityLog[] = [
  {
    id: 'activity1',
    memberId: 'member1',
    activityType: 'event_participation',
    description: '서예 워크샵 참가',
    points: 50,
    relatedEntityId: 'workshop1',
    relatedEntityType: 'workshop',
    timestamp: new Date('2025-01-20')
  },
  {
    id: 'activity2',
    memberId: 'member1',
    activityType: 'artwork_submission',
    description: '작품 포트폴리오 업데이트',
    points: 30,
    timestamp: new Date('2025-01-18')
  },
  {
    id: 'activity3',
    memberId: 'member1',
    activityType: 'forum_post',
    description: '서예 기법 토론 참여',
    points: 10,
    timestamp: new Date('2025-01-15')
  }
]

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<MemberProfile>(mockMemberProfile)
  const [tierInfo, setTierInfo] = useState<MembershipTierInfo>(mockTierInfo)
  const [activities, setActivities] = useState<MemberActivityLog[]>(mockActivities)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MemberProfile>>(profile)

  // 서예 스타일 한국어 매핑
  const styleNames: Record<CalligraphyStyle, string> = {
    kaishu: '해서',
    xingshu: '행서',
    caoshu: '초서',
    lishu: '예서',
    zhuanshu: '전서',
    modern: '현대서예',
    experimental: '실험서예'
  }

  // Parse JSON fields
  const parsedPrivacySettings = profile.privacySettings ? JSON.parse(profile.privacySettings) : {}

  // 프로필 수정 핸들러
  const handleSaveProfile = async () => {
    try {
      // TODO: API 호출로 프로필 업데이트
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
      // 성공 토스트 메시지
    } catch (error) {
      logger.error('프로필 업데이트 실패', error instanceof Error ? error : new Error(String(error)))
      // 에러 토스트 메시지
    }
  }

  const handleCancelEdit = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 프로필 헤더 */}
      <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* 프로필 이미지 */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.fullName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  <Badge 
                    className="text-sm px-3 py-1"
                    style={{ backgroundColor: tierInfo.color + '20', color: tierInfo.color }}
                  >
                    {tierInfo.icon} {tierInfo.nameKo}
                  </Badge>
                  <Badge variant="secondary">{profile.membershipNumber}</Badge>
                </div>
                <p className="text-lg text-muted-foreground">{profile.fullNameEn}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>가입: {profile.joinDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.calligraphyExperience}년 경력</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.participationScore}점 (참여도)</span>
                </div>
              </div>

              {/* 프로필 완성도 */}
              <div className="max-w-md">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>프로필 완성도</span>
                  <span className="font-medium">{profile.profileCompleteness}%</span>
                </div>
                <Progress value={profile.profileCompleteness} className="h-2" />
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    취소
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  프로필 편집
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="personal">개인정보</TabsTrigger>
            <TabsTrigger value="calligraphy">서예활동</TabsTrigger>
            <TabsTrigger value="achievements">업적</TabsTrigger>
            <TabsTrigger value="activities">활동내역</TabsTrigger>
            <TabsTrigger value="privacy">프라이버시</TabsTrigger>
            <TabsTrigger value="membership">멤버십</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 주요 통계 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>활동 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {profile.participationScore}
                      </div>
                      <div className="text-sm text-muted-foreground">참여 점수</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {profile.contributionScore}
                      </div>
                      <div className="text-sm text-muted-foreground">기여 점수</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {profile.achievements ? JSON.parse(profile.achievements).length : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">수상 경력</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-amber-600 mb-1">
                        {profile.calligraphyExperience}년
                      </div>
                      <div className="text-sm text-muted-foreground">서예 경력</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 전문 분야 */}
              <Card>
                <CardHeader>
                  <CardTitle>전문 분야</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">특화 서체</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations ? JSON.parse(profile.specializations).map((style: string) => (
                        <Badge key={style} variant="secondary">
                          {styleNames[style as CalligraphyStyle]}
                        </Badge>
                      )) : null}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">관심 분야</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests ? JSON.parse(profile.interests).map((interest: string) => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      )) : null}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">구사 언어</div>
                    <div className="flex gap-2">
                      {profile.languages ? JSON.parse(profile.languages).map((lang: string) => (
                        <Badge key={lang} variant="secondary">
                          {lang === 'ko' ? '한국어' : lang === 'en' ? '영어' : lang === 'zh' ? '중국어' : lang === 'ja' ? '일본어' : lang}
                        </Badge>
                      )) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 최근 활동 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.timestamp.toLocaleDateString()} • +{activity.points}점
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 개인정보 탭 */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">한국어 이름</Label>
                      <Input
                        id="fullName"
                        value={editForm.fullName || ''}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullNameEn">영어 이름</Label>
                      <Input
                        id="fullNameEn"
                        value={editForm.fullNameEn || ''}
                        onChange={(e) => setEditForm({...editForm, fullNameEn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">전화번호</Label>
                      <Input
                        id="phoneNumber"
                        value={editForm.phoneNumber || ''}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternateEmail">보조 이메일</Label>
                      <Input
                        id="alternateEmail"
                        type="email"
                        value={editForm.alternateEmail || ''}
                        onChange={(e) => setEditForm({...editForm, alternateEmail: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">한국어 이름</div>
                        <div className="font-medium">{profile.fullName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">영어 이름</div>
                        <div className="font-medium">{profile.fullNameEn}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">생년월일</div>
                        <div className="font-medium">
                          {profile.dateOfBirth?.toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">국적</div>
                        <div className="font-medium">
                          {profile.nationality === 'KR' ? '대한민국' : profile.nationality}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">전화번호</div>
                        <div className="font-medium">{profile.phoneNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">보조 이메일</div>
                        <div className="font-medium">{profile.alternateEmail || '미설정'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">주소</div>
                        <div className="font-medium">{profile.address}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">우편번호</div>
                        <div className="font-medium">{profile.postalCode}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 비상 연락처 */}
            <Card>
              <CardHeader>
                <CardTitle>비상 연락처</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">이름</div>
                      <div className="font-medium">{profile.emergencyContactName || '미설정'}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">전화번호</div>
                      <div className="font-medium">{profile.emergencyContactPhone || '미설정'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 서예활동 탭 */}
          <TabsContent value="calligraphy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>서예 경력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">서예 경력</div>
                      <div className="text-2xl font-bold text-blue-600">{profile.calligraphyExperience}년</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">교육 경력</div>
                      <div className="text-2xl font-bold text-green-600">{profile.teachingExperience}년</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">전문 서체</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations ? JSON.parse(profile.specializations).map((style: string) => (
                        <Badge key={style} className="bg-primary/10 text-primary">
                          {styleNames[style as CalligraphyStyle]}
                        </Badge>
                      )) : null}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">문화적 배경</div>
                    <p className="text-sm">{profile.culturalBackground}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>보유 인증서</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.certifications ? JSON.parse(profile.certifications).map((cert: any, index: number) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="font-medium">{cert.name}</div>
                        <div className="text-sm text-muted-foreground">{cert.issuingOrganization}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          발급일: {cert.issuedDate}
                          {cert.certificateNumber && ` • ${cert.certificateNumber}`}
                        </div>
                      </div>
                    )) : null}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 교육 이력 */}
            <Card>
              <CardHeader>
                <CardTitle>교육 이력</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">일반 교육</h4>
                    {profile.educationBackground && JSON.parse(profile.educationBackground).general?.map((edu: any, index: number) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="font-medium">{edu.institution}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.field} • {edu.graduationYear}년 졸업
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">서예 교육</h4>
                    {profile.educationBackground && JSON.parse(profile.educationBackground).calligraphy?.map((edu: any, index: number) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="font-medium">{edu.institution}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.teacher && `${edu.teacher} • `}
                          {edu.startYear}-{edu.endYear} • 
                          {edu.level} 과정
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          전공: {edu.focus?.map((f: string) => styleNames[f as CalligraphyStyle] || f).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 업적 탭 */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>수상 경력 및 전시 참가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.achievements ? JSON.parse(profile.achievements).map((achievement: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                          {achievement.type === 'award' ? (
                            <Trophy className="h-5 w-5 text-amber-600" />
                          ) : achievement.type === 'exhibition' ? (
                            <Eye className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Star className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{achievement.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{achievement.organization}</span>
                                <span>{achievement.date}</span>
                                {achievement.rank && <span>• {achievement.rank}</span>}
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              {achievement.significance === 'international' ? '국제' : 
                               achievement.significance === 'national' ? '전국' : '지역'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 활동내역 탭 */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{activity.points}점
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 프라이버시 탭 */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>프라이버시 설정</CardTitle>
                <p className="text-sm text-muted-foreground">
                  다른 회원들에게 공개할 정보를 선택하세요.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">프로필 공개 범위</div>
                      <div className="text-sm text-muted-foreground">
                        누가 내 프로필을 볼 수 있는지 설정합니다
                      </div>
                    </div>
                    <Select value={parsedPrivacySettings.profileVisibility}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">전체 공개</SelectItem>
                        <SelectItem value="members_only">회원만</SelectItem>
                        <SelectItem value="private">비공개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">연락처 정보 공개</div>
                      <div className="text-sm text-muted-foreground">
                        전화번호, 이메일 등 연락처 정보 공개 여부
                      </div>
                    </div>
                    <Checkbox checked={parsedPrivacySettings.contactInfoVisible} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">업적 및 수상 경력 공개</div>
                      <div className="text-sm text-muted-foreground">
                        수상 경력, 전시 참가 등 업적 공개 여부
                      </div>
                    </div>
                    <Checkbox checked={parsedPrivacySettings.achievementsVisible} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">활동 내역 공개</div>
                      <div className="text-sm text-muted-foreground">
                        참여한 이벤트, 프로그램 등 활동 내역 공개 여부
                      </div>
                    </div>
                    <Checkbox checked={parsedPrivacySettings.participationHistoryVisible} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">직접 메시지 허용</div>
                      <div className="text-sm text-muted-foreground">
                        다른 회원들이 직접 메시지를 보낼 수 있도록 허용
                      </div>
                    </div>
                    <Checkbox checked={parsedPrivacySettings.allowDirectMessages} />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">마케팅 및 개인정보 동의</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">마케팅 정보 수신 동의</div>
                        <div className="text-sm text-muted-foreground">
                          이벤트, 프로그램 등 마케팅 정보 수신 동의
                        </div>
                      </div>
                      <Checkbox checked={profile.marketingConsent} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">개인정보 처리 동의</div>
                        <div className="text-sm text-muted-foreground">
                          서비스 이용을 위한 개인정보 처리 동의 (필수)
                        </div>
                      </div>
                      <Checkbox checked={profile.dataProcessingConsent} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 멤버십 탭 */}
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>현재 멤버십</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{tierInfo.icon}</div>
                    <div>
                      <div className="font-semibold text-lg" style={{ color: tierInfo.color }}>
                        {tierInfo.nameKo}
                      </div>
                      <div className="text-sm text-muted-foreground">{tierInfo.nameEn}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 border border-border rounded-lg">
                      <div className="text-lg font-bold">Level {profile.tierLevel}</div>
                      <div className="text-xs text-muted-foreground">멤버십 등급</div>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <div className="text-lg font-bold">
                        ₩{tierInfo.annualFee.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">연회비</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">회원번호</div>
                    <div className="font-mono text-lg">{profile.membershipNumber}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>멤버십 이력</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.membershipHistory ? JSON.parse(profile.membershipHistory).map((history: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {history.action === 'joined' ? '가입' :
                             history.action === 'upgraded' ? '등급 상승' :
                             history.action === 'downgraded' ? '등급 하락' : history.action}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {history.date}
                            {history.fromTier && history.toTier && 
                              ` • Lv.${history.fromTier} → Lv.${history.toTier}`}
                          </div>
                        </div>
                      </div>
                    )) : null}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 회비 납부 내역 */}
            <Card>
              <CardHeader>
                <CardTitle>회비 납부 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.paymentHistory ? JSON.parse(profile.paymentHistory).map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {payment.purpose === 'annual_fee' ? '연회비' :
                           payment.purpose === 'event_fee' ? '이벤트 참가비' :
                           payment.purpose === 'workshop_fee' ? '워크샵 참가비' : payment.purpose}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.date} • {payment.paymentMethod}
                          {payment.receiptNumber && ` • ${payment.receiptNumber}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₩{payment.amount.toLocaleString()}</div>
                        <Badge 
                          className={cn(
                            "text-xs",
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          )}
                        >
                          {payment.status === 'completed' ? '완료' :
                           payment.status === 'pending' ? '대기' : payment.status}
                        </Badge>
                      </div>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}