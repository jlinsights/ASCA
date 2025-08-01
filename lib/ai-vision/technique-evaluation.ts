// 서예 기법 평가 및 피드백 시스템

import type { 
  CalligraphyAnalysis, 
  Stroke, 
  CharacterAnalysis, 
  CalligraphyFeedback,
  CalligraphyStyle 
} from './types'
import { StrokeAnalyzer } from './stroke-detection'

export class CalligraphyTechniqueEvaluator {
  /**
   * 종합적인 서예 기법 평가
   */
  evaluateTechnique(strokes: Stroke[], style: CalligraphyStyle): {
    overall: number
    brushControl: number
    inkFlow: number
    strokeQuality: number
    rhythmConsistency: number
    feedback: CalligraphyFeedback
  } {
    const brushControl = this.evaluateBrushControl(strokes)
    const inkFlow = this.evaluateInkFlow(strokes)
    const strokeQuality = this.evaluateStrokeQuality(strokes)
    const rhythmConsistency = this.evaluateRhythmConsistency(strokes)
    
    const overall = (brushControl + inkFlow + strokeQuality + rhythmConsistency) / 4
    
    const feedback = this.generateFeedback({
      overall,
      brushControl,
      inkFlow,
      strokeQuality,
      rhythmConsistency
    }, style, strokes)
    
    return {
      overall,
      brushControl,
      inkFlow,
      strokeQuality,
      rhythmConsistency,
      feedback
    }
  }

  /**
   * 붓 조절력 평가
   */
  private evaluateBrushControl(strokes: Stroke[]): number {
    if (strokes.length === 0) return 0
    
    let totalScore = 0
    
    strokes.forEach(stroke => {
      const analysis = StrokeAnalyzer.analyzeStrokeQuality(stroke)
      
      // 붓 조절력 = 제어력 + 일관성
      const controlScore = analysis.aspects.control / 100
      const consistencyScore = analysis.aspects.consistency / 100
      const strokeControlScore = (controlScore + consistencyScore) / 2
      
      totalScore += strokeControlScore
    })
    
    return (totalScore / strokes.length) * 100
  }

  /**
   * 먹의 농담 표현 평가
   */
  private evaluateInkFlow(strokes: Stroke[]): number {
    if (strokes.length === 0) return 0
    
    let totalScore = 0
    let hasVariation = false
    
    strokes.forEach(stroke => {
      // 압력 변화로 먹의 농담 측정
      const pressureRange = stroke.pressure.max - stroke.pressure.min
      const pressureVariation = pressureRange / stroke.pressure.max
      
      if (pressureVariation > 0.3) {
        hasVariation = true
      }
      
      // 적절한 압력 변화가 있으면 높은 점수
      let score = Math.min(1, pressureVariation * 2)
      
      // 너무 극단적인 변화는 감점
      if (pressureVariation > 0.8) {
        score *= 0.7
      }
      
      totalScore += score
    })
    
    // 전체적으로 농담 변화가 없으면 감점
    if (!hasVariation && strokes.length > 1) {
      totalScore *= 0.5
    }
    
    return (totalScore / strokes.length) * 100
  }

  /**
   * 붓질 품질 평가
   */
  private evaluateStrokeQuality(strokes: Stroke[]): number {
    if (strokes.length === 0) return 0
    
    let totalScore = 0
    
    strokes.forEach(stroke => {
      const analysis = StrokeAnalyzer.analyzeStrokeQuality(stroke)
      
      // 품질 = 부드러움 + 힘
      const smoothnessScore = analysis.aspects.smoothness / 100
      const strengthScore = analysis.aspects.strength / 100
      const qualityScore = (smoothnessScore + strengthScore) / 2
      
      totalScore += qualityScore
    })
    
    return (totalScore / strokes.length) * 100
  }

