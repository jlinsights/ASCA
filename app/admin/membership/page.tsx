'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  Award,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Activity,
  Settings,
  Eye,
  Edit,
  MoreHorizontal,
  Shield,
  Crown,
  GraduationCap,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  MemberProfile,
  MembershipDashboardStats,
  MembershipTierInfo,
} from '@/lib/types/membership'
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  seedTestApplication,
  type PendingApplication,
} from './actions'

// Mock data - 실제 구현시 API에서 가져올 데이터
const mockStats: MembershipDashboardStats = {
  totalMembers: 1247,
  membersByTier: {
    1: 523, // Student
    2: 412, // Advanced Practitioner
    3: 198, // Certified Master
    4: 67, // Honorary Master
    5: 32, // Institutional
    6: 15, // International Associate
  },
  membersByStatus: {
    active: 1156,
    pending_approval: 67,
    inactive: 18,
    suspended: 6,
  },
  newMembersThisMonth: 43,
  pendingApplications: 23,
  activePrograms: 8,
  upcomingEvents: 12,
  revenueThisMonth: 8450000,
  memberRetentionRate: 94.2,
  averageProfileCompleteness: 78,
}

const membershipTiers: MembershipTierInfo[] = [
  {
    id: '1',
    name: 'student',
    nameKo: '학생 회원',
    nameEn: 'Student Member',
    level: 1,
    color: '#10B981',
    icon: '📚',
    annualFee: 50000,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 1,
  },
  {
    id: '2',
    name: 'advanced',
    nameKo: '고급 실습생',
    nameEn: 'Advanced Practitioner',
    level: 2,
    color: '#3B82F6',
    icon: '🎨',
    annualFee: 100000,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 2,
  },
  {
    id: '3',
    name: 'certified',
    nameKo: '인증 서예가',
    nameEn: 'Certified Master',
    level: 3,
    color: '#8B5CF6',
    icon: '🏆',
    annualFee: 200000,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 3,
  },
  {
    id: '4',
    name: 'honorary',
    nameKo: '명예 서예가',
    nameEn: 'Honorary Master',
    level: 4,
    color: '#F59E0B',
    icon: '👑',
    annualFee: 0,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 4,
  },
  {
    id: '5',
    name: 'institutional',
    nameKo: '기관 회원',
    nameEn: 'Institutional Member',
    level: 5,
    color: '#EF4444',
    icon: '🏛️',
    annualFee: 500000,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 5,
  },
  {
    id: '6',
    name: 'international',
    nameKo: '국제 회원',
    nameEn: 'International Associate',
    level: 6,
    color: '#14B8A6',
    icon: '🌏',
    annualFee: 150000,
    currency: 'KRW',
    requirements: JSON.stringify([]),
    benefits: JSON.stringify([]),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    sortOrder: 6,
  },
]

const mockMembers: (MemberProfile & { user?: any })[] = [
  {
    id: '1',
    userId: 'user1',
    membershipNumber: 'ASCA-2025-001',
    tierLevel: 3,
    tierId: '3',
    status: 'active',
    joinDate: new Date('2023-01-15'),
    fullName: '김서예',
    fullNameKo: '김서예',
    fullNameEn: 'Kim Seo-ye',
    nationality: 'KR',
    phoneNumber: '010-1234-5678',
    // 스키마와 일치하도록 수정
    calligraphyExperience: 12,
    specializations: JSON.stringify([]),
    preferredStyles: JSON.stringify([]),
    teachingExperience: 5,
    certifications: JSON.stringify([]),
    achievements: JSON.stringify([]),
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    country: 'KR',
    educationBackground: JSON.stringify({ general: [], calligraphy: [] }),
    interests: JSON.stringify([]),
    languages: JSON.stringify(['ko', 'en']),
    membershipHistory: JSON.stringify([]),
    paymentHistory: JSON.stringify([]),
    privacySettings: JSON.stringify({
      profileVisibility: 'members_only',
      contactInfoVisible: false,
      achievementsVisible: true,
      participationHistoryVisible: true,
      allowDirectMessages: true,
      showOnlinStatus: false,
    }),
    participationScore: 450,
    contributionScore: 120,
    profileCompleteness: 95,
    marketingConsent: true,
    dataProcessingConsent: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2025-01-20'),
    user: {
      email: 'kim.seoye@example.com',
      avatar: '/images/artists/kangdaehee.avif',
    },
  },
  {
    id: '2',
    userId: 'user2',
    membershipNumber: 'ASCA-2025-002',
    tierLevel: 2,
    tierId: '2',
    status: 'active',
    joinDate: new Date('2023-03-20'),
    fullName: '이묵향',
    fullNameKo: '이묵향',
    fullNameEn: 'Lee Muk-hyang',
    nationality: 'KR',
    phoneNumber: '010-2345-6789',
    // 스키마와 일치하도록 수정
    calligraphyExperience: 8,
    specializations: JSON.stringify([]),
    preferredStyles: JSON.stringify([]),
    teachingExperience: 3,
    certifications: JSON.stringify([]),
    achievements: JSON.stringify([]),
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    country: 'KR',
    educationBackground: JSON.stringify({ general: [], calligraphy: [] }),
    interests: JSON.stringify([]),
    languages: JSON.stringify(['ko']),
    membershipHistory: JSON.stringify([]),
    paymentHistory: JSON.stringify([]),
    privacySettings: JSON.stringify({
      profileVisibility: 'members_only',
      contactInfoVisible: false,
      achievementsVisible: true,
      participationHistoryVisible: true,
      allowDirectMessages: true,
      showOnlinStatus: false,
    }),
    participationScore: 320,
    contributionScore: 85,
    profileCompleteness: 78,
    marketingConsent: false,
    dataProcessingConsent: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2025-01-19'),
    user: {
      email: 'lee.mukhyang@example.com',
      avatar: '/images/artists/sojeonga.avif',
    },
  },
]

