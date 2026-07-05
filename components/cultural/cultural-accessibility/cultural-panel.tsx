'use client'

import { Button } from '@/components/ui/button'
import type { CulturalContext } from './types'

interface CulturalPanelProps {
  settings: CulturalContext
  updateSetting: (key: keyof CulturalContext, value: any) => void
}

export function CulturalPanel({ settings, updateSetting }: CulturalPanelProps) {
  return (
    <div className='space-y-6'>
      {/* Name Display */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4'>Cultural Display</h4>

        <div className='space-y-4'>
          <div>
            <label className='text-sm text-ink-black/70 mb-2 block'>Name Format</label>
            <select
              value={settings.displayNames}
              onChange={e => updateSetting('displayNames', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value='traditional'>Traditional characters only</option>
              <option value='simplified'>Simplified characters only</option>
              <option value='romanized'>Romanized only</option>
              <option value='mixed'>Show all variants</option>
            </select>
          </div>

          <div>
            <label className='text-sm text-ink-black/70 mb-2 block'>Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={e => updateSetting('dateFormat', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value='gregorian'>Gregorian calendar only</option>
              <option value='lunar'>Lunar calendar only</option>
              <option value='both'>Both calendars</option>
            </select>
          </div>

          <div>
            <label className='text-sm text-ink-black/70 mb-2 block'>Number Format</label>
            <select
              value={settings.numberFormat}
              onChange={e => updateSetting('numberFormat', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value='western'>Western numerals (1, 2, 3)</option>
              <option value='chinese'>Chinese numerals (一, 二, 三)</option>
              <option value='local'>Local preference</option>
            </select>
          </div>
        </div>
      </div>

      {/* Context Options */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4'>Cultural Context</h4>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <label className='text-sm text-ink-black/70'>Cultural Explanations</label>
            <Button
              size='sm'
              variant={settings.culturalExplanations ? 'default' : 'outline'}
              onClick={() => updateSetting('culturalExplanations', !settings.culturalExplanations)}
              className='h-8'
            >
              {settings.culturalExplanations ? 'On' : 'Off'}
            </Button>
          </div>

          <div className='flex items-center justify-between'>
            <label className='text-sm text-ink-black/70'>Historical Context</label>
            <Button
              size='sm'
              variant={settings.historicalContext ? 'default' : 'outline'}
              onClick={() => updateSetting('historicalContext', !settings.historicalContext)}
              className='h-8'
            >
              {settings.historicalContext ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
