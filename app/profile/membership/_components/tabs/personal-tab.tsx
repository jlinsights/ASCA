'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MemberProfile } from '@/lib/types/membership'

interface PersonalTabProps {
  profile: MemberProfile
  isEditing: boolean
  editForm: Partial<MemberProfile>
  setEditForm: (form: Partial<MemberProfile>) => void
}

export function PersonalTab({ profile, isEditing, editForm, setEditForm }: PersonalTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {isEditing ? (
            <EditForm editForm={editForm} setEditForm={setEditForm} />
          ) : (
            <ReadOnlyInfo profile={profile} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비상 연락처</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <InfoField label='이름' value={profile.emergencyContactName || '미설정'} />
            <InfoField label='전화번호' value={profile.emergencyContactPhone || '미설정'} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function EditForm({
  editForm,
  setEditForm,
}: {
  editForm: Partial<MemberProfile>
  setEditForm: (form: Partial<MemberProfile>) => void
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <EditField
        id='fullName'
        label='한국어 이름'
        value={editForm.fullName || ''}
        onChange={v => setEditForm({ ...editForm, fullName: v })}
      />
      <EditField
        id='fullNameEn'
        label='영어 이름'
        value={editForm.fullNameEn || ''}
        onChange={v => setEditForm({ ...editForm, fullNameEn: v })}
      />
      <EditField
        id='phoneNumber'
        label='전화번호'
        value={editForm.phoneNumber || ''}
        onChange={v => setEditForm({ ...editForm, phoneNumber: v })}
      />
      <EditField
        id='alternateEmail'
        label='보조 이메일'
        type='email'
        value={editForm.alternateEmail || ''}
        onChange={v => setEditForm({ ...editForm, alternateEmail: v })}
      />
    </div>
  )
}

function EditField({
  id,
  label,
  value,
  onChange,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function ReadOnlyInfo({ profile }: { profile: MemberProfile }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='space-y-4'>
        <InfoField label='한국어 이름' value={profile.fullName} />
        <InfoField label='영어 이름' value={profile.fullNameEn ?? ''} />
        <InfoField label='생년월일' value={profile.dateOfBirth?.toLocaleDateString() ?? ''} />
        <InfoField
          label='국적'
          value={profile.nationality === 'KR' ? '대한민국' : (profile.nationality ?? '')}
        />
      </div>
      <div className='space-y-4'>
        <InfoField label='전화번호' value={profile.phoneNumber ?? ''} />
        <InfoField label='보조 이메일' value={profile.alternateEmail || '미설정'} />
        <InfoField label='주소' value={profile.address ?? ''} />
        <InfoField label='우편번호' value={profile.postalCode ?? ''} />
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='text-sm text-muted-foreground'>{label}</div>
      <div className='font-medium'>{value}</div>
    </div>
  )
}