export default function AdminMembershipPage() {
  const [stats, setStats] = useState<MembershipDashboardStats>(mockStats)
  const [members, setMembers] = useState(mockMembers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // -- Application Management Logic --
  const [applications, setApplications] = useState<PendingApplication[]>([])
  const [appsLoading, setAppsLoading] = useState(false)

  const loadApplications = useCallback(async () => {
    setAppsLoading(true)
    try {
      const data = await getPendingApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications', error)
    } finally {
      setAppsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const handleApprove = async (id: string) => {
    if (!confirm('승인하시겠습니까?')) return
    const res = await approveApplication(id)
    if (res.success) {
      alert('승인되었습니다.')
      loadApplications()
    } else {
      alert('오류가 발생했습니다.')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('거절 사유를 입력하세요:')
    if (reason === null) return
    const res = await rejectApplication(id, reason || 'No reason provided')
    if (res.success) {
      alert('거절되었습니다.')
      loadApplications()
    } else {
      alert('오류가 발생했습니다.')
    }
  }

  const handleSeed = async () => {
    const res = await seedTestApplication()
    if (res.success) {
      alert('테스트 신청서가 생성되었습니다.')
      loadApplications()
    } else {
      alert('생성 실패: ' + res.error)
    }
  }
  // ----------------------------------

  // 회원 등급별 색상 및 아이콘 가져오기
  const getTierInfo = (tierLevel: number) => {
    const tier = membershipTiers.find(t => t.level === tierLevel)
    return tier || membershipTiers[0]
  }

  // 상태별 뱃지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'pending_approval':
        return '승인 대기'
      case 'inactive':
        return '비활성'
      case 'suspended':
        return '정지'
      default:
        return status
    }
  }

  // ... imports ...
  // Removed Header, LayoutFooter imports

  // ... code ...

  return (
    <div className='space-y-6'>
      {' '}
      {/* Removed global wrapper and Header */}
      {/* 관리자 페이지 헤더 */}
      <section className='border-b border-border bg-muted/30 -mx-4 px-4 py-6 -mt-8 mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>회원 관리</h1>
            <p className='text-muted-foreground'>ASCA 회원 정보 관리 및 통계</p>
          </div>
          <div className='flex gap-3'>
            <Button variant='outline'>
              <Download className='w-4 h-4 mr-2' />
              회원 목록 내보내기
            </Button>
            <Button>
              <UserPlus className='w-4 h-4 mr-2' />새 회원 추가
            </Button>
          </div>
        </div>
      </section>
      <Tabs defaultValue='dashboard' className='space-y-6'>
        {/* ... existing tabs content ... */}
        {/* Copied existing content below */}
        <TabsList>
          <TabsTrigger value='dashboard'>대시보드</TabsTrigger>
          <TabsTrigger value='members'>회원 목록</TabsTrigger>
          <TabsTrigger value='applications'>가입 신청</TabsTrigger>
          <TabsTrigger value='tiers'>회원 등급</TabsTrigger>
          <TabsTrigger value='analytics'>분석</TabsTrigger>
        </TabsList>

        {/* 대시보드 탭 */}
        <TabsContent value='dashboard' className='space-y-6'>
          {/* ... stats cards ... */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>총 회원 수</CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.totalMembers.toLocaleString()}</div>
                <p className='text-xs text-muted-foreground'>
                  <span className='text-emerald-600'>+{stats.newMembersThisMonth}</span> 이번 달
                </p>
              </CardContent>
            </Card>
            {/* ... other stats ... */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>승인 대기</CardTitle>
                <AlertCircle className='h-4 w-4 text-amber-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.pendingApplications}</div>
                <p className='text-xs text-muted-foreground'>신규 가입 신청서</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>활성 프로그램</CardTitle>
                <Activity className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.activePrograms}</div>
                <p className='text-xs text-muted-foreground'>진행 중인 문화교류 프로그램</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>이번 달 수익</CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ₩{(stats.revenueThisMonth / 1000000).toFixed(1)}M
                </div>
                <p className='text-xs text-muted-foreground'>회비 및 프로그램 수수료</p>
              </CardContent>
            </Card>
          </div>

          {/* 회원 등급별 분포 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>회원 등급별 분포</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {membershipTiers.map(tier => {
                  const count = stats.membersByTier[tier.level] || 0
                  const percentage = (count / stats.totalMembers) * 100

                  return (
                    <div key={tier.id} className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-2'>
                          <span>{tier.icon}</span>
                          <span className='font-medium'>{tier.nameKo}</span>
                        </div>
                        <div className='text-right'>
                          <span className='font-medium'>{count}</span>
                          <span className='text-muted-foreground ml-1'>
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className='h-2'
                        style={{ '--progress-foreground': tier.color } as any}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>회원 상태 현황</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {Object.entries(stats.membersByStatus).map(([status, count]) => {
                  const percentage = (count / stats.totalMembers) * 100

                  return (
                    <div key={status} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Badge className={getStatusBadge(status)}>{getStatusText(status)}</Badge>
                      </div>
                      <div className='text-right'>
                        <span className='font-medium'>{count}</span>
                        <span className='text-muted-foreground ml-1'>
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* 추가 통계 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>회원 유지율</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-emerald-600 mb-2'>
                  {stats.memberRetentionRate}%
                </div>
                <Progress value={stats.memberRetentionRate} className='mb-2' />
                <p className='text-sm text-muted-foreground'>지난 1년간 회원 유지율</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>평균 프로필 완성도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-blue-600 mb-2'>
                  {stats.averageProfileCompleteness}%
                </div>
                <Progress value={stats.averageProfileCompleteness} className='mb-2' />
                <p className='text-sm text-muted-foreground'>전체 회원 평균 완성도</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>다가오는 이벤트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-purple-600 mb-2'>
                  {stats.upcomingEvents}
                </div>
                <p className='text-sm text-muted-foreground'>이번 달 예정된 이벤트</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 회원 목록 탭 */}
        <TabsContent value='members' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>회원 검색 및 필터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                    <Input
                      placeholder='이름, 이메일, 회원번호로 검색...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='회원 등급' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>모든 등급</SelectItem>
                    {membershipTiers.map(tier => (
                      <SelectItem key={tier.id} value={tier.level.toString()}>
                        {tier.icon} {tier.nameKo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='상태' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>모든 상태</SelectItem>
                    <SelectItem value='active'>활성</SelectItem>
                    <SelectItem value='pending_approval'>승인 대기</SelectItem>
                    <SelectItem value='inactive'>비활성</SelectItem>
                    <SelectItem value='suspended'>정지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>전체 회원 ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {members.map(member => {
                  const tierInfo = getTierInfo(member.tierLevel)
                  if (!tierInfo) return null

                  return (
                    <div
                      key={member.id}
                      className='flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <Avatar className='h-12 w-12'>
                          <AvatarImage src={member.user?.avatar} />
                          <AvatarFallback>{member.fullName.slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold'>{member.fullName}</h3>
                            <Badge
                              className={cn('text-xs px-2 py-0', getStatusBadge(member.status))}
                            >
                              {getStatusText(member.status)}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Mail className='h-3 w-3' />
                              {member.user?.email}
                            </span>
                            <span>{member.membershipNumber}</span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              가입: {member.joinDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-6'>
                        <div className='text-center'>
                          <div className='flex items-center gap-1 text-sm font-medium mb-1'>
                            <span>{tierInfo.icon}</span>
                            <span style={{ color: tierInfo.color }}>{tierInfo.nameKo}</span>
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {member.calligraphyExperience || 0}년 경력
                          </div>
                        </div>

                        <div className='text-center'>
                          <div className='text-sm font-medium text-amber-600 mb-1'>
                            {member.participationScore}점
                          </div>
                          <div className='text-xs text-muted-foreground'>참여 점수</div>
                        </div>

                        <div className='text-center min-w-[80px]'>
                          <div className='text-sm font-medium mb-1'>
                            {member.profileCompleteness}%
                          </div>
                          <Progress value={member.profileCompleteness} className='h-2 w-16' />
                        </div>

                        <div className='flex gap-2'>
                          <Button size='sm' variant='outline'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button size='sm' variant='outline'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button size='sm' variant='outline'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='applications'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>가입 신청 관리</CardTitle>
                <p className='text-muted-foreground'>
                  승인 대기 중인 신규 회원 및 등급 변경 신청을 관리합니다.
                </p>
              </div>
              <div className='text-center py-12'>
                <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>승인 대기 중인 신청이 없습니다</h3>
                <p className='text-muted-foreground'>
                  새로운 가입 신청이 있으면 여기에 표시됩니다.
                </p>
              </div>
              <Button variant='outline' size='sm' onClick={handleSeed}>
                🛠️ 테스트 데이터 생성
              </Button>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className='text-center py-8'>로딩 중...</div>
              ) : applications.length === 0 ? (
                <div className='text-center py-12'>
                  <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>승인 대기 중인 신청이 없습니다</h3>
                  <p className='text-muted-foreground'>
                    새로운 가입 신청이 있으면 여기에 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className='flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4'
                    >
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-semibold'>{app.memberName}</h4>
                          <Badge>
                            {app.applicationType === 'new_member' ? '신규 가입' : '등급 변경'}
                          </Badge>
                          <Badge variant='outline'>{app.requestedTierName}</Badge>
                        </div>
                        <div className='text-sm text-muted-foreground space-y-1'>
                          <p>{app.memberEmail}</p>
                          <p>신청일: {new Date(app.submittedAt).toLocaleDateString()}</p>
                          {app.reason && (
                            <p className='text-foreground mt-2 bg-secondary/10 p-2 rounded'>
                              "{app.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          className='text-red-500 hover:text-red-600 hover:bg-red-50'
                          onClick={() => handleReject(app.id)}
                        >
                          거절
                        </Button>
                        <Button
                          className='bg-emerald-600 hover:bg-emerald-700 text-white'
                          onClick={() => handleApprove(app.id)}
                        >
                          승인
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tiers'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>회원 등급 관리</CardTitle>
                <p className='text-muted-foreground'>
                  회원 등급별 요구사항, 혜택 및 연회비를 관리합니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {membershipTiers.map(tier => (
                    <Card key={tier.id} className='relative overflow-hidden'>
                      <div className='h-2 w-full' style={{ backgroundColor: tier.color }} />
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-2xl'>{tier.icon}</span>
                            <div>
                              <CardTitle className='text-lg'>{tier.nameKo}</CardTitle>
                              <p className='text-sm text-muted-foreground'>{tier.nameEn}</p>
                            </div>
                          </div>
                          <Badge variant='secondary'>Level {tier.level}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div>
                          <div className='text-2xl font-bold' style={{ color: tier.color }}>
                            {tier.annualFee === 0 ? '무료' : `₩${tier.annualFee.toLocaleString()}`}
                          </div>
                          <div className='text-sm text-muted-foreground'>연회비</div>
                        </div>

                        <div className='text-center'>
                          <div className='text-xl font-semibold'>
                            {stats.membersByTier[tier.level] || 0}명
                          </div>
                          <div className='text-sm text-muted-foreground'>현재 회원 수</div>
                        </div>

                        <Button variant='outline' className='w-full'>
                          <Settings className='h-4 w-4 mr-2' />
                          등급 관리
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='analytics'>
          <Card>
            <CardHeader>
              <CardTitle>회원 분석</CardTitle>
              <p className='text-muted-foreground'>회원 활동, 참여도 및 성장 추이를 분석합니다.</p>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <TrendingUp className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>분석 데이터 준비 중</h3>
                <p className='text-muted-foreground'>
                  회원 활동 데이터가 충분히 수집되면 상세한 분석을 제공합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
