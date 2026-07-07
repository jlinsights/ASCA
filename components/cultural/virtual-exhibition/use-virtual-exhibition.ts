'use client'

import React, { useState, useRef, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { WALL_BG } from '../_constants/color-classes'
import type { Exhibition, ExhibitionArtwork, ExhibitionView } from './types'

interface UseVirtualExhibitionParams {
  exhibition: Exhibition
}

export function useVirtualExhibition({ exhibition }: UseVirtualExhibitionParams) {
  const [selectedArtwork, setSelectedArtwork] = useState<ExhibitionArtwork | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [currentView, setCurrentView] = useState<ExhibitionView>('gallery')

  const galleryRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Handle pan/drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentView !== 'gallery') return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Reset view
  const resetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Fullscreen 상태는 fullscreenchange 이벤트가 단일 소스 — Esc 종료·요청 거부 반영
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      galleryRef.current
        ?.requestFullscreen()
        .catch(error => logger.warn('Fullscreen request rejected', { error }))
    } else {
      document.exitFullscreen().catch(error => logger.warn('Fullscreen exit rejected', { error }))
    }
  }

  // Audio controls — 상태는 실제 재생 결과를 따른다 (자동재생 정책 거부 대응)
  const toggleAudio = () => {
    if (!audioRef.current) return

    if (audioEnabled) {
      audioRef.current.pause()
      setAudioEnabled(false)
    } else {
      audioRef.current
        .play()
        .then(() => setAudioEnabled(true))
        .catch(error => logger.warn('Background audio playback rejected', { error }))
    }
  }

  // Get wall color based on style
  const getWallColor = () => WALL_BG[exhibition.galleryLayout.style] ?? WALL_BG.default

  // Get lighting effect
  const getLightingEffect = () => {
    switch (exhibition.ambiance.lighting) {
      case 'warm':
        return 'sepia(0.1) brightness(1.1)'
      case 'cool':
        return 'brightness(0.9) hue-rotate(10deg)'
      case 'neutral':
        return 'none'
      default:
        return 'none'
    }
  }

  return {
    selectedArtwork,
    setSelectedArtwork,
    zoom,
    position,
    isFullscreen,
    audioEnabled,
    currentView,
    setCurrentView,
    galleryRef,
    audioRef,
    handleZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    toggleFullscreen,
    toggleAudio,
    getWallColor,
    getLightingEffect,
  }
}
