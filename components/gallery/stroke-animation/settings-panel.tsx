'use client'

import { useId } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnimationSettings } from './types'

interface SettingsPanelProps {
  showSettings: boolean
  settings: AnimationSettings
  setSettings: Dispatch<SetStateAction<AnimationSettings>>
}

export function SettingsPanel({ showSettings, settings, setSettings }: SettingsPanelProps) {
  const loopModeId = useId()

  if (!showSettings) return null

  return (
    <Card className='mt-4 border-celadon-green/20'>
      <CardHeader>
        <CardTitle className='text-base'>Animation Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <label htmlFor={`${loopModeId}-pressure`} className='flex items-center gap-2'>
            <input
              id={`${loopModeId}-pressure`}
              type='checkbox'
              aria-label='Show Pressure'
              checked={settings.showPressure}
              onChange={e => setSettings(prev => ({ ...prev, showPressure: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Pressure</span>
          </label>

          <label htmlFor={`${loopModeId}-direction`} className='flex items-center gap-2'>
            <input
              id={`${loopModeId}-direction`}
              type='checkbox'
              aria-label='Show Direction'
              checked={settings.showDirection}
              onChange={e => setSettings(prev => ({ ...prev, showDirection: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Direction</span>
          </label>

          <label htmlFor={`${loopModeId}-grid`} className='flex items-center gap-2'>
            <input
              id={`${loopModeId}-grid`}
              type='checkbox'
              aria-label='Show Grid'
              checked={settings.showTiming}
              onChange={e => setSettings(prev => ({ ...prev, showTiming: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Grid</span>
          </label>

          <label htmlFor={`${loopModeId}-auto-advance`} className='flex items-center gap-2'>
            <input
              id={`${loopModeId}-auto-advance`}
              type='checkbox'
              aria-label='Auto Advance'
              checked={settings.autoAdvance}
              onChange={e => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Auto Advance</span>
          </label>
        </div>

        <div>
          <label htmlFor={loopModeId} className='block text-sm font-medium text-ink-black mb-2'>
            Loop Mode
          </label>
          <select
            id={loopModeId}
            value={settings.loopMode}
            onChange={e => setSettings(prev => ({ ...prev, loopMode: e.target.value as any }))}
            className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
          >
            <option value='none'>No Loop</option>
            <option value='single'>Loop Current Stroke</option>
            <option value='all'>Loop All Strokes</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
