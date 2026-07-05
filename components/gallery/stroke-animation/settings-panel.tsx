'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnimationSettings } from './types'

interface SettingsPanelProps {
  showSettings: boolean
  settings: AnimationSettings
  setSettings: Dispatch<SetStateAction<AnimationSettings>>
}

export function SettingsPanel({ showSettings, settings, setSettings }: SettingsPanelProps) {
  if (!showSettings) return null

  return (
    <Card className='mt-4 border-celadon-green/20'>
      <CardHeader>
        <CardTitle className='text-base'>Animation Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showPressure}
              onChange={e => setSettings(prev => ({ ...prev, showPressure: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Pressure</span>
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showDirection}
              onChange={e => setSettings(prev => ({ ...prev, showDirection: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Direction</span>
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showTiming}
              onChange={e => setSettings(prev => ({ ...prev, showTiming: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Show Grid</span>
          </label>

          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.autoAdvance}
              onChange={e => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm'>Auto Advance</span>
          </label>
        </div>

        <div>
          <label className='block text-sm font-medium text-ink-black mb-2'>Loop Mode</label>
          <select
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
