// 붓질 감지 및 분석 알고리즘

import type { Point, Stroke, StrokePoint, StrokeType, AnalysisConfig } from './types'

export class StrokeDetector {
  private config: AnalysisConfig['strokeDetection']

  constructor(config: AnalysisConfig['strokeDetection']) {
    this.config = config
  }

  /**
   * 이미지에서 붓질 감지
   */
  detectStrokes(imageData: ImageData): Stroke[] {
    // 1. 스켈레톤화로 중심선 추출
    const skeleton = this.skeletonize(imageData)
    
    // 2. 연결된 구성요소 찾기
    const components = this.findConnectedComponents(skeleton)
    
    // 3. 각 구성요소를 붓질로 변환
    const strokes: Stroke[] = []
    
    components.forEach((component, index) => {
      if (component.length >= this.config.minStrokeLength) {
        const stroke = this.componentToStroke(component, index.toString())
        if (stroke) {
          strokes.push(stroke)
        }
      }
    })
    
    // 4. 붓질 병합 및 정제
    return this.refineStrokes(strokes)
  }

  /**
   * 이미지 스켈레톤화 (Zhang-Suen 알고리즘)
   */
  private skeletonize(imageData: ImageData): boolean[][] {
    const { width, height, data } = imageData
    const binary: boolean[][] = []
    
    // 이진 배열로 변환
    for (let y = 0; y < height; y++) {
      binary[y] = []
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        binary[y][x] = gray < 128 // 검은색 픽셀을 true로
      }
    }
    
