'use client'

import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import type { LanguageSettings } from './types'
import { languageOptions } from './accessibility-defaults'

interface LanguagePanelProps {
  settings: LanguageSettings
  updateSetting: (key: keyof LanguageSettings, value: any) => void
}

export function LanguagePanel({ settings, updateSetting }: LanguagePanelProps) {
  const id = useId()

  return (
    <div className='space-y-6'>
      {/* Primary Language */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4 flex items-center gap-2'>
          <Languages className='w-4 h-4' />
          Language Selection
        </h4>

        <div className='space-y-4'>
          <div>
            <span id={`${id}-primary-language`} className='text-sm text-ink-black/70 mb-2 block'>
              Primary Language
            </span>
            <div
              role='group'
              aria-labelledby={`${id}-primary-language`}
              className='grid grid-cols-1 gap-2'
            >
              {languageOptions.map(lang => (
                <Button
                  key={lang.code}
                  variant={settings.primary === lang.code ? 'default' : 'outline'}
                  onClick={() => updateSetting('primary', lang.code)}
                  className='justify-start h-12'
                  aria-pressed={settings.primary === lang.code}
                >
                  <span className='text-xl mr-3'>{lang.flag}</span>
                  <div className='text-left'>
                    <div className='font-medium'>{lang.name}</div>
                    <div className='text-xs opacity-70'>{lang.nativeName}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Secondary Language */}
          <div>
            <label
              htmlFor={`${id}-secondary-language`}
              className='text-sm text-ink-black/70 mb-2 block'
            >
              Secondary Language (Optional)
            </label>
            <select
              id={`${id}-secondary-language`}
              value={settings.secondary || ''}
              onChange={e => updateSetting('secondary', e.target.value || undefined)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value=''>None</option>
              {languageOptions
                .filter(lang => lang.code !== settings.primary)
                .map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4'>Display Options</h4>

        <div className='space-y-4'>
          {/* Romanization */}
          <div className='flex items-center justify-between'>
            <span id={`${id}-romanization`} className='text-sm text-ink-black/70'>
              Show Romanization
            </span>
            <Button
              size='sm'
              variant={settings.romanization ? 'default' : 'outline'}
              onClick={() => updateSetting('romanization', !settings.romanization)}
              className='h-8'
              aria-labelledby={`${id}-romanization`}
              aria-pressed={settings.romanization}
            >
              {settings.romanization ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Pronunciation */}
          <div className='flex items-center justify-between'>
            <span id={`${id}-pronunciation`} className='text-sm text-ink-black/70'>
              Pronunciation Guide
            </span>
            <Button
              size='sm'
              variant={settings.pronunciation ? 'default' : 'outline'}
              onClick={() => updateSetting('pronunciation', !settings.pronunciation)}
              className='h-8'
              aria-labelledby={`${id}-pronunciation`}
              aria-pressed={settings.pronunciation}
            >
              {settings.pronunciation ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Translation Mode */}
          <div>
            <label htmlFor={`${id}-translation`} className='text-sm text-ink-black/70 mb-2 block'>
              Translation Display
            </label>
            <select
              id={`${id}-translation`}
              value={settings.translation}
              onChange={e => updateSetting('translation', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value='inline'>Always visible</option>
              <option value='hover'>Show on hover</option>
              <option value='toggle'>Toggle button</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
