'use client'

import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MemberProfile, MembershipTierInfo } from '@/lib/types/membership'

interface MembershipTabProps {
  profile: MemberProfile
  tierInfo: MembershipTierInfo
}

export function MembershipTab({ profile, tierInfo }: MembershipTabProps) {
  const history = profile.membershipHistory ? JSON.parse(profile.membershipHistory) : []
  const payments = profile.paymentHistory ? JSON.parse(profile.paymentHistory) : []

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>현재 멤버십</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='text-3xl'>{tierInfo.icon}</div>
              <div>
                <div className='font-semibold text-lg' style={{ color: tierInfo.color }}>
                  {tierInfo.nameKo}
                </div>
                <div className='text-sm text-muted-foreground'>{tierInfo.nameEn}</div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 text-center'>
              <div className='p-3 border border-border rounded-lg'>
                <div className='text-lg font-bold'>Level {profile.tierLevel}</div>
                <div className='text-xs text-muted-foreground'>멤버십 등급</div>
              </div>
              <div className='p-3 border border-border rounded-lg'>
                <div className='text-lg font-bold'>₩{tierInfo.annualFee.toLocaleString()}</div>
                <div className='text-xs text-muted-foreground'>연회비</div>
              </div>
            </div>

            <div>
              <div className='text-sm text-muted-foreground mb-2'>회원번호</div>
              <div className='font-mono text-lg'>{profile.membershipNumber}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>멤버십 이력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {history.map((entry: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-3 border border-border rounded-lg'
                >
                  <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                    <TrendingUp className='h-4 w-4 text-blue-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-sm'>{resolveActionLabel(entry.action)}</div>
                    <div className='text-xs text-muted-foreground'>
                      {entry.date}
                      {entry.fromTier &&
                        entry.toTier &&
                        ` • Lv.${entry.fromTier} → Lv.${entry.toTier}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회비 납부 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {payments.map((payment: any, index: number) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 border border-border rounded-lg'
              >
                <div>
                  <div className='font-medium'>{resolvePurposeLabel(payment.purpose)}</div>
                  <div className='text-sm text-muted-foreground'>
                    {payment.date} • {payment.paymentMethod}
                    {payment.receiptNumber && ` • ${payment.receiptNumber}`}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-bold'>₩{payment.amount.toLocaleString()}</div>
                  <Badge className={cn('text-xs', resolveStatusColor(payment.status))}>
                    {resolveStatusLabel(payment.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function resolveActionLabel(action: string): string {
  const map: Record<string, string> = {
    joined: '가입',
    upgraded: '등급 상승',
    downgraded: '등급 하락',
  }
  return map[action] || action
}

function resolvePurposeLabel(purpose: string): string {
  const map: Record<string, string> = {
    annual_fee: '연회비',
    event_fee: '이벤트 참가비',
    workshop_fee: '워크샵 참가비',
  }
  return map[purpose] || purpose
}

function resolveStatusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: '완료',
    pending: '대기',
  }
  return map[status] || status
}

function resolveStatusColor(status: string): string {
  if (status === 'completed') return 'bg-green-100 text-green-800'
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
