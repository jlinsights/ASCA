import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Mail, Calendar, Eye, Edit, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemberProfile } from '@/lib/types/membership'
import { membershipTiers } from './membership-data'
import { getTierInfo, getStatusBadge, getStatusText } from './membership-utils'

interface MembershipListProps {
  members: (MemberProfile & { user?: any })[]
  searchTerm: string
  setSearchTerm: (val: string) => void
  selectedTier: string
  setSelectedTier: (val: string) => void
  selectedStatus: string
  setSelectedStatus: (val: string) => void
}

export function MembershipList({
  members,
  searchTerm,
  setSearchTerm,
  selectedTier,
  setSelectedTier,
  selectedStatus,
  setSelectedStatus,
}: MembershipListProps) {
  return (
    <div className='space-y-6'>
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
                        <Badge className={cn('text-xs px-2 py-0', getStatusBadge(member.status))}>
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
                      <div className='text-sm font-medium mb-1'>{member.profileCompleteness}%</div>
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
    </div>
  )
}
