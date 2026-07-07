'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'
import type { ArtworkImage, ImageRegion } from '@/lib/types/gallery'
import type { MeasurementTool, ViewerState, ViewerTool } from './types'

interface UseImageZoomParams {
  image: ArtworkImage
  enableDeepZoom: boolean
  maxZoom: number
  minZoom: number
  zoomStep: number
  enableFullscreen: boolean
  onZoomChange?: (scale: number) => void
  onRegionSelect?: (region: ImageRegion) => void
}

export function useImageZoom({
  image,
  enableDeepZoom,
  maxZoom,
  minZoom,
  zoomStep,
  enableFullscreen,
  onZoomChange,
  onRegionSelect,
}: UseImageZoomParams) {
  // State management
  const [viewerState, setViewerState] = useState<ViewerState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  })

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(image.urls.medium)
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [activeTool, setActiveTool] = useState<ViewerTool>('pan')
  const [measurements, setMeasurements] = useState<MeasurementTool[]>([])
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate optimal image URL based on zoom level
  const getOptimalImageUrl = useCallback(
    (scale: number) => {
      if (!enableDeepZoom) return image.urls.large || image.urls.medium

      if (scale >= 4) return image.urls.original
      if (scale >= 2) return image.urls.large || image.urls.medium
      if (scale >= 1) return image.urls.medium || image.urls.small
      return image.urls.small || image.urls.thumbnail
    },
    [image.urls, enableDeepZoom]
  )

  // Load appropriate image based on zoom level
  useEffect(() => {
    const optimalUrl = getOptimalImageUrl(viewerState.scale)
    if (optimalUrl !== currentImageUrl) {
      setIsLoading(true)
      setCurrentImageUrl(optimalUrl)
    }
  }, [viewerState.scale, getOptimalImageUrl, currentImageUrl])

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    onZoomChange?.(viewerState.scale)
  }, [viewerState.scale, onZoomChange])

  // ===============================
  // Zoom and Pan Functions
  // ===============================

  const handleZoom = useCallback(
    (delta: number, centerX?: number, centerY?: number) => {
      setViewerState(prev => {
        const newScale = Math.max(minZoom, Math.min(maxZoom, prev.scale + delta))

        if (centerX !== undefined && centerY !== undefined) {
          // Zoom towards specific point
          const scaleRatio = newScale / prev.scale
          const newOffsetX = centerX - (centerX - prev.offsetX) * scaleRatio
          const newOffsetY = centerY - (centerY - prev.offsetY) * scaleRatio

          return {
            ...prev,
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
          }
        }

        return { ...prev, scale: newScale }
      })
    },
    [minZoom, maxZoom]
  )

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewerState(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
    }))
  }, [])

  const resetView = useCallback(() => {
    setViewerState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
    })
  }, [])

  // ===============================
  // Event Handlers
  // ===============================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'pan') return

      e.preventDefault()
      setViewerState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
      }))
    },
    [activeTool]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!viewerState.isDragging || activeTool !== 'pan') return

      const deltaX = e.clientX - viewerState.dragStart.x
      const deltaY = e.clientY - viewerState.dragStart.y

      handlePan(deltaX, deltaY)

      setViewerState(prev => ({
        ...prev,
        dragStart: { x: e.clientX, y: e.clientY },
      }))
    },
    [viewerState.isDragging, viewerState.dragStart, activeTool, handlePan]
  )

  const handleMouseUp = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      if (activeTool === 'zoom' || e.ctrlKey) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const centerX = e.clientX - rect.left
          const centerY = e.clientY - rect.top
          const delta = e.deltaY > 0 ? -zoomStep : zoomStep
          handleZoom(delta, centerX, centerY)
        }
      }
    },
    [activeTool, zoomStep, handleZoom]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = e.clientX - rect.left
        const centerY = e.clientY - rect.top
        const delta = viewerState.scale >= 2 ? -viewerState.scale + 1 : zoomStep * 2
        handleZoom(delta, centerX, centerY)
      }
    },
    [viewerState.scale, zoomStep, handleZoom]
  )

  // Touch events for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && activeTool === 'pan') {
        const touch = e.touches[0]
        if (touch) {
          setViewerState(prev => ({
            ...prev,
            isDragging: true,
            dragStart: { x: touch.clientX, y: touch.clientY },
          }))
        }
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        if (touch1 && touch2) {
          const distance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
          )
          setViewerState(prev => ({ ...prev, lastPinchDistance: distance }))
        }
      }
    },
    [activeTool]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && viewerState.isDragging) {
        const touch = e.touches[0]
        if (touch) {
          const deltaX = touch.clientX - viewerState.dragStart.x
          const deltaY = touch.clientY - viewerState.dragStart.y

          handlePan(deltaX, deltaY)

          setViewerState(prev => ({
            ...prev,
            dragStart: { x: touch.clientX, y: touch.clientY },
          }))
        }
      } else if (e.touches.length === 2 && viewerState.lastPinchDistance) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        if (touch1 && touch2) {
          const distance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
          )

          const centerX = (touch1.clientX + touch2.clientX) / 2
          const centerY = (touch1.clientY + touch2.clientY) / 2

          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const localCenterX = centerX - rect.left
            const localCenterY = centerY - rect.top
            const delta = (distance - viewerState.lastPinchDistance) * 0.01
            handleZoom(delta, localCenterX, localCenterY)
          }

          setViewerState(prev => ({ ...prev, lastPinchDistance: distance }))
        }
      }
    },
    [
      viewerState.isDragging,
      viewerState.dragStart,
      viewerState.lastPinchDistance,
      handlePan,
      handleZoom,
    ]
  )

  const handleTouchEnd = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      isDragging: false,
      lastPinchDistance: undefined,
    }))
  }, [])

  // ===============================
  // Fullscreen Management
  // ===============================

  const toggleFullscreen = useCallback(() => {
    if (!enableFullscreen) return

    // 상태는 fullscreenchange 리스너가 document.fullscreenElement 기준으로 동기화한다
    if (!isFullscreen) {
      containerRef.current
        ?.requestFullscreen()
        .catch(error => logger.warn('Fullscreen request rejected', { error }))
    } else {
      document.exitFullscreen().catch(error => logger.warn('Fullscreen exit rejected', { error }))
    }
  }, [isFullscreen, enableFullscreen])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // ===============================
  // Region and Annotation Rendering
  // ===============================

  const getImageCoordinates = useCallback(
    (x: number, y: number) => {
      if (!imageRef.current || !containerRef.current) return { x: 0, y: 0 }

      const rect = containerRef.current.getBoundingClientRect()
      const imgRect = imageRef.current.getBoundingClientRect()

      const relativeX = (x - imgRect.left) / (imgRect.width * viewerState.scale)
      const relativeY = (y - imgRect.top) / (imgRect.height * viewerState.scale)

      return { x: relativeX, y: relativeY }
    },
    [viewerState.scale]
  )

  const handleRegionClick = useCallback(
    (region: ImageRegion) => {
      setActiveRegion(region.id)
      onRegionSelect?.(region)
    },
    [onRegionSelect]
  )

  return {
    viewerState,
    isFullscreen,
    currentImageUrl,
    isLoading,
    setIsLoading,
    showInfo,
    setShowInfo,
    activeTool,
    setActiveTool,
    activeRegion,
    setActiveRegion,
    containerRef,
    imageRef,
    canvasRef,
    handleImageLoad,
    handleZoom,
    resetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    toggleFullscreen,
    handleRegionClick,
  }
}
