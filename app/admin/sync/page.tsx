'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Square, 
  RefreshCw, 
  Activity, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  ArrowLeftRight
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/AdminNavigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'

interface SyncStatus {
  success: boolean
  sync_status: {
    last_24h: {
      total: number
      success: number
      failed: number
      pending: number
    }
    recent_logs: any[]
  }
  data_counts: {
    artists: number
    artworks: number
  }
}

export default function SyncManagementPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncInterval, setSyncInterval] = useState(60000) // 1분

  // 동기화 상태 조회
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status')
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      } else {
        setError('동기화 상태 조회에 실패했습니다.')
      }
    } catch (err) {
      setError('동기화 상태 조회 중 오류가 발생했습니다.')
    }
  }

  // 동기화 엔진 시작
  const startSync = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/sync/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs: syncInterval })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('동기화 엔진이 시작되었습니다.')
        await fetchSyncStatus()
      } else {
        setError(data.error || '동기화 시작에 실패했습니다.')
      }
    } catch (err) {
      setError('동기화 시작 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 동기화 엔진 중지
  const stopSync = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/sync/stop', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('동기화 엔진이 중지되었습니다.')
        await fetchSyncStatus()
      } else {
        setError(data.error || '동기화 중지에 실패했습니다.')
      }
    } catch (err) {
      setError('동기화 중지 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 강제 동기화
  const forceSync = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/migration/migrate-all', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('강제 동기화가 완료되었습니다.')
        await fetchSyncStatus()
      } else {
        setError(data.message || '강제 동기화에 실패했습니다.')
      }
    } catch (err) {
      setError('강제 동기화 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 상태 포맷팅
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">성공</Badge>
      case 'failed':
        return <Badge variant="destructive">실패</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">대기</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 컴포넌트 마운트 시 상태 조회
  useEffect(() => {
    fetchSyncStatus()
  }, [])

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <AdminNavigation currentPage="sync" />

        <main className="container mx-auto p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">실시간 동기화 관리</h1>
            <p className="text-muted-foreground">
              Airtable과 Supabase 간의 실시간 양방향 동기화를 관리합니다.
            </p>
          </div>

          {/* 메시지 및 에러 표시 */}
          {message && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="control" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="control">제어</TabsTrigger>
              <TabsTrigger value="status">상태</TabsTrigger>
              <TabsTrigger value="logs">로그</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>

            {/* 동기화 제어 */}
            <TabsContent value="control" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5" />
                    동기화 엔진 제어
                  </CardTitle>
                  <CardDescription>
                    실시간 동기화 엔진을 시작하거나 중지할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Button 
                      onClick={startSync} 
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      동기화 시작
                    </Button>
                    
                    <Button 
                      onClick={stopSync} 
                      disabled={isLoading}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      동기화 중지
                    </Button>
                    
                    <Button 
                      onClick={forceSync} 
                      disabled={isLoading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      강제 동기화
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">동기화 간격 (밀리초)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Number(e.target.value))}
                        min="10000"
                        max="3600000"
                        step="10000"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <span className="text-sm text-muted-foreground flex items-center">
                        ({Math.round(syncInterval / 1000)}초)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 동기화 상태 */}
            <TabsContent value="status" className="space-y-6">
              {syncStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 동기화 통계 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        최근 24시간 동기화 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {syncStatus.sync_status.last_24h.total}
                          </div>
                          <div className="text-sm text-muted-foreground">총 작업</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {syncStatus.sync_status.last_24h.success}
                          </div>
                          <div className="text-sm text-muted-foreground">성공</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {syncStatus.sync_status.last_24h.failed}
                          </div>
                          <div className="text-sm text-muted-foreground">실패</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {syncStatus.sync_status.last_24h.pending}
                          </div>
                          <div className="text-sm text-muted-foreground">대기</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 데이터 개수 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Supabase 데이터 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Artists</span>
                          <Badge variant="outline" className="bg-blue-50">
                            {syncStatus.data_counts.artists.toLocaleString()}개
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Artworks</span>
                          <Badge variant="outline" className="bg-green-50">
                            {syncStatus.data_counts.artworks.toLocaleString()}개
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* 동기화 로그 */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    최근 동기화 로그
                  </CardTitle>
                  <CardDescription>
                    최근 동기화 작업의 상세 로그를 확인할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {syncStatus?.sync_status.recent_logs && syncStatus.sync_status.recent_logs.length > 0 ? (
                    <div className="space-y-3">
                      {syncStatus.sync_status.recent_logs.map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(log.status)}
                            <span className="font-medium">{log.operation}</span>
                            <span className="text-sm text-muted-foreground">{log.table_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      동기화 로그가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 설정 */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    동기화 설정
                  </CardTitle>
                  <CardDescription>
                    동기화 동작을 세부적으로 설정할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">지원되는 동기화 유형</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">스키마 동기화 (필드 추가/삭제)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">데이터 동기화 (레코드 생성/수정/삭제)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">실시간 변경 감지 (개발 중)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">충돌 해결 (개발 중)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">필드 매핑</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Name (Korean) → name_korean</div>
                        <div>• Name (Chinese) → name_chinese</div>
                        <div>• Phone → phone</div>
                        <div>• Email → email</div>
                        <div>• DOB → date_of_birth</div>
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription>
                        <strong>주의:</strong> 동기화는 Airtable을 소스로 하여 Supabase로 데이터를 전송합니다. 
                        Supabase에서 직접 수정한 데이터는 다음 동기화 시 덮어씌워질 수 있습니다.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </AdminProtectedRoute>
  )
} 