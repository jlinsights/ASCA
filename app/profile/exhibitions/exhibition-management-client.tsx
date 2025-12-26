'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Calendar, MapPin, Eye, Edit, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabaseClient } from '@/lib/supabase'
import { fetchArtistExhibitions, deleteExhibition } from '@/lib/api/exhibitions'
import type { Exhibition } from '@/types/exhibition'
import { EXHIBITION_STATUS_LABELS } from '@/types/exhibition'

export function ExhibitionManagementClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [userId, setUserId] = useState<string | null>(null)

  // Load exhibitions
  useEffect(() => {
    const loadExhibitions = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await fetchArtistExhibitions(user.id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
      })

      if (data) {
        setExhibitions(data)
        setFilteredExhibitions(data)
      }

      setLoading(false)
    }

    loadExhibitions()
  }, [router, statusFilter])

  // Statistics
  const stats = {
    total: exhibitions.length,
    upcoming: exhibitions.filter((e) => e.status === 'upcoming').length,
    current: exhibitions.filter((e) => e.status === 'current').length,
    past: exhibitions.filter((e) => e.status === 'past').length,
    featured: exhibitions.filter((e) => e.isFeatured).length,
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 전시를 삭제하시겠습니까?')) return

    const { error } = await deleteExhibition(id)
    if (error) {
      alert('전시 삭제 중 오류가 발생했습니다.')
      return
    }

    // Refresh list
    setExhibitions((prev) => prev.filter((e) => e.id !== id))
    setFilteredExhibitions((prev) => prev.filter((e) => e.id !== id))
    alert('전시가 삭제되었습니다.')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'current':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'past':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                전시 관리
              </h1>
              <p className="text-muted-foreground">
                내 전시를 관리하고 새로운 전시를 만들어보세요
              </p>
            </div>
            <Link href="/exhibitions/create">
              <Button className="bg-celadon-green hover:bg-celadon-green/90">
                <Plus className="w-4 h-4 mr-2" />
                새 전시 만들기
              </Button>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-celadon-green mb-1">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">전체 전시</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.upcoming}
                </div>
                <div className="text-sm text-muted-foreground">예정</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {stats.current}
                </div>
                <div className="text-sm text-muted-foreground">진행중</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-slate-600 mb-1">
                  {stats.past}
                </div>
                <div className="text-sm text-muted-foreground">종료</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-temple-gold mb-1">
                  {stats.featured}
                </div>
                <div className="text-sm text-muted-foreground">주요 전시</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="upcoming">예정</SelectItem>
                      <SelectItem value="current">진행중</SelectItem>
                      <SelectItem value="past">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exhibitions List */}
          {filteredExhibitions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-celadon-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-celadon-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {statusFilter === 'all' ? '등록된 전시가 없습니다' : '해당하는 전시가 없습니다'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    새로운 전시를 만들어 작품을 선보이세요
                  </p>
                  <Link href="/exhibitions/create">
                    <Button className="bg-celadon-green hover:bg-celadon-green/90">
                      <Plus className="w-4 h-4 mr-2" />
                      첫 전시 만들기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredExhibitions.map((exhibition) => (
                <Card
                  key={exhibition.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Featured Image */}
                      <div className="relative w-48 h-32 rounded overflow-hidden flex-shrink-0 bg-celadon-green/10">
                        {exhibition.featuredImageUrl ? (
                          <Image
                            src={exhibition.featuredImageUrl}
                            alt={exhibition.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-celadon-green/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-serif font-bold text-foreground">
                                {exhibition.title}
                              </h3>
                              <Badge className={getStatusColor(exhibition.status)}>
                                {EXHIBITION_STATUS_LABELS[exhibition.status as keyof typeof EXHIBITION_STATUS_LABELS]?.ko}
                              </Badge>
                              {exhibition.isFeatured && (
                                <Badge className="bg-temple-gold/20 text-temple-gold border-temple-gold/30">
                                  주요
                                </Badge>
                              )}
                            </div>
                            {exhibition.subtitle && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {exhibition.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {exhibition.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                            </span>
                          </div>
                          {exhibition.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{exhibition.venue}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{exhibition.views || 0} 조회</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/exhibitions/${exhibition.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              보기
                            </Button>
                          </Link>
                          <Link href={`/exhibitions/${exhibition.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              수정
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(exhibition.id)}
                            className="text-scholar-red hover:text-scholar-red hover:border-scholar-red"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