    // Zhang-Suen 스켈레톤화
    let changed = true
    while (changed) {
      changed = false
      
      // 첫 번째 서브이터레이션
      const toRemove1: Point[] = []
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (this.shouldRemovePixel(binary, x, y, 1)) {
            toRemove1.push({ x, y })
          }
        }
      }
      
      toRemove1.forEach(({ x, y }) => {
        binary[y][x] = false
        changed = true
      })
      
      // 두 번째 서브이터레이션
      const toRemove2: Point[] = []
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (this.shouldRemovePixel(binary, x, y, 2)) {
            toRemove2.push({ x, y })
          }
        }
      }
      
      toRemove2.forEach(({ x, y }) => {
        binary[y][x] = false
        changed = true
      })
    }
    
    return binary
  }

  /**
   * Zhang-Suen 알고리즘의 픽셀 제거 조건 검사
   */
  private shouldRemovePixel(binary: boolean[][], x: number, y: number, iteration: number): boolean {
    if (!binary[y][x]) return false
    
    const neighbors = [
      binary[y-1][x],   // P2
      binary[y-1][x+1], // P3
      binary[y][x+1],   // P4
      binary[y+1][x+1], // P5
      binary[y+1][x],   // P6
      binary[y+1][x-1], // P7
      binary[y][x-1],   // P8
      binary[y-1][x-1]  // P9
    ]
    
    // 조건 1: 2 ≤ B(P1) ≤ 6
    const B = neighbors.filter(n => n).length
    if (B < 2 || B > 6) return false
    
    // 조건 2: A(P1) = 1
    let A = 0
    for (let i = 0; i < 8; i++) {
      if (!neighbors[i] && neighbors[(i + 1) % 8]) {
        A++
      }
    }
    if (A !== 1) return false
    
    // 조건 3 & 4: iteration에 따라 다름
    if (iteration === 1) {
      return !neighbors[0] || !neighbors[2] || !neighbors[4] || // P2 * P4 * P6 = 0
             !neighbors[2] || !neighbors[4] || !neighbors[6]    // P4 * P6 * P8 = 0
    } else {
      return !neighbors[0] || !neighbors[2] || !neighbors[6] || // P2 * P4 * P8 = 0
             !neighbors[0] || !neighbors[4] || !neighbors[6]    // P2 * P6 * P8 = 0
    }
  }

  /**
   * 연결된 구성요소 찾기
   */
  private findConnectedComponents(skeleton: boolean[][]): Point[][] {
    const height = skeleton.length
    const width = skeleton[0].length
    const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false))
    const components: Point[][] = []
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (skeleton[y][x] && !visited[y][x]) {
          const component = this.dfs(skeleton, visited, x, y)
          if (component.length > 0) {
            components.push(component)
          }
        }
      }
    }
    
    return components
  }

  /**
   * 깊이 우선 탐색으로 연결된 픽셀 찾기
   */
  private dfs(skeleton: boolean[][], visited: boolean[][], x: number, y: number): Point[] {
    const stack: Point[] = [{ x, y }]
    const component: Point[] = []
    
    while (stack.length > 0) {
      const { x: cx, y: cy } = stack.pop()!
      
      if (cx < 0 || cx >= skeleton[0].length || cy < 0 || cy >= skeleton.length ||
          visited[cy][cx] || !skeleton[cy][cx]) {
        continue
      }
      
      visited[cy][cx] = true
      component.push({ x: cx, y: cy })
      
      // 8방향 이웃 검사
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          stack.push({ x: cx + dx, y: cy + dy })
        }
      }
    }
    
    return component
  }

  /**
   * 구성요소를 붓질로 변환
   */
  private componentToStroke(component: Point[], id: string): Stroke | null {
    if (component.length < 2) return null
    
    // 1. 점들을 순서대로 정렬 (경로 추적)
    const orderedPoints = this.orderPoints(component)
    
    // 2. StrokePoint로 변환
    const strokePoints: StrokePoint[] = orderedPoints.map((point, index) => ({
      ...point,
      pressure: this.estimatePressure(component, point),
      speed: index > 0 ? this.calculateSpeed(orderedPoints[index - 1], point) : 0,
      timestamp: index * 10 // 가상의 타임스탬프
    }))
    
    // 3. 붓질 속성 계산
    const length = this.calculateStrokeLength(strokePoints)
    const curvature = this.calculateCurvature(strokePoints)
    const direction = this.calculateDirection(strokePoints)
    const strokeType = this.classifyStrokeType(strokePoints)
    
    const pressures = strokePoints.map(p => p.pressure || 0)
    const speeds = strokePoints.map(p => p.speed || 0)
    
    return {
      id,
      points: strokePoints,
      startTime: strokePoints[0].timestamp || 0,
      endTime: strokePoints[strokePoints.length - 1].timestamp || 0,
      pressure: {
        min: Math.min(...pressures),
        max: Math.max(...pressures),
        average: pressures.reduce((a, b) => a + b, 0) / pressures.length
      },
      speed: {
        min: Math.min(...speeds),
        max: Math.max(...speeds),
        average: speeds.reduce((a, b) => a + b, 0) / speeds.length
      },
      length,
      curvature,
      direction,
      strokeType
    }
  }

  /**
   * 점들을 순서대로 정렬 (최단 경로)
   */
  private orderPoints(points: Point[]): Point[] {
    if (points.length <= 2) return points
    
    const ordered: Point[] = [points[0]]
    const remaining = points.slice(1)
    
    while (remaining.length > 0) {
      const current = ordered[ordered.length - 1]
      let nearestIndex = 0
      let nearestDistance = this.distance(current, remaining[0])
      
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.distance(current, remaining[i])
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }
      
      ordered.push(remaining[nearestIndex])
      remaining.splice(nearestIndex, 1)
    }
    
    return ordered
  }

  /**
   * 두 점 사이의 거리 계산
   */
  private distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }

  /**
   * 압력 추정 (주변 픽셀 밀도 기반)
   */
  private estimatePressure(component: Point[], point: Point): number {
    const radius = 3
    let count = 0
    
    component.forEach(p => {
      if (this.distance(point, p) <= radius) {
        count++
      }
    })
    
    return Math.min(1, count / (Math.PI * radius * radius))
  }

  /**
   * 속도 계산
   */
  private calculateSpeed(p1: Point, p2: Point): number {
    return this.distance(p1, p2) / 10 // 가상의 시간 간격 10ms
  }

  /**
   * 붓질 길이 계산
   */
  private calculateStrokeLength(points: StrokePoint[]): number {
    let length = 0
    for (let i = 1; i < points.length; i++) {
      length += this.distance(points[i - 1], points[i])
    }
    return length
  }

  /**
   * 곡률 계산
   */
  private calculateCurvature(points: StrokePoint[]): number {
    if (points.length < 3) return 0
    
    let totalCurvature = 0
    let count = 0
    
    for (let i = 1; i < points.length - 1; i++) {
      const p1 = points[i - 1]
      const p2 = points[i]
      const p3 = points[i + 1]
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
      let curvature = Math.abs(angle2 - angle1)
      
      if (curvature > Math.PI) {
        curvature = 2 * Math.PI - curvature
      }
      
      totalCurvature += curvature
      count++
    }
    
    return count > 0 ? totalCurvature / count : 0
  }

  /**
   * 방향 계산 (전체적인 방향)
   */
  private calculateDirection(points: StrokePoint[]): number {
    if (points.length < 2) return 0
    
    const start = points[0]
    const end = points[points.length - 1]
    
    return Math.atan2(end.y - start.y, end.x - start.x)
  }

  /**
   * 붓질 유형 분류
   */
  private classifyStrokeType(points: StrokePoint[]): StrokeType {
    if (points.length < 2) return 'dot'
    
    const direction = this.calculateDirection(points)
    const curvature = this.calculateCurvature(points)
    const length = this.calculateStrokeLength(points)
    
    // 점
    if (length < 10) {
      return 'dot'
    }
    
    // 직선 계열
    if (curvature < 0.2) {
      const angle = Math.abs(direction)
      if (angle < Math.PI / 8 || angle > 7 * Math.PI / 8) {
        return 'horizontal'
      } else if (angle > 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
        return 'vertical'
      }
    }
    
    // 곡선 계열
    if (curvature > 0.5) {
      if (this.hasHook(points)) {
        return 'hook'
      }
      return 'curve'
    }
    
    // 방향 변화 확인
    if (this.hasTurn(points)) {
      return 'turn'
    }
    
    // 기울기에 따른 분류
    if (direction > 0) {
      return 'sweep_right'
    } else {
      return 'sweep_left'
    }
  }

  /**
   * 갈고리 형태 확인
   */
  private hasHook(points: StrokePoint[]): boolean {
    if (points.length < 5) return false
    
    const quarterLength = Math.floor(points.length / 4)
    const start = points.slice(0, quarterLength)
    const end = points.slice(-quarterLength)
    
    const startDirection = this.calculateDirection(start)
    const endDirection = this.calculateDirection(end)
    
    const angleDiff = Math.abs(startDirection - endDirection)
    return angleDiff > Math.PI / 3 // 60도 이상 방향 변화
  }

  /**
   * 꺾임 확인
   */
  private hasTurn(points: StrokePoint[]): boolean {
    if (points.length < 6) return false
    
    const midPoint = Math.floor(points.length / 2)
    const firstHalf = points.slice(0, midPoint)
    const secondHalf = points.slice(midPoint)
    
    const firstDirection = this.calculateDirection(firstHalf)
    const secondDirection = this.calculateDirection(secondHalf)
    
    const angleDiff = Math.abs(firstDirection - secondDirection)
    return angleDiff > Math.PI / 4 // 45도 이상 방향 변화
  }

  /**
   * 붓질 정제 (병합, 분할, 필터링)
   */
  private refineStrokes(strokes: Stroke[]): Stroke[] {
    let refined = [...strokes]
    
    // 1. 너무 짧은 붓질 제거
    refined = refined.filter(stroke => stroke.length >= this.config.minStrokeLength)
    
    // 2. 가까운 붓질들 병합
    refined = this.mergeNearbyStrokes(refined)
    
    // 3. 교차점에서 분할
    refined = this.splitAtIntersections(refined)
    
    return refined
  }

  /**
   * 가까운 붓질들 병합
   */
  private mergeNearbyStrokes(strokes: Stroke[]): Stroke[] {
    const merged: Stroke[] = []
    const used: boolean[] = new Array(strokes.length).fill(false)
    
    for (let i = 0; i < strokes.length; i++) {
      if (used[i]) continue
      
      let currentStroke = strokes[i]
      used[i] = true
      
      // 현재 붓질과 병합 가능한 붓질 찾기
      for (let j = i + 1; j < strokes.length; j++) {
        if (used[j]) continue
        
        if (this.canMergeStrokes(currentStroke, strokes[j])) {
          currentStroke = this.mergeStrokes(currentStroke, strokes[j])
          used[j] = true
        }
      }
      
      merged.push(currentStroke)
    }
    
    return merged
  }

  /**
   * 두 붓질이 병합 가능한지 확인
   */
  private canMergeStrokes(stroke1: Stroke, stroke2: Stroke): boolean {
    const end1 = stroke1.points[stroke1.points.length - 1]
    const start2 = stroke2.points[0]
    const start1 = stroke1.points[0]
    const end2 = stroke2.points[stroke2.points.length - 1]
    
    const distance1 = this.distance(end1, start2)
    const distance2 = this.distance(start1, end2)
    
    return distance1 <= this.config.maxGapDistance || distance2 <= this.config.maxGapDistance
  }

  /**
   * 두 붓질 병합
   */
  private mergeStrokes(stroke1: Stroke, stroke2: Stroke): Stroke {
    const end1 = stroke1.points[stroke1.points.length - 1]
    const start2 = stroke2.points[0]
    const start1 = stroke1.points[0]
    const end2 = stroke2.points[stroke2.points.length - 1]
    
    let mergedPoints: StrokePoint[]
    
    if (this.distance(end1, start2) <= this.distance(start1, end2)) {
      mergedPoints = [...stroke1.points, ...stroke2.points]
    } else {
      mergedPoints = [...stroke1.points.reverse(), ...stroke2.points]
    }
    
    // 새로운 붓질 속성 계산
    const length = this.calculateStrokeLength(mergedPoints)
    const curvature = this.calculateCurvature(mergedPoints)
    const direction = this.calculateDirection(mergedPoints)
    const strokeType = this.classifyStrokeType(mergedPoints)
    
    const pressures = mergedPoints.map(p => p.pressure || 0)
    const speeds = mergedPoints.map(p => p.speed || 0)
    
    return {
      id: `${stroke1.id}-${stroke2.id}`,
      points: mergedPoints,
      startTime: Math.min(stroke1.startTime, stroke2.startTime),
      endTime: Math.max(stroke1.endTime, stroke2.endTime),
      pressure: {
        min: Math.min(...pressures),
        max: Math.max(...pressures),
        average: pressures.reduce((a, b) => a + b, 0) / pressures.length
      },
      speed: {
        min: Math.min(...speeds),
        max: Math.max(...speeds),
        average: speeds.reduce((a, b) => a + b, 0) / speeds.length
      },
      length,
      curvature,
      direction,
      strokeType
    }
  }

  /**
   * 교차점에서 붓질 분할 (간단화된 버전)
   */
  private splitAtIntersections(strokes: Stroke[]): Stroke[] {
    // 실제 구현에서는 복잡한 교차점 감지 알고리즘이 필요
    // 여기서는 간단히 원래 붓질들을 반환
    return strokes
  }
}

/**
 * 붓질 분석기
 */
export class StrokeAnalyzer {
  /**
   * 붓질 품질 분석
   */
  static analyzeStrokeQuality(stroke: Stroke): {
    score: number // 0-100
    aspects: {
      smoothness: number
      consistency: number
      control: number
      strength: number
    }
    feedback: string[]
  } {
    const smoothness = this.calculateSmoothness(stroke)
    const consistency = this.calculateConsistency(stroke)
    const control = this.calculateControl(stroke)
    const strength = this.calculateStrength(stroke)
    
    const score = (smoothness + consistency + control + strength) / 4
    const feedback: string[] = []
    
    if (smoothness < 0.7) {
      feedback.push('붓질이 거칠어 보입니다. 더 부드럽게 그어보세요.')
    }
    if (consistency < 0.7) {
      feedback.push('붓질의 굵기가 불규칙합니다. 일정한 압력을 유지하세요.')
    }
    if (control < 0.7) {
      feedback.push('붓의 방향 제어가 부족합니다. 의도한 선을 그릴 수 있도록 연습하세요.')
    }
    if (strength < 0.7) {
      feedback.push('붓질의 힘이 부족합니다. 더 확실하게 그어보세요.')
    }
    
    return {
      score: score * 100,
      aspects: {
        smoothness: smoothness * 100,
        consistency: consistency * 100,
        control: control * 100,
        strength: strength * 100
      },
      feedback
    }
  }

  private static calculateSmoothness(stroke: Stroke): number {
    if (stroke.points.length < 3) return 1
    
    let smoothness = 0
    let count = 0
    
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i - 1]
      const p2 = stroke.points[i]
      const p3 = stroke.points[i + 1]
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
      let angleDiff = Math.abs(angle2 - angle1)
      
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff
      }
      
      smoothness += 1 - (angleDiff / Math.PI)
      count++
    }
    
    return count > 0 ? smoothness / count : 1
  }

  private static calculateConsistency(stroke: Stroke): number {
    const pressures = stroke.points.map(p => p.pressure || 0)
    const mean = pressures.reduce((a, b) => a + b, 0) / pressures.length
    const variance = pressures.reduce((a, b) => a + (b - mean) ** 2, 0) / pressures.length
    const stdDev = Math.sqrt(variance)
    
    return Math.max(0, 1 - stdDev)
  }

  private static calculateControl(stroke: Stroke): number {
    // 의도된 방향과 실제 방향의 차이로 제어력 측정
    const intendedDirection = Math.atan2(
      stroke.points[stroke.points.length - 1].y - stroke.points[0].y,
      stroke.points[stroke.points.length - 1].x - stroke.points[0].x
    )
    
    let totalDeviation = 0
    let count = 0
    
    for (let i = 1; i < stroke.points.length; i++) {
      const p1 = stroke.points[i - 1]
      const p2 = stroke.points[i]
      const actualDirection = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      
      let deviation = Math.abs(actualDirection - intendedDirection)
      if (deviation > Math.PI) {
        deviation = 2 * Math.PI - deviation
      }
      
      totalDeviation += deviation
      count++
    }
    
    const averageDeviation = count > 0 ? totalDeviation / count : 0
    return Math.max(0, 1 - averageDeviation / Math.PI)
  }

  private static calculateStrength(stroke: Stroke): number {
    const averagePressure = stroke.pressure.average
    const speedVariation = stroke.speed.max - stroke.speed.min
    
    // 적절한 압력과 속도 변화가 있는 붓질을 좋은 것으로 평가
    const pressureScore = Math.min(1, averagePressure * 2)
    const speedScore = Math.min(1, speedVariation / 100)
    
    return (pressureScore + speedScore) / 2
  }
}