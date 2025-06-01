'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Download, Upload, Database, Settings, Users, Palette, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/AdminNavigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'

interface MigrationStatus {
  airtable: { artists: number; artworks: number; exhibitions: number };
  estimated_time: string;
}

interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    artists: { migrated: number; total: number };
    artworks: { migrated: number; total: number };
    exhibitions: { migrated: number; total: number };
  };
}

export default function MigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  // Airtable 상태 확인
  const checkAirtableStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/migration/check-status')
      if (response.ok) {
        const status = await response.json()
        setMigrationStatus(status)
      } else {
        setMigrationResult({
          success: false,
          message: 'Airtable 연결에 실패했습니다. API 키와 Base ID를 확인해주세요.'
        })
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Airtable 상태 확인 중 오류가 발생했습니다.'
      })
    } finally {
      setIsChecking(false)
    }
  }

  // 마이그레이션 실행
  const runMigration = async () => {
    setIsMigrating(true)
    setProgress(0)
    setCurrentStep('Artists 마이그레이션 시작...')
    
    try {
      const response = await fetch('/api/migration/migrate-all', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setMigrationResult(result)
        setProgress(100)
        setCurrentStep('마이그레이션 완료!')
      } else {
        const error = await response.json()
        setMigrationResult({
          success: false,
          message: error.message || '마이그레이션 중 오류가 발생했습니다.'
        })
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: '마이그레이션 요청 중 오류가 발생했습니다.'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <AdminNavigation currentPage="migration" />

        <main className="container mx-auto p-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Airtable → Supabase 마이그레이션</h1>
            <p className="text-muted-foreground">
              Airtable의 Artists, Artworks, Exhibitions 데이터를 Supabase로 안전하게 이전합니다.
            </p>
          </div>

          {/* 환경 설정 안내 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                환경 설정 확인
              </CardTitle>
              <CardDescription>
                마이그레이션을 시작하기 전에 다음 환경변수가 설정되어 있는지 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">AIRTABLE_API_KEY</code>
                  <span className="text-sm text-muted-foreground">- Airtable Personal Access Token</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">AIRTABLE_BASE_ID</code>
                  <span className="text-sm text-muted-foreground">- Airtable Base ID (app_xxxxxxxxx)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상태 확인 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                1단계: Airtable 상태 확인
              </CardTitle>
              <CardDescription>
                Airtable 연결 상태와 마이그레이션할 데이터 양을 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={checkAirtableStatus} 
                disabled={isChecking || isMigrating}
                className="mb-4"
              >
                {isChecking ? '확인 중...' : 'Airtable 상태 확인'}
              </Button>

              {migrationStatus && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Airtable에 성공적으로 연결되었습니다!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{migrationStatus.airtable.artists}</div>
                      <div className="text-sm text-muted-foreground">Artists</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{migrationStatus.airtable.artworks}</div>
                      <div className="text-sm text-muted-foreground">Artworks</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{migrationStatus.airtable.exhibitions}</div>
                      <div className="text-sm text-muted-foreground">Exhibitions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">예상 소요시간:</span>
                    <Badge variant="outline">{migrationStatus.estimated_time}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 마이그레이션 실행 */}
          {migrationStatus && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  2단계: 마이그레이션 실행
                </CardTitle>
                <CardDescription>
                  Airtable 데이터를 Supabase로 마이그레이션합니다. 이 과정은 되돌릴 수 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isMigrating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{currentStep}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                  
                  <Button 
                    onClick={runMigration} 
                    disabled={isMigrating || !migrationStatus}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    {isMigrating ? '마이그레이션 진행 중...' : '마이그레이션 시작'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 결과 표시 */}
          {migrationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {migrationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  마이그레이션 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={migrationResult.success ? 'border-green-200' : 'border-red-200'}>
                  <AlertDescription>{migrationResult.message}</AlertDescription>
                </Alert>

                {migrationResult.success && migrationResult.details && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-semibold">마이그레이션 상세 결과:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {migrationResult.details.artists.migrated}/{migrationResult.details.artists.total}
                        </div>
                        <div className="text-sm text-muted-foreground">Artists 마이그레이션</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {migrationResult.details.artworks.migrated}/{migrationResult.details.artworks.total}
                        </div>
                        <div className="text-sm text-muted-foreground">Artworks 마이그레이션</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {migrationResult.details.exhibitions.migrated}/{migrationResult.details.exhibitions.total}
                        </div>
                        <div className="text-sm text-muted-foreground">Exhibitions 마이그레이션</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 주의사항 */}
          <Card className="mt-6 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">⚠️ 중요 주의사항</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700 space-y-2">
              <p>• 마이그레이션은 기존 Supabase 데이터에 추가로 삽입됩니다.</p>
              <p>• 중복 실행 시 같은 데이터가 여러 번 추가될 수 있습니다.</p>
              <p>• 마이그레이션 전에 반드시 Supabase 백업을 권장합니다.</p>
              <p>• 이미지 URL은 Airtable의 원본 URL을 사용합니다.</p>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </AdminProtectedRoute>
  )
} 