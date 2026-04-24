'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Download } from 'lucide-react'
import type { PendingApplication } from '@/lib/membership/admin-application-service'
import { error as logError } from '@/lib/logging'

// Extracted Components
import { MembershipStats } from './_components/membership-stats'
import { MembershipList } from './_components/membership-list'
import { ApplicationManagement } from './_components/application-management'
import { mockStats, mockMembers } from './_components/membership-data'

export default function AdminMembershipPage() {
  const [stats] = useState(mockStats)
  const [members] = useState(mockMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // -- Application Management Logic --
  const [applications, setApplications] = useState<PendingApplication[]>([])
  const [appsLoading, setAppsLoading] = useState(false)

  const loadApplications = useCallback(async () => {
    setAppsLoading(true)
    try {
      const res = await fetch('/api/admin/membership/applications', {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const json = (await res.json()) as {
        success: boolean
        data: Array<Omit<PendingApplication, 'submittedAt'> & { submittedAt: string }>
      }
      const rows = (json.data ?? []).map(row => ({
        ...row,
        submittedAt: new Date(row.submittedAt),
      }))
      setApplications(rows)
    } catch (error) {
      logError('Failed to load applications', error instanceof Error ? error : undefined)
    } finally {
      setAppsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const handleApprove = async (id: string) => {
    if (!confirm('승인하시겠습니까?')) return
    const res = await fetch('/api/admin/membership/applications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'approve', applicationId: id }),
    })
    const data = (await res.json()) as { success: boolean }
    if (res.ok && data.success) {
      alert('승인되었습니다.')
      loadApplications()
    } else {
      alert('오류가 발생했습니다.')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('거절 사유를 입력하세요:')
    if (reason === null) return
    const res = await fetch('/api/admin/membership/applications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        op: 'reject',
        applicationId: id,
        reason: reason || 'No reason provided',
      }),
    })
    const data = (await res.json()) as { success: boolean }
    if (res.ok && data.success) {
      alert('거절되었습니다.')
      loadApplications()
    } else {
      alert('오류가 발생했습니다.')
    }
  }

  const handleSeed = async () => {
    const res = await fetch('/api/admin/membership/applications', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'seed-test' }),
    })
    const data = (await res.json()) as { success: boolean; error?: string }
    if (res.ok && data.success) {
      alert('테스트 신청서가 생성되었습니다.')
      loadApplications()
    } else {
      alert('생성 실패: ' + (data.error ?? res.statusText))
    }
  }

  return (
    <div className='space-y-6'>
      <section className='border-b border-border bg-muted/30 -mx-4 px-4 py-6 -mt-8 mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>회원 관리</h1>
            <p className='text-muted-foreground'>ASCA 회원 정보 관리 및 통계</p>
          </div>
          <div className='flex gap-3'>
            <Button variant='outline'>
              <Download className='w-4 h-4 mr-2' />
              회원 목록 내보내기
            </Button>
            <Button>
              <UserPlus className='w-4 h-4 mr-2' />새 회원 추가
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue='dashboard' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='dashboard'>대시보드</TabsTrigger>
          <TabsTrigger value='members'>회원 목록</TabsTrigger>
          <TabsTrigger value='applications'>가입 신청</TabsTrigger>
          <TabsTrigger value='tiers'>회원 등급</TabsTrigger>
          <TabsTrigger value='analytics'>분석</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          <MembershipStats stats={stats} />
        </TabsContent>

        <TabsContent value='members' className='space-y-6'>
          <MembershipList
            members={members}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        </TabsContent>

        <TabsContent value='applications'>
          <ApplicationManagement
            applications={applications}
            appsLoading={appsLoading}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleSeed={handleSeed}
          />
        </TabsContent>

        <TabsContent value='tiers'>
          <div className='p-8 text-center text-muted-foreground'>등급 관리 기능 준비 중...</div>
        </TabsContent>

        <TabsContent value='analytics'>
          <div className='p-8 text-center text-muted-foreground'>상세 분석 기능 준비 중...</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
