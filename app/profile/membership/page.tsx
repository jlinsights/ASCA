
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

import { mockMemberProfile, mockTierInfo, mockActivities, styleNames } from "./_components/mock-data"

import { ProfileHeader } from './_components/profile-header';
import { ProfileTabs } from './_components/profile-tabs';

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
      logger.error('프로필 업데이트 실패', error instanceof Error ? error : new Error(String(error)))
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
