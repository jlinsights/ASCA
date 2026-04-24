'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MemberProfile, CalligraphyStyle } from '@/lib/types/membership'
import { styleNames } from '../mock-data'

interface CalligraphyTabProps {
  profile: MemberProfile
}

export function CalligraphyTab({ profile }: CalligraphyTabProps) {
  const specializations = profile.specializations ? JSON.parse(profile.specializations) : []
  const certifications = profile.certifications ? JSON.parse(profile.certifications) : []
  const education = profile.educationBackground ? JSON.parse(profile.educationBackground) : {}

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>서예 경력</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground'>서예 경력</div>
                <div className='text-2xl font-bold text-blue-600'>
                  {profile.calligraphyExperience}년
                </div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>교육 경력</div>
                <div className='text-2xl font-bold text-green-600'>
                  {profile.teachingExperience}년
                </div>
              </div>
            </div>

            <div>
              <div className='text-sm text-muted-foreground mb-2'>전문 서체</div>
              <div className='flex flex-wrap gap-2'>
                {specializations.map((style: CalligraphyStyle) => (
                  <Badge key={style} className='bg-primary/10 text-primary'>
                    {styleNames[style]}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className='text-sm text-muted-foreground mb-2'>문화적 배경</div>
              <p className='text-sm'>{profile.culturalBackground}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>보유 인증서</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {certifications.map((cert: any, index: number) => (
                <div key={index} className='p-3 border border-border rounded-lg'>
                  <div className='font-medium'>{cert.name}</div>
                  <div className='text-sm text-muted-foreground'>{cert.issuingOrganization}</div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    발급일: {cert.issuedDate}
                    {cert.certificateNumber && ` • ${cert.certificateNumber}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>교육 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h4 className='font-semibold mb-3'>일반 교육</h4>
              {education.general?.map((edu: any, index: number) => (
                <div key={index} className='p-3 border border-border rounded-lg'>
                  <div className='font-medium'>{edu.institution}</div>
                  <div className='text-sm text-muted-foreground'>
                    {edu.field} • {edu.graduationYear}년 졸업
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className='font-semibold mb-3'>서예 교육</h4>
              {education.calligraphy?.map((edu: any, index: number) => (
                <div key={index} className='p-3 border border-border rounded-lg'>
                  <div className='font-medium'>{edu.institution}</div>
                  <div className='text-sm text-muted-foreground'>
                    {edu.teacher && `${edu.teacher} • `}
                    {edu.startYear}-{edu.endYear} •{edu.level} 과정
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    전공: {edu.focus?.map((f: CalligraphyStyle) => styleNames[f] || f).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