  /**
   * 리듬감 일관성 평가
   */
  private evaluateRhythmConsistency(strokes: Stroke[]): number {
    if (strokes.length < 2) return 100
    
    // 1. 속도 일관성
    const speeds = strokes.map(s => s.speed.average)
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const speedVariance = speeds.reduce((a, b) => a + (b - avgSpeed) ** 2, 0) / speeds.length
    const speedConsistency = Math.max(0, 1 - Math.sqrt(speedVariance) / avgSpeed)
    
    // 2. 붓질 길이 일관성
    const lengths = strokes.map(s => s.length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const lengthVariance = lengths.reduce((a, b) => a + (b - avgLength) ** 2, 0) / lengths.length
    const lengthConsistency = Math.max(0, 1 - Math.sqrt(lengthVariance) / avgLength)
    
    // 3. 시간 간격 일관성 (붓질 사이의 간격)
    let timeConsistency = 1
    if (strokes.length > 2) {
      const intervals: number[] = []
      for (let i = 1; i < strokes.length; i++) {
        intervals.push(strokes[i].startTime - strokes[i - 1].endTime)
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const intervalVariance = intervals.reduce((a, b) => a + (b - avgInterval) ** 2, 0) / intervals.length
      timeConsistency = Math.max(0, 1 - Math.sqrt(intervalVariance) / Math.max(avgInterval, 1))
    }
    
    return ((speedConsistency + lengthConsistency + timeConsistency) / 3) * 100
  }

  /**
   * 구성 분석
   */
  analyzeComposition(strokes: Stroke[], imageWidth: number, imageHeight: number): {
    balance: number
    spacing: number
    proportion: number
    alignment: number
  } {
    return {
      balance: this.analyzeBalance(strokes, imageWidth, imageHeight),
      spacing: this.analyzeSpacing(strokes),
      proportion: this.analyzeProportion(strokes, imageWidth, imageHeight),
      alignment: this.analyzeAlignment(strokes)
    }
  }

  /**
   * 균형감 분석
   */
  private analyzeBalance(strokes: Stroke[], width: number, height: number): number {
    if (strokes.length === 0) return 0
    
    // 무게중심 계산
    let totalX = 0, totalY = 0, totalWeight = 0
    
    strokes.forEach(stroke => {
      stroke.points.forEach(point => {
        const weight = point.pressure || 1
        totalX += point.x * weight
        totalY += point.y * weight
        totalWeight += weight
      })
    })
    
    const centerX = totalX / totalWeight
    const centerY = totalY / totalWeight
    
    // 이상적인 중심 (화면의 중앙)
    const idealX = width / 2
    const idealY = height / 2
    
    // 중심점과의 거리
    const distance = Math.sqrt((centerX - idealX) ** 2 + (centerY - idealY) ** 2)
    const maxDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2)
    
    return Math.max(0, (1 - distance / maxDistance)) * 100
  }

  /**
   * 간격 분석
   */
  private analyzeSpacing(strokes: Stroke[]): number {
    if (strokes.length < 2) return 100
    
    const distances: number[] = []
    
    for (let i = 0; i < strokes.length; i++) {
      for (let j = i + 1; j < strokes.length; j++) {
        const minDistance = this.findMinimumDistance(strokes[i], strokes[j])
        distances.push(minDistance)
      }
    }
    
    // 간격의 일관성 측정
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = distances.reduce((a, b) => a + (b - avgDistance) ** 2, 0) / distances.length
    const consistency = Math.max(0, 1 - Math.sqrt(variance) / avgDistance)
    
    return consistency * 100
  }

  /**
   * 두 붓질 사이의 최소 거리
   */
  private findMinimumDistance(stroke1: Stroke, stroke2: Stroke): number {
    let minDistance = Infinity
    
    stroke1.points.forEach(p1 => {
      stroke2.points.forEach(p2 => {
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
        minDistance = Math.min(minDistance, distance)
      })
    })
    
    return minDistance
  }

  /**
   * 비례감 분석
   */
  private analyzeProportion(strokes: Stroke[], width: number, height: number): number {
    if (strokes.length === 0) return 0
    
    // 각 붓질의 크기 분석
    const strokeSizes = strokes.map(stroke => {
      const xs = stroke.points.map(p => p.x)
      const ys = stroke.points.map(p => p.y)
      const width = Math.max(...xs) - Math.min(...xs)
      const height = Math.max(...ys) - Math.min(...ys)
      return width * height
    })
    
    // 크기 일관성
    const avgSize = strokeSizes.reduce((a, b) => a + b, 0) / strokeSizes.length
    const sizeVariance = strokeSizes.reduce((a, b) => a + (b - avgSize) ** 2, 0) / strokeSizes.length
    const sizeConsistency = Math.max(0, 1 - Math.sqrt(sizeVariance) / avgSize)
    
    // 전체 화면 대비 적절한 크기인지
    const totalArea = width * height
    const strokeArea = strokeSizes.reduce((a, b) => a + b, 0)
    const areaRatio = strokeArea / totalArea
    
    // 적절한 비율 (10-30%)
    const proportionScore = areaRatio > 0.1 && areaRatio < 0.3 ? 1 : 
                           Math.max(0, 1 - Math.abs(areaRatio - 0.2) / 0.2)
    
    return ((sizeConsistency + proportionScore) / 2) * 100
  }

  /**
   * 정렬 분석
   */
  private analyzeAlignment(strokes: Stroke[]): number {
    if (strokes.length < 2) return 100
    
    // 각 붓질의 중심점과 방향 계산
    const strokeInfos = strokes.map(stroke => {
      const points = stroke.points
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length
      
      return {
        centerX,
        centerY,
        direction: stroke.direction
      }
    })
    
    // 수직/수평 정렬 확인
    const verticalAlignment = this.checkVerticalAlignment(strokeInfos)
    const horizontalAlignment = this.checkHorizontalAlignment(strokeInfos)
    
    // 방향 일관성 확인
    const directionConsistency = this.checkDirectionConsistency(strokeInfos)
    
    return ((verticalAlignment + horizontalAlignment + directionConsistency) / 3) * 100
  }

  private checkVerticalAlignment(strokeInfos: Array<{centerX: number, centerY: number, direction: number}>): number {
    if (strokeInfos.length < 2) return 1
    
    const xs = strokeInfos.map(info => info.centerX)
    const avgX = xs.reduce((a, b) => a + b, 0) / xs.length
    const variance = xs.reduce((a, b) => a + (b - avgX) ** 2, 0) / xs.length
    
    return Math.max(0, 1 - Math.sqrt(variance) / 50) // 50픽셀을 기준으로
  }

  private checkHorizontalAlignment(strokeInfos: Array<{centerX: number, centerY: number, direction: number}>): number {
    if (strokeInfos.length < 2) return 1
    
    const ys = strokeInfos.map(info => info.centerY)
    const avgY = ys.reduce((a, b) => a + b, 0) / ys.length
    const variance = ys.reduce((a, b) => a + (b - avgY) ** 2, 0) / ys.length
    
    return Math.max(0, 1 - Math.sqrt(variance) / 50) // 50픽셀을 기준으로
  }

  private checkDirectionConsistency(strokeInfos: Array<{centerX: number, centerY: number, direction: number}>): number {
    if (strokeInfos.length < 2) return 1
    
    const directions = strokeInfos.map(info => info.direction)
    const avgDirection = directions.reduce((a, b) => a + b, 0) / directions.length
    
    let totalDeviation = 0
    directions.forEach(direction => {
      let deviation = Math.abs(direction - avgDirection)
      if (deviation > Math.PI) {
        deviation = 2 * Math.PI - deviation
      }
      totalDeviation += deviation
    })
    
    const avgDeviation = totalDeviation / directions.length
    return Math.max(0, 1 - avgDeviation / (Math.PI / 4)) // 45도를 기준으로
  }

  /**
   * 스타일별 피드백 생성
   */
  private generateFeedback(
    scores: {
      overall: number
      brushControl: number
      inkFlow: number
      strokeQuality: number
      rhythmConsistency: number
    },
    style: CalligraphyStyle,
    strokes: Stroke[]
  ): CalligraphyFeedback {
    const strengths: string[] = []
    const improvements: string[] = []
    const suggestions: string[] = []
    
    // 강점 파악
    if (scores.brushControl > 80) {
      strengths.push('붓 조절력이 뛰어납니다.')
    }
    if (scores.inkFlow > 80) {
      strengths.push('먹의 농담 표현이 자연스럽습니다.')
    }
    if (scores.strokeQuality > 80) {
      strengths.push('붓질의 품질이 높습니다.')
    }
    if (scores.rhythmConsistency > 80) {
      strengths.push('리듬감이 일관되게 유지됩니다.')
    }
    
    // 개선점 파악
    if (scores.brushControl < 60) {
      improvements.push('붓 조절력을 개선해야 합니다.')
      suggestions.push('기본 획 연습을 반복하여 붓에 익숙해지세요.')
    }
    if (scores.inkFlow < 60) {
      improvements.push('먹의 농담 표현이 부족합니다.')
      suggestions.push('붓에 먹의 양을 조절하며 다양한 농담을 연습하세요.')
    }
    if (scores.strokeQuality < 60) {
      improvements.push('붓질의 품질을 높여야 합니다.')
      suggestions.push('천천히 정확하게 그으며 붓질의 완성도를 높이세요.')
    }
    if (scores.rhythmConsistency < 60) {
      improvements.push('리듬감이 일정하지 않습니다.')
      suggestions.push('일정한 속도와 간격으로 쓰는 연습을 하세요.')
    }
    
    // 스타일별 특화 피드백
    const styleSpecificFeedback = this.getStyleSpecificFeedback(style, scores, strokes)
    suggestions.push(...styleSpecificFeedback)
    
    const overall = this.generateOverallFeedback(scores.overall)
    const detailed = {
      brushControl: this.generateBrushControlFeedback(scores.brushControl),
      composition: '구성에 대한 분석이 필요합니다.',
      technique: this.generateTechniqueFeedback(scores),
      style: this.generateStyleFeedback(style, scores.overall)
    }
    
    const practiceRecommendations = this.generatePracticeRecommendations(scores, style)
    
    return {
      overall,
      strengths,
      improvements,
      suggestions,
      detailed,
      practiceRecommendations
    }
  }

  /**
   * 스타일별 특화 피드백
   */
  private getStyleSpecificFeedback(style: CalligraphyStyle, scores: any, strokes: Stroke[]): string[] {
    const feedback: string[] = []
    
    switch (style) {
      case 'kaishu':
        feedback.push('해서는 정확하고 균형 잡힌 글자가 중요합니다.')
        if (scores.brushControl < 70) {
          feedback.push('해서에서는 각 획의 시작과 끝이 명확해야 합니다.')
        }
        break
        
      case 'xingshu':
        feedback.push('행서는 흘림과 연결이 자연스러워야 합니다.')
        if (scores.rhythmConsistency < 70) {
          feedback.push('행서에서는 붓질 간의 연결과 리듬이 중요합니다.')
        }
        break
        
      case 'caoshu':
        feedback.push('초서는 자유로운 흘림과 개성이 중요합니다.')
        if (scores.inkFlow < 70) {
          feedback.push('초서에서는 먹의 농담 변화가 더욱 중요합니다.')
        }
        break
        
      case 'lishu':
        feedback.push('예서는 고풍스럽고 안정적인 형태가 특징입니다.')
        if (scores.brushControl < 75) {
          feedback.push('예서의 특징적인 파책법을 더 연습하세요.')
        }
        break
        
      default:
        feedback.push('선택한 서체의 특징을 더 살려보세요.')
    }
    
    return feedback
  }

  private generateOverallFeedback(score: number): string {
    if (score >= 90) {
      return '매우 뛰어난 작품입니다. 전문가 수준의 기량을 보여주고 있습니다.'
    } else if (score >= 80) {
      return '우수한 작품입니다. 기본기가 탄탄하고 표현력이 좋습니다.'
    } else if (score >= 70) {
      return '양호한 작품입니다. 몇 가지 개선점을 보완하면 더 좋아질 것 같습니다.'
    } else if (score >= 60) {
      return '기본기를 더 다져야 할 것 같습니다. 꾸준한 연습이 필요합니다.'
    } else {
      return '초보 단계입니다. 기초부터 차근차근 연습하시기 바랍니다.'
    }
  }

  private generateBrushControlFeedback(score: number): string {
    if (score >= 80) {
      return '붓 조절이 매우 안정적이고 숙련되어 있습니다.'
    } else if (score >= 60) {
      return '붓 조절이 어느 정도 되고 있으나, 더 정교함이 필요합니다.'
    } else {
      return '붓 조절력이 부족합니다. 기본 획 연습을 더 많이 하세요.'
    }
  }

  private generateTechniqueFeedback(scores: any): string {
    const issues: string[] = []
    
    if (scores.brushControl < 70) issues.push('붓 조절')
    if (scores.inkFlow < 70) issues.push('먹의 농담')
    if (scores.strokeQuality < 70) issues.push('붓질 품질')
    if (scores.rhythmConsistency < 70) issues.push('리듬감')
    
    if (issues.length === 0) {
      return '전반적인 기법이 우수합니다.'
    } else {
      return `다음 영역에서 개선이 필요합니다: ${issues.join(', ')}`
    }
  }

  private generateStyleFeedback(style: CalligraphyStyle, score: number): string {
    const styleNames = {
      kaishu: '해서',
      xingshu: '행서',
      caoshu: '초서',
      lishu: '예서',
      zhuanshu: '전서',
      modern: '현대서예',
      traditional: '전통서예'
    }
    
    const styleName = styleNames[style] || '해당 서체'
    
    if (score >= 80) {
      return `${styleName}의 특징이 잘 표현되었습니다.`
    } else {
      return `${styleName}의 특징을 더 살려보세요.`
    }
  }

  private generatePracticeRecommendations(scores: any, style: CalligraphyStyle): {
    exercises: string[]
    focusAreas: string[]
    timeframe: string
  } {
    const exercises: string[] = []
    const focusAreas: string[] = []
    
    if (scores.brushControl < 70) {
      exercises.push('기본 획 연습 (횡, 수, 점, 별, 날)')
      focusAreas.push('붓 잡는 법과 팔꿈치 사용법')
    }
    
    if (scores.inkFlow < 70) {
      exercises.push('농담 변화 연습')
      focusAreas.push('붓에 먹 묻히는 양 조절')
    }
    
    if (scores.strokeQuality < 70) {
      exercises.push('천천히 정확하게 쓰는 연습')
      focusAreas.push('붓질의 시작과 끝 처리')
    }
    
    if (scores.rhythmConsistency < 70) {
      exercises.push('메트로놈에 맞춰 쓰는 연습')
      focusAreas.push('일정한 속도와 간격 유지')
    }
    
    // 기본 연습이 항상 포함
    if (exercises.length === 0) {
      exercises.push('선택한 서체의 기본 글자 연습')
    }
    
    let timeframe = ''
    if (scores.overall >= 80) {
      timeframe = '2-3개월 심화 연습'
    } else if (scores.overall >= 60) {
      timeframe = '3-6개월 집중 연습'
    } else {
      timeframe = '6개월 이상 기초 연습'
    }
    
    return {
      exercises,
      focusAreas,
      timeframe
    }
  }
}

/**
 * 문자 인식 및 분석
 */
export class CharacterAnalyzer {
  /**
   * 개별 문자 분석
   */
  analyzeCharacter(strokes: Stroke[], boundingBox: {x: number, y: number, width: number, height: number}): CharacterAnalysis {
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 해당 영역의 붓질들 필터링
    const characterStrokes = strokes.filter(stroke => 
      this.isStrokeInBoundingBox(stroke, boundingBox)
    )
    
    const scores = {
      structure: this.analyzeStructure(characterStrokes, boundingBox),
      proportion: this.analyzeProportion(characterStrokes, boundingBox),
      strokeOrder: this.analyzeStrokeOrder(characterStrokes),
      balance: this.analyzeBalance(characterStrokes, boundingBox)
    }
    
    const improvements = this.generateCharacterImprovements(scores)
    
    return {
      id: characterId,
      boundingBox,
      strokes: characterStrokes.map(s => s.id),
      scores,
      improvements
    }
  }

