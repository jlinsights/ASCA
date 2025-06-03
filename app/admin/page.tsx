'use client'

import React, { useMemo, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
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
  Image,
  RefreshCw,
  Loader2,
  Folder
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { useAdminStats } from '@/hooks/useAdminStats'

// 통계 카드 컴포넌트 분리 및 최적화
const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLoading 
}: { 
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  isLoading: boolean
}) => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
))

StatCard.displayName = 'StatCard'

// 빠른 액션 버튼 컴포넌트
const QuickActionButton = React.memo(({ 
  href, 
  icon: Icon, 
  title, 
  color, 
  disabled = false 
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  color: string
  disabled?: boolean
}) => {
  const buttonContent = (
    <Button 
      className={`w-full justify-start ${color} ${disabled ? 'opacity-50' : ''}`} 
      variant="outline" 
      disabled={disabled}
    >
      <Icon className="h-4 w-4 mr-2" />
      {title}
    </Button>
  )

  if (disabled) {
    return buttonContent
  }

  return (
    <Link href={href} prefetch={true}>
      {buttonContent}
    </Link>
  )
})

QuickActionButton.displayName = 'QuickActionButton'

export default function AdminDashboard() {
  const { language } = useLanguage()
  const { stats, isLoading, error, mutate } = useAdminStats()

  // 통계 카드 설정 메모이제이션
  const statCards = useMemo(() => [
    {
      title: language === 'ko' ? '공지사항' : 'Notices',
      value: stats?.notices || 0,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: language === 'ko' ? '전시회' : 'Exhibitions', 
      value: stats?.exhibitions || 0,
      icon: Star,
      color: 'text-amber-600'
    },
    {
      title: language === 'ko' ? '행사' : 'Events',
      value: stats?.events || 0,
      icon: Calendar,
      color: 'text-emerald-600'
    },
    {
      title: language === 'ko' ? '작가' : 'Artists',
      value: stats?.artists || 0,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: language === 'ko' ? '작품' : 'Artworks',
      value: stats?.artworks || 0,
      icon: Palette,
      color: 'text-pink-600'
    },
    {
      title: language === 'ko' ? '파일' : 'Files',
      value: stats?.files || 0,
      icon: Folder,
      color: 'text-indigo-600'
    },
    {
      title: language === 'ko' ? '총 조회수' : 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'text-orange-600'
    },
    {
      title: language === 'ko' ? '시스템 상태' : 'System Status',
      value: language === 'ko' ? '정상' : 'Normal',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ], [stats, language])

  // 빠른 액션 버튼 설정 메모이제이션
  const quickActions = useMemo(() => [
    {
      href: '/admin/notices/new',
      icon: FileText,
      title: language === 'ko' ? '새 공지사항' : 'New Notice',
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
    },
    {
      href: '/admin/exhibitions/new',
      icon: Star,
      title: language === 'ko' ? '새 전시회' : 'New Exhibition',
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
    },
    {
      href: '/admin/events/new',
      icon: Calendar,
      title: language === 'ko' ? '새 행사' : 'New Event',
      color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
    },
    {
      href: '/admin/artists/new',
      icon: Users,
      title: language === 'ko' ? '새 작가' : 'New Artist',
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
    },
    {
      href: '/admin/artworks/new',
      icon: Palette,
      title: language === 'ko' ? '새 작품' : 'New Artwork',
      color: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:hover:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800'
    },
    {
      href: '/admin/migration',
      icon: RefreshCw,
      title: language === 'ko' ? 'Airtable 마이그레이션' : 'Airtable Migration',
      color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:hover:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800'
    }
  ], [language])

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <AdminLayout currentPage="migration">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'ko' ? '관리자 대시보드' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ko' 
              ? '사이트 전체를 관리하고 모니터링하세요.' 
              : 'Manage and monitor your entire site.'
            }
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {language === 'ko' ? '새로고침' : 'Refresh'}
        </Button>
      </div>

      {/* 빠른 액션 */}
      <Card className="mb-8 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {language === 'ko' ? '빠른 액션' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                href={action.href}
                icon={action.icon}
                title={action.title}
                color={action.color}
              />
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/20">
            <QuickActionButton
              href=""
              icon={Folder}
              title={language === 'ko' ? '새 파일 (준비중)' : 'New File (Coming Soon)'}
              color="bg-indigo-50/50 hover:bg-indigo-50/50 text-indigo-700/50 border-indigo-200/50 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/30 dark:text-indigo-300/50 dark:border-indigo-800/50"
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* 마이그레이션 상태 카드 */}
      <Card className="mb-8 border-cyan-200 bg-cyan-50/50 dark:border-cyan-800 dark:bg-cyan-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-600" />
            {language === 'ko' ? 'Airtable 마이그레이션' : 'Airtable Migration'}
            <Badge variant="outline" className="ml-2 text-cyan-700 border-cyan-300">
              {language === 'ko' ? '사용 가능' : 'Available'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'ko' 
                  ? 'Airtable의 Artists, Artworks, Exhibitions 데이터를 Supabase로 안전하게 마이그레이션할 수 있습니다.' 
                  : 'Safely migrate Artists, Artworks, and Exhibitions data from Airtable to Supabase.'
                }
              </p>
              <div className="flex gap-2">
                <Link href="/admin/migration">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '마이그레이션 시작' : 'Start Migration'}
                  </Button>
                </Link>
                <Link href="/admin/migration">
                  <Button variant="outline" className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
                    <Database className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '상태 확인' : 'Check Status'}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-600 mb-1">
                {language === 'ko' ? '직접 API 연동' : 'Direct API Integration'}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ko' ? '무료 마이그레이션' : 'Free Migration'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* 에러 표시 */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">
                  {language === 'ko' ? '데이터 로드 오류' : 'Data Load Error'}
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                {language === 'ko' ? '다시 시도' : 'Retry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 관리 메뉴 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 콘텐츠 관리 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {language === 'ko' ? '콘텐츠 관리' : 'Content Management'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/notices" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <FileText className="h-4 w-4 mr-2" />
                {language === 'ko' ? '공지사항 관리' : 'Manage Notices'}
              </Button>
            </Link>
            <Link href="/admin/exhibitions" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <Star className="h-4 w-4 mr-2" />
                {language === 'ko' ? '전시회 관리' : 'Manage Exhibitions'}
              </Button>
            </Link>
            <Link href="/admin/events" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <Calendar className="h-4 w-4 mr-2" />
                {language === 'ko' ? '행사 관리' : 'Manage Events'}
              </Button>
            </Link>
            <Link href="/admin/files" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <Folder className="h-4 w-4 mr-2" />
                {language === 'ko' ? '파일 관리' : 'Manage Files'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 사용자 및 작품 관리 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              {language === 'ko' ? '사용자 및 작품 관리' : 'Users & Artworks'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/artists" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <Users className="h-4 w-4 mr-2" />
                {language === 'ko' ? '작가 관리' : 'Manage Artists'}
              </Button>
            </Link>
            <Link href="/admin/artworks" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <Palette className="h-4 w-4 mr-2" />
                {language === 'ko' ? '작품 관리' : 'Manage Artworks'}
              </Button>
            </Link>
            <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost" disabled>
              <Shield className="h-4 w-4 mr-2" />
              {language === 'ko' ? '사용자 관리 (준비중)' : 'Manage Users (Coming Soon)'}
            </Button>
            <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost" disabled>
              <BarChart3 className="h-4 w-4 mr-2" />
              {language === 'ko' ? '분석 (준비중)' : 'Analytics (Coming Soon)'}
            </Button>
          </CardContent>
        </Card>

        {/* 시스템 관리 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600" />
              {language === 'ko' ? '시스템 관리' : 'System Management'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/migration" prefetch={true}>
              <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost">
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'ko' ? 'Airtable 마이그레이션' : 'Airtable Migration'}
              </Button>
            </Link>
            <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost" disabled>
              <Database className="h-4 w-4 mr-2" />
              {language === 'ko' ? '데이터베이스 관리 (준비중)' : 'Database Management (Coming Soon)'}
            </Button>
            <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost" disabled>
              <Download className="h-4 w-4 mr-2" />
              {language === 'ko' ? '백업 & 복원 (준비중)' : 'Backup & Restore (Coming Soon)'}
            </Button>
            <Button className="w-full justify-start hover:bg-accent/50 text-sm" variant="ghost" disabled>
              <Shield className="h-4 w-4 mr-2" />
              {language === 'ko' ? '보안 설정 (준비중)' : 'Security Settings (Coming Soon)'}
            </Button>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              {language === 'ko' ? '최근 활동' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.type} • {activity.date}
                        {activity.author && ` • ${activity.author}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === 'ko' ? '최근 활동이 없습니다.' : 'No recent activity.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 