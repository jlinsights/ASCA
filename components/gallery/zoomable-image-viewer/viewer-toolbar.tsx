'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
  Info,
  Ruler,
  Target,
  MousePointer,
  Move,
} from 'lucide-react'
import type { ViewerTool } from './types'

interface ViewerToolbarProps {
  activeTool: ViewerTool
  setActiveTool: Dispatch<SetStateAction<ViewerTool>>
  showInfo: boolean
  setShowInfo: Dispatch<SetStateAction<boolean>>
  isFullscreen: boolean
  enableFullscreen: boolean
  zoomStep: number
  originalUrl: string
  onZoom: (delta: number, centerX?: number, centerY?: number) => void
  onResetView: () => void
  onToggleFullscreen: () => void
}

export function ViewerToolbar({
  activeTool,
  setActiveTool,
  showInfo,
  setShowInfo,
  isFullscreen,
  enableFullscreen,
  zoomStep,
  originalUrl,
  onZoom,
  onResetView,
  onToggleFullscreen,
}: ViewerToolbarProps) {
  return (
    <div className='absolute top-4 left-4 flex gap-2 z-40'>
      {/* Zoom Controls */}
      <div className='flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1'>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onZoom(zoomStep)}
          className='h-8 w-8 p-0'
          title='Zoom In'
        >
          <ZoomIn className='w-4 h-4' />
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onZoom(-zoomStep)}
          className='h-8 w-8 p-0'
          title='Zoom Out'
        >
          <ZoomOut className='w-4 h-4' />
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={onResetView}
          className='h-8 w-8 p-0'
          title='Reset View'
        >
          <RotateCcw className='w-4 h-4' />
        </Button>
      </div>

      {/* Tool Selection */}
      <div className='flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1'>
        {[
          { tool: 'pan', icon: Move, title: 'Pan' },
          { tool: 'zoom', icon: Target, title: 'Zoom' },
          { tool: 'measure', icon: Ruler, title: 'Measure' },
          { tool: 'annotate', icon: MousePointer, title: 'Annotate' },
        ].map(({ tool, icon: Icon, title }) => (
          <Button
            key={tool}
            size='sm'
            variant={activeTool === tool ? 'default' : 'ghost'}
            onClick={() => setActiveTool(tool as any)}
            className='h-8 w-8 p-0'
            title={title}
          >
            <Icon className='w-4 h-4' />
          </Button>
        ))}
      </div>

      {/* Additional Controls */}
      <div className='flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1'>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setShowInfo(!showInfo)}
          className='h-8 w-8 p-0'
          title='Image Info'
        >
          <Info className='w-4 h-4' />
        </Button>
        {enableFullscreen && (
          <Button
            size='sm'
            variant='ghost'
            onClick={onToggleFullscreen}
            className='h-8 w-8 p-0'
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className='w-4 h-4' /> : <Maximize className='w-4 h-4' />}
          </Button>
        )}
        <Button
          size='sm'
          variant='ghost'
          onClick={() => window.open(originalUrl, '_blank')}
          className='h-8 w-8 p-0'
          title='Download Original'
        >
          <Download className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