  private isStrokeInBoundingBox(stroke: Stroke, box: {x: number, y: number, width: number, height: number}): boolean {
    const strokeBounds = this.getStrokeBounds(stroke)
    
    // 겹치는 영역이 있는지 확인
    return !(strokeBounds.right < box.x || 
             strokeBounds.left > box.x + box.width ||
             strokeBounds.bottom < box.y || 
             strokeBounds.top > box.y + box.height)
  }

  private getStrokeBounds(stroke: Stroke): {left: number, right: number, top: number, bottom: number} {
    const xs = stroke.points.map(p => p.x)
    const ys = stroke.points.map(p => p.y)
    
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys)
    }
  }

  private analyzeStructure(strokes: Stroke[], boundingBox: any): number {
    // 구조적 완성도를 간단하게 측정
    if (strokes.length === 0) return 0
    
    // 붓질들이 고르게 분포되어 있는지 확인
    const distribution = this.analyzeStrokeDistribution(strokes, boundingBox)
    
    return distribution * 100
  }

  private analyzeProportion(strokes: Stroke[], boundingBox: any): number {
    // 각 붓질의 크기 비례성 확인
    if (strokes.length === 0) return 0
    
    const strokeSizes = strokes.map(stroke => stroke.length)
    const avgSize = strokeSizes.reduce((a, b) => a + b, 0) / strokeSizes.length
    const variance = strokeSizes.reduce((a, b) => a + (b - avgSize) ** 2, 0) / strokeSizes.length
    
    return Math.max(0, 1 - Math.sqrt(variance) / avgSize) * 100
  }

  private analyzeStrokeOrder(strokes: Stroke[]): number {
    // 붓질 순서의 적절성 - 시간 순서로 판단
    if (strokes.length <= 1) return 100
    
    const sortedByTime = [...strokes].sort((a, b) => a.startTime - b.startTime)
    let orderScore = 0
    
    for (let i = 1; i < sortedByTime.length; i++) {
      const prev = sortedByTime[i - 1]
      const curr = sortedByTime[i]
      
      // 일반적인 붓질 순서 규칙 (위->아래, 왼쪽->오른쪽)
      const prevCenter = this.getStrokeCenter(prev)
      const currCenter = this.getStrokeCenter(curr)
      
      if (prevCenter.y <= currCenter.y || prevCenter.x <= currCenter.x) {
        orderScore += 1
      }
    }
    
    return (orderScore / (strokes.length - 1)) * 100
  }

  private analyzeBalance(strokes: Stroke[], boundingBox: any): number {
    if (strokes.length === 0) return 0
    
    // 무게중심이 경계상자의 중심에 가까운지 확인
    let totalX = 0, totalY = 0, totalWeight = 0
    
    strokes.forEach(stroke => {
      stroke.points.forEach(point => {
        const weight = point.pressure || 1
        totalX += point.x * weight
        totalY += point.y * weight
        totalWeight += weight
      })
    })
    
    const centerX = totalX / totalWeight
    const centerY = totalY / totalWeight
    
    const boxCenterX = boundingBox.x + boundingBox.width / 2
    const boxCenterY = boundingBox.y + boundingBox.height / 2
    
    const distance = Math.sqrt((centerX - boxCenterX) ** 2 + (centerY - boxCenterY) ** 2)
    const maxDistance = Math.sqrt((boundingBox.width / 2) ** 2 + (boundingBox.height / 2) ** 2)
    
    return Math.max(0, (1 - distance / maxDistance)) * 100
  }

  private analyzeStrokeDistribution(strokes: Stroke[], boundingBox: any): number {
    if (strokes.length === 0) return 0
    
    // 9개 구역으로 나누어 분포 확인
    const regions = Array(9).fill(0)
    
    strokes.forEach(stroke => {
      const center = this.getStrokeCenter(stroke)
      const regionX = Math.floor((center.x - boundingBox.x) / (boundingBox.width / 3))
      const regionY = Math.floor((center.y - boundingBox.y) / (boundingBox.height / 3))
      
      const regionIndex = Math.max(0, Math.min(8, regionY * 3 + regionX))
      regions[regionIndex]++
    })
    
    // 분포의 균등성 측정
    const nonEmptyRegions = regions.filter(r => r > 0).length
    return nonEmptyRegions / 9
  }

  private getStrokeCenter(stroke: Stroke): {x: number, y: number} {
    const totalX = stroke.points.reduce((sum, p) => sum + p.x, 0)
    const totalY = stroke.points.reduce((sum, p) => sum + p.y, 0)
    
    return {
      x: totalX / stroke.points.length,
      y: totalY / stroke.points.length
    }
  }

  private generateCharacterImprovements(scores: any): string[] {
    const improvements: string[] = []
    
    if (scores.structure < 70) {
      improvements.push('문자의 구조적 안정성을 개선하세요')
    }
    if (scores.proportion < 70) {
      improvements.push('각 획의 크기 비례를 조정하세요')
    }
    if (scores.strokeOrder < 70) {
      improvements.push('정확한 필순으로 연습하세요')
    }
    if (scores.balance < 70) {
      improvements.push('문자의 중심을 더 잘 맞춰보세요')
    }
    
    return improvements
  }
}