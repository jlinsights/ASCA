'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Type, 
  Eye, 
  EyeOff, 
  Palette, 
  Languages, 
  Settings,
  Minus,
  Plus,
  RotateCcw,
  Moon,
  Sun,
  Contrast,
  Focus,
  Mouse,
  Keyboard,
  Headphones,
  Captions
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for accessibility and internationalization
interface AccessibilitySettings {
  fontSize: number;
  fontFamily: 'default' | 'dyslexic' | 'serif' | 'sans';
  lineHeight: number;
  letterSpacing: number;
  contrast: 'normal' | 'high' | 'higher';
  colorScheme: 'light' | 'dark' | 'auto';
  motionReduced: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  audioDescriptions: boolean;
  captionsEnabled: boolean;
  focusVisible: boolean;
}

interface LanguageSettings {
  primary: 'ko' | 'zh-CN' | 'zh-TW' | 'ja' | 'en';
  secondary?: 'ko' | 'zh-CN' | 'zh-TW' | 'ja' | 'en';
  romanization: boolean;
  pronunciation: boolean;
  translation: 'inline' | 'hover' | 'toggle';
  direction: 'ltr' | 'rtl' | 'auto';
}

interface CulturalContext {
  displayNames: 'traditional' | 'simplified' | 'romanized' | 'mixed';
  dateFormat: 'gregorian' | 'lunar' | 'both';
  timeFormat: '12h' | '24h';
  numberFormat: 'western' | 'chinese' | 'local';
  culturalExplanations: boolean;
  historicalContext: boolean;
}

interface CulturalAccessibilityProps {
  initialSettings?: Partial<AccessibilitySettings>;
  initialLanguage?: Partial<LanguageSettings>;
  initialCultural?: Partial<CulturalContext>;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onLanguageChange?: (language: LanguageSettings) => void;
  onCulturalChange?: (cultural: CulturalContext) => void;
  className?: string;
}

