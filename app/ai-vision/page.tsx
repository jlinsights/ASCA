'use client'

import React, { useState } from 'react'
import { CalligraphyAnalyzer } from '@/components/ai-vision/CalligraphyAnalyzer'
import { AnalysisHistory } from '@/components/ai-vision/AnalysisHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Eye, History, Zap, Target, Brain, Palette } from 'lucide-react'

export default function AIVisionPage() {
  const [activeTab, setActiveTab] = useState('analyzer')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI 서예 분석</h1>
            <p className="text-muted-foreground">
              인공지능을 활용한 서예 작품 분석 및 피드백 시스템
            </p>
          </div>
        </div>

        {/* 기능 소개 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                붓질 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zhang-Suen 알고리즘으로 붓질을 감지하고 품질을 분석합니다
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                기법 평가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                붓 조절력, 먹의 농담, 리듬감 등을 종합적으로 평가합니다
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                맞춤 피드백
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                서체별 특성을 고려한 개인화된 학습 가이드를 제공합니다
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            작품 분석
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            분석 기록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <CalligraphyAnalyzer />
        </TabsContent>

        <TabsContent value="history">
          <AnalysisHistory />
        </TabsContent>
      </Tabs>

      {/* 사용 가이드 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">사용 방법</CardTitle>
          <CardDescription>
            AI 서예 분석 시스템을 효과적으로 활용하는 방법을 안내합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="outline" className="font-mono">1</Badge>
              <div>
                <p className="font-medium">이미지 업로드</p>
                <p className="text-sm text-muted-foreground">
                  서예 작품 사진을 업로드하세요. 최소 800x600px 해상도를 권장합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="font-mono">2</Badge>
              <div>
                <p className="font-medium">서체 선택</p>
                <p className="text-sm text-muted-foreground">
                  작품의 서체(해서, 행서, 초서 등)를 선택하여 정확한 분석을 받으세요.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="font-mono">3</Badge>
              <div>
                <p className="font-medium">분석 결과 확인</p>
                <p className="text-sm text-muted-foreground">
                  붓질 품질, 구성, 기법 등에 대한 상세 분석과 개선 제안을 확인하세요.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="font-mono">4</Badge>
              <div>
                <p className="font-medium">연습 계획</p>
                <p className="text-sm text-muted-foreground">
                  AI가 추천하는 맞춤형 연습 방법을 따라 실력을 향상시키세요.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}