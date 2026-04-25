import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import type { PendingApplication } from '@/lib/membership/admin-application-service'

interface ApplicationManagementProps {
  applications: PendingApplication[]
  appsLoading: boolean
  handleApprove: (id: string) => void
  handleReject: (id: string) => void
  handleSeed: () => void
}

export function ApplicationManagement({
  applications,
  appsLoading,
  handleApprove,
  handleReject,
  handleSeed,
}: ApplicationManagementProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>가입 신청 관리</CardTitle>
          <p className='text-muted-foreground'>
            승인 대기 중인 신규 회원 및 등급 변경 신청을 관리합니다.
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
            <p className='text-muted-foreground'>새로운 가입 신청이 있으면 여기에 표시됩니다.</p>
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
                    <p>신청일: {app.submittedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button size='sm' onClick={() => handleApprove(app.id)}>
                    승인
                  </Button>
                  <Button size='sm' variant='destructive' onClick={() => handleReject(app.id)}>
                    거절
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
