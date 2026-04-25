import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, AlertCircle, Activity, TrendingUp } from 'lucide-react'
import type { MembershipDashboardStats } from '@/lib/types/membership'
import { membershipTiers } from './membership-data'
import { getStatusBadge, getStatusText } from './membership-utils'

interface MembershipStatsProps {
  stats: MembershipDashboardStats
}

export function MembershipStats({ stats }: MembershipStatsProps) {
  return (
    <div className='space-y-6'>
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
                      <span className='text-muted-foreground ml-1'>({percentage.toFixed(1)}%)</span>
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
                    <span className='text-muted-foreground ml-1'>({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
