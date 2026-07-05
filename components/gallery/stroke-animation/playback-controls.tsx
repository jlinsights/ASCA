'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { SkipBack, Pause, Play, Square, SkipForward, Minus, Plus, Settings } from 'lucide-react'
import type { AnimationSettings, PlaybackState } from './types'

interface PlaybackControlsProps {
  playbackState: PlaybackState
  strokesCount: number
  settings: AnimationSettings
  setSettings: Dispatch<SetStateAction<AnimationSettings>>
  showSettings: boolean
  setShowSettings: Dispatch<SetStateAction<boolean>>
  onPrevious: () => void
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNext: () => void
}

export function PlaybackControls({
  playbackState,
  strokesCount,
  settings,
  setSettings,
  showSettings,
  setShowSettings,
  onPrevious,
  onPlay,
  onPause,
  onStop,
  onNext,
}: PlaybackControlsProps) {
  return (
    <div className='flex items-center justify-center gap-2 p-4 bg-silk-cream/50 rounded-lg'>
      <Button
        size='sm'
        variant='outline'
        onClick={onPrevious}
        disabled={playbackState.currentStroke === 0}
        className='border-ink-black/20'
      >
        <SkipBack className='w-4 h-4' />
      </Button>

      {playbackState.isPlaying ? (
        <Button
          size='sm'
          onClick={onPause}
          className='bg-celadon-green text-ink-black hover:bg-celadon-green/80'
        >
          <Pause className='w-4 h-4' />
        </Button>
      ) : (
        <Button
          size='sm'
          onClick={onPlay}
          className='bg-celadon-green text-ink-black hover:bg-celadon-green/80'
        >
          <Play className='w-4 h-4' />
        </Button>
      )}

      <Button size='sm' variant='outline' onClick={onStop} className='border-ink-black/20'>
        <Square className='w-4 h-4' />
      </Button>

      <Button
        size='sm'
        variant='outline'
        onClick={onNext}
        disabled={playbackState.currentStroke === strokesCount - 1}
        className='border-ink-black/20'
      >
        <SkipForward className='w-4 h-4' />
      </Button>

      <div className='flex items-center gap-2 ml-4'>
        <span className='text-sm text-ink-black/70'>Speed:</span>
        <div className='flex gap-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              setSettings(prev => ({
                ...prev,
                playbackSpeed: Math.max(0.25, prev.playbackSpeed - 0.25),
              }))
            }
            className='h-8 w-8 p-0 border-ink-black/20'
          >
            <Minus className='w-3 h-3' />
          </Button>
          <span className='text-sm font-medium min-w-[3rem] text-center'>
            {settings.playbackSpeed}x
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              setSettings(prev => ({
                ...prev,
                playbackSpeed: Math.min(3, prev.playbackSpeed + 0.25),
              }))
            }
            className='h-8 w-8 p-0 border-ink-black/20'
          >
            <Plus className='w-3 h-3' />
          </Button>
        </div>
      </div>

      <Button
        size='sm'
        variant='outline'
        onClick={() => setShowSettings(!showSettings)}
        className='border-ink-black/20 ml-4'
      >
        <Settings className='w-4 h-4' />
      </Button>
    </div>
  )
}
