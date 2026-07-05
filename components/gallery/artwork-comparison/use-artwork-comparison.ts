'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'
import type { Artwork } from '@/lib/types/gallery'
import type { ComparisonAnalysis, ComparisonMode, ViewerState } from './types'

interface UseArtworkComparisonParams {
  artworks: Artwork[]
  initialMode: ComparisonMode
  maxArtworks: number
  onAnalysisRequest?: (artworkIds: string[]) => Promise<ComparisonAnalysis>
}

export function useArtworkComparison({
  artworks,
  initialMode,
  maxArtworks,
  onAnalysisRequest,
}: UseArtworkComparisonParams) {
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>(
    artworks.slice(0, Math.min(2, artworks.length))
  )
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(initialMode)
  const [viewerStates, setViewerStates] = useState<ViewerState[]>([
    { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: { x: 0, y: 0 } },
    { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: { x: 0, y: 0 } },
  ])
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [activeImage, setActiveImage] = useState<{ artworkIndex: number; imageIndex: number }>({
    artworkIndex: 0,
    imageIndex: 0,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])

  // Initialize viewer states when artworks change
  useEffect(() => {
    const states = selectedArtworks.map(() => ({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
    }))
    setViewerStates(states)
  }, [selectedArtworks])

  // ===============================
  // Artwork Selection Management
  // ===============================

  const addArtwork = (artwork: Artwork) => {
    if (selectedArtworks.length < maxArtworks && !selectedArtworks.find(a => a.id === artwork.id)) {
      setSelectedArtworks(prev => [...prev, artwork])
    }
  }

  const removeArtwork = (artworkId: string) => {
    setSelectedArtworks(prev => prev.filter(a => a.id !== artworkId))
  }

  const replaceArtwork = (index: number, artwork: Artwork) => {
    setSelectedArtworks(prev => {
      const newArtworks = [...prev]
      newArtworks[index] = artwork
      return newArtworks
    })
  }

  // ===============================
  // Zoom and Pan Management
  // ===============================

  const updateViewerState = useCallback(
    (index: number, updates: Partial<ViewerState>) => {
      setViewerStates(prev => {
        const newStates = [...prev]
        // Only update fields that are actually provided and not undefined
        const currentState = newStates[index]
        if (!currentState) return prev // Safety check

        newStates[index] = {
          scale: updates.scale !== undefined ? updates.scale : currentState.scale,
          offsetX: updates.offsetX !== undefined ? updates.offsetX : currentState.offsetX,
          offsetY: updates.offsetY !== undefined ? updates.offsetY : currentState.offsetY,
          isDragging:
            updates.isDragging !== undefined ? updates.isDragging : currentState.isDragging,
          dragStart: updates.dragStart !== undefined ? updates.dragStart : currentState.dragStart,
        }

        // Sync with other viewers if enabled
        if (
          (comparisonMode.syncZoom && updates.scale !== undefined) ||
          (comparisonMode.syncPan &&
            (updates.offsetX !== undefined || updates.offsetY !== undefined))
        ) {
          for (let i = 0; i < newStates.length; i++) {
            const syncState = newStates[i]
            if (i !== index && syncState) {
              if (comparisonMode.syncZoom && updates.scale !== undefined) {
                syncState.scale = updates.scale
              }
              if (comparisonMode.syncPan) {
                if (updates.offsetX !== undefined) syncState.offsetX = updates.offsetX
                if (updates.offsetY !== undefined) syncState.offsetY = updates.offsetY
              }
            }
          }
        }

        return newStates
      })
    },
    [comparisonMode.syncZoom, comparisonMode.syncPan]
  )

  const handleZoom = useCallback(
    (index: number, delta: number, centerX?: number, centerY?: number) => {
      const currentState = viewerStates[index]
      if (!currentState) return // Safety check

      const newScale = Math.max(0.1, Math.min(5, currentState.scale + delta))

      if (centerX !== undefined && centerY !== undefined) {
        const scaleRatio = newScale / currentState.scale
        const newOffsetX = centerX - (centerX - currentState.offsetX) * scaleRatio
        const newOffsetY = centerY - (centerY - currentState.offsetY) * scaleRatio

        updateViewerState(index, {
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        })
      } else {
        updateViewerState(index, { scale: newScale })
      }
    },
    [viewerStates, updateViewerState]
  )

  const handlePan = useCallback(
    (index: number, deltaX: number, deltaY: number) => {
      const currentState = viewerStates[index]
      if (!currentState) return // Safety check

      updateViewerState(index, {
        offsetX: currentState.offsetX + deltaX,
        offsetY: currentState.offsetY + deltaY,
      })
    },
    [viewerStates, updateViewerState]
  )

  const resetView = useCallback(
    (index?: number) => {
      if (index !== undefined) {
        updateViewerState(index, {
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          isDragging: false,
          dragStart: { x: 0, y: 0 },
        })
      } else {
        // Reset all viewers
        const resetStates = viewerStates.map(() => ({
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          isDragging: false,
          dragStart: { x: 0, y: 0 },
        }))
        setViewerStates(resetStates)
      }
    },
    [viewerStates, updateViewerState]
  )

  // ===============================
  // Event Handlers
  // ===============================

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault()
      updateViewerState(index, {
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
      })
    },
    [updateViewerState]
  )

  const handleMouseMove = useCallback(
    (index: number, e: React.MouseEvent) => {
      const currentState = viewerStates[index]
      if (!currentState || !currentState.isDragging) return // Safety check

      const deltaX = e.clientX - currentState.dragStart.x
      const deltaY = e.clientY - currentState.dragStart.y

      handlePan(index, deltaX, deltaY)

      updateViewerState(index, {
        dragStart: { x: e.clientX, y: e.clientY },
      })
    },
    [viewerStates, handlePan, updateViewerState]
  )

  const handleMouseUp = useCallback(
    (index: number) => {
      updateViewerState(index, { isDragging: false })
    },
    [updateViewerState]
  )

  const handleWheel = useCallback(
    (index: number, e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      handleZoom(index, delta)
    },
    [handleZoom]
  )

  // ===============================
  // Analysis Functions
  // ===============================

  const requestAnalysis = async () => {
    if (!onAnalysisRequest || selectedArtworks.length < 2) return

    try {
      const artworkIds = selectedArtworks.map(artwork => artwork.id)
      const analysisResult = await onAnalysisRequest(artworkIds)
      setAnalysis(analysisResult)
      setShowAnalysis(true)
    } catch (error) {
      logger.error(
        'Failed to get comparison analysis',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  return {
    selectedArtworks,
    comparisonMode,
    setComparisonMode,
    viewerStates,
    analysis,
    isFullscreen,
    setIsFullscreen,
    showAnalysis,
    setShowAnalysis,
    imageRefs,
    addArtwork,
    removeArtwork,
    handleZoom,
    resetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    requestAnalysis,
  }
}
