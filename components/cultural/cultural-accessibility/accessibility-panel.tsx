'use client'

import { useId } from 'react'
import { Button } from '@/components/ui/button'
import {
  Type,
  Eye,
  Minus,
  Plus,
  Moon,
  Sun,
  Contrast,
  Focus,
  Volume2,
  Keyboard,
  Headphones,
  Captions,
} from 'lucide-react'
import type { AccessibilitySettings } from './types'
import { fontFamilyOptions } from './accessibility-defaults'

interface AccessibilityPanelProps {
  settings: AccessibilitySettings
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void
}

export function AccessibilityPanel({ settings, updateSetting }: AccessibilityPanelProps) {
  const id = useId()

  return (
    <div className='space-y-6'>
      {/* Typography Controls */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4 flex items-center gap-2'>
          <Type className='w-4 h-4' />
          Typography
        </h4>

        <div className='space-y-4'>
          {/* Font Size */}
          <div className='flex items-center justify-between'>
            <span id={`${id}-font-size`} className='text-sm text-ink-black/70'>
              Font Size
            </span>
            <div
              role='group'
              aria-labelledby={`${id}-font-size`}
              className='flex items-center gap-2'
            >
              <Button
                size='sm'
                variant='outline'
                onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                className='h-8 w-8 p-0'
                aria-label='Decrease font size'
              >
                <Minus className='w-3 h-3' />
              </Button>
              <span className='w-12 text-center text-sm'>{settings.fontSize}px</span>
              <Button
                size='sm'
                variant='outline'
                onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
                className='h-8 w-8 p-0'
                aria-label='Increase font size'
              >
                <Plus className='w-3 h-3' />
              </Button>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label htmlFor={`${id}-font-family`} className='text-sm text-ink-black/70 mb-2 block'>
              Font Family
            </label>
            <select
              id={`${id}-font-family`}
              value={settings.fontFamily}
              onChange={e => updateSetting('fontFamily', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              {fontFamilyOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Line Height */}
          <div className='flex items-center justify-between'>
            <span id={`${id}-line-height`} className='text-sm text-ink-black/70'>
              Line Height
            </span>
            <div
              role='group'
              aria-labelledby={`${id}-line-height`}
              className='flex items-center gap-2'
            >
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  updateSetting('lineHeight', Math.max(1.2, settings.lineHeight - 0.1))
                }
                className='h-8 w-8 p-0'
                aria-label='Decrease line height'
              >
                <Minus className='w-3 h-3' />
              </Button>
              <span className='w-12 text-center text-sm'>{settings.lineHeight.toFixed(1)}</span>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  updateSetting('lineHeight', Math.min(2.0, settings.lineHeight + 0.1))
                }
                className='h-8 w-8 p-0'
                aria-label='Increase line height'
              >
                <Plus className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Controls */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4 flex items-center gap-2'>
          <Eye className='w-4 h-4' />
          Visual
        </h4>

        <div className='space-y-4'>
          {/* Contrast */}
          <div>
            <label htmlFor={`${id}-contrast`} className='text-sm text-ink-black/70 mb-2 block'>
              Contrast
            </label>
            <select
              id={`${id}-contrast`}
              value={settings.contrast}
              onChange={e => updateSetting('contrast', e.target.value)}
              className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
            >
              <option value='normal'>Normal</option>
              <option value='high'>High Contrast</option>
              <option value='higher'>Maximum Contrast</option>
            </select>
          </div>

          {/* Color Scheme */}
          <div>
            <span id={`${id}-color-scheme`} className='text-sm text-ink-black/70 mb-2 block'>
              Color Scheme
            </span>
            <div role='group' aria-labelledby={`${id}-color-scheme`} className='flex gap-2'>
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Contrast, label: 'Auto' },
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  size='sm'
                  variant={settings.colorScheme === value ? 'default' : 'outline'}
                  onClick={() => updateSetting('colorScheme', value)}
                  className='flex-1'
                  aria-pressed={settings.colorScheme === value}
                >
                  <Icon className='w-3 h-3 mr-1' />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div className='flex items-center justify-between'>
            <span id={`${id}-reduce-motion`} className='text-sm text-ink-black/70'>
              Reduce Motion
            </span>
            <Button
              size='sm'
              variant={settings.motionReduced ? 'default' : 'outline'}
              onClick={() => updateSetting('motionReduced', !settings.motionReduced)}
              className='h-8'
              aria-labelledby={`${id}-reduce-motion`}
              aria-pressed={settings.motionReduced}
            >
              {settings.motionReduced ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div>
        <h4 className='font-semibold text-ink-black mb-4 flex items-center gap-2'>
          <Focus className='w-4 h-4' />
          Navigation
        </h4>

        <div className='space-y-3'>
          {[
            { key: 'keyboardNavigation', label: 'Keyboard Navigation', icon: Keyboard },
            { key: 'focusVisible', label: 'Focus Indicators', icon: Focus },
            { key: 'screenReader', label: 'Screen Reader Mode', icon: Volume2 },
            { key: 'audioDescriptions', label: 'Audio Descriptions', icon: Headphones },
            { key: 'captionsEnabled', label: 'Captions', icon: Captions },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className='flex items-center justify-between'>
              <span
                id={`${id}-nav-${key}`}
                className='text-sm text-ink-black/70 flex items-center gap-2'
              >
                <Icon className='w-3 h-3' />
                {label}
              </span>
              <Button
                size='sm'
                variant={settings[key as keyof AccessibilitySettings] ? 'default' : 'outline'}
                onClick={() =>
                  updateSetting(
                    key as keyof AccessibilitySettings,
                    !settings[key as keyof AccessibilitySettings]
                  )
                }
                className='h-8'
                aria-labelledby={`${id}-nav-${key}`}
                aria-pressed={Boolean(settings[key as keyof AccessibilitySettings])}
              >
                {settings[key as keyof AccessibilitySettings] ? 'On' : 'Off'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
