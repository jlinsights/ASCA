'use client'

import { useState } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Sparkles, FileText, Award } from 'lucide-react'
import type {
  CulturalExchangeProgramInfo,
  CulturalProgramType,
  CulturalProgramStatus,
} from '@/lib/types/membership'

// Extracted Components & Data
import { ProgramCard } from './_components/program-card'
import { ProgramDetailModal } from './_components/program-detail-modal'
import { mockPrograms, programTypeConfig, statusConfig } from './_components/program-data'

export default function CulturalExchangePage() {
  const [programs] = useState<CulturalExchangeProgramInfo[]>(mockPrograms)
  const [selectedProgram, setSelectedProgram] = useState<CulturalExchangeProgramInfo | null>(null)
  const [filterType, setFilterType] = useState<CulturalProgramType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<CulturalProgramStatus | 'all'>('all')

  const filteredPrograms = programs.filter(program => {
    if (filterType !== 'all' && program.programType !== filterType) return false
    if (filterStatus !== 'all' && program.status !== filterStatus) return false
    return true
  })

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'>
        <div className='container mx-auto px-4 py-16'>
          <div className='text-center max-w-3xl mx-auto'>
            <div className='flex items-center justify-center gap-3 mb-6'>
              <Globe className='w-8 h-8 text-blue-600' />
              <h1 className='text-4xl md:text-5xl font-bold'>문화교류 프로그램</h1>
              <Sparkles className='w-8 h-8 text-purple-600' />
            </div>
            <p className='text-lg md:text-xl text-muted-foreground mb-8'>
              세계 각국의 서예 전통을 배우고, 국제적인 예술가 네트워크를 구축하세요
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600 mb-2'>{programs.length}</div>
                <div className='text-sm text-muted-foreground'>진행 프로그램</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600 mb-2'>
                  {programs.filter(p => p.status === 'open_for_applications').length}
                </div>
                <div className='text-sm text-muted-foreground'>모집 중</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-purple-600 mb-2'>
                  {programs.reduce((sum, p) => sum + p.currentParticipants, 0)}
                </div>
                <div className='text-sm text-muted-foreground'>총 참가자</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='container mx-auto px-4 py-8'>
        <Tabs defaultValue='programs' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='programs'>프로그램 목록</TabsTrigger>
            <TabsTrigger value='my-applications'>내 신청 현황</TabsTrigger>
            <TabsTrigger value='certificates'>수료증</TabsTrigger>
          </TabsList>

          <TabsContent value='programs' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>프로그램 필터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-4'>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>프로그램 유형</label>
                    <select
                      className='px-3 py-2 border border-border rounded-md bg-background'
                      value={filterType}
                      onChange={e => setFilterType(e.target.value as any)}
                    >
                      <option value='all'>전체</option>
                      {Object.entries(programTypeConfig).map(([type, config]) => (
                        <option key={type} value={type}>
                          {config.icon} {config.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>모집 상태</label>
                    <select
                      className='px-3 py-2 border border-border rounded-md bg-background'
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value as any)}
                    >
                      <option value='all'>전체</option>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {filteredPrograms.map(program => (
                <ProgramCard key={program.id} program={program} onSelect={setSelectedProgram} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value='my-applications'>
            <Card>
              <CardHeader>
                <CardTitle>신청 현황</CardTitle>
                <p className='text-muted-foreground'>
                  내가 신청한 문화교류 프로그램의 진행 상황을 확인하세요.
                </p>
              </CardHeader>
              <CardContent>
                <div className='text-center py-12'>
                  <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>아직 신청한 프로그램이 없습니다</h3>
                  <p className='text-muted-foreground mb-4'>
                    관심 있는 문화교류 프로그램에 신청해 보세요.
                  </p>
                  <Button onClick={() => setFilterType('all')}>프로그램 둘러보기</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='certificates'>
            <Card>
              <CardHeader>
                <CardTitle>수료증</CardTitle>
                <p className='text-muted-foreground'>
                  완료한 문화교류 프로그램의 수료증을 다운로드하실 수 있습니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className='text-center py-12'>
                  <Award className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>보유한 수료증이 없습니다</h3>
                  <p className='text-muted-foreground'>
                    문화교류 프로그램을 완료하면 수료증이 발급됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProgramDetailModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />

      <LayoutFooter />
    </div>
  )
}
