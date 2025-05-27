'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  Users,
  FileText,
  Calendar,
  Eye,
  Plus,
  Settings,
  Download,
  Upload,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Shield,
  Database,
  Palette,
  Image
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

// 임시 통계 데이터 (실제로는 Supabase에서 가져와야 함)
const mockStats = {
  totalNotices: 45,
  totalExhibitions: 12,
  totalEvents: 28,
  totalArtists: 156,
  totalArtworks: 342,
  totalViews: 15420,
  recentActivity: [
    {
      id: '1',
      type: 'notice' as 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork',
      action: 'created' as 'created' | 'updated' | 'published' | 'deleted',
      title: '2024년 정기전 공지사항',
      timestamp: '2024-01-15T10:30:00Z',
      user: '관리자'
    },
    {
      id: '2',
      type: 'exhibition' as 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork',
      action: 'updated' as 'created' | 'updated' | 'published' | 'deleted',
      title: '찰나의 아름다움 전시회',
      timestamp: '2024-01-14T15:45:00Z',
      user: '큐레이터'
    },
    {
      id: '3',
      type: 'artist' as 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork',
      action: 'created' as 'created' | 'updated' | 'published' | 'deleted',
      title: '김서예 작가 프로필',
      timestamp: '2024-01-14T14:20:00Z',
      user: '관리자'
    },
    {
      id: '4',
      type: 'artwork' as 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork',
      action: 'published' as 'created' | 'updated' | 'published' | 'deleted',
      title: '묵향의 정취',
      timestamp: '2024-01-14T09:20:00Z',
      user: '큐레이터'
    },
    {
      id: '5',
      type: 'event' as 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork',
      action: 'published' as 'created' | 'updated' | 'published' | 'deleted',
      title: '서예 기초 워크숍',
      timestamp: '2024-01-13T16:45:00Z',
      user: '교육팀'
    }
  ]
}

export default function AdminDashboard() {
  const { language } = useLanguage()
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4 text-emerald-500" />
      case 'updated': return <Settings className="h-4 w-4 text-blue-500" />
      case 'published': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'deleted': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notice': return <FileText className="h-4 w-4 text-blue-600" />
      case 'exhibition': return <Star className="h-4 w-4 text-amber-500" />
      case 'event': return <Calendar className="h-4 w-4 text-emerald-600" />
      case 'artist': return <Users className="h-4 w-4 text-purple-600" />
      case 'artwork': return <Palette className="h-4 w-4 text-pink-600" />
      default: return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'ko' ? '관리자 대시보드' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ko' 
              ? 'CMS 콘텐츠를 관리하고 통계를 확인하세요.'
              : 'Manage CMS content and view statistics.'
            }
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '공지사항' : 'Notices'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalNotices}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '전시회' : 'Exhibitions'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalExhibitions}</p>
                </div>
                <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/50 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+8%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '행사' : 'Events'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+15%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '작가' : 'Artists'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalArtists}</p>
                </div>
                <div className="h-12 w-12 bg-purple-50 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+5%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '작품' : 'Artworks'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalArtworks}</p>
                </div>
                <div className="h-12 w-12 bg-pink-50 dark:bg-pink-950/50 rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+18%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '파일' : 'Files'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">89</p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center">
                  <Image className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+25%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '총 조회수' : 'Total Views'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-orange-50 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+23%</span>
                <span className="text-muted-foreground ml-1">
                  {language === 'ko' ? '지난 달 대비' : 'vs last month'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 빠른 액션 */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Plus className="h-5 w-5 text-blue-600" />
                  {language === 'ko' ? '빠른 액션' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/notices/new">
                  <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '새 공지사항' : 'New Notice'}
                  </Button>
                </Link>
                <Link href="/admin/exhibitions/new">
                  <Button className="w-full justify-start bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '새 전시회' : 'New Exhibition'}
                  </Button>
                </Link>
                <Link href="/admin/events/new">
                  <Button className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '새 행사' : 'New Event'}
                  </Button>
                </Link>
                <Link href="/admin/artists/new">
                  <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '새 작가' : 'New Artist'}
                  </Button>
                </Link>
                <Link href="/admin/artworks/new">
                  <Button className="w-full justify-start bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:hover:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800" variant="outline">
                    <Palette className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '새 작품' : 'New Artwork'}
                  </Button>
                </Link>
                <div className="border-t border-border pt-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '데이터 백업' : 'Backup Data'}
                  </Button>
                  <Button className="w-full justify-start mt-2" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '데이터 복원' : 'Restore Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 관리 메뉴 */}
            <Card className="mt-6 border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5 text-slate-600" />
                  {language === 'ko' ? '관리 메뉴' : 'Management'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {language === 'ko' ? 'CMS 콘텐츠' : 'CMS Content'}
                  </p>
                  <Link href="/admin/notices">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '공지사항 관리' : 'Manage Notices'}
                    </Button>
                  </Link>
                  <Link href="/admin/exhibitions">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Star className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '전시회 관리' : 'Manage Exhibitions'}
                    </Button>
                  </Link>
                  <Link href="/admin/events">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Calendar className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '행사 관리' : 'Manage Events'}
                    </Button>
                  </Link>
                  <Link href="/admin/files">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Upload className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '파일 관리' : 'File Management'}
                    </Button>
                  </Link>
                </div>
                
                <div className="border-t border-border/30 pt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {language === 'ko' ? '작가 & 작품' : 'Artists & Artworks'}
                  </p>
                  <Link href="/admin/artists">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Users className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '작가 관리' : 'Manage Artists'}
                    </Button>
                  </Link>
                  <Link href="/admin/artworks">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Palette className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '작품 관리' : 'Manage Artworks'}
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-border/30 pt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {language === 'ko' ? '시스템' : 'System'}
                  </p>
                  <Link href="/admin/users">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <Shield className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '사용자 관리' : 'Manage Users'}
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button className="w-full justify-start hover:bg-accent/50" variant="ghost">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '분석 리포트' : 'Analytics'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 최근 활동 */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-slate-600" />
                  {language === 'ko' ? '최근 활동' : 'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 bg-accent/20 dark:bg-accent/10 rounded-lg border border-border/30">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(activity.type)}
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-border/50">
                            {language === 'ko' ? 
                              (activity.type === 'notice' ? '공지사항' :
                               activity.type === 'exhibition' ? '전시회' :
                               activity.type === 'event' ? '행사' :
                               activity.type === 'artist' ? '작가' :
                               activity.type === 'artwork' ? '작품' : activity.type) 
                              : activity.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-border/50">
                            {language === 'ko' ? 
                              (activity.action === 'created' ? '생성' :
                               activity.action === 'updated' ? '수정' :
                               activity.action === 'published' ? '발행' :
                               activity.action === 'deleted' ? '삭제' : activity.action)
                              : activity.action}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm" className="border-border/50">
                    {language === 'ko' ? '모든 활동 보기' : 'View All Activity'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Card className="mt-6 border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-slate-600" />
                  {language === 'ko' ? '시스템 상태' : 'System Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {language === 'ko' ? '데이터베이스' : 'Database'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {language === 'ko' ? '정상' : 'Healthy'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {language === 'ko' ? '스토리지' : 'Storage'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {language === 'ko' ? '정상' : 'Healthy'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {language === 'ko' ? 'API' : 'API'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {language === 'ko' ? '정상' : 'Healthy'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </AdminProtectedRoute>
  )
} 