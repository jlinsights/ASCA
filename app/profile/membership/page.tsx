'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  MemberProfile,
  MembershipTierInfo,
  CalligraphyStyle,
  Achievement,
  CalligraphyCertification,
  MemberActivityLog,
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
      certificateNumber: 'ASCA-CERT-2022-156',
    },
  ]),
  achievements: JSON.stringify([
    {
      type: 'award',
      title: '제47회 대한민국서예대전 특선',
      description: '행서 부문 특선 수상',
      date: '2023-10-15',
      organization: '대한민국서예협회',
      rank: '특선',
      significance: 'national',
    },
    {
      type: 'exhibition',
      title: '서울서예비엔날레 2024 참가',
      description: '개인 작품 3점 전시',
      date: '2024-05-20',
      organization: '서울문화재단',
      significance: 'local',
    },
  ]),

  // 교육 배경 (JSON 형태)
  educationBackground: JSON.stringify({
    general: [
      {
        level: 'bachelor',
        institution: '서울대학교',
        field: '동양화학과',
        graduationYear: 2008,
        country: 'KR',
      },
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
        focus: ['kaishu', 'xingshu'],
      },
    ],
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
      reason: '신규 가입',
    },
    {
      date: '2023-06-15',
      action: 'upgraded',
      fromTier: 1,
      toTier: 2,
      reason: '6개월 활동 우수',
    },
    {
      date: '2024-01-15',
      action: 'upgraded',
      fromTier: 2,
      toTier: 3,
      reason: '인증서 취득 및 작품 활동',
    },
  ]),
  paymentHistory: JSON.stringify([
    {
      date: '2025-01-01',
      amount: 200000,
      currency: 'KRW',
      paymentMethod: 'bank_transfer',
      purpose: 'annual_fee',
      status: 'completed',
      receiptNumber: 'ASCA-2025-001-001',
    },
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
    showOnlinStatus: false,
  }),
  marketingConsent: true,
  dataProcessingConsent: true,

  // 메타 정보
  profileCompleteness: 95,
  lastProfileUpdate: new Date('2025-01-15'),
  notes: '',

  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2025-01-20'),
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
  updatedAt: new Date(),
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
    timestamp: new Date('2025-01-20'),
  },
  {
    id: 'activity2',
    memberId: 'member1',
    activityType: 'artwork_submission',
    description: '작품 포트폴리오 업데이트',
    points: 30,
    timestamp: new Date('2025-01-18'),
  },
  {
    id: 'activity3',
    memberId: 'member1',
    activityType: 'forum_post',
    description: '서예 기법 토론 참여',
    points: 10,
    timestamp: new Date('2025-01-15'),
  },
]

import { ProfileHeader } from './_components/profile-header'
import { ProfileTabs } from './_components/profile-tabs'

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<MemberProfile>(mockMemberProfile)
  const [tierInfo, setTierInfo] = useState<MembershipTierInfo>(mockTierInfo)
  const [activities, setActivities] = useState<MemberActivityLog[]>(mockActivities)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MemberProfile>>(profile)

  const parsedPrivacySettings = profile.privacySettings ? JSON.parse(profile.privacySettings) : {}

  const handleSaveProfile = async () => {
    try {
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
    } catch (error) {
      logger.error(
        '프로필 업데이트 실패',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  const handleCancelEdit = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <ProfileHeader
        profile={profile}
        tierInfo={tierInfo}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSaveProfile={handleSaveProfile}
        handleCancelEdit={handleCancelEdit}
      />
      <ProfileTabs
        profile={profile}
        tierInfo={tierInfo}
        activities={activities}
        isEditing={isEditing}
        editForm={editForm}
        setEditForm={setEditForm}
        parsedPrivacySettings={parsedPrivacySettings}
      />
      <LayoutFooter />
    </div>
  )
}
