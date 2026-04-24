'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  MemberProfile,
  MembershipTierInfo,
  MemberActivityLog,
} from '@/lib/types/membership'
import { OverviewTab } from './tabs/overview-tab'
import { PersonalTab } from './tabs/personal-tab'
import { CalligraphyTab } from './tabs/calligraphy-tab'
import { AchievementsTab } from './tabs/achievements-tab'
import { ActivitiesTab } from './tabs/activities-tab'
import { PrivacyTab } from './tabs/privacy-tab'
import { MembershipTab } from './tabs/membership-tab'

interface ProfileTabsProps {
  profile: MemberProfile
  tierInfo: MembershipTierInfo
  activities: MemberActivityLog[]
  isEditing: boolean
  editForm: Partial<MemberProfile>
  setEditForm: (form: Partial<MemberProfile>) => void
  parsedPrivacySettings: any
}

export function ProfileTabs({
  profile,
  tierInfo,
  activities,
  isEditing,
  editForm,
  setEditForm,
  parsedPrivacySettings,
}: ProfileTabsProps) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-7'>
          <TabsTrigger value='overview'>개요</TabsTrigger>
          <TabsTrigger value='personal'>개인정보</TabsTrigger>
          <TabsTrigger value='calligraphy'>서예활동</TabsTrigger>
          <TabsTrigger value='achievements'>업적</TabsTrigger>
          <TabsTrigger value='activities'>활동내역</TabsTrigger>
          <TabsTrigger value='privacy'>프라이버시</TabsTrigger>
          <TabsTrigger value='membership'>멤버십</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <OverviewTab profile={profile} activities={activities} />
        </TabsContent>

        <TabsContent value='personal' className='space-y-6'>
          <PersonalTab
            profile={profile}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        </TabsContent>

        <TabsContent value='calligraphy' className='space-y-6'>
          <CalligraphyTab profile={profile} />
        </TabsContent>

        <TabsContent value='achievements' className='space-y-6'>
          <AchievementsTab profile={profile} />
        </TabsContent>

        <TabsContent value='activities' className='space-y-6'>
          <ActivitiesTab activities={activities} />
        </TabsContent>

        <TabsContent value='privacy' className='space-y-6'>
          <PrivacyTab profile={profile} parsedPrivacySettings={parsedPrivacySettings} />
        </TabsContent>

        <TabsContent value='membership' className='space-y-6'>
          <MembershipTab profile={profile} tierInfo={tierInfo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
