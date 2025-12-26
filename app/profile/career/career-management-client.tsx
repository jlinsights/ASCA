'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Calendar, Award, GraduationCap, BookOpen, Newspaper, MapPin, Users } from 'lucide-react'
import { Timeline } from '@/components/career/timeline'
import { 
  fetchCareerEntries, 
  deleteCareerEntry, 
  toggleCareerFeatured,
  getCareerSummary
} from '@/lib/api/career'
import { getSupabaseClient } from '@/lib/supabase'
import type { CareerEntry, TimelineFilters, TimelineView, CareerEntryType } from '@/types/career'
import { CAREER_ENTRY_TYPE_LABELS } from '@/types/career'

export function CareerManagementClient() {
  const router = useRouter()
  const [entries, setEntries] = useState<CareerEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<CareerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)
  
  const [filters, setFilters] = useState<TimelineFilters>({})
  const [view, setView] = useState<TimelineView>({
    groupBy: 'year',
    sortOrder: 'desc',
    showImages: true
  })

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        router.push('/login')
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      
      // Fetch career entries
      const { data: careerData, error } = await fetchCareerEntries(user.id)
      
      if (careerData) {
        setEntries(careerData)
        setFilteredEntries(careerData)
      }
      
      // Fetch summary
      const { data: summaryData } = await getCareerSummary(user.id)
      if (summaryData) {
        setSummary(summaryData)
      }
      
      setLoading(false)
    }

    loadData()
  }, [router])

  // Apply filters
  useEffect(() => {
    let filtered = [...entries]
    
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(e => filters.types!.includes(e.type))
    }
    
    if (filters.yearRange) {
      filtered = filtered.filter(e => 
        e.year >= filters.yearRange!.start && e.year <= filters.yearRange!.end
      )
    }
    
    if (filters.isFeatured !== undefined) {
      filtered = filtered.filter(e => e.isFeatured === filters.isFeatured)
    }
    
    setFilteredEntries(filtered)
  }, [entries, filters])

  const handleDelete = async (entryId: string) => {
    if (!confirm('이 이력을 삭제하시겠습니까?')) return
    
    const { error } = await deleteCareerEntry(entryId)
    
    if (error) {
      alert('삭제에 실패했습니다.')
    } else {
      setEntries(entries.filter(e => e.id !== entryId))
    }
  }

  const handleToggleFeatured = async (entryId: string) => {
    const { data, error } = await toggleCareerFeatured(entryId)
    
    if (error) {
      alert('대표작 설정에 실패했습니다.')
    } else if (data) {
      setEntries(entries.map(e => e.id === entryId ? data : e))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-celadon-green mb-4" />
          <p className="text-muted-foreground">이력을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  이력 관리
                </h1>
                <p className="text-muted-foreground">
                  전시, 수상, 학력 등 작가 이력을 관리하세요
                </p>
              </div>
              <Button 
                className="bg-celadon-green hover:bg-celadon-green/90 text-ink-black"
                onClick={() => router.push('/profile/career/add')}
              >
                <Plus className="w-4 h-4 mr-2" />
                이력 추가
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-celadon-green">{summary.exhibitions || 0}</p>
                      <p className="text-sm text-muted-foreground">전시</p>
                    </div>
                    <Calendar className="w-8 h-8 text-celadon-green/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-temple-gold">{summary.awards || 0}</p>
                      <p className="text-sm text-muted-foreground">수상</p>
                    </div>
                    <Award className="w-8 h-8 text-temple-gold/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-scholar-red">{summary.education || 0}</p>
                      <p className="text-sm text-muted-foreground">학력</p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-scholar-red/30" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-ink-black">{summary.total_entries || 0}</p>
                      <p className="text-sm text-muted-foreground">전체</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-ink-black/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif">필터 & 보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">그룹화</label>
                  <Select
                    value={view.groupBy}
                    onValueChange={(value) => setView({ ...view, groupBy: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">연도별</SelectItem>
                      <SelectItem value="type">타입별</SelectItem>
                      <SelectItem value="chronological">시간순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">정렬</label>
                  <Select
                    value={view.sortOrder}
                    onValueChange={(value) => setView({ ...view, sortOrder: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">최신순</SelectItem>
                      <SelectItem value="asc">오래된순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">이미지 표시</label>
                  <Select
                    value={view.showImages ? 'yes' : 'no'}
                    onValueChange={(value) => setView({ ...view, showImages: value === 'yes' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">표시</SelectItem>
                      <SelectItem value="no">숨김</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for filtering by type */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger 
                value="all"
                onClick={() => setFilters({ ...filters, types: undefined })}
              >
                전체
              </TabsTrigger>
              {Object.entries(CAREER_ENTRY_TYPE_LABELS).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  onClick={() => setFilters({ ...filters, types: [key as CareerEntryType] })}
                >
                  {label.ko}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Timeline */}
          <Timeline
            entries={filteredEntries}
            view={view}
            onEdit={(entry) => router.push(`/profile/career/edit/${entry.id}`)}
            onDelete={handleDelete}
            onToggleFeatured={handleToggleFeatured}
            showActions={true}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