const CulturalAccessibility: React.FC<CulturalAccessibilityProps> = ({
  initialSettings = {},
  initialLanguage = {},
  initialCultural = {},
  onSettingsChange,
  onLanguageChange,
  onCulturalChange,
  className
}) => {
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    fontFamily: 'default',
    lineHeight: 1.6,
    letterSpacing: 0,
    contrast: 'normal',
    colorScheme: 'auto',
    motionReduced: false,
    screenReader: false,
    keyboardNavigation: true,
    audioDescriptions: false,
    captionsEnabled: false,
    focusVisible: true,
    ...initialSettings
  });

  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    primary: 'ko',
    romanization: true,
    pronunciation: false,
    translation: 'hover',
    direction: 'ltr',
    ...initialLanguage
  });

  const [culturalSettings, setCulturalSettings] = useState<CulturalContext>({
    displayNames: 'mixed',
    dateFormat: 'both',
    timeFormat: '24h',
    numberFormat: 'local',
    culturalExplanations: true,
    historicalContext: true,
    ...initialCultural
  });

  const [activePanel, setActivePanel] = useState<'accessibility' | 'language' | 'cultural'>('accessibility');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);

  // Language options with native names
  const languageOptions = [
    { code: 'ko', name: '한국어', nativeName: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: '简体中文', nativeName: 'Simplified Chinese', flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文', nativeName: 'Traditional Chinese', flag: '🇹🇼' },
    { code: 'ja', name: '日本語', nativeName: 'Japanese', flag: '🇯🇵' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' }
  ];

  // Font family options optimized for different scripts
  const fontFamilyOptions = [
    { 
      id: 'default', 
      name: 'Default', 
      description: 'Optimized for current language',
      css: 'font-family: var(--font-calligraphy)'
    },
    { 
      id: 'serif', 
      name: 'Traditional Serif', 
      description: 'Classical typography for formal content',
      css: 'font-family: var(--font-korean)'
    },
    { 
      id: 'sans', 
      name: 'Modern Sans', 
      description: 'Clean and readable for digital content',
      css: 'font-family: var(--font-sans)'
    },
    { 
      id: 'dyslexic', 
      name: 'Dyslexic Friendly', 
      description: 'Optimized for reading difficulties',
      css: 'font-family: "OpenDyslexic", sans-serif'
    }
  ];

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font settings
    root.style.fontSize = `${accessibilitySettings.fontSize}px`;
    root.style.lineHeight = accessibilitySettings.lineHeight.toString();
    root.style.letterSpacing = `${accessibilitySettings.letterSpacing}px`;
    
    // Apply contrast settings
    switch (accessibilitySettings.contrast) {
      case 'high':
        root.style.filter = 'contrast(150%)';
        break;
      case 'higher':
        root.style.filter = 'contrast(200%)';
        break;
      default:
        root.style.filter = 'none';
    }
    
    // Apply color scheme
    if (accessibilitySettings.colorScheme !== 'auto') {
      root.classList.toggle('dark', accessibilitySettings.colorScheme === 'dark');
    }
    
    // Apply motion reduction
    if (accessibilitySettings.motionReduced) {
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
    }
    
    // Apply focus visibility
    if (accessibilitySettings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Notify parent of changes
    onSettingsChange?.(accessibilitySettings);
  }, [accessibilitySettings, onSettingsChange]);

  // Apply language settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Set language and direction
    root.lang = languageSettings.primary;
    root.dir = languageSettings.direction;
    
    onLanguageChange?.(languageSettings);
  }, [languageSettings, onLanguageChange]);

  // Apply cultural settings
  useEffect(() => {
    onCulturalChange?.(culturalSettings);
  }, [culturalSettings, onCulturalChange]);

  const updateAccessibilitySetting = (key: keyof AccessibilitySettings, value: any) => {
    setAccessibilitySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateLanguageSetting = (key: keyof LanguageSettings, value: any) => {
    setLanguageSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCulturalSetting = (key: keyof CulturalContext, value: any) => {
    setCulturalSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAllSettings = () => {
    setAccessibilitySettings({
      fontSize: 16,
      fontFamily: 'default',
      lineHeight: 1.6,
      letterSpacing: 0,
      contrast: 'normal',
      colorScheme: 'auto',
      motionReduced: false,
      screenReader: false,
      keyboardNavigation: true,
      audioDescriptions: false,
      captionsEnabled: false,
      focusVisible: true
    });
    
    setLanguageSettings({
      primary: 'ko',
      romanization: true,
      pronunciation: false,
      translation: 'hover',
      direction: 'ltr'
    });
    
    setCulturalSettings({
      displayNames: 'mixed',
      dateFormat: 'both',
      timeFormat: '24h',
      numberFormat: 'local',
      culturalExplanations: true,
      historicalContext: true
    });
  };

  // Accessibility Panel
  const AccessibilityPanel = () => (
    <div className="space-y-6">
      {/* Typography Controls */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typography
        </h4>
        
        <div className="space-y-4">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Font Size</label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAccessibilitySetting('fontSize', Math.max(12, accessibilitySettings.fontSize - 2))}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-12 text-center text-sm">{accessibilitySettings.fontSize}px</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAccessibilitySetting('fontSize', Math.min(24, accessibilitySettings.fontSize + 2))}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Font Family</label>
            <select
              value={accessibilitySettings.fontFamily}
              onChange={(e) => updateAccessibilitySetting('fontFamily', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              {fontFamilyOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Line Height */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Line Height</label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAccessibilitySetting('lineHeight', Math.max(1.2, accessibilitySettings.lineHeight - 0.1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-12 text-center text-sm">{accessibilitySettings.lineHeight.toFixed(1)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAccessibilitySetting('lineHeight', Math.min(2.0, accessibilitySettings.lineHeight + 0.1))}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Controls */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Visual
        </h4>
        
        <div className="space-y-4">
          {/* Contrast */}
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Contrast</label>
            <select
              value={accessibilitySettings.contrast}
              onChange={(e) => updateAccessibilitySetting('contrast', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="normal">Normal</option>
              <option value="high">High Contrast</option>
              <option value="higher">Maximum Contrast</option>
            </select>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Color Scheme</label>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Contrast, label: 'Auto' }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={accessibilitySettings.colorScheme === value ? "default" : "outline"}
                  onClick={() => updateAccessibilitySetting('colorScheme', value)}
                  className="flex-1"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Reduce Motion</label>
            <Button
              size="sm"
              variant={accessibilitySettings.motionReduced ? "default" : "outline"}
              onClick={() => updateAccessibilitySetting('motionReduced', !accessibilitySettings.motionReduced)}
              className="h-8"
            >
              {accessibilitySettings.motionReduced ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4 flex items-center gap-2">
          <Focus className="w-4 h-4" />
          Navigation
        </h4>
        
        <div className="space-y-3">
          {[
            { key: 'keyboardNavigation', label: 'Keyboard Navigation', icon: Keyboard },
            { key: 'focusVisible', label: 'Focus Indicators', icon: Focus },
            { key: 'screenReader', label: 'Screen Reader Mode', icon: Volume2 },
            { key: 'audioDescriptions', label: 'Audio Descriptions', icon: Headphones },
            { key: 'captionsEnabled', label: 'Captions', icon: Captions }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-ink-black/70 flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {label}
              </label>
              <Button
                size="sm"
                variant={accessibilitySettings[key as keyof AccessibilitySettings] ? "default" : "outline"}
                onClick={() => updateAccessibilitySetting(key as keyof AccessibilitySettings, !accessibilitySettings[key as keyof AccessibilitySettings])}
                className="h-8"
              >
                {accessibilitySettings[key as keyof AccessibilitySettings] ? 'On' : 'Off'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Language Panel
  const LanguagePanel = () => (
    <div className="space-y-6">
      {/* Primary Language */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Language Selection
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Primary Language</label>
            <div className="grid grid-cols-1 gap-2">
              {languageOptions.map(lang => (
                <Button
                  key={lang.code}
                  variant={languageSettings.primary === lang.code ? "default" : "outline"}
                  onClick={() => updateLanguageSetting('primary', lang.code)}
                  className="justify-start h-12"
                >
                  <span className="text-xl mr-3">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs opacity-70">{lang.nativeName}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Secondary Language */}
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Secondary Language (Optional)</label>
            <select
              value={languageSettings.secondary || ''}
              onChange={(e) => updateLanguageSetting('secondary', e.target.value || undefined)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="">None</option>
              {languageOptions
                .filter(lang => lang.code !== languageSettings.primary)
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
        <h4 className="font-semibold text-ink-black mb-4">Display Options</h4>
        
        <div className="space-y-4">
          {/* Romanization */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Show Romanization</label>
            <Button
              size="sm"
              variant={languageSettings.romanization ? "default" : "outline"}
              onClick={() => updateLanguageSetting('romanization', !languageSettings.romanization)}
              className="h-8"
            >
              {languageSettings.romanization ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Pronunciation */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Pronunciation Guide</label>
            <Button
              size="sm"
              variant={languageSettings.pronunciation ? "default" : "outline"}
              onClick={() => updateLanguageSetting('pronunciation', !languageSettings.pronunciation)}
              className="h-8"
            >
              {languageSettings.pronunciation ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Translation Mode */}
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Translation Display</label>
            <select
              value={languageSettings.translation}
              onChange={(e) => updateLanguageSetting('translation', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="inline">Always visible</option>
              <option value="hover">Show on hover</option>
              <option value="toggle">Toggle button</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Cultural Panel
  const CulturalPanel = () => (
    <div className="space-y-6">
      {/* Name Display */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4">Cultural Display</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Name Format</label>
            <select
              value={culturalSettings.displayNames}
              onChange={(e) => updateCulturalSetting('displayNames', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="traditional">Traditional characters only</option>
              <option value="simplified">Simplified characters only</option>
              <option value="romanized">Romanized only</option>
              <option value="mixed">Show all variants</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Date Format</label>
            <select
              value={culturalSettings.dateFormat}
              onChange={(e) => updateCulturalSetting('dateFormat', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="gregorian">Gregorian calendar only</option>
              <option value="lunar">Lunar calendar only</option>
              <option value="both">Both calendars</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-ink-black/70 mb-2 block">Number Format</label>
            <select
              value={culturalSettings.numberFormat}
              onChange={(e) => updateCulturalSetting('numberFormat', e.target.value)}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="western">Western numerals (1, 2, 3)</option>
              <option value="chinese">Chinese numerals (一, 二, 三)</option>
              <option value="local">Local preference</option>
            </select>
          </div>
        </div>
      </div>

      {/* Context Options */}
      <div>
        <h4 className="font-semibold text-ink-black mb-4">Cultural Context</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Cultural Explanations</label>
            <Button
              size="sm"
              variant={culturalSettings.culturalExplanations ? "default" : "outline"}
              onClick={() => updateCulturalSetting('culturalExplanations', !culturalSettings.culturalExplanations)}
              className="h-8"
            >
              {culturalSettings.culturalExplanations ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-ink-black/70">Historical Context</label>
            <Button
              size="sm"
              variant={culturalSettings.historicalContext ? "default" : "outline"}
              onClick={() => updateCulturalSetting('historicalContext', !culturalSettings.historicalContext)}
              className="h-8"
            >
              {culturalSettings.historicalContext ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-celadon-green text-ink-black hover:bg-celadon-green/80 shadow-lg"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Card 
        ref={panelRef}
        className="w-96 max-h-[80vh] overflow-hidden bg-rice-paper/95 backdrop-blur-md border-celadon-green/20 shadow-xl"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-calligraphy text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Accessibility & Language
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={resetAllSettings}
                className="h-8 w-8 p-0 border-ink-black/20"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 border-ink-black/20"
              >
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Panel Navigation */}
          <div className="flex gap-1 mt-3">
            {[
              { id: 'accessibility', label: 'Accessibility', icon: Eye },
              { id: 'language', label: 'Language', icon: Languages },
              { id: 'cultural', label: 'Cultural', icon: Palette }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                size="sm"
                variant={activePanel === id ? "default" : "outline"}
                onClick={() => setActivePanel(id as any)}
                className={cn(
                  "flex-1 text-xs",
                  activePanel === id && "bg-celadon-green text-ink-black"
                )}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto">
          {activePanel === 'accessibility' && <AccessibilityPanel />}
          {activePanel === 'language' && <LanguagePanel />}
          {activePanel === 'cultural' && <CulturalPanel />}
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalAccessibility;