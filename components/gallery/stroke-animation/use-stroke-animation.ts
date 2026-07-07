'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { AnimatedStroke, AnimationSettings, PlaybackState, StrokePoint } from './types'

interface UseStrokeAnimationParams {
  strokes: AnimatedStroke[]
  characterImage?: string
  onStrokeComplete?: (strokeIndex: number) => void
  onAnimationComplete?: () => void
}

export function useStrokeAnimation({
  strokes,
  characterImage,
  onStrokeComplete,
  onAnimationComplete,
}: UseStrokeAnimationParams) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStroke: 0,
    currentProgress: 0,
    totalProgress: 0,
    isComplete: false,
  })

  const [settings, setSettings] = useState<AnimationSettings>({
    playbackSpeed: 1,
    showPressure: true,
    showDirection: true,
    showTiming: false,
    loopMode: 'none',
    autoAdvance: true,
    soundEnabled: false,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showEducational, setShowEducational] = useState(false)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<number>(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  // pause 시점까지의 스케일된 elapsed — play()가 이어서 재생할 수 있게 보존 (A-1)
  const pausedElapsedRef = useRef(0)
  // loopMode 'all' 재시작 타이머 핸들 — stop/unmount 시 정리 (A-3)
  const loopTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
  // 배경 문자 이미지 1회 로드 캐시 — RAF 매 프레임 new Image() 방지 (A-4)
  const characterImageRef = useRef<HTMLImageElement | null>(null)

  // Animation dimensions
  const canvasWidth = 800
  const canvasHeight = 600

  // ===============================
  // Animation Engine
  // ===============================

  const initializeAnimation = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw background character if available
    if (characterImage) {
      const img = new Image()
      img.onload = () => {
        ctx.globalAlpha = 0.1
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        ctx.globalAlpha = 1
      }
      img.src = characterImage
    }

    // Draw grid if enabled
    if (settings.showTiming) {
      drawGrid(ctx)
    }
  }, [characterImage, settings.showTiming])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: AnimatedStroke, progress: number) => {
      if (stroke.points.length === 0) return

      const totalPoints = stroke.points.length
      const currentPointIndex = Math.floor(totalPoints * progress)

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Draw completed portion of stroke
      for (let i = 0; i < currentPointIndex - 1; i++) {
        const point1 = stroke.points[i]
        const point2 = stroke.points[i + 1]

        // Safety check for undefined points
        if (!point1 || !point2) continue

        // Calculate line width based on pressure
        const pressure1 = settings.showPressure ? point1.pressure : 0.5
        const pressure2 = settings.showPressure ? point2.pressure : 0.5
        const avgPressure = (pressure1 + pressure2) / 2
        const lineWidth = Math.max(2, avgPressure * 20)

        // Calculate ink flow
        const inkFlow = stroke.ink_flow[i] || 1
        const alpha = Math.min(1, 0.7 + inkFlow * 0.3)

        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`
        ctx.lineWidth = lineWidth

        ctx.beginPath()
        ctx.moveTo(point1.x * canvasWidth, point1.y * canvasHeight)
        ctx.lineTo(point2.x * canvasWidth, point2.y * canvasHeight)
        ctx.stroke()

        // Draw pressure indicator
        if (settings.showPressure && pressure1 > 0.8) {
          ctx.fillStyle = `rgba(255, 0, 0, ${(pressure1 - 0.8) * 2})`
          ctx.beginPath()
          ctx.arc(point1.x * canvasWidth, point1.y * canvasHeight, 3, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw direction arrow
        if (settings.showDirection && point1.direction !== undefined) {
          drawDirectionArrow(ctx, point1, lineWidth)
        }
      }

      // Draw current brush position
      if (currentPointIndex < totalPoints) {
        const currentPoint = stroke.points[currentPointIndex]

        // Safety check for undefined point
        if (!currentPoint) return

        const pressure = settings.showPressure ? currentPoint.pressure : 0.5
        const brushSize = Math.max(4, pressure * 24)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(
          currentPoint.x * canvasWidth,
          currentPoint.y * canvasHeight,
          brushSize / 2,
          0,
          2 * Math.PI
        )
        ctx.fill()

        // Brush tip indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.beginPath()
        ctx.arc(currentPoint.x * canvasWidth, currentPoint.y * canvasHeight, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    },
    [settings.showPressure, settings.showDirection]
  )

  const drawDirectionArrow = (
    ctx: CanvasRenderingContext2D,
    point: StrokePoint,
    lineWidth: number
  ) => {
    if (point.direction === undefined) return

    const x = point.x * canvasWidth
    const y = point.y * canvasHeight
    const arrowLength = lineWidth * 1.5

    ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)'
    ctx.lineWidth = 2

    // Draw arrow line
    const endX = x + Math.cos(point.direction) * arrowLength
    const endY = y + Math.sin(point.direction) * arrowLength

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Draw arrow head
    const headSize = 4
    const angle1 = point.direction + Math.PI * 0.8
    const angle2 = point.direction - Math.PI * 0.8

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX + Math.cos(angle1) * headSize, endY + Math.sin(angle1) * headSize)
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX + Math.cos(angle2) * headSize, endY + Math.sin(angle2) * headSize)
    ctx.stroke()
  }

  // ===============================
  // Playback Controls
  // ===============================

  const animate = useCallback(
    (timestamp: number) => {
      if (!canvasRef.current || strokes.length === 0) return

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      if (!startTimeRef.current) {
        // pause 후 재개 시 저장된 elapsed만큼 시작점을 당겨 이어서 재생 (A-1)
        startTimeRef.current = timestamp - pausedElapsedRef.current / settings.playbackSpeed
      }

      const elapsed = (timestamp - startTimeRef.current) * settings.playbackSpeed
      pausedElapsedRef.current = elapsed
      const currentStroke = strokes[playbackState.currentStroke]

      if (!currentStroke) return

      const strokeProgress = Math.min(1, elapsed / (currentStroke.duration * 1000))

      // Clear canvas and redraw
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Redraw background — 캐시된 이미지만 사용 (A-4)
      const backgroundImage = characterImageRef.current
      if (backgroundImage?.complete) {
        ctx.globalAlpha = 0.1
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight)
        ctx.globalAlpha = 1
      }

      if (settings.showTiming) {
        drawGrid(ctx)
      }

      // Draw previous completed strokes
      for (let i = 0; i < playbackState.currentStroke; i++) {
        const stroke = strokes[i]
        if (stroke) {
          drawStroke(ctx, stroke, 1)
        }
      }

      // Draw current stroke
      drawStroke(ctx, currentStroke, strokeProgress)

      // Update state
      const totalDuration = strokes.reduce((sum, stroke) => sum + stroke.duration, 0)
      const completedDuration = strokes
        .slice(0, playbackState.currentStroke)
        .reduce((sum, stroke) => sum + stroke.duration, 0)
      const currentStrokeDuration = strokeProgress * currentStroke.duration
      const totalProgress = (completedDuration + currentStrokeDuration) / totalDuration

      setPlaybackState(prev => ({
        ...prev,
        currentProgress: strokeProgress,
        totalProgress,
      }))

      // Check if stroke is complete
      if (strokeProgress >= 1) {
        onStrokeComplete?.(playbackState.currentStroke)

        // Loop current stroke — advance/complete 분기에 진입하지 않는다 (A-2)
        if (settings.loopMode === 'single') {
          startTimeRef.current = timestamp
          pausedElapsedRef.current = 0
          animationRef.current = requestAnimationFrame(animate)
          return
        }

        if (playbackState.currentStroke < strokes.length - 1) {
          // Move to next stroke
          if (settings.autoAdvance) {
            setPlaybackState(prev => ({
              ...prev,
              currentStroke: prev.currentStroke + 1,
            }))
            startTimeRef.current = timestamp
            pausedElapsedRef.current = 0
          } else {
            // Pause at end of stroke
            setPlaybackState(prev => ({ ...prev, isPlaying: false }))
          }
        } else {
          // Animation complete
          setPlaybackState(prev => ({
            ...prev,
            isPlaying: false,
            isComplete: true,
          }))
          onAnimationComplete?.()

          if (settings.loopMode === 'all') {
            // Reset and restart animation — 타이머 핸들은 stop/unmount에서 정리 (A-3)
            const restartTimeout = setTimeout(() => {
              setPlaybackState({
                isPlaying: false,
                currentStroke: 0,
                currentProgress: 0,
                totalProgress: 0,
                isComplete: false,
              })
              startTimeRef.current = null
              pausedElapsedRef.current = 0

              const resumeTimeout = setTimeout(() => {
                setPlaybackState(prev => ({ ...prev, isPlaying: true }))
                animationRef.current = requestAnimationFrame(animate)
              }, 100)
              loopTimeoutsRef.current.push(resumeTimeout)
            }, 1000)
            loopTimeoutsRef.current.push(restartTimeout)
          }
        }
      }

      if (playbackState.isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    },
    [
      strokes,
      playbackState.currentStroke,
      playbackState.isPlaying,
      settings.playbackSpeed,
      settings.autoAdvance,
      settings.loopMode,
      settings.showTiming,
      drawStroke,
      onStrokeComplete,
      onAnimationComplete,
    ]
  )

  const clearLoopTimeouts = useCallback(() => {
    loopTimeoutsRef.current.forEach(clearTimeout)
    loopTimeoutsRef.current = []
  }, [])

  const resetAnimation = useCallback(() => {
    clearLoopTimeouts()
    setPlaybackState({
      isPlaying: false,
      currentStroke: 0,
      currentProgress: 0,
      totalProgress: 0,
      isComplete: false,
    })
    startTimeRef.current = null
    pausedElapsedRef.current = 0

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [clearLoopTimeouts])

  const play = useCallback(() => {
    if (playbackState.isComplete && settings.loopMode === 'none') {
      resetAnimation()
    }

    setPlaybackState(prev => ({ ...prev, isPlaying: true }))
    startTimeRef.current = null
    animationRef.current = requestAnimationFrame(animate)
  }, [playbackState.isComplete, settings.loopMode, resetAnimation, animate])

  // ===============================
  // Additional Playback Controls
  // ===============================

  const pause = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }))
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const stop = () => {
    pause()
    resetAnimation()
  }

  const nextStroke = () => {
    if (playbackState.currentStroke < strokes.length - 1) {
      setPlaybackState(prev => ({
        ...prev,
        currentStroke: prev.currentStroke + 1,
        currentProgress: 0,
      }))
      startTimeRef.current = null
      pausedElapsedRef.current = 0
    }
  }

  const previousStroke = () => {
    if (playbackState.currentStroke > 0) {
      setPlaybackState(prev => ({
        ...prev,
        currentStroke: prev.currentStroke - 1,
        currentProgress: 0,
      }))
      startTimeRef.current = null
      pausedElapsedRef.current = 0
    }
  }

  // ===============================
  // Effects
  // ===============================

  // 배경 문자 이미지 1회 로드 캐시 (A-4)
  useEffect(() => {
    if (!characterImage) {
      characterImageRef.current = null
      return undefined
    }

    const img = new Image()
    img.onload = () => {
      characterImageRef.current = img
    }
    img.src = characterImage

    return () => {
      img.onload = null
    }
  }, [characterImage])

  useEffect(() => {
    initializeAnimation()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      clearLoopTimeouts()
    }
  }, [initializeAnimation, clearLoopTimeouts])

  useEffect(() => {
    if (playbackState.isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [playbackState.isPlaying, animate])

  return {
    canvasRef,
    canvasWidth,
    canvasHeight,
    playbackState,
    settings,
    setSettings,
    showSettings,
    setShowSettings,
    showEducational,
    setShowEducational,
    currentQuizQuestion,
    setCurrentQuizQuestion,
    isFullscreen,
    setIsFullscreen,
    play,
    pause,
    stop,
    nextStroke,
    previousStroke,
  }
}
