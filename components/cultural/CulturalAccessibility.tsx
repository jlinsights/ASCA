'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Palette, Languages, Settings, Minus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CulturalAccessibilityProps } from './cultural-accessibility/types'
import { useAccessibilitySettings } from './cultural-accessibility/use-accessibility-settings'
import { AccessibilityPanel } from './cultural-accessibility/accessibility-panel'
import { LanguagePanel } from './cultural-accessibility/language-panel'
import { CulturalPanel } from './cultural-accessibility/cultural-panel'

// ===============================
// Main Component (shell)
// ===============================

function CulturalAccessibility({
  initialSettings = {},
  initialLanguage = {},
  initialCultural = {},
  onSettingsChange,
  onLanguageChange,
  onCulturalChange,
  className,
}: CulturalAccessibilityProps) {
  const {
    accessibilitySettings,
    languageSettings,
    culturalSettings,
    activePanel,
    setActivePanel,
    isMinimized,
    setIsMinimized,
    panelRef,
    updateAccessibilitySetting,
    updateLanguageSetting,
    updateCulturalSetting,
    resetAllSettings,
  } = useAccessibilitySettings({
    initialSettings,
    initialLanguage,
    initialCultural,
    onSettingsChange,
    onLanguageChange,
    onCulturalChange,
  })

  if (isMinimized) {
    return (
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className='h-12 w-12 rounded-full bg-celadon-green text-ink-black hover:bg-celadon-green/80 shadow-lg'
        >
          <Settings className='w-5 h-5' />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      <Card
        ref={panelRef}
        className='w-96 max-h-[80vh] overflow-hidden bg-rice-paper/95 backdrop-blur-md border-celadon-green/20 shadow-xl'
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='font-calligraphy text-lg flex items-center gap-2'>
              <Settings className='w-5 h-5' />
              Accessibility & Language
            </CardTitle>
            <div className='flex gap-1'>
              <Button
                size='sm'
                variant='outline'
                onClick={resetAllSettings}
                className='h-8 w-8 p-0 border-ink-black/20'
              >
                <RotateCcw className='w-3 h-3' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setIsMinimized(true)}
                className='h-8 w-8 p-0 border-ink-black/20'
              >
                <Minus className='w-3 h-3' />
              </Button>
            </div>
          </div>

          {/* Panel Navigation */}
          <div className='flex gap-1 mt-3'>
            {[
              { id: 'accessibility', label: 'Accessibility', icon: Eye },
              { id: 'language', label: 'Language', icon: Languages },
              { id: 'cultural', label: 'Cultural', icon: Palette },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                size='sm'
                variant={activePanel === id ? 'default' : 'outline'}
                onClick={() => setActivePanel(id as any)}
                className={cn(
                  'flex-1 text-xs',
                  activePanel === id && 'bg-celadon-green text-ink-black'
                )}
              >
                <Icon className='w-3 h-3 mr-1' />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className='max-h-96 overflow-y-auto'>
          {activePanel === 'accessibility' && (
            <AccessibilityPanel
              settings={accessibilitySettings}
              updateSetting={updateAccessibilitySetting}
            />
          )}
          {activePanel === 'language' && (
            <LanguagePanel settings={languageSettings} updateSetting={updateLanguageSetting} />
          )}
          {activePanel === 'cultural' && (
            <CulturalPanel settings={culturalSettings} updateSetting={updateCulturalSetting} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CulturalAccessibility
