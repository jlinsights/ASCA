'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MemberProfile } from '@/lib/types/membership'

interface PrivacyTabProps {
  profile: MemberProfile
  parsedPrivacySettings: any
}

export function PrivacyTab({ profile, parsedPrivacySettings }: PrivacyTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>프라이버시 설정</CardTitle>
        <p className='text-sm text-muted-foreground'>다른 회원들에게 공개할 정보를 선택하세요.</p>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <SettingDescription
              title='프로필 공개 범위'
              desc='누가 내 프로필을 볼 수 있는지 설정합니다'
            />
            <Select value={parsedPrivacySettings.profileVisibility}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='public'>전체 공개</SelectItem>
                <SelectItem value='members_only'>회원만</SelectItem>
                <SelectItem value='private'>비공개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PrivacyToggle
            title='연락처 정보 공개'
            desc='전화번호, 이메일 등 연락처 정보 공개 여부'
            checked={parsedPrivacySettings.contactInfoVisible}
          />
          <PrivacyToggle
            title='업적 및 수상 경력 공개'
            desc='수상 경력, 전시 참가 등 업적 공개 여부'
            checked={parsedPrivacySettings.achievementsVisible}
          />
          <PrivacyToggle
            title='활동 내역 공개'
            desc='참여한 이벤트, 프로그램 등 활동 내역 공개 여부'
            checked={parsedPrivacySettings.participationHistoryVisible}
          />
          <PrivacyToggle
            title='직접 메시지 허용'
            desc='다른 회원들이 직접 메시지를 보낼 수 있도록 허용'
            checked={parsedPrivacySettings.allowDirectMessages}
          />
        </div>

        <div className='border-t pt-6'>
          <h4 className='font-semibold mb-4'>마케팅 및 개인정보 동의</h4>
          <div className='space-y-4'>
            <PrivacyToggle
              title='마케팅 정보 수신 동의'
              desc='이벤트, 프로그램 등 마케팅 정보 수신 동의'
              checked={profile.marketingConsent ?? false}
            />
            <PrivacyToggle
              title='개인정보 처리 동의'
              desc='서비스 이용을 위한 개인정보 처리 동의 (필수)'
              checked={profile.dataProcessingConsent ?? false}
              disabled
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SettingDescription({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className='font-medium'>{title}</div>
      <div className='text-sm text-muted-foreground'>{desc}</div>
    </div>
  )
}

function PrivacyToggle({
  title,
  desc,
  checked,
  disabled,
}: {
  title: string
  desc: string
  checked: boolean
  disabled?: boolean
}) {
  return (
    <div className='flex items-center justify-between'>
      <SettingDescription title={title} desc={desc} />
      <Checkbox checked={checked} disabled={disabled} />
    </div>
  )
}
