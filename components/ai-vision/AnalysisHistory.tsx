'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  TrendingUp, 
  BarChart3,
  Download,
  Share2,
  Trash2,
  Clock,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { CalligraphyAnalysis, CalligraphyStyle } from '@/lib/ai-vision/types'

// 모의 데이터 타입
interface AnalysisHistoryItem {
  id: string
  imageUrl: string
  analysis: CalligraphyAnalysis
  createdAt: Date
  tags?: string[]
}

// 모의 데이터
const mockHistory: AnalysisHistoryItem[] = [
  {
    id: '1',
    imageUrl: '/placeholder-calligraphy.jpg',
    analysis: {
      id: '1',
      imageUrl: '/placeholder-calligraphy.jpg',
      timestamp: Date.now(),
      overall: {
        score: 82,
        style: 'kaishu',
        confidence: 0.89,
        dimensions: { width: 800, height: 600 }
      },
      characters: [],
      strokes: [],
      composition: {
        balance: 78,
        spacing: 85,
        proportion: 80,
        alignment: 76
      },
      technique: {
        brushControl: 84,
        inkFlow: 79,
        strokeQuality: 88,
        rhythmConsistency: 77
      },
      feedback: {
        overall: '우수한 작품입니다. 기본기가 탄탄하고 표현력이 좋습니다.',
        strengths: ['붓 조절력이 뛰어남', '붓질 품질이 높음'],
        improvements: ['리듬감 개선 필요'],
        suggestions: ['일정한 속도로 연습'],
        detailed: {
          brushControl: '붓 조절이 매우 안정적입니다',
          composition: '구성이 균형잡혀 있습니다',
          technique: '전반적인 기법이 우수합니다',
          style: '해서의 특징이 잘 표현되었습니다'
        },
        practiceRecommendations: {
          exercises: ['기본 획 연습'],
          focusAreas: ['리듬감 향상'],
          timeframe: '2-3개월 심화 연습'
        }
      }
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
    tags: ['해서', '연습']
  },
  {
    id: '2',
    imageUrl: '/placeholder-calligraphy.jpg',
    analysis: {
      id: '2',
      imageUrl: '/placeholder-calligraphy.jpg',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      overall: {
        score: 74,
        style: 'xingshu',
        confidence: 0.76,
        dimensions: { width: 800, height: 600 }
      },
      characters: [],
      strokes: [],
      composition: {
        balance: 72,
        spacing: 78,
        proportion: 75,
        alignment: 71
      },
      technique: {
        brushControl: 76,
        inkFlow: 73,
        strokeQuality: 78,
        rhythmConsistency: 70
      },
      feedback: {
        overall: '양호한 작품입니다. 몇 가지 개선점을 보완하면 더 좋아질 것 같습니다.',
        strengths: ['기본적인 형태 유지'],
        improvements: ['붓 조절력 개선 필요', '리듬감 일정하지 않음'],
        suggestions: ['기본 획 연습 반복'],
        detailed: {
          brushControl: '붓 조절력이 부족합니다',
          composition: '구성에 약간의 개선이 필요합니다',
          technique: '기법 향상이 필요합니다',
          style: '행서의 특징을 더 살려보세요'
        },
        practiceRecommendations: {
          exercises: ['기본 획 연습', '농담 변화 연습'],
          focusAreas: ['붓 조절력', '리듬감'],
          timeframe: '3-6개월 집중 연습'
        }
      }
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
    tags: ['행서', '개선']
  }
]

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(mockHistory)
  const [filteredHistory, setFilteredHistory] = useState<AnalysisHistoryItem[]>(mockHistory)
  const [searchTerm, setSearchTerm] = useState('')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...history]

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.tags?.some(tag => tag.includes(searchTerm)) ||
        item.analysis.overall.style.includes(searchTerm)
      )
    }

    // 스타일 필터
    if (styleFilter !== 'all') {
      filtered = filtered.filter(item => item.analysis.overall.style === styleFilter)
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.analysis.overall.score - a.analysis.overall.score
      }
    })

    setFilteredHistory(filtered)
  }, [history, searchTerm, styleFilter, sortBy])

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
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

  const getStyleLabel = (style: CalligraphyStyle): string => {
    const styleMap = {
      kaishu: '해서',
      xingshu: '행서',
      caoshu: '초서',
      lishu: '예서',
      zhuanshu: '전서',
      modern: '현대서예',
      traditional: '전통서예'
    }
    return styleMap[style] || style
  }

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            분석 기록
          </CardTitle>
          <CardDescription>
            과거 분석 결과를 확인하고 학습 진행 상황을 추적하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="태그나 서체로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="서체 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 서체</SelectItem>
                <SelectItem value="kaishu">해서</SelectItem>
                <SelectItem value="xingshu">행서</SelectItem>
                <SelectItem value="caoshu">초서</SelectItem>
                <SelectItem value="lishu">예서</SelectItem>
                <SelectItem value="zhuanshu">전서</SelectItem>
                <SelectItem value="modern">현대서예</SelectItem>
                <SelectItem value="traditional">전통서예</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'score')}>
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜순</SelectItem>
                <SelectItem value="score">점수순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-sm text-muted-foreground">총 분석</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(history.reduce((sum, item) => sum + item.analysis.overall.score, 0) / history.length)}
                </p>
                <p className="text-sm text-muted-foreground">평균 점수</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.max(...history.map(item => item.analysis.overall.score))}
                </p>
                <p className="text-sm text-muted-foreground">최고 점수</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {history.filter(item => item.analysis.overall.score >= 80).length}
                </p>
                <p className="text-sm text-muted-foreground">우수 작품</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 분석 기록 목록 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">검색 조건에 맞는 분석 기록이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => {
            const isExpanded = expandedCards.has(item.id)
            
            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* 이미지 미리보기 */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>

                    {/* 기본 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getScoreVariant(item.analysis.overall.score)}>
                              {item.analysis.overall.score}점
                            </Badge>
                            <Badge variant="outline">
                              {getStyleLabel(item.analysis.overall.style)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              신뢰도 {Math.round(item.analysis.overall.confidence * 100)}%
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(item.createdAt, { 
                              addSuffix: true, 
                              locale: ko 
                            })}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpansion(item.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>분석 상세 결과</DialogTitle>
                                <DialogDescription>
                                  {formatDistanceToNow(item.createdAt, { 
                                    addSuffix: true, 
                                    locale: ko 
                                  })} 분석된 {getStyleLabel(item.analysis.overall.style)} 작품
                                </DialogDescription>
                              </DialogHeader>
                              
                              {/* 상세 분석 내용 */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium">붓 조절력</div>
                                    <Progress value={item.analysis.technique.brushControl} className="mt-1" />
                                    <div className="text-right text-xs text-muted-foreground mt-1">
                                      {item.analysis.technique.brushControl}점
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">먹의 농담</div>
                                    <Progress value={item.analysis.technique.inkFlow} className="mt-1" />
                                    <div className="text-right text-xs text-muted-foreground mt-1">
                                      {item.analysis.technique.inkFlow}점
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">붓질 품질</div>
                                    <Progress value={item.analysis.technique.strokeQuality} className="mt-1" />
                                    <div className="text-right text-xs text-muted-foreground mt-1">
                                      {item.analysis.technique.strokeQuality}점
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">리듬 일관성</div>
                                    <Progress value={item.analysis.technique.rhythmConsistency} className="mt-1" />
                                    <div className="text-right text-xs text-muted-foreground mt-1">
                                      {item.analysis.technique.rhythmConsistency}점
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-medium">피드백</h4>
                                  <p className="text-sm">{item.analysis.feedback.overall}</p>
                                  
                                  {item.analysis.feedback.strengths.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-green-600 text-sm">강점</h5>
                                      <ul className="text-sm space-y-1">
                                        {item.analysis.feedback.strengths.map((strength, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                            {strength}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {item.analysis.feedback.improvements.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-orange-600 text-sm">개선점</h5>
                                      <ul className="text-sm space-y-1">
                                        {item.analysis.feedback.improvements.map((improvement, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                            {improvement}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 태그 */}
                      {item.tags && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 확장된 내용 */}
                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">균형감</div>
                              <div className={`text-lg font-bold ${getScoreColor(item.analysis.composition.balance)}`}>
                                {item.analysis.composition.balance}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">간격</div>
                              <div className={`text-lg font-bold ${getScoreColor(item.analysis.composition.spacing)}`}>
                                {item.analysis.composition.spacing}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">비례</div>
                              <div className={`text-lg font-bold ${getScoreColor(item.analysis.composition.proportion)}`}>
                                {item.analysis.composition.proportion}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">정렬</div>
                              <div className={`text-lg font-bold ${getScoreColor(item.analysis.composition.alignment)}`}>
                                {item.analysis.composition.alignment}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <strong>피드백:</strong> {item.analysis.feedback.overall}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}