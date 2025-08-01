'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  Palette,
  Target,
  Zap,
  BookOpen,
  Clock,
  Award,
  BarChart3
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { 
  CalligraphyAnalysis,
  CalligraphyStyle,
  ImagePreprocessingConfig,
  AnalysisConfig
} from '@/lib/ai-vision/types'

const CALLIGRAPHY_STYLES: { value: CalligraphyStyle; label: string; description: string }[] = [
  { value: 'kaishu', label: '해서 (楷書)', description: '정자체, 기본적이고 균형잡힌 서체' },
  { value: 'xingshu', label: '행서 (行書)', description: '흘림체의 중간 형태, 실용적' },
  { value: 'caoshu', label: '초서 (草書)', description: '흘림체, 자유롭고 역동적' },
  { value: 'lishu', label: '예서 (隸書)', description: '고전적이고 안정감 있는 서체' },
  { value: 'zhuanshu', label: '전서 (篆書)', description: '가장 오래된 형태의 서체' },
  { value: 'modern', label: '현대서예', description: '현대적 해석과 표현' },
  { value: 'traditional', label: '전통서예', description: '전통적 기법과 양식' }
]

interface AnalysisProgress {
  step: string
  progress: number
  message: string
}

export function CalligraphyAnalyzer() {
  const [images, setImages] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState<CalligraphyStyle>('kaishu')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null)
  const [analysis, setAnalysis] = useState<CalligraphyAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 이미지 업로드 처리
  const handleImageUpload = useCallback(async (files: File[]): Promise<string[]> => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/ai-vision/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('이미지 업로드에 실패했습니다')
        }
        
        const data = await response.json()
        return data.imageUrl
      })
      
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error('이미지 업로드 중 오류가 발생했습니다')
    }
  }, [])

  // 분석 시작
  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast({
        title: "이미지를 업로드해 주세요",
        description: "분석할 서예 작품 이미지가 필요합니다.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress({ step: 'preprocessing', progress: 0, message: '이미지 전처리 중...' })
    setAnalysis(null)
    setError(null)

    try {
      // 분석 요청
      const response = await fetch('/api/ai-vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: images[0], // 첫 번째 이미지 분석
          style: selectedStyle,
          config: {
            strokeDetection: {
              sensitivity: 0.8,
              minStrokeLength: 10,
              maxGapDistance: 15
            },
            characterRecognition: {
              enabled: true,
              confidence: 0.7
            },
            styleClassification: {
              enabled: true,
              styles: [selectedStyle]
            },
            feedbackLevel: 'detailed'
          } as AnalysisConfig
        })
      })

      if (!response.ok) {
        throw new Error('분석 처리에 실패했습니다')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다')
      }

      setAnalysis(data.analysis)
      toast({
        title: "분석 완료",
        description: "서예 작품 분석이 성공적으로 완료되었습니다."
      })

    } catch (error) {
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다')
      toast({
        title: "분석 실패",
        description: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다',
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(null)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* 이미지 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            작품 업로드
          </CardTitle>
          <CardDescription>
            분석할 서예 작품의 사진을 업로드하고 서체를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiImageUpload
            value={images}
            onChange={setImages}
            onUpload={handleImageUpload}
            maxFiles={1}
            showPreview={true}
            previewSize={200}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">서체 선택</label>
            <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as CalligraphyStyle)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="서체를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CALLIGRAPHY_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || images.length === 0}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                분석 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 분석 진행상황 */}
      {analysisProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{analysisProgress.message}</span>
                <span>{analysisProgress.progress}%</span>
              </div>
              <Progress value={analysisProgress.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 분석 결과 */}
      {analysis && (
        <div className="space-y-6">
          {/* 종합 점수 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                종합 평가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {analysis.overall.score}점
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {CALLIGRAPHY_STYLES.find(s => s.value === analysis.overall.style)?.label} · 
                    신뢰도 {Math.round(analysis.overall.confidence * 100)}%
                  </div>
                </div>
                <Badge variant={getScoreVariant(analysis.overall.score)} className="text-lg px-3 py-1">
                  {analysis.overall.score >= 80 ? '우수' : 
                   analysis.overall.score >= 60 ? '양호' : '개선필요'}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {analysis.feedback.overall}
              </div>
            </CardContent>
          </Card>

          {/* 상세 분석 결과 */}
          <Tabs defaultValue="technique" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="technique" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                기법
              </TabsTrigger>
              <TabsTrigger value="composition" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                구성
              </TabsTrigger>
              <TabsTrigger value="strokes" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                붓질
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                피드백
              </TabsTrigger>
            </TabsList>

            <TabsContent value="technique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>기법 분석</CardTitle>
                  <CardDescription>붓 조절력, 먹의 농담, 붓질 품질, 리듬감을 분석합니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>붓 조절력</span>
                        <span className={getScoreColor(analysis.technique.brushControl)}>
                          {analysis.technique.brushControl}점
                        </span>
                      </div>
                      <Progress value={analysis.technique.brushControl} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>먹의 농담</span>
                        <span className={getScoreColor(analysis.technique.inkFlow)}>
                          {analysis.technique.inkFlow}점
                        </span>
                      </div>
                      <Progress value={analysis.technique.inkFlow} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>붓질 품질</span>
                        <span className={getScoreColor(analysis.technique.strokeQuality)}>
                          {analysis.technique.strokeQuality}점
                        </span>
                      </div>
                      <Progress value={analysis.technique.strokeQuality} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>리듬 일관성</span>
                        <span className={getScoreColor(analysis.technique.rhythmConsistency)}>
                          {analysis.technique.rhythmConsistency}점
                        </span>
                      </div>
                      <Progress value={analysis.technique.rhythmConsistency} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="composition" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>구성 분석</CardTitle>
                  <CardDescription>균형감, 간격, 비례, 정렬 상태를 분석합니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>균형감</span>
                        <span className={getScoreColor(analysis.composition.balance)}>
                          {analysis.composition.balance}점
                        </span>
                      </div>
                      <Progress value={analysis.composition.balance} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>간격</span>
                        <span className={getScoreColor(analysis.composition.spacing)}>
                          {analysis.composition.spacing}점
                        </span>
                      </div>
                      <Progress value={analysis.composition.spacing} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>비례</span>
                        <span className={getScoreColor(analysis.composition.proportion)}>
                          {analysis.composition.proportion}점
                        </span>
                      </div>
                      <Progress value={analysis.composition.proportion} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>정렬</span>
                        <span className={getScoreColor(analysis.composition.alignment)}>
                          {analysis.composition.alignment}점
                        </span>
                      </div>
                      <Progress value={analysis.composition.alignment} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strokes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>붓질 상세 분석</CardTitle>
                  <CardDescription>감지된 {analysis.strokes.length}개 붓질의 상세 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.strokes.slice(0, 5).map((stroke, index) => (
                      <div key={stroke.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">붓질 {index + 1}</span>
                          <Badge variant="outline">
                            {stroke.strokeType === 'horizontal' ? '橫' :
                             stroke.strokeType === 'vertical' ? '竪' :
                             stroke.strokeType === 'dot' ? '點' :
                             stroke.strokeType === 'sweep_left' ? '撇' :
                             stroke.strokeType === 'sweep_right' ? '捺' :
                             stroke.strokeType === 'hook' ? '鉤' :
                             stroke.strokeType === 'turn' ? '折' : '彎'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>길이: {Math.round(stroke.length)}px</div>
                          <div>곡률: {(stroke.curvature * 100).toFixed(1)}%</div>
                          <div>평균 압력: {(stroke.pressure.average * 100).toFixed(1)}%</div>
                          <div>평균 속도: {stroke.speed.average.toFixed(1)}px/ms</div>
                        </div>
                      </div>
                    ))}
                    {analysis.strokes.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... 및 {analysis.strokes.length - 5}개 더
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-4">
              <div className="space-y-4">
                {/* 강점 */}
                {analysis.feedback.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        강점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 개선점 */}
                {analysis.feedback.improvements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <TrendingUp className="h-5 w-5" />
                        개선점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 연습 권장사항 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      연습 계획
                    </CardTitle>
                    <CardDescription>
                      {analysis.feedback.practiceRecommendations.timeframe}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">권장 연습</h4>
                        <ul className="space-y-1">
                          {analysis.feedback.practiceRecommendations.exercises.map((exercise, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">집중 영역</h4>
                        <ul className="space-y-1">
                          {analysis.feedback.practiceRecommendations.focusAreas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}